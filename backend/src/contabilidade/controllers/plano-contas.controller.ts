import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PlanoContasService } from '../services/plano-contas.service';

@Controller('plano-contas')
export class PlanoContasController {
  constructor(private readonly planoContasService: PlanoContasService) {}

  /**
   * Retorna a estrutura em árvore (hierárquica) do plano de contas.
   * As raízes contêm os filhos aninhados recursivamente.
   */
  @Get(':codigoEmpresa/arvore')
  async obterArvore(
    @Param('codigoEmpresa', ParseIntPipe) codigoEmpresa: number,
  ) {
    const arvore = await this.planoContasService.montarArvore(codigoEmpresa);
    return arvore.raizes;
  }

  /**
   * Retorna a lista plana (array simples) de todas as contas.
   */
  @Get(':codigoEmpresa')
  async listar(@Param('codigoEmpresa', ParseIntPipe) codigoEmpresa: number) {
    return this.planoContasService.listarPlanoContas(codigoEmpresa);
  }
}
