import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mysql from 'mysql2/promise';

@Injectable()
export class ObisidianRepository implements OnModuleDestroy {
  private pool: mysql.Pool;

  constructor(private configService: ConfigService) {
    this.pool = mysql.createPool({
      host: this.configService.get<string>('OBISIDIAN_HOST'),
      port: this.configService.get<number>('OBISIDIAN_PORT'),
      user: this.configService.get<string>('OBISIDIAN_USER'),
      password: this.configService.get<string>('OBISIDIAN_PASS'),
      database: this.configService.get<string>('OBISIDIAN_NAME'),
      waitForConnections: true,
      connectionLimit: 10,
    });
  }

  async executeQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows as T[];
    } catch (err) {
      console.error('❌ Erro na query MariaDB:', err);
      throw err;
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}