import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { PlanoContasService } from '../services/plano-contas.service';

@Controller('plano-contas')
export class PlanoContasController {
  constructor(private readonly planoContasService: PlanoContasService) {}

  @Get(':codigoEmpresa')
  async listar(@Param('codigoEmpresa', ParseIntPipe) codigoEmpresa: number) {
    return this.planoContasService.listarPlanoContas(codigoEmpresa);
  }

  @Get(':codigoEmpresa/arvore')
  async construirArvore(
    @Param('codigoEmpresa', ParseIntPipe) codigoEmpresa: number,
  ) {
    const arvore = await this.planoContasService.construirArvore(codigoEmpresa);
    return {
      raizes: arvore.raizes,
      totalContas: arvore.mapa.size,
    };
  }

  @Post(':codigoEmpresa/arvore-valores')
  async construirArvoreComValores(
    @Param('codigoEmpresa', ParseIntPipe) codigoEmpresa: number,
    @Body() body: { valores: Record<number, number> }, // ← MUDOU: Record<number, number>
  ) {
    // ← MUDOU: Converte para Map<number, number>
    const valoresPorConta = new Map<number, number>(
      Object.entries(body.valores).map(([k, v]) => [Number(k), v]),
    );

    const arvore = await this.planoContasService.construirArvoreComValores(
      codigoEmpresa,
      valoresPorConta,
    );

    return {
      raizes: arvore.raizes,
      totalContas: arvore.mapa.size,
    };
  }

  @Get(':codigoEmpresa/conta/:conta')
  async buscarConta(
    @Param('codigoEmpresa', ParseIntPipe) codigoEmpresa: number,
    @Param('conta', ParseIntPipe) conta: number, // ← MUDOU: ParseIntPipe
  ) {
    return this.planoContasService.buscarConta(codigoEmpresa, conta);
  }

  @Get(':codigoEmpresa/classificacao')
  async listarPorClassificacao(
    @Param('codigoEmpresa', ParseIntPipe) codigoEmpresa: number,
    @Query('classificacao') classificacao: string,
  ) {
    return this.planoContasService.listarPorClassificacao(
      codigoEmpresa,
      classificacao,
    );
  }

  @Get(':codigoEmpresa/buscar')
  async buscarPorDescricao(
    @Param('codigoEmpresa', ParseIntPipe) codigoEmpresa: number,
    @Query('descricao') descricao: string,
  ) {
    return this.planoContasService.buscarPorDescricao(codigoEmpresa, descricao);
  }

  @Post(':codigoEmpresa/validar')
  async validarContas(
    @Param('codigoEmpresa', ParseIntPipe) codigoEmpresa: number,
    @Body() body: { contas: number[] }, // ← MUDOU: number[]
  ) {
    return this.planoContasService.validarContas(codigoEmpresa, body.contas);
  }

  @Get(':codigoEmpresa/mapa')
  async criarMapaContas(
    @Param('codigoEmpresa', ParseIntPipe) codigoEmpresa: number,
  ) {
    const mapa = await this.planoContasService.criarMapaContas(codigoEmpresa);
    // ← MUDOU: Converte Map<number, ...> para objeto
    return Object.fromEntries(mapa);
  }
}
