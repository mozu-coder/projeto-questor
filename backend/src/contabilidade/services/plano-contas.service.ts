import { Injectable } from '@nestjs/common';
import { PlanoContasRepository } from '../repositories/plano-contas.repository';
import {
  IPlanoContas,
  IPlanoContasNode,
  IPlanoContasTree,
} from '../../shared/interfaces/plano-contas.interface';

@Injectable()
export class PlanoContasService {
  constructor(private readonly planoContasRepo: PlanoContasRepository) {}

  /**
   * Constrói a árvore hierárquica do plano de contas baseada na classificação (string).
   *
   * Lógica "Ancestral Mais Próximo":
   * O sistema tenta encontrar o pai exato. Se não existir, sobe um nível na string
   * até encontrar um nó existente ou chegar na raiz.
   *
   * Representação Visual da Lógica:
   * ---------------------------------------------------------
   * Nível 1:  1 (Ativo)
   * └── Nível 2: 1.1 (Circulante)
   * ├── Nível 3: 1.1.001 (Caixa Geral - ID 50)
   * │            └── Nível 4: 1.1.001.001 (Caixa Filial - ID 60)
   * │            NOTE: O Pai de 1.1.001.001 é o 1.1.001.
   * │
   * └── Caso de "Pai Ausente" (Salto de Nível):
   * Se o 1.1.002 não existisse, mas existisse 1.1.002.01:
   * 1.1.002.01 buscaria 1.1.002 -> falha -> busca 1.1 -> Sucesso.
   * Ele se tornaria filho direto de 1.1.
   * ---------------------------------------------------------
   */
  async montarArvore(codigoEmpresa: number): Promise<IPlanoContasTree> {
    const contas = await this.planoContasRepo.findByEmpresa(codigoEmpresa);

    const mapaClassif = new Map<string, IPlanoContasNode>();
    const mapaId = new Map<number, IPlanoContasNode>();
    const raizes: IPlanoContasNode[] = [];
    const todosNos: IPlanoContasNode[] = [];

    contas.sort((a, b) => a.CLASSIFCONTA.localeCompare(b.CLASSIFCONTA));

    for (const conta of contas) {
      const classifLimpa = conta.CLASSIFCONTA ? conta.CLASSIFCONTA.trim() : '';

      const node: IPlanoContasNode = {
        ...conta,
        CLASSIFCONTA: classifLimpa,
        nivel: classifLimpa.split('.').length,
        filhos: [],
        valor: 0,
        valorTotal: 0,
      };

      todosNos.push(node);
      mapaId.set(node.CONTACTB, node);

      if (classifLimpa) {
        mapaClassif.set(classifLimpa, node);
      }
    }

    for (const node of todosNos) {
      const classifAtual = node.CLASSIFCONTA;

      if (!classifAtual) {
        raizes.push(node);
        continue;
      }

      let paiEncontrado: IPlanoContasNode | undefined = undefined;
      let classifBusca = classifAtual;

      while (classifBusca.includes('.')) {
        const lastDotIndex = classifBusca.lastIndexOf('.');
        classifBusca = classifBusca.substring(0, lastDotIndex);

        const paiCandidato = mapaClassif.get(classifBusca);

        if (paiCandidato && paiCandidato.CONTACTB !== node.CONTACTB) {
          paiEncontrado = paiCandidato;
          break;
        }
      }

      if (paiEncontrado) {
        node.pai = paiEncontrado.CLASSIFCONTA;
        paiEncontrado.filhos.push(node);
      } else {
        raizes.push(node);
      }
    }

    return {
      raizes,
      mapa: mapaId,
      mapaClassif,
    };
  }

  /**
   * Retorna a lista plana de todas as contas da empresa sem hierarquia processada.
   */
  async listarPlanoContas(codigoEmpresa: number): Promise<IPlanoContas[]> {
    return this.planoContasRepo.findByEmpresa(codigoEmpresa);
  }

  /**
   * Cria um mapa otimizado para conferências fiscais.
   * Chave: CONTACTB (ID único numérico)
   * Valor: CLASSIFCONTA (String hierárquica limpa)
   */
  async carregarMapaClassificacoes(
    codigoEmpresa: number,
  ): Promise<Map<number, string>> {
    const contas = await this.planoContasRepo.findByEmpresa(codigoEmpresa);
    const mapa = new Map<number, string>();

    for (const conta of contas) {
      if (conta.CLASSIFCONTA) {
        mapa.set(Number(conta.CONTACTB), conta.CLASSIFCONTA.trim());
      }
    }
    return mapa;
  }

  /**
   * Verifica se uma conta é filha ou descendente de outra baseada na string de classificação.
   * Utilizado para validar regras de contabilização (Ex: Se lançou na conta filha de 'Caixa').
   */
  verificarHierarquia(
    contaFilhaId: number,
    contaPaiId: number,
    mapaClassificacoes: Map<number, string>,
  ): boolean {
    if (contaFilhaId === contaPaiId) return true;

    const classifFilha = mapaClassificacoes.get(contaFilhaId);
    const classifPai = mapaClassificacoes.get(contaPaiId);

    if (!classifFilha || !classifPai) return false;

    return classifFilha.startsWith(classifPai);
  }
}
