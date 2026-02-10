export interface IDivergenciaConferencia {
  tipo:
    | 'CONTA_INCORRETA'
    | 'VALOR_DIVERGENTE'
    | 'NAO_ENCONTRADO_CONTABIL'
    | 'NAO_ENCONTRADO_FISCAL';
  numeroNf: number;
  tipoLancamento: 'ENTRADA' | 'SAIDA';
  cfop?: string;
  chaveFiscal?: number;
  valorFiscal?: number;
  chaveContabil?: number;
  valorContabil?: number;
  contaDebito?: number;
  contaCredito?: number;
  contaDebitoEsperada?: number;
  contaCreditoEsperada?: number;
  descricao: string;
}

export interface INotaConferida {
  numeroNf: number;
  tipoLancamento: 'ENTRADA' | 'SAIDA';
  chaveFiscal: number;
  chaveContabil: number;
  valorFiscal: number;
  valorContabil: number;
  contaDebito: number;
  contaCredito: number;
}

export interface IResultadoConferencia {
  totalEntradas: number;
  totalSaidas: number;
  entradasConferidas: number;
  saidasConferidas: number;
  divergenciasEncontradas: number;
  divergencias: IDivergenciaConferencia[];
  notasCorretas: INotaConferida[];
}

export interface IParamsConferencia {
  codigoEmpresa: number;
  dataInicio: string;
  dataFim: string;
  planoContabilizacaoId: number;
}
