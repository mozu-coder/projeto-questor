import { Injectable } from '@nestjs/common';
import { ObisidianRepository } from '../../obisidian/repositories/obisidian.repository';
import {
  IPlano,
  IPlanoItem,
} from '../../shared/interfaces/plano-contabilizacao.interface';

@Injectable()
export class PlanoContabilizacaoRepository {
  constructor(private readonly db: ObisidianRepository) {}

  // ── PLANOS ──

  async findAll(): Promise<IPlano[]> {
    return this.db.executeQuery<IPlano>(`
      SELECT p.*, 
        (SELECT COUNT(*) FROM plano_itens pi WHERE pi.plano_id = p.id) as total_itens
      FROM planos p 
      ORDER BY p.nome
    `);
  }

  async findById(id: number): Promise<IPlano | null> {
    const rows = await this.db.executeQuery<IPlano>(
      `SELECT * FROM planos WHERE id = ?`,
      [id],
    );
    return rows[0] || null;
  }

  async create(nome: string): Promise<IPlano> {
    await this.db.executeQuery(`INSERT INTO planos (nome) VALUES (?)`, [nome]);
    const rows = await this.db.executeQuery<IPlano>(
      `SELECT * FROM planos WHERE id = LAST_INSERT_ID()`,
    );
    return rows[0];
  }

  async update(id: number, nome: string): Promise<IPlano | null> {
    await this.db.executeQuery(`UPDATE planos SET nome = ? WHERE id = ?`, [
      nome,
      id,
    ]);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.db.executeQuery(`DELETE FROM planos WHERE id = ?`, [id]);
  }

  // ── ITENS ──

  async findItensByPlano(planoId: number): Promise<IPlanoItem[]> {
    return this.db.executeQuery<IPlanoItem>(
      `SELECT * FROM plano_itens WHERE plano_id = ? ORDER BY cfop`,
      [planoId],
    );
  }

  async findItemById(id: number): Promise<IPlanoItem | null> {
    const rows = await this.db.executeQuery<IPlanoItem>(
      `SELECT * FROM plano_itens WHERE id = ?`,
      [id],
    );
    return rows[0] || null;
  }

  async createItem(
    planoId: number,
    cfop: string,
    contaCredito: string,
    contaDebito: string,
  ): Promise<IPlanoItem> {
    await this.db.executeQuery(
      `INSERT INTO plano_itens (plano_id, cfop, conta_credito, conta_debito) 
       VALUES (?, ?, ?, ?)`,
      [planoId, cfop, contaCredito || '', contaDebito || ''],
    );
    const rows = await this.db.executeQuery<IPlanoItem>(
      `SELECT * FROM plano_itens WHERE id = LAST_INSERT_ID()`,
    );
    return rows[0];
  }

  async updateItem(
    id: number,
    cfop: string,
    contaCredito: string,
    contaDebito: string,
  ): Promise<IPlanoItem | null> {
    await this.db.executeQuery(
      `UPDATE plano_itens SET cfop = ?, conta_credito = ?, conta_debito = ? WHERE id = ?`,
      [cfop, contaCredito || '', contaDebito || '', id],
    );
    return this.findItemById(id);
  }

  async deleteItem(id: number): Promise<void> {
    await this.db.executeQuery(`DELETE FROM plano_itens WHERE id = ?`, [id]);
  }
}
