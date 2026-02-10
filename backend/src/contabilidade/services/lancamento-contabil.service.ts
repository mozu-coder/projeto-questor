import { Injectable } from '@nestjs/common';
import { LancamentoContabilRepository } from '../repositories/lancamento-contabil.repository';
import { ILancamentoContabil } from '../../shared/interfaces/lancamento-contabil.interface';

@Injectable()
export class LancamentoContabilService {
  constructor(private readonly lancamentoRepo: LancamentoContabilRepository) {}

  async listarPorPeriodo(
    codigoEmpresa: number,
    dataInicio: string,
    dataFim: string,
  ): Promise<ILancamentoContabil[]> {
    return this.lancamentoRepo.findByEmpresaAndPeriodo(
      codigoEmpresa,
      dataInicio,
      dataFim,
    );
  }

  async listarPorPeriodoAndOrigem(
    codigoEmpresa: number,
    dataInicio: string,
    dataFim: string,
    codigoOrigem: string,
  ): Promise<ILancamentoContabil[]> {
    return this.lancamentoRepo.findByEmpresaPeriodoAndOrigem(
      codigoEmpresa,
      dataInicio,
      dataFim,
      codigoOrigem,
    );
  }
}
