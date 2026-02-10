import { Injectable } from '@nestjs/common';
import { LancamentoFiscalRepository } from '../repositories/lancamento-fiscal.repository';
import {
  ILancamentoFiscalEntrada,
  ILancamentoFiscalSaida,
  ILancamentoFiscal,
} from '../../shared/interfaces/lancamento-fiscal.interface';

@Injectable()
export class LancamentoFiscalService {
  constructor(
    private readonly lancamentoFiscalRepo: LancamentoFiscalRepository,
  ) {}

  async listarEntradasPorPeriodo(
    codigoEmpresa: number,
    dataInicio: string,
    dataFim: string,
  ): Promise<ILancamentoFiscalEntrada[]> {
    return this.lancamentoFiscalRepo.findEntradasByPeriodo(
      codigoEmpresa,
      dataInicio,
      dataFim,
    );
  }

  async listarSaidasPorPeriodo(
    codigoEmpresa: number,
    dataInicio: string,
    dataFim: string,
  ): Promise<ILancamentoFiscalSaida[]> {
    return this.lancamentoFiscalRepo.findSaidasByPeriodo(
      codigoEmpresa,
      dataInicio,
      dataFim,
    );
  }

  /**
   * Lista todos os lançamentos fiscais (entradas + saídas) de forma unificada
   */
  async listarTodos(
    codigoEmpresa: number,
    dataInicio: string,
    dataFim: string,
  ): Promise<ILancamentoFiscal[]> {
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

    const todosLancamentos: ILancamentoFiscal[] = [
      ...entradas.map((e) => ({
        CODIGOEMPRESA: e.CODIGOEMPRESA,
        CHAVE: e.CHAVELCTOFISENT,
        CODIGOESTAB: e.CODIGOESTAB,
        NUMERONF: e.NUMERONF,
        ESPECIENF: e.ESPECIENF,
        DATALCTOFIS: e.DATALCTOFIS,
        VALORCONTABIL: e.VALORCONTABIL,
        ORIGEMDADO: e.ORIGEMDADO,
        TIPO: 'ENTRADA' as const,
      })),
      ...saidas.map((s) => ({
        CODIGOEMPRESA: s.CODIGOEMPRESA,
        CHAVE: s.CHAVELCTOFISSAI,
        CODIGOESTAB: s.CODIGOESTAB,
        NUMERONF: s.NUMERONF,
        ESPECIENF: s.ESPECIENF,
        DATALCTOFIS: s.DATALCTOFIS,
        VALORCONTABIL: s.VALORCONTABIL,
        ORIGEMDADO: s.ORIGEMDADO,
        TIPO: 'SAIDA' as const,
      })),
    ];

    todosLancamentos.sort((a, b) => a.DATALCTOFIS.localeCompare(b.DATALCTOFIS));

    return todosLancamentos;
  }
}
