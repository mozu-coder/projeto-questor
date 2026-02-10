import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Firebird from 'node-firebird';

@Injectable()
export class QuestorRepository {
  private options;

  constructor(private configService: ConfigService) {
    this.options = {
      host: this.configService.get<string>('QUESTOR_HOST'),
      port: this.configService.get<number>('QUESTOR_PORT'),
      database: this.configService.get<string>('QUESTOR_DB_PATH'),
      user: this.configService.get<string>('QUESTOR_USER'),
      password: this.configService.get<string>('QUESTOR_PASS'),
      lowercase_keys: false,
      role: null,
      pageSize: 4096,
    };
  }

  async executeQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      Firebird.attach(this.options, (err, db) => {
        if (err) {
          console.error('❌ Erro ao conectar no Firebird:', err);
          return reject(err);
        }

        db.query(sql, params, (err, result) => {
          db.detach();
          if (err) {
            console.error('❌ Erro na query SQL:', err);
            return reject(err);
          }
          resolve(result as T[]);
        });
      });
    });
  }
}