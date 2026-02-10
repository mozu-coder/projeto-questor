import { Injectable } from '@nestjs/common';
import { QuestorRepository } from '../../questor/repositories/questor.repository';
import { IPlanoContas } from '../../shared/interfaces/plano-contas.interface';

@Injectable()
export class PlanoContasRepository {
  constructor(private readonly questor: QuestorRepository) {}

  async findByEmpresa(codigoEmpresa: number): Promise<IPlanoContas[]> {
    return this.questor.executeQuery<IPlanoContas>(
      `SELECT 
        CODIGOEMPRESA,
        CONTACTB,
        CLASSIFCONTA,
        DESCRCONTA
       FROM PLANOESPEC
       WHERE CODIGOEMPRESA = ?
       ORDER BY CONTACTB`,
      [codigoEmpresa],
    );
  }

  async findByConta(
    codigoEmpresa: number,
    conta: number, // ← MUDOU: agora é number
  ): Promise<IPlanoContas | null> {
    const rows = await this.questor.executeQuery<IPlanoContas>(
      `SELECT 
        CODIGOEMPRESA,
        CONTACTB,
        CLASSIFCONTA,
        DESCRCONTA
       FROM PLANOESPEC
       WHERE CODIGOEMPRESA = ? AND CONTACTB = ?`,
      [codigoEmpresa, conta],
    );
    return rows[0] || null;
  }

  async findByClassificacao(
    codigoEmpresa: number,
    classificacao: string,
  ): Promise<IPlanoContas[]> {
    return this.questor.executeQuery<IPlanoContas>(
      `SELECT 
        CODIGOEMPRESA,
        CONTACTB,
        CLASSIFCONTA,
        DESCRCONTA
       FROM PLANOESPEC
       WHERE CODIGOEMPRESA = ? AND CLASSIFCONTA LIKE ?
       ORDER BY CONTACTB`,
      [codigoEmpresa, `${classificacao}%`],
    );
  }

  async buscarContaPorDescricao(
    codigoEmpresa: number,
    descricao: string,
  ): Promise<IPlanoContas[]> {
    return this.questor.executeQuery<IPlanoContas>(
      `SELECT 
        CODIGOEMPRESA,
        CONTACTB,
        CLASSIFCONTA,
        DESCRCONTA
       FROM PLANOESPEC
       WHERE CODIGOEMPRESA = ? AND DESCRCONTA LIKE ?
       ORDER BY CONTACTB`,
      [codigoEmpresa, `%${descricao}%`],
    );
  }
}
