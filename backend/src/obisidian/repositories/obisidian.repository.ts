import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mysql from 'mysql2/promise';

@Injectable()
export class ObisidianRepository implements OnModuleInit, OnModuleDestroy {
  private pool: mysql.Pool;
  private readonly logger = new Logger(ObisidianRepository.name);

  constructor(private configService: ConfigService) {
    this.pool = mysql.createPool({
      host: this.configService.get<string>('OBISIDIAN_HOST'),
      port: this.configService.get<number>('OBISIDIAN_PORT'),
      user: this.configService.get<string>('OBISIDIAN_USER'),
      password: this.configService.get<string>('OBISIDIAN_PASS'),
      database: this.configService.get<string>('OBISIDIAN_NAME'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  async onModuleInit() {
    await this.initDatabase();
  }

  private async initDatabase() {
    this.logger.log('Verificando esquema do banco de dados (MariaDB)...');

    const connection = await this.pool.getConnection();

    try {
      await connection.query(`
      CREATE TABLE IF NOT EXISTS plano (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

      await connection.query(`
      CREATE TABLE IF NOT EXISTS plano_item (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        plano_id INT(11) NOT NULL,
        cfop VARCHAR(10),
        conta_credito VARCHAR(50),
        conta_debito VARCHAR(50),
        contabiliza BOOLEAN DEFAULT TRUE,
        retido BOOLEAN DEFAULT FALSE,
        conta_inss VARCHAR(50),
        conta_issqn VARCHAR(50),
        conta_irpj VARCHAR(50),
        conta_csll VARCHAR(50),
        conta_irrf VARCHAR(50),
        conta_pis VARCHAR(50),
        conta_cofins VARCHAR(50),
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_plano_item_plano
          FOREIGN KEY (plano_id) 
          REFERENCES plano(id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

      const colunas = [
        { nome: 'contabiliza', sql: 'BOOLEAN DEFAULT TRUE AFTER conta_debito' },
        { nome: 'retido', sql: 'BOOLEAN DEFAULT FALSE AFTER contabiliza' },
        { nome: 'conta_inss', sql: 'VARCHAR(50) AFTER retido' },
        { nome: 'conta_issqn', sql: 'VARCHAR(50) AFTER conta_inss' },
        { nome: 'conta_irpj', sql: 'VARCHAR(50) AFTER conta_issqn' },
        { nome: 'conta_csll', sql: 'VARCHAR(50) AFTER conta_irpj' },
        { nome: 'conta_irrf', sql: 'VARCHAR(50) AFTER conta_csll' },
        { nome: 'conta_pis', sql: 'VARCHAR(50) AFTER conta_irrf' },
        { nome: 'conta_cofins', sql: 'VARCHAR(50) AFTER conta_pis' },
      ];

      for (const coluna of colunas) {
        try {
          await connection.query(`
          ALTER TABLE plano_item ADD COLUMN ${coluna.nome} ${coluna.sql}
        `);
          this.logger.log(
            `Coluna ${coluna.nome} adicionada à tabela plano_item`,
          );
        } catch (err: any) {
          if (err.code !== 'ER_DUP_FIELDNAME') {
            this.logger.error(`Erro ao adicionar coluna ${coluna.nome}:`, err);
          }
        }
      }

      this.logger.log(
        'Tabelas (plano, plano_item) verificadas/criadas no MariaDB.',
      );
    } catch (err) {
      this.logger.error('Erro ao inicializar tabelas no MariaDB:', err);
      throw err;
    } finally {
      connection.release();
    }
  }

  async executeQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows as T[];
    } catch (err) {
      this.logger.error(`Erro na query: ${sql}`, err);
      throw err;
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
