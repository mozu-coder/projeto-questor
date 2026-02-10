import { Injectable, NotFoundException } from '@nestjs/common';
import { PlanoContasRepository } from '../repositories/plano-contas.repository';
import {
  IPlanoContas,
  IPlanoContasNode,
  IPlanoContasTree,
} from '../../shared/interfaces/plano-contas.interface';

@Injectable()
export class PlanoContasService {
  constructor(private readonly planoContasRepo: PlanoContasRepository) {}

  async listarPlanoContas(codigoEmpresa: number): Promise<IPlanoContas[]> {
    return this.planoContasRepo.findByEmpresa(codigoEmpresa);
  }

  async buscarConta(
    codigoEmpresa: number,
    conta: number, // ← MUDOU: agora é number
  ): Promise<IPlanoContas> {
    const plano = await this.planoContasRepo.findByConta(codigoEmpresa, conta);
    if (!plano) {
      throw new NotFoundException(
        `Conta ${conta} não encontrada na empresa ${codigoEmpresa}`,
      );
    }
    return plano;
  }

  async contaExiste(codigoEmpresa: number, conta: number): Promise<boolean> {
    const plano = await this.planoContasRepo.findByConta(codigoEmpresa, conta);
    return plano !== null;
  }

  async listarPorClassificacao(
    codigoEmpresa: number,
    classificacao: string,
  ): Promise<IPlanoContas[]> {
    return this.planoContasRepo.findByClassificacao(
      codigoEmpresa,
      classificacao,
    );
  }

  async buscarPorDescricao(
    codigoEmpresa: number,
    descricao: string,
  ): Promise<IPlanoContas[]> {
    return this.planoContasRepo.buscarContaPorDescricao(
      codigoEmpresa,
      descricao,
    );
  }

  async validarContas(
    codigoEmpresa: number,
    contas: number[], // ← MUDOU: agora é number[]
  ): Promise<{ validas: number[]; invalidas: number[] }> {
    const validas: number[] = [];
    const invalidas: number[] = [];

    for (const conta of contas) {
      const existe = await this.contaExiste(codigoEmpresa, conta);
      if (existe) {
        validas.push(conta);
      } else {
        invalidas.push(conta);
      }
    }

    return { validas, invalidas };
  }

  async criarMapaContas(
    codigoEmpresa: number,
  ): Promise<Map<number, IPlanoContas>> {
    // ← MUDOU: Map<number, ...>
    const contas = await this.planoContasRepo.findByEmpresa(codigoEmpresa);
    const mapa = new Map<number, IPlanoContas>();

    contas.forEach((conta) => {
      mapa.set(conta.CONTACTB, conta);
    });

    return mapa;
  }

  private calcularNivel(classificacao: string): number {
    return classificacao.split('.').length;
  }

  private encontrarPaiDireto(classificacao: string): string | null {
    const partes = classificacao.split('.');
    if (partes.length === 1) return null;
    partes.pop();
    return partes.join('.');
  }

  private encontrarPaiExistente(
    classificacao: string,
    mapaClassif: Map<string, IPlanoContasNode>, // ← Usa mapaClassif
  ): string | null {
    let paiCanditado = this.encontrarPaiDireto(classificacao);

    while (paiCanditado) {
      if (mapaClassif.has(paiCanditado)) {
        return paiCanditado;
      }
      paiCanditado = this.encontrarPaiDireto(paiCanditado);
    }

    return null;
  }

  async construirArvore(codigoEmpresa: number): Promise<IPlanoContasTree> {
    const contas = await this.planoContasRepo.findByEmpresa(codigoEmpresa);

    // ← MUDOU: Agora temos dois mapas
    const mapa = new Map<number, IPlanoContasNode>();
    const mapaClassif = new Map<string, IPlanoContasNode>();

    // Primeira passagem: cria todos os nodes
    contas.forEach((conta) => {
      const node: IPlanoContasNode = {
        ...conta,
        nivel: this.calcularNivel(conta.CLASSIFCONTA),
        filhos: [],
        valor: 0,
        valorTotal: 0,
      };
      mapa.set(conta.CONTACTB, node); // Por número
      mapaClassif.set(conta.CLASSIFCONTA, node); // Por classificação
    });

    // Segunda passagem: estabelece relações pai-filho
    const raizes: IPlanoContasNode[] = [];

    mapaClassif.forEach((node) => {
      const paiClassif = this.encontrarPaiExistente(
        node.CLASSIFCONTA,
        mapaClassif,
      );

      if (paiClassif) {
        node.pai = paiClassif;
        const nodePai = mapaClassif.get(paiClassif);
        if (nodePai) {
          nodePai.filhos.push(node);
        }
      } else {
        raizes.push(node);
      }
    });

    raizes.sort((a, b) => a.CLASSIFCONTA.localeCompare(b.CLASSIFCONTA));
    mapaClassif.forEach((node) => {
      node.filhos.sort((a, b) => a.CLASSIFCONTA.localeCompare(b.CLASSIFCONTA));
    });

    return { raizes, mapa, mapaClassif }; // ← MUDOU: retorna ambos os mapas
  }

  private calcularValorTotal(
    node: IPlanoContasNode,
    valoresPorConta: Map<number, number>, // ← MUDOU: Map<number, number>
  ): number {
    const valorProprio = valoresPorConta.get(node.CONTACTB) || 0;
    node.valor = valorProprio;

    let somaFilhos = 0;
    for (const filho of node.filhos) {
      somaFilhos += this.calcularValorTotal(filho, valoresPorConta);
    }

    node.valorTotal = valorProprio + somaFilhos;
    return node.valorTotal;
  }

  async construirArvoreComValores(
    codigoEmpresa: number,
    valoresPorConta: Map<number, number>, // ← MUDOU: Map<number, number>
  ): Promise<IPlanoContasTree> {
    const arvore = await this.construirArvore(codigoEmpresa);

    arvore.raizes.forEach((raiz) => {
      this.calcularValorTotal(raiz, valoresPorConta);
    });

    return arvore;
  }

  obterCaminhoPais(classificacao: string, arvore: IPlanoContasTree): string[] {
    const pais: string[] = [];
    let atual = classificacao;

    while (true) {
      const paiClassif = this.encontrarPaiExistente(atual, arvore.mapaClassif);
      if (!paiClassif) break;
      pais.push(paiClassif);
      atual = paiClassif;
    }

    return pais;
  }

  obterTodosFilhos(node: IPlanoContasNode): IPlanoContasNode[] {
    const filhos: IPlanoContasNode[] = [];

    const coletar = (n: IPlanoContasNode) => {
      n.filhos.forEach((filho) => {
        filhos.push(filho);
        coletar(filho);
      });
    };

    coletar(node);
    return filhos;
  }

  ehPaiDe(paiClassif: string, filhoClassif: string): boolean {
    if (paiClassif === filhoClassif) return false;
    return filhoClassif.startsWith(paiClassif + '.');
  }

  // ← NOVO: Busca por número de conta
  buscarPorConta(
    conta: number,
    arvore: IPlanoContasTree,
  ): IPlanoContasNode | null {
    return arvore.mapa.get(conta) || null;
  }

  // ← NOVO: Busca por classificação
  buscarPorClassificacao(
    classificacao: string,
    arvore: IPlanoContasTree,
  ): IPlanoContasNode | null {
    return arvore.mapaClassif.get(classificacao) || null;
  }
}
