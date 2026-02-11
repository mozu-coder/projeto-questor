import { Injectable, Logger } from '@nestjs/common';
import { LancamentoFiscalRepository } from '../repositories/lancamento-fiscal.repository';
import { LancamentoContabilRepository } from '../repositories/lancamento-contabil.repository';
import { PlanoContabilizacaoService } from './plano-contabilizacao.service';
import { PlanoContasService } from './plano-contas.service';
import {
  IDivergenciaConferencia,
  IResultadoConferencia,
  IParamsConferencia,
  INotaConferida,
} from '../../shared/interfaces/conferencia-fiscal.interface';
import { ILancamentoFiscalCFOP } from '../../shared/interfaces/lancamento-fiscal.interface';
import { ILancamentoContabil } from '../../shared/interfaces/lancamento-contabil.interface';

interface ResultadoConferenciaItem {
  divergencias: IDivergenciaConferencia[];
  notasCorretas?: INotaConferida[];
}

interface GrupoCFOP {
  cfops: ILancamentoFiscalCFOP[];
  contaDebito: number;
  contaCredito: number;
  valorTotal: number;
}

interface ItemPlanoExtendido {
  conta_credito: number;
  conta_debito: number;
  contabiliza: boolean;
  retido: boolean;
}

@Injectable()
export class ConferenciaFiscalService {
  private readonly logger = new Logger(ConferenciaFiscalService.name);

  constructor(
    private readonly lancamentoFiscalRepo: LancamentoFiscalRepository,
    private readonly lancamentoContabilRepo: LancamentoContabilRepository,
    private readonly planoContabilizacaoService: PlanoContabilizacaoService,
    private readonly planoContasService: PlanoContasService,
  ) {}

  private parseChaveOrigem(
    chaveOrigem: string,
  ): { tipo: string; chave: number } | null {
    if (!chaveOrigem || chaveOrigem.length < 3) return null;

    const tipo = chaveOrigem.substring(0, 2).toUpperCase();
    const numeroParte = chaveOrigem.substring(2);
    const chave = parseInt(numeroParte, 10);

    if (isNaN(chave)) return null;

    return { tipo, chave };
  }

  private validarConta(
    contaLancamentoId: number | null | undefined,
    contaRegraId: number,
    mapaClassificacoes: Map<number, string>,
  ): boolean {
    if (!contaLancamentoId) return false;
    if (contaLancamentoId === contaRegraId) return true;

    const classifLancamento = mapaClassificacoes.get(contaLancamentoId);
    const classifRegra = mapaClassificacoes.get(contaRegraId);

    if (!classifLancamento || !classifRegra) return false;

    const lancamento = classifLancamento.trim();
    const regra = classifRegra.trim();

    if (lancamento === regra) return true;

    return lancamento.startsWith(regra + '.');
  }

  private agruparCFOPsPorConta(
    cfops: ILancamentoFiscalCFOP[],
    itensPlano: Map<string, ItemPlanoExtendido>,
  ): GrupoCFOP[] {
    const grupos = new Map<string, GrupoCFOP>();

    for (const cfop of cfops) {
      const regra = itensPlano.get(String(cfop.CODIGOCFOP));
      if (!regra) continue;

      const chave = `${regra.conta_debito}-${regra.conta_credito}`;

      if (!grupos.has(chave)) {
        grupos.set(chave, {
          cfops: [],
          contaDebito: regra.conta_debito,
          contaCredito: regra.conta_credito,
          valorTotal: 0,
        });
      }

      const grupo = grupos.get(chave)!;
      grupo.cfops.push(cfop);
      grupo.valorTotal += cfop.VALORCONTABILIMPOSTO;
    }

    return Array.from(grupos.values());
  }

  private conferirCFOPs(
    numeronf: number,
    chaveFiscal: number,
    tipoLancamento: 'ENTRADA' | 'SAIDA',
    cfops: ILancamentoFiscalCFOP[],
    contabeisDisponiveis: ILancamentoContabil[],
    todosContabeis: ILancamentoContabil[], // NOVO: todos os contábeis para buscar RE
    itensPlano: Map<string, ItemPlanoExtendido>,
    mapaClassificacoes: Map<number, string>,
  ): ResultadoConferenciaItem {
    const divergencias: IDivergenciaConferencia[] = [];
    const notasCorretas: INotaConferida[] = [];

    if (!cfops || cfops.length === 0) {
      return { divergencias, notasCorretas };
    }

    const cfopsNaoConfigurados: ILancamentoFiscalCFOP[] = [];
    const cfopsNaoContabiliza: ILancamentoFiscalCFOP[] = [];
    const cfopsRetidos: ILancamentoFiscalCFOP[] = [];
    const cfopsParaConferir: ILancamentoFiscalCFOP[] = [];

    for (const cfop of cfops) {
      const regra = itensPlano.get(String(cfop.CODIGOCFOP));

      if (!regra) {
        cfopsNaoConfigurados.push(cfop);
      } else if (!regra.contabiliza) {
        cfopsNaoContabiliza.push(cfop);
      } else if (regra.retido) {
        cfopsRetidos.push(cfop);
      } else {
        cfopsParaConferir.push(cfop);
      }
    }

    for (const cfop of cfopsNaoConfigurados) {
      divergencias.push({
        tipo: 'CFOP_NAO_CONFIGURADO',
        numeroNf: numeronf,
        tipoLancamento,
        cfop: cfop.CODIGOCFOP,
        chaveFiscal,
        valorFiscal: cfop.VALORCONTABILIMPOSTO,
        descricao: `CFOP ${cfop.CODIGOCFOP} não está configurado no plano de contabilização`,
      });
    }

    for (const cfop of cfopsNaoContabiliza) {
      notasCorretas.push({
        numeroNf: numeronf,
        tipoLancamento,
        cfop: cfop.CODIGOCFOP,
        chaveFiscal,
        chaveContabil: null,
        valorFiscal: cfop.VALORCONTABILIMPOSTO,
        valorContabil: 0,
        contaDebito: null,
        contaCredito: null,
      });
    }

    const resRetidos = this.conferirCFOPsComRetencao(
      numeronf,
      chaveFiscal,
      tipoLancamento,
      cfopsRetidos,
      todosContabeis,
      itensPlano,
      mapaClassificacoes,
    );

    divergencias.push(...resRetidos.divergencias);
    if (resRetidos.notasCorretas) {
      notasCorretas.push(...resRetidos.notasCorretas);
    }

    if (cfopsParaConferir.length === 0) {
      return { divergencias, notasCorretas };
    }

    if (contabeisDisponiveis.length === 0) {
      for (const cfop of cfopsParaConferir) {
        divergencias.push({
          tipo: 'NAO_ENCONTRADO_CONTABIL',
          numeroNf: numeronf,
          tipoLancamento,
          cfop: cfop.CODIGOCFOP,
          chaveFiscal,
          valorFiscal: cfop.VALORCONTABILIMPOSTO,
          descricao: `CFOP ${cfop.CODIGOCFOP} da NF ${numeronf} (Chave ${chaveFiscal}) não encontrado no contábil`,
        });
      }
      return { divergencias, notasCorretas };
    }

    const grupos = this.agruparCFOPsPorConta(cfopsParaConferir, itensPlano);

    for (const grupo of grupos) {
      const idxCorreto = contabeisDisponiveis.findIndex((contabil) => {
        const diff = Math.abs(grupo.valorTotal - contabil.VALORLCTOCTB);
        if (diff > 0.01) return false;

        const debitoOk = this.validarConta(
          contabil.CONTACTBDEB,
          grupo.contaDebito,
          mapaClassificacoes,
        );
        const creditoOk = this.validarConta(
          contabil.CONTACTBCRED,
          grupo.contaCredito,
          mapaClassificacoes,
        );

        return debitoOk && creditoOk;
      });

      if (idxCorreto !== -1) {
        const contabilCorreto = contabeisDisponiveis.splice(idxCorreto, 1)[0];

        for (const cfop of grupo.cfops) {
          notasCorretas.push({
            numeroNf: numeronf,
            tipoLancamento,
            cfop: cfop.CODIGOCFOP,
            chaveFiscal,
            chaveContabil: contabilCorreto.CHAVELCTOCTB,
            valorFiscal: cfop.VALORCONTABILIMPOSTO,
            valorContabil: grupo.valorTotal,
            contaDebito: contabilCorreto.CONTACTBDEB,
            contaCredito: contabilCorreto.CONTACTBCRED,
          });
        }
      } else {
        const idxMesmoValor = contabeisDisponiveis.findIndex(
          (c) => Math.abs(grupo.valorTotal - c.VALORLCTOCTB) <= 0.01,
        );

        if (idxMesmoValor !== -1) {
          const ctb = contabeisDisponiveis[idxMesmoValor];
          const cfopsLista = grupo.cfops.map((c) => c.CODIGOCFOP).join(', ');

          divergencias.push({
            tipo: 'CONTA_INCORRETA',
            numeroNf: numeronf,
            tipoLancamento,
            cfop: grupo.cfops[0].CODIGOCFOP,
            chaveFiscal,
            valorFiscal: grupo.valorTotal,
            chaveContabil: ctb.CHAVELCTOCTB,
            valorContabil: ctb.VALORLCTOCTB,
            contaDebito: ctb.CONTACTBDEB,
            contaCredito: ctb.CONTACTBCRED,
            contaDebitoEsperada: grupo.contaDebito,
            contaCreditoEsperada: grupo.contaCredito,
            descricao: `Grupo CFOPs [${cfopsLista}]. Débito: ${ctb.CONTACTBDEB ? mapaClassificacoes.get(ctb.CONTACTBDEB) || '???' : 'NULL'} vs Esperado ${mapaClassificacoes.get(grupo.contaDebito) || '???'}. Crédito: ${ctb.CONTACTBCRED ? mapaClassificacoes.get(ctb.CONTACTBCRED) || '???' : 'NULL'} vs Esperado ${mapaClassificacoes.get(grupo.contaCredito) || '???'}.`,
          });
        } else {
          const cfopsLista = grupo.cfops.map((c) => c.CODIGOCFOP).join(', ');

          divergencias.push({
            tipo: 'VALOR_DIVERGENTE',
            numeroNf: numeronf,
            tipoLancamento,
            cfop: grupo.cfops[0].CODIGOCFOP,
            chaveFiscal,
            valorFiscal: grupo.valorTotal,
            chaveContabil: contabeisDisponiveis[0]?.CHAVELCTOCTB,
            valorContabil: contabeisDisponiveis[0]?.VALORLCTOCTB,
            contaDebito: contabeisDisponiveis[0]?.CONTACTBDEB,
            contaCredito: contabeisDisponiveis[0]?.CONTACTBCRED,
            descricao: `Grupo CFOPs [${cfopsLista}]. Valor fiscal: ${grupo.valorTotal.toFixed(2)}, não encontrado no contábil.`,
          });
        }
      }
    }

    return { divergencias, notasCorretas };
  }

  /**
   * Confere notas fiscais com retenção de impostos
   */
  private conferirCFOPsComRetencao(
    numeronf: number,
    chaveFiscal: number,
    tipoLancamento: 'ENTRADA' | 'SAIDA',
    cfops: ILancamentoFiscalCFOP[],
    todosContabeis: ILancamentoContabil[],
    itensPlano: Map<string, ItemPlanoExtendido>,
    mapaClassificacoes: Map<number, string>,
  ): ResultadoConferenciaItem {
    const divergencias: IDivergenciaConferencia[] = [];
    const notasCorretas: INotaConferida[] = [];

    if (!cfops || cfops.length === 0) {
      return { divergencias, notasCorretas };
    }

    const cfopsRetidos = cfops.filter((cfop) => {
      const regra = itensPlano.get(String(cfop.CODIGOCFOP));
      return regra && regra.retido;
    });

    // DEBUG LOG
    this.logger.log(
      `NF ${numeronf}: ${cfopsRetidos.length} CFOPs com retenção`,
    );

    if (cfopsRetidos.length === 0) {
      return { divergencias, notasCorretas };
    }

    const contabeisRE = todosContabeis.filter((c) => {
      if (!c.CHAVEORIGEM?.startsWith('RE')) return false;
      if (!c.COMPLHIST) return false;

      const padraoNF = new RegExp(`NF\\s+${numeronf}\\s+`, 'i');
      return padraoNF.test(c.COMPLHIST);
    });

    // DEBUG LOG
    this.logger.log(
      `NF ${numeronf}: ${contabeisRE.length} lançamentos contábeis RE encontrados`,
    );

    if (contabeisRE.length > 0) {
      this.logger.log(`Exemplo COMPLHIST: ${contabeisRE[0].COMPLHIST}`);
      this.logger.log(`Exemplo CHAVEORIGEM: ${contabeisRE[0].CHAVEORIGEM}`);
    }

    if (contabeisRE.length === 0) {
      for (const cfop of cfopsRetidos) {
        divergencias.push({
          tipo: 'NAO_ENCONTRADO_CONTABIL',
          numeroNf: numeronf,
          tipoLancamento,
          cfop: cfop.CODIGOCFOP,
          chaveFiscal,
          valorFiscal: cfop.VALORCONTABILIMPOSTO,
          descricao: `CFOP ${cfop.CODIGOCFOP} com retenção da NF ${numeronf} não encontrado no contábil (CHAVEORIGEM RE)`,
        });
      }
      return { divergencias, notasCorretas };
    }

    for (const cfop of cfopsRetidos) {
      const regra = itensPlano.get(String(cfop.CODIGOCFOP));
      if (!regra) continue;

      const valorBruto = cfop.VALORCONTABILIMPOSTO;

      // DEBUG: Log dos valores
      this.logger.log(`NF ${numeronf} - CFOP ${cfop.CODIGOCFOP}:`);
      this.logger.log(`  Valor Bruto: ${valorBruto.toFixed(2)}`);
      this.logger.log(`  Conta Débito esperada: ${regra.conta_debito}`);
      this.logger.log(`  Conta Crédito esperada: ${regra.conta_credito}`);

      // DEBUG: Log dos lançamentos contábeis encontrados
      this.logger.log(`  Lançamentos contábeis RE:`);
      contabeisRE.forEach((c, idx) => {
        this.logger.log(
          `    [${idx}] Valor: ${c.VALORLCTOCTB.toFixed(2)}, Déb: ${c.CONTACTBDEB || 'NULL'}, Créd: ${c.CONTACTBCRED || 'NULL'}`,
        );
      });

      // Procura o lançamento BRUTO (débito preenchido, crédito vazio)
      const lancamentoBrutoIdx = contabeisRE.findIndex((c) => {
        const diff = Math.abs(valorBruto - c.VALORLCTOCTB);
        if (diff > 0.01) return false;

        const debitoOk = this.validarConta(
          c.CONTACTBDEB,
          regra.conta_debito,
          mapaClassificacoes,
        );
        const creditoVazio = !c.CONTACTBCRED;

        this.logger.log(
          `    Testando lançamento bruto: Valor OK? ${diff <= 0.01}, Débito OK? ${debitoOk}, Crédito vazio? ${creditoVazio}`,
        );

        return debitoOk && creditoVazio;
      });

      // Procura o lançamento LÍQUIDO (crédito preenchido, débito vazio)
      // Como não sabemos o valor dos impostos ainda, apenas verificamos se existe UM lançamento
      // com crédito na conta esperada e débito vazio
      const lancamentoLiquidoIdx = contabeisRE.findIndex((c) => {
        const creditoOk = this.validarConta(
          c.CONTACTBCRED,
          regra.conta_credito,
          mapaClassificacoes,
        );
        const debitoVazio = !c.CONTACTBDEB;

        // Valor do líquido deve ser menor que o bruto (pois tem retenção)
        const valorMenor = c.VALORLCTOCTB < valorBruto;

        this.logger.log(
          `    Testando lançamento líquido: Crédito OK? ${creditoOk}, Débito vazio? ${debitoVazio}, Valor menor? ${valorMenor} (${c.VALORLCTOCTB.toFixed(2)} < ${valorBruto.toFixed(2)})`,
        );

        return creditoOk && debitoVazio && valorMenor;
      });

      this.logger.log(
        `  Bruto encontrado? ${lancamentoBrutoIdx !== -1}, Líquido encontrado? ${lancamentoLiquidoIdx !== -1}`,
      );

      if (lancamentoBrutoIdx !== -1 && lancamentoLiquidoIdx !== -1) {
        const contabilBruto = contabeisRE[lancamentoBrutoIdx];
        const contabilLiquido = contabeisRE[lancamentoLiquidoIdx];

        notasCorretas.push({
          numeroNf: numeronf,
          tipoLancamento,
          cfop: cfop.CODIGOCFOP,
          chaveFiscal,
          chaveContabil: contabilBruto.CHAVELCTOCTB,
          valorFiscal: valorBruto,
          valorContabil: valorBruto,
          contaDebito: contabilBruto.CONTACTBDEB,
          contaCredito: contabilLiquido.CONTACTBCRED,
        });
      } else {
        divergencias.push({
          tipo: 'VALOR_DIVERGENTE',
          numeroNf: numeronf,
          tipoLancamento,
          cfop: cfop.CODIGOCFOP,
          chaveFiscal,
          valorFiscal: valorBruto,
          descricao: `CFOP ${cfop.CODIGOCFOP} com retenção. Esperado: Lançamento débito R$ ${valorBruto.toFixed(2)} na conta ${mapaClassificacoes.get(regra.conta_debito)} (crédito vazio) + Lançamento crédito na conta ${mapaClassificacoes.get(regra.conta_credito)} (débito vazio)`,
        });
      }
    }

    return { divergencias, notasCorretas };
  }

  async executarConferencia(
    params: IParamsConferencia,
  ): Promise<IResultadoConferencia> {
    const { codigoEmpresa, dataInicio, dataFim, planoContabilizacaoId } =
      params;

    this.logger.log(`Iniciando conferencia fiscal - Empresa: ${codigoEmpresa}`);

    const mapaClassificacoes =
      await this.planoContasService.carregarMapaClassificacoes(codigoEmpresa);

    const planoComItens =
      await this.planoContabilizacaoService.obterPlanoComItens(
        planoContabilizacaoId,
      );
    if (!planoComItens) throw new Error('Plano não encontrado');

    // Agora o mapa inclui o campo contabiliza
    const itensPlano = new Map<string, ItemPlanoExtendido>();
    for (const item of planoComItens.itens) {
      itensPlano.set(item.cfop, {
        conta_credito: Number(item.conta_credito),
        conta_debito: Number(item.conta_debito),
        contabiliza: item.contabiliza,
        retido: item.retido,
      });
    }

    const [entradas, saidas, lancamentosContabeis] = await Promise.all([
      this.lancamentoFiscalRepo.findEntradasByPeriodo(
        codigoEmpresa,
        dataInicio,
        dataFim,
      ),
      this.lancamentoFiscalRepo.findSaidasByPeriodo(
        codigoEmpresa,
        dataInicio,
        dataFim,
      ),
      this.lancamentoContabilRepo.findByEmpresaPeriodoAndOrigem(
        codigoEmpresa,
        dataInicio,
        dataFim,
        'FI',
      ),
    ]);

    const contabeisPorChaveFiscal = new Map<string, ILancamentoContabil[]>();
    for (const contabil of lancamentosContabeis) {
      const parsed = this.parseChaveOrigem(contabil.CHAVEORIGEM);
      if (!parsed) continue;

      const mapKey = `${parsed.tipo}-${parsed.chave}`;
      if (!contabeisPorChaveFiscal.has(mapKey)) {
        contabeisPorChaveFiscal.set(mapKey, []);
      }
      contabeisPorChaveFiscal.get(mapKey)!.push(contabil);
    }

    this.logger.log(
      `Mapeados ${lancamentosContabeis.length} contábeis em ${contabeisPorChaveFiscal.size} chaves fiscais`,
    );

    const divergencias: IDivergenciaConferencia[] = [];
    const notasCorretas: INotaConferida[] = [];
    let totalCFOPsEntrada = 0;
    let cfopsEntradasConferidos = 0;

    for (const entrada of entradas) {
      if (!entrada.cfops) continue;
      totalCFOPsEntrada += entrada.cfops.length;

      const mapKey = `ME-${entrada.CHAVELCTOFISENT}`;
      const contabeisDisponiveis = contabeisPorChaveFiscal.get(mapKey) || [];

      const res = this.conferirCFOPs(
        entrada.NUMERONF,
        entrada.CHAVELCTOFISENT,
        'ENTRADA',
        entrada.cfops,
        contabeisDisponiveis,
        lancamentosContabeis,
        itensPlano,
        mapaClassificacoes,
      );

      if (res.notasCorretas && res.notasCorretas.length > 0) {
        cfopsEntradasConferidos += res.notasCorretas.length;
        notasCorretas.push(...res.notasCorretas);
      }
      if (res.divergencias.length > 0) {
        divergencias.push(...res.divergencias);
      }
    }

    let totalCFOPsSaida = 0;
    let cfopsSaidasConferidos = 0;

    for (const saida of saidas) {
      if (!saida.cfops) continue;
      totalCFOPsSaida += saida.cfops.length;

      const mapKey = `MS-${saida.CHAVELCTOFISSAI}`;
      const contabeisDisponiveis = contabeisPorChaveFiscal.get(mapKey) || [];

      const res = this.conferirCFOPs(
        saida.NUMERONF,
        saida.CHAVELCTOFISSAI,
        'SAIDA',
        saida.cfops,
        contabeisDisponiveis,
        lancamentosContabeis,
        itensPlano,
        mapaClassificacoes,
      );

      if (res.notasCorretas && res.notasCorretas.length > 0) {
        cfopsSaidasConferidos += res.notasCorretas.length;
        notasCorretas.push(...res.notasCorretas);
      }
      if (res.divergencias.length > 0) {
        divergencias.push(...res.divergencias);
      }
    }

    this.logger.log(
      `Conferencia concluida - ${divergencias.length} divergencias, ${notasCorretas.length} corretas`,
    );

    return {
      totalEntradas: entradas.length,
      totalSaidas: saidas.length,
      totalCFOPsEntrada,
      totalCFOPsSaida,
      cfopsEntradasConferidos,
      cfopsSaidasConferidos,
      divergenciasEncontradas: divergencias.length,
      divergencias,
      notasCorretas,
    };
  }
}
