import { Controller, Get } from '@nestjs/common';
import { ObisidianService } from '../services/obisidian.service';

@Controller('obisidian')
export class ObisidianController {
  constructor(private readonly obisidianService: ObisidianService) {}

  @Get('teste')
  async teste() {
    return this.obisidianService.testarConexao();
  }
}