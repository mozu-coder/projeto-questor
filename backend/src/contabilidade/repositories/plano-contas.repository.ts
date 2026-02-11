  import { Injectable, Logger } from '@nestjs/common';
  import { QuestorRepository } from '../../questor/repositories/questor.repository';
  import { IPlanoContas } from '../../shared/interfaces/plano-contas.interface';

  @Injectable()
  export class PlanoContasRepository {
    private readonly logger = new Logger(PlanoContasRepository.name);

    constructor(private readonly questor: QuestorRepository) {}

    /**
     * Busca todas as contas de uma empresa para montar o mapa
     */
    async findByEmpresa(codigoEmpresa: number): Promise<IPlanoContas[]> {
      this.logger.log(`Buscando plano de contas - Empresa: ${codigoEmpresa}`);

      const result = await this.questor.executeQuery<IPlanoContas>(
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

      this.logger.log(`Encontradas ${result.length} contas`);
      return result;
    }
  }
