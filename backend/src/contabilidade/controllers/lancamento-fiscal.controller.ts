import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { LancamentoFiscalService } from '../services/lancamento-fiscal.service';

@Controller('lancamentos-fiscais')
export class LancamentoFiscalController {
  constructor(
    private readonly lancamentoFiscalService: LancamentoFiscalService,
  ) {}

  @Get(':codigoEmpresa/entradas')
  async listarEntradas(
    @Param('codigoEmpresa', ParseIntPipe) codigoEmpresa: number,
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
  ) {
    return this.lancamentoFiscalService.listarEntradasPorPeriodo(
      codigoEmpresa,
      dataInicio,
      dataFim,
    );
  }

  @Get(':codigoEmpresa/saidas')
  async listarSaidas(
    @Param('codigoEmpresa', ParseIntPipe) codigoEmpresa: number,
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
  ) {
    return this.lancamentoFiscalService.listarSaidasPorPeriodo(
      codigoEmpresa,
      dataInicio,
      dataFim,
    );
  }

  @Get(':codigoEmpresa/todos')
  async listarTodos(
    @Param('codigoEmpresa', ParseIntPipe) codigoEmpresa: number,
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
  ) {
    return this.lancamentoFiscalService.listarTodos(
      codigoEmpresa,
      dataInicio,
      dataFim,
    );
  }
}
