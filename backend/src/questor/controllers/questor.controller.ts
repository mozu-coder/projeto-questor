import { Controller, Get } from '@nestjs/common';
import { QuestorService } from '../services/questor.services';

@Controller('questor')
export class QuestorController {
  constructor(private readonly questorService: QuestorService) {}

  @Get('teste')
  async teste() {
    return await this.questorService.testarConexao();
  }
}