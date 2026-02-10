import { Controller, Post, Body } from '@nestjs/common';
import { ConferenciaFiscalService } from '../services/conferencia-fiscal.service';
import type { IParamsConferencia } from '../../shared/interfaces/conferencia-fiscal.interface';

@Controller('conferencia-fiscal')
export class ConferenciaFiscalController {
  constructor(
    private readonly conferenciaFiscalService: ConferenciaFiscalService,
  ) {}

  @Post('executar')
  async executarConferencia(@Body() params: IParamsConferencia) {
    return this.conferenciaFiscalService.executarConferencia(params);
  }
}
