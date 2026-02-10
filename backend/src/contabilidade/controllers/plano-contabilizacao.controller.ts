import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { PlanoContabilizacaoService } from '../services/plano-contabilizacao.service';

@Controller('planos')
export class PlanoContabilizacaoController {
  constructor(private readonly planoService: PlanoContabilizacaoService) {}

  // ── PLANOS ──

  @Get()
  async listar() {
    return this.planoService.listarPlanos();
  }

  @Get(':id')
  async buscar(@Param('id', ParseIntPipe) id: number) {
    return this.planoService.buscarPlano(id);
  }

  @Post()
  async criar(@Body() body: { nome: string }) {
    return this.planoService.criarPlano(body.nome);
  }

  @Put(':id')
  async atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { nome: string },
  ) {
    return this.planoService.atualizarPlano(id, body.nome);
  }

  @Delete(':id')
  async excluir(@Param('id', ParseIntPipe) id: number) {
    await this.planoService.excluirPlano(id);
    return { message: 'Plano excluído' };
  }

  // ── ITENS ──

  @Get(':planoId/itens')
  async listarItens(@Param('planoId', ParseIntPipe) planoId: number) {
    return this.planoService.listarItens(planoId);
  }

  @Post(':planoId/itens')
  async criarItem(
    @Param('planoId', ParseIntPipe) planoId: number,
    @Body() body: { cfop: string; contaCredito: string; contaDebito: string },
  ) {
    return this.planoService.criarItem(
      planoId,
      body.cfop,
      body.contaCredito,
      body.contaDebito,
    );
  }

  @Put('itens/:id')
  async atualizarItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { cfop: string; contaCredito: string; contaDebito: string },
  ) {
    return this.planoService.atualizarItem(
      id,
      body.cfop,
      body.contaCredito,
      body.contaDebito,
    );
  }

  @Delete('itens/:id')
  async excluirItem(@Param('id', ParseIntPipe) id: number) {
    await this.planoService.excluirItem(id);
    return { message: 'Item excluído' };
  }
}