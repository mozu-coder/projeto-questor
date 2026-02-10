import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { LancamentoContabilService } from '../services/lancamento-contabil.service';

@Controller('lancamentos-contabeis')
export class LancamentoContabilController {
  constructor(private readonly lancamentoService: LancamentoContabilService) {}

  @Get(':codigoEmpresa/periodo')
  async listarPorPeriodo(
    @Param('codigoEmpresa', ParseIntPipe) codigoEmpresa: number,
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
  ) {
    return this.lancamentoService.listarPorPeriodo(
      codigoEmpresa,
      dataInicio,
      dataFim,
    );
  }

  @Get(':codigoEmpresa/periodo/origem')
  async listarPorPeriodoAndOrigem(
    @Param('codigoEmpresa', ParseIntPipe) codigoEmpresa: number,
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
    @Query('origem') origem: string,
  ) {
    return this.lancamentoService.listarPorPeriodoAndOrigem(
      codigoEmpresa,
      dataInicio,
      dataFim,
      origem,
    );
  }
}
