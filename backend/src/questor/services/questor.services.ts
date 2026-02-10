import { Injectable } from '@nestjs/common';
import { QuestorRepository } from '../repositories/questor.repository';

@Injectable()
export class QuestorService {
  constructor(private readonly questorRepo: QuestorRepository) {}

  async testarConexao() {
    const sql = `SELECT rdb$get_context('SYSTEM', 'ENGINE_VERSION') as version from rdb$database`;
    return await this.questorRepo.executeQuery(sql);
  }
}