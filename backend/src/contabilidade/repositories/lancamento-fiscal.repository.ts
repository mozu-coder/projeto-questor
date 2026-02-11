import { Injectable, Logger } from '@nestjs/common';
import { QuestorRepository } from '../../questor/repositories/questor.repository';
import {
  ILancamentoFiscalEntrada,
  ILancamentoFiscalSaida,
  ILancamentoFiscalCFOP,
} from '../../shared/interfaces/lancamento-fiscal.interface';

@Injectable()
export class LancamentoFiscalRepository {
  private readonly logger = new Logger(LancamentoFiscalRepository.name);

  constructor(private readonly questor: QuestorRepository) {}

  /**
   * Busca lançamentos fiscais de entrada por período
   */
  async findEntradasByPeriodo(
    codigoEmpresa: number,
    dataInicio: string,
    dataFim: string,
  ): Promise<ILancamentoFiscalEntrada[]> {
    this.logger.log(
      `Buscando entradas - Empresa: ${codigoEmpresa}, Período: ${dataInicio} a ${dataFim}`,
    );

    const entradas = await this.questor.executeQuery<ILancamentoFiscalEntrada>(
      `SELECT 
        CODIGOEMPRESA,
        CHAVELCTOFISENT,
        CODIGOESTAB,
        NUMERONF,
        ESPECIENF,
        DATALCTOFIS,
        VALORCONTABIL,
        ORIGEMDADO
       FROM LCTOFISENT
       WHERE CODIGOEMPRESA = ?
         AND DATALCTOFIS BETWEEN ? AND ?
       ORDER BY DATALCTOFIS, CHAVELCTOFISENT`,
      [codigoEmpresa, dataInicio, dataFim],
    );

    this.logger.log(`Encontradas ${entradas.length} entradas`);

    if (entradas.length === 0) return [];

    const chaves = entradas.map((e) => e.CHAVELCTOFISENT);
    const todosCfops: ILancamentoFiscalCFOP[] = [];

    const BATCH_SIZE = 1000;
    const totalLotes = Math.ceil(chaves.length / BATCH_SIZE);

    this.logger.log(`Buscando CFOPs de entrada em ${totalLotes} lotes`);

    for (let i = 0; i < chaves.length; i += BATCH_SIZE) {
      const loteNum = Math.floor(i / BATCH_SIZE) + 1;
      const lote = chaves.slice(i, i + BATCH_SIZE);

      this.logger.log(
        `Processando lote ${loteNum}/${totalLotes} (${lote.length} chaves)`,
      );

      const cfopsLote = await this.questor.executeQuery<ILancamentoFiscalCFOP>(
        `SELECT 
          CHAVELCTOFISENT,
          CODIGOCFOP,
          VALORCONTABILIMPOSTO
        FROM LCTOFISENTCFOP
        WHERE CODIGOEMPRESA = ?
          AND DATALCTOFIS BETWEEN ? AND ?
          AND CHAVELCTOFISENT IN (${lote.join(',')})`,
        [codigoEmpresa, dataInicio, dataFim],
      );

      for (const cfop of cfopsLote) {
        todosCfops.push(cfop);
      }
    }

    this.logger.log(
      `Total de CFOPs de entrada encontrados: ${todosCfops.length}`,
    );
    this.logger.log(`Mapeando CFOPs por chave`);

    const cfopsPorChave = new Map<number, ILancamentoFiscalCFOP[]>();
    for (const cfop of todosCfops) {
      const chave = cfop.CHAVELCTOFISENT!;
      if (!cfopsPorChave.has(chave)) {
        cfopsPorChave.set(chave, []);
      }
      cfopsPorChave.get(chave)!.push(cfop);
    }

    for (const entrada of entradas) {
      entrada.cfops = cfopsPorChave.get(entrada.CHAVELCTOFISENT) || [];
    }

    this.logger.log(`Entradas processadas com CFOPs`);

    return entradas;
  }

  /**
   * Busca lançamentos fiscais de saída por período
   */
  async findSaidasByPeriodo(
    codigoEmpresa: number,
    dataInicio: string,
    dataFim: string,
  ): Promise<ILancamentoFiscalSaida[]> {
    this.logger.log(
      `Buscando saidas - Empresa: ${codigoEmpresa}, Período: ${dataInicio} a ${dataFim}`,
    );

    const saidas = await this.questor.executeQuery<ILancamentoFiscalSaida>(
      `SELECT 
        CODIGOEMPRESA,
        CHAVELCTOFISSAI,
        CODIGOESTAB,
        NUMERONF,
        ESPECIENF,
        DATALCTOFIS,
        VALORCONTABIL,
        ORIGEMDADO
       FROM LCTOFISSAI
       WHERE CODIGOEMPRESA = ?
         AND DATALCTOFIS BETWEEN ? AND ?
       ORDER BY DATALCTOFIS, CHAVELCTOFISSAI`,
      [codigoEmpresa, dataInicio, dataFim],
    );

    this.logger.log(`Encontradas ${saidas.length} saidas`);

    if (saidas.length === 0) return [];

    const chaves = saidas.map((s) => s.CHAVELCTOFISSAI);
    const todosCfops: ILancamentoFiscalCFOP[] = [];

    const BATCH_SIZE = 1000;
    const totalLotes = Math.ceil(chaves.length / BATCH_SIZE);

    this.logger.log(`Buscando CFOPs de saida em ${totalLotes} lotes`);

    for (let i = 0; i < chaves.length; i += BATCH_SIZE) {
      const loteNum = Math.floor(i / BATCH_SIZE) + 1;
      const lote = chaves.slice(i, i + BATCH_SIZE);

      this.logger.log(
        `Processando lote ${loteNum}/${totalLotes} (${lote.length} chaves)`,
      );

      const cfopsLote = await this.questor.executeQuery<ILancamentoFiscalCFOP>(
        `SELECT 
          CHAVELCTOFISSAI,
          CODIGOCFOP,
          VALORCONTABILIMPOSTO
        FROM LCTOFISSAICFOP
        WHERE CODIGOEMPRESA = ?
          AND DATALCTOFIS BETWEEN ? AND ?
          AND CHAVELCTOFISSAI IN (${lote.join(',')})`,
        [codigoEmpresa, dataInicio, dataFim],
      );

      for (const cfop of cfopsLote) {
        todosCfops.push(cfop);
      }
    }

    this.logger.log(
      `Total de CFOPs de saida encontrados: ${todosCfops.length}`,
    );
    this.logger.log(`Mapeando CFOPs por chave`);

    const cfopsPorChave = new Map<number, ILancamentoFiscalCFOP[]>();
    for (const cfop of todosCfops) {
      const chave = cfop.CHAVELCTOFISSAI!;
      if (!cfopsPorChave.has(chave)) {
        cfopsPorChave.set(chave, []);
      }
      cfopsPorChave.get(chave)!.push(cfop);
    }

    for (const saida of saidas) {
      saida.cfops = cfopsPorChave.get(saida.CHAVELCTOFISSAI) || [];
    }

    this.logger.log(`Saidas processadas com CFOPs`);

    return saidas;
  }
}
