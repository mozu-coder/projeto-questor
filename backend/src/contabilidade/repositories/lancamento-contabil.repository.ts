import { Injectable, Logger } from '@nestjs/common';
import { QuestorRepository } from '../../questor/repositories/questor.repository';
import { ILancamentoContabil } from '../../shared/interfaces/lancamento-contabil.interface';

@Injectable()
export class LancamentoContabilRepository {
  private readonly logger = new Logger(LancamentoContabilRepository.name);

  constructor(private readonly questor: QuestorRepository) {}

  /**
   * Busca lançamentos contábeis por empresa e período
   */
  async findByEmpresaAndPeriodo(
    codigoEmpresa: number,
    dataInicio: string,
    dataFim: string,
  ): Promise<ILancamentoContabil[]> {
    this.logger.log(
      `Buscando lancamentos contabeis - Empresa: ${codigoEmpresa}, Período: ${dataInicio} a ${dataFim}`,
    );

    const result = await this.questor.executeQuery<ILancamentoContabil>(
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

    this.logger.log(`Encontrados ${result.length} lancamentos contabeis`);
    return result;
  }

  /**
   * Busca lançamentos contábeis por empresa, período e origem
   */
  async findByEmpresaPeriodoAndOrigem(
    codigoEmpresa: number,
    dataInicio: string,
    dataFim: string,
    codigoOrigem: string,
  ): Promise<ILancamentoContabil[]> {
    this.logger.log(
      `Buscando lancamentos contabeis por origem - Empresa: ${codigoEmpresa}, Origem: ${codigoOrigem}`,
    );

    const result = await this.questor.executeQuery<ILancamentoContabil>(
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

    this.logger.log(
      `Encontrados ${result.length} lancamentos contabeis com origem ${codigoOrigem}`,
    );
    return result;
  }
}
