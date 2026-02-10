// contabilidade/services/conferencia-fiscal.service.ts
import { Injectable } from '@nestjs/common';
import { LancamentoFiscalRepository } from '../repositories/lancamento-fiscal.repository';
import { LancamentoContabilRepository } from '../repositories/lancamento-contabil.repository';
import { PlanoContabilizacaoService } from './plano-contabilizacao.service';
import {
  IDivergenciaConferencia,
  IResultadoConferencia,
  IParamsConferencia,
  INotaConferida, // ← NOVO
} from '../../shared/interfaces/conferencia-fiscal.interface';
import {
  ILancamentoFiscalEntrada,
  ILancamentoFiscalSaida,
} from '../../shared/interfaces/lancamento-fiscal.interface';
import { ILancamentoContabil } from '../../shared/interfaces/lancamento-contabil.interface';

interface ResultadoConferenciaItem {
  divergencias: IDivergenciaConferencia[];
  notaCorreta?: INotaConferida; // ← NOVO
}

@Injectable()
export class ConferenciaFiscalService {
  constructor(
    private readonly lancamentoFiscalRepo: LancamentoFiscalRepository,
    private readonly lancamentoContabilRepo: LancamentoContabilRepository,
    private readonly planoContabilizacaoService: PlanoContabilizacaoService,
  ) {}

  private extrairNumeroNF(complhist: string): number | null {
    const matchNF = complhist.match(/NF\s+(\d+)/i);
    if (matchNF) {
      return parseInt(matchNF[1]);
    }

    const matchNumero = complhist.match(/\b(\d{4,})\b/);
    if (matchNumero) {
      return parseInt(matchNumero[1]);
    }

    return null;
  }

  private buscarContabilPorNF(
    numeroNf: number,
    lancamentosContabeis: ILancamentoContabil[],
  ): ILancamentoContabil | null {
    return (
      lancamentosContabeis.find((lanc) => {
        const nfExtraido = this.extrairNumeroNF(lanc.COMPLHIST);
        return nfExtraido === numeroNf;
      }) || null
    );
  }

  private async conferirEntrada(
    entrada: ILancamentoFiscalEntrada,
    lancamentosContabeis: ILancamentoContabil[],
    itensPlano: Map<string, { conta_credito: string; conta_debito: string }>,
  ): Promise<ResultadoConferenciaItem> {
    const divergencias: IDivergenciaConferencia[] = [];
    let notaCorreta: INotaConferida | undefined;

    const contabil = this.buscarContabilPorNF(
      entrada.NUMERONF,
      lancamentosContabeis,
    );

    if (!contabil) {
      divergencias.push({
        tipo: 'NAO_ENCONTRADO_CONTABIL',
        numeroNf: entrada.NUMERONF,
        tipoLancamento: 'ENTRADA',
        chaveFiscal: entrada.CHAVELCTOFISENT,
        valorFiscal: entrada.VALORCONTABIL,
        descricao: `Nota fiscal ${entrada.NUMERONF} não encontrada nos lançamentos contábeis`,
      });
      return { divergencias };
    }

    const diferencaValor = Math.abs(
      entrada.VALORCONTABIL - contabil.VALORLCTOCTB,
    );
    if (diferencaValor > 0.01) {
      divergencias.push({
        tipo: 'VALOR_DIVERGENTE',
        numeroNf: entrada.NUMERONF,
        tipoLancamento: 'ENTRADA',
        chaveFiscal: entrada.CHAVELCTOFISENT,
        valorFiscal: entrada.VALORCONTABIL,
        chaveContabil: contabil.CHAVELCTOCTB,
        valorContabil: contabil.VALORLCTOCTB,
        contaDebito: contabil.CONTACTBDEB,
        contaCredito: contabil.CONTACTBCRED,
        descricao: `Divergência de valor na NF ${entrada.NUMERONF}: Fiscal R$ ${entrada.VALORCONTABIL.toFixed(2)} vs Contábil R$ ${contabil.VALORLCTOCTB.toFixed(2)}`,
      });
    } else {
      // ← NOVO: Se não tem divergência, adiciona como nota correta
      notaCorreta = {
        numeroNf: entrada.NUMERONF,
        tipoLancamento: 'ENTRADA',
        chaveFiscal: entrada.CHAVELCTOFISENT,
        chaveContabil: contabil.CHAVELCTOCTB,
        valorFiscal: entrada.VALORCONTABIL,
        valorContabil: contabil.VALORLCTOCTB,
        contaDebito: contabil.CONTACTBDEB,
        contaCredito: contabil.CONTACTBCRED,
      };
    }

    return { divergencias, notaCorreta };
  }

  private async conferirSaida(
    saida: ILancamentoFiscalSaida,
    lancamentosContabeis: ILancamentoContabil[],
    itensPlano: Map<string, { conta_credito: string; conta_debito: string }>,
  ): Promise<ResultadoConferenciaItem> {
    const divergencias: IDivergenciaConferencia[] = [];
    let notaCorreta: INotaConferida | undefined;

    const contabil = this.buscarContabilPorNF(
      saida.NUMERONF,
      lancamentosContabeis,
    );

    if (!contabil) {
      divergencias.push({
        tipo: 'NAO_ENCONTRADO_CONTABIL',
        numeroNf: saida.NUMERONF,
        tipoLancamento: 'SAIDA',
        chaveFiscal: saida.CHAVELCTOFISSAI,
        valorFiscal: saida.VALORCONTABIL,
        descricao: `Nota fiscal ${saida.NUMERONF} não encontrada nos lançamentos contábeis`,
      });
      return { divergencias };
    }

    const diferencaValor = Math.abs(
      saida.VALORCONTABIL - contabil.VALORLCTOCTB,
    );
    if (diferencaValor > 0.01) {
      divergencias.push({
        tipo: 'VALOR_DIVERGENTE',
        numeroNf: saida.NUMERONF,
        tipoLancamento: 'SAIDA',
        chaveFiscal: saida.CHAVELCTOFISSAI,
        valorFiscal: saida.VALORCONTABIL,
        chaveContabil: contabil.CHAVELCTOCTB,
        valorContabil: contabil.VALORLCTOCTB,
        contaDebito: contabil.CONTACTBDEB,
        contaCredito: contabil.CONTACTBCRED,
        descricao: `Divergência de valor na NF ${saida.NUMERONF}: Fiscal R$ ${saida.VALORCONTABIL.toFixed(2)} vs Contábil R$ ${contabil.VALORLCTOCTB.toFixed(2)}`,
      });
    } else {
      // ← NOVO: Se não tem divergência, adiciona como nota correta
      notaCorreta = {
        numeroNf: saida.NUMERONF,
        tipoLancamento: 'SAIDA',
        chaveFiscal: saida.CHAVELCTOFISSAI,
        chaveContabil: contabil.CHAVELCTOCTB,
        valorFiscal: saida.VALORCONTABIL,
        valorContabil: contabil.VALORLCTOCTB,
        contaDebito: contabil.CONTACTBDEB,
        contaCredito: contabil.CONTACTBCRED,
      };
    }

    return { divergencias, notaCorreta };
  }

  async executarConferencia(
    params: IParamsConferencia,
  ): Promise<IResultadoConferencia> {
    const { codigoEmpresa, dataInicio, dataFim, planoContabilizacaoId } =
      params;

    const planoComItens =
      await this.planoContabilizacaoService.obterPlanoComItens(
        planoContabilizacaoId,
      );

    if (!planoComItens) {
      throw new Error('Plano de contabilização não encontrado');
    }

    const itensPlano = new Map<
      string,
      { conta_credito: string; conta_debito: string }
    >();
    planoComItens.itens.forEach((item) => {
      itensPlano.set(item.cfop, {
        conta_credito: item.conta_credito,
        conta_debito: item.conta_debito,
      });
    });

    const entradas = await this.lancamentoFiscalRepo.findEntradasByPeriodo(
      codigoEmpresa,
      dataInicio,
      dataFim,
    );

    const saidas = await this.lancamentoFiscalRepo.findSaidasByPeriodo(
      codigoEmpresa,
      dataInicio,
      dataFim,
    );

    const lancamentosContabeis =
      await this.lancamentoContabilRepo.findByEmpresaPeriodoAndOrigem(
        codigoEmpresa,
        dataInicio,
        dataFim,
        'FI',
      );

    const divergencias: IDivergenciaConferencia[] = [];
    const notasCorretas: INotaConferida[] = []; // ← NOVO
    let entradasConferidas = 0;

    for (const entrada of entradas) {
      const resultado = await this.conferirEntrada(
        entrada,
        lancamentosContabeis,
        itensPlano,
      );
      if (resultado.divergencias.length === 0 && resultado.notaCorreta) {
        entradasConferidas++;
        notasCorretas.push(resultado.notaCorreta); // ← NOVO
      } else {
        divergencias.push(...resultado.divergencias);
      }
    }

    let saidasConferidas = 0;

    for (const saida of saidas) {
      const resultado = await this.conferirSaida(
        saida,
        lancamentosContabeis,
        itensPlano,
      );
      if (resultado.divergencias.length === 0 && resultado.notaCorreta) {
        saidasConferidas++;
        notasCorretas.push(resultado.notaCorreta); // ← NOVO
      } else {
        divergencias.push(...resultado.divergencias);
      }
    }

    return {
      totalEntradas: entradas.length,
      totalSaidas: saidas.length,
      entradasConferidas,
      saidasConferidas,
      divergenciasEncontradas: divergencias.length,
      divergencias,
      notasCorretas, // ← NOVO
    };
  }
}
