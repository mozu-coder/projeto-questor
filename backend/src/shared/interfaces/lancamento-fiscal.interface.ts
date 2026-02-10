export interface ILancamentoFiscal {
  CODIGOEMPRESA: number;
  CHAVE: number;
  CODIGOESTAB: number;
  NUMERONF: number;
  ESPECIENF: string;
  DATALCTOFIS: string;
  VALORCONTABIL: number;
  ORIGEMDADO: string;
  TIPO: 'ENTRADA' | 'SAIDA';
}

export interface ILancamentoFiscalEntrada {
  CODIGOEMPRESA: number;
  CHAVELCTOFISENT: number;
  CODIGOESTAB: number;
  NUMERONF: number;
  ESPECIENF: string;
  DATALCTOFIS: string;
  VALORCONTABIL: number;
  ORIGEMDADO: string;
}

export interface ILancamentoFiscalSaida {
  CODIGOEMPRESA: number;
  CHAVELCTOFISSAI: number;
  CODIGOESTAB: number;
  NUMERONF: number;
  ESPECIENF: string;
  DATALCTOFIS: string;
  VALORCONTABIL: number;
  ORIGEMDADO: string;
}
