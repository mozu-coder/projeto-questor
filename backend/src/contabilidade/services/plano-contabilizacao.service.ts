import { Injectable, NotFoundException } from '@nestjs/common';
import { PlanoContabilizacaoRepository } from '../repositories/plano-contabilizacao.repository';
import {
  IPlano,
  IPlanoItem,
} from '../../shared/interfaces/plano-contabilizacao.interface';

export interface IPlanoComItens extends IPlano {
  itens: IPlanoItem[];
}

@Injectable()
export class PlanoContabilizacaoService {
  constructor(private readonly planoRepo: PlanoContabilizacaoRepository) {}

  async listarPlanos(): Promise<IPlano[]> {
    return this.planoRepo.findAll();
  }

  async buscarPlano(id: number): Promise<IPlano> {
    const plano = await this.planoRepo.findById(id);
    if (!plano) throw new NotFoundException(`Plano ${id} não encontrado`);
    return plano;
  }

  async obterPlanoComItens(id: number): Promise<IPlanoComItens> {
    const plano = await this.buscarPlano(id);
    const itens = await this.planoRepo.findItensByPlano(id);

    return {
      ...plano,
      itens,
    };
  }

  async criarPlano(nome: string): Promise<IPlano> {
    return this.planoRepo.create(nome);
  }

  async atualizarPlano(id: number, nome: string): Promise<IPlano> {
    const plano = await this.planoRepo.update(id, nome);
    if (!plano) throw new NotFoundException(`Plano ${id} não encontrado`);
    return plano;
  }

  async excluirPlano(id: number): Promise<void> {
    await this.buscarPlano(id);
    await this.planoRepo.delete(id);
  }

  async listarItens(planoId: number): Promise<IPlanoItem[]> {
    await this.buscarPlano(planoId);
    return this.planoRepo.findItensByPlano(planoId);
  }

  async criarItem(
    planoId: number,
    cfop: string,
    contaCredito: string,
    contaDebito: string,
  ): Promise<IPlanoItem> {
    await this.buscarPlano(planoId);
    return this.planoRepo.createItem(planoId, cfop, contaCredito, contaDebito);
  }

  async atualizarItem(
    id: number,
    cfop: string,
    contaCredito: string,
    contaDebito: string,
  ): Promise<IPlanoItem> {
    const item = await this.planoRepo.updateItem(
      id,
      cfop,
      contaCredito,
      contaDebito,
    );
    if (!item) throw new NotFoundException(`Item ${id} não encontrado`);
    return item;
  }

  async excluirItem(id: number): Promise<void> {
    const item = await this.planoRepo.findItemById(id);
    if (!item) throw new NotFoundException(`Item ${id} não encontrado`);
    await this.planoRepo.deleteItem(id);
  }
}
