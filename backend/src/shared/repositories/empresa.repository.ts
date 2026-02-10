import { Injectable } from '@nestjs/common';
import { QuestorRepository } from '../../questor/repositories/questor.repository';
import { IEmpresaQuestor } from '../interfaces/empresa.interface'; 

@Injectable()
export class EmpresaRepository {
  constructor(private readonly questor: QuestorRepository) {}

  async listarTodas(): Promise<IEmpresaQuestor[]> {
    return this.questor.executeQuery<IEmpresaQuestor>(
        'SELECT CODIGOEMPRESA, NOMEEMPRESA FROM EMPRESA ORDER BY CODIGOEMPRESA'
    );
  }
}