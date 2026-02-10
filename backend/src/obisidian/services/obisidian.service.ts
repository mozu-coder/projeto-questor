import { Injectable } from '@nestjs/common';
import { ObisidianRepository } from '../repositories/obisidian.repository';

@Injectable()
export class ObisidianService {
  constructor(private readonly obisidianRepo: ObisidianRepository) {}

  async testarConexao() {
    return this.obisidianRepo.executeQuery(`SELECT VERSION() as version`);
  }
}