import { Injectable, Logger } from '@nestjs/common';
import { ObisidianRepository } from '../../obisidian/repositories/obisidian.repository';
import {
  IPlano,
  IPlanoItem,
} from '../../shared/interfaces/plano-contabilizacao.interface';

@Injectable()
export class PlanoContabilizacaoRepository {
  private readonly logger = new Logger(PlanoContabilizacaoRepository.name);

  constructor(private readonly db: ObisidianRepository) {}

  async findAll(): Promise<IPlano[]> {
    this.logger.log(`Buscando todos os plano`);

    const result = await this.db.executeQuery<IPlano>(`
      SELECT p.*, 
        (SELECT COUNT(*) FROM plano_item pi WHERE pi.plano_id = p.id) as total_itens
      FROM plano p 
      ORDER BY p.nome
    `);

    this.logger.log(`Encontrados ${result.length} plano`);
    return result;
  }

  async findById(id: number): Promise<IPlano | null> {
    this.logger.log(`Buscando plano ID: ${id}`);

    const rows = await this.db.executeQuery<IPlano>(
      `SELECT * FROM plano WHERE id = ?`,
      [id],
    );
    return rows[0] || null;
  }

  async create(nome: string): Promise<IPlano> {
    this.logger.log(`Criando plano: ${nome}`);

    await this.db.executeQuery(`INSERT INTO plano (nome) VALUES (?)`, [nome]);
    const rows = await this.db.executeQuery<IPlano>(
      `SELECT * FROM plano WHERE id = LAST_INSERT_ID()`,
    );
    return rows[0];
  }

  async update(id: number, nome: string): Promise<IPlano | null> {
    this.logger.log(`Atualizando plano ID: ${id}`);

    await this.db.executeQuery(`UPDATE plano SET nome = ? WHERE id = ?`, [
      nome,
      id,
    ]);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    this.logger.log(`Removendo plano ID: ${id}`);

    await this.db.executeQuery(`DELETE FROM plano WHERE id = ?`, [id]);
  }

  async findItensByPlano(planoId: number): Promise<IPlanoItem[]> {
    this.logger.log(`Buscando itens do plano ID: ${planoId}`);

    const result = await this.db.executeQuery<IPlanoItem>(
      `SELECT * FROM plano_item WHERE plano_id = ? ORDER BY cfop`,
      [planoId],
    );

    this.logger.log(`Encontrados ${result.length} itens`);
    return result;
  }

  async findItemById(id: number): Promise<IPlanoItem | null> {
    const rows = await this.db.executeQuery<IPlanoItem>(
      `SELECT * FROM plano_item WHERE id = ?`,
      [id],
    );
    return rows[0] || null;
  }

  async createItem(
    planoId: number,
    cfop: string,
    contaCredito: string | null,
    contaDebito: string | null,
    contabiliza: boolean,
    retido: boolean,
    contaInss: string | null,
    contaIssqn: string | null,
    contaIrpj: string | null,
    contaCsll: string | null,
    contaIrrf: string | null,
    contaPis: string | null,
    contaCofins: string | null,
  ): Promise<IPlanoItem> {
    this.logger.log(`Criando item - Plano ID: ${planoId}, CFOP: ${cfop}`);

    await this.db.executeQuery(
      `INSERT INTO plano_item (
        plano_id, cfop, conta_credito, conta_debito, contabiliza, retido,
        conta_inss, conta_issqn, conta_irpj, conta_csll, conta_irrf, conta_pis, conta_cofins
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        planoId,
        cfop,
        contaCredito || null,
        contaDebito || null,
        contabiliza ? 1 : 0,
        retido ? 1 : 0,
        contaInss || null,
        contaIssqn || null,
        contaIrpj || null,
        contaCsll || null,
        contaIrrf || null,
        contaPis || null,
        contaCofins || null,
      ],
    );
    const rows = await this.db.executeQuery<IPlanoItem>(
      `SELECT * FROM plano_item WHERE id = LAST_INSERT_ID()`,
    );
    return rows[0];
  }

  async updateItem(
    id: number,
    cfop: string,
    contaCredito: string | null,
    contaDebito: string | null,
    contabiliza: boolean,
    retido: boolean,
    contaInss: string | null,
    contaIssqn: string | null,
    contaIrpj: string | null,
    contaCsll: string | null,
    contaIrrf: string | null,
    contaPis: string | null,
    contaCofins: string | null,
  ): Promise<IPlanoItem | null> {
    this.logger.log(`Atualizando item ID: ${id}`);

    await this.db.executeQuery(
      `UPDATE plano_item SET 
        cfop = ?, conta_credito = ?, conta_debito = ?, contabiliza = ?, retido = ?,
        conta_inss = ?, conta_issqn = ?, conta_irpj = ?, conta_csll = ?, 
        conta_irrf = ?, conta_pis = ?, conta_cofins = ?
      WHERE id = ?`,
      [
        cfop,
        contaCredito || null,
        contaDebito || null,
        contabiliza ? 1 : 0,
        retido ? 1 : 0,
        contaInss || null,
        contaIssqn || null,
        contaIrpj || null,
        contaCsll || null,
        contaIrrf || null,
        contaPis || null,
        contaCofins || null,
        id,
      ],
    );
    return this.findItemById(id);
  }

  async deleteItem(id: number): Promise<void> {
    this.logger.log(`Removendo item ID: ${id}`);

    await this.db.executeQuery(`DELETE FROM plano_item WHERE id = ?`, [id]);
  }
}
