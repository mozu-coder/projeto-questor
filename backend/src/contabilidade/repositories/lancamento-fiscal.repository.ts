import { Injectable } from '@nestjs/common';
import { QuestorRepository } from '../../questor/repositories/questor.repository';
import {
  ILancamentoFiscalEntrada,
  ILancamentoFiscalSaida,
} from '../../shared/interfaces/lancamento-fiscal.interface';

@Injectable()
export class LancamentoFiscalRepository {
  constructor(private readonly questor: QuestorRepository) {}

  async findEntradasByPeriodo(
    codigoEmpresa: number,
    dataInicio: string,
    dataFim: string,
  ): Promise<ILancamentoFiscalEntrada[]> {
    return this.questor.executeQuery<ILancamentoFiscalEntrada>(
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
  }

  async findSaidasByPeriodo(
    codigoEmpresa: number,
    dataInicio: string,
    dataFim: string,
  ): Promise<ILancamentoFiscalSaida[]> {
    return this.questor.executeQuery<ILancamentoFiscalSaida>(
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
  }
}
