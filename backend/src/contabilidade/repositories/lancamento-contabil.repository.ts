import { Injectable } from '@nestjs/common';
import { QuestorRepository } from '../../questor/repositories/questor.repository';
import { ILancamentoContabil } from '../../shared/interfaces/lancamento-contabil.interface';

@Injectable()
export class LancamentoContabilRepository {
  constructor(private readonly questor: QuestorRepository) {}

  async findByEmpresaAndPeriodo(
    codigoEmpresa: number,
    dataInicio: string,
    dataFim: string,
  ): Promise<ILancamentoContabil[]> {
    return this.questor.executeQuery<ILancamentoContabil>(
      `SELECT 
        CODIGOEMPRESA,
        CHAVELCTOCTB,
        DATALCTOCTB,
        CODIGOORIGLCTOCTB,
        CONTACTBDEB,
        CONTACTBCRED,
        COMPLHIST,
        VALORLCTOCTB,
        CHAVEORIGEM,
        TRANSCTB
       FROM LCTOCTB
       WHERE CODIGOEMPRESA = ?
         AND DATALCTOCTB BETWEEN ? AND ?
       ORDER BY DATALCTOCTB, CHAVELCTOCTB`,
      [codigoEmpresa, dataInicio, dataFim],
    );
  }

  async findByEmpresaPeriodoAndOrigem(
    codigoEmpresa: number,
    dataInicio: string,
    dataFim: string,
    codigoOrigem: string,
  ): Promise<ILancamentoContabil[]> {
    return this.questor.executeQuery<ILancamentoContabil>(
      `SELECT 
        CODIGOEMPRESA,
        CHAVELCTOCTB,
        DATALCTOCTB,
        CODIGOORIGLCTOCTB,
        CONTACTBDEB,
        CONTACTBCRED,
        COMPLHIST,
        VALORLCTOCTB,
        CHAVEORIGEM,
        TRANSCTB
       FROM LCTOCTB
       WHERE CODIGOEMPRESA = ?
         AND DATALCTOCTB BETWEEN ? AND ?
         AND CODIGOORIGLCTOCTB = ?
       ORDER BY DATALCTOCTB, CHAVELCTOCTB`,
      [codigoEmpresa, dataInicio, dataFim, codigoOrigem],
    );
  }
}
