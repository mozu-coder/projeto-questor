export interface IDivergenciaConferencia {
  tipo:
    | 'NAO_ENCONTRADO_CONTABIL'
    | 'NAO_ENCONTRADO_FISCAL'
    | 'VALOR_DIVERGENTE'
    | 'CONTA_INCORRETA'
    | 'CFOP_NAO_CONFIGURADO';
  numeroNf: number;
  tipoLancamento: 'ENTRADA' | 'SAIDA';
  cfop: number;
  chaveFiscal: number;
  valorFiscal: number;
  chaveContabil?: number;
  valorContabil?: number;
  contaDebito?: number | null;
  contaCredito?: number | null;
  contaDebitoEsperada?: number;
  contaCreditoEsperada?: number;
  descricao: string;
}

export interface INotaConferida {
  numeroNf: number;
  tipoLancamento: 'ENTRADA' | 'SAIDA';
  cfop: number;
  chaveFiscal: number;
  chaveContabil: number | null;
  valorFiscal: number;
  valorContabil: number;
  contaDebito: number | null;
  contaCredito: number | null;
}

export interface IResultadoConferencia {
  totalEntradas: number;
  totalSaidas: number;
  totalCFOPsEntrada: number;
  totalCFOPsSaida: number;
  cfopsEntradasConferidos: number;
  cfopsSaidasConferidos: number;
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
