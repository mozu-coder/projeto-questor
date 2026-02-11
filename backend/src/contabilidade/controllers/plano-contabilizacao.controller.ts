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

  @Get(':planoId/itens')
  async listarItens(@Param('planoId', ParseIntPipe) planoId: number) {
    return this.planoService.listarItens(planoId);
  }

  @Post(':planoId/itens')
  async criarItem(
    @Param('planoId', ParseIntPipe) planoId: number,
    @Body()
    body: {
      cfop: string;
      contaCredito?: string | null;
      contaDebito?: string | null;
      contabiliza?: boolean;
      retido?: boolean;
      contaInss?: string | null;
      contaIssqn?: string | null;
      contaIrpj?: string | null;
      contaCsll?: string | null;
      contaIrrf?: string | null;
      contaPis?: string | null;
      contaCofins?: string | null;
    },
  ) {
    return this.planoService.criarItem(
      planoId,
      body.cfop,
      body.contaCredito || null,
      body.contaDebito || null,
      body.contabiliza ?? true,
      body.retido ?? false,
      body.contaInss || null,
      body.contaIssqn || null,
      body.contaIrpj || null,
      body.contaCsll || null,
      body.contaIrrf || null,
      body.contaPis || null,
      body.contaCofins || null,
    );
  }

  @Put('itens/:id')
  async atualizarItem(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      cfop: string;
      contaCredito?: string | null;
      contaDebito?: string | null;
      contabiliza?: boolean;
      retido?: boolean;
      contaInss?: string | null;
      contaIssqn?: string | null;
      contaIrpj?: string | null;
      contaCsll?: string | null;
      contaIrrf?: string | null;
      contaPis?: string | null;
      contaCofins?: string | null;
    },
  ) {
    return this.planoService.atualizarItem(
      id,
      body.cfop,
      body.contaCredito || null,
      body.contaDebito || null,
      body.contabiliza ?? true,
      body.retido ?? false,
      body.contaInss || null,
      body.contaIssqn || null,
      body.contaIrpj || null,
      body.contaCsll || null,
      body.contaIrrf || null,
      body.contaPis || null,
      body.contaCofins || null,
    );
  }

  @Delete('itens/:id')
  async excluirItem(@Param('id', ParseIntPipe) id: number) {
    await this.planoService.excluirItem(id);
    return { message: 'Item excluído' };
  }
}
