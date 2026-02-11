export interface ILancamentoFiscalCFOP {
  CHAVELCTOFISENT?: number;
  CHAVELCTOFISSAI?: number;
  CODIGOCFOP: number;
  VALORCONTABILIMPOSTO: number;
  VALORINSS?: number;
  VALORISSQN?: number;
  VALORIRPJ?: number;
  VALORCSLL?: number;
  VALORIRRF?: number;
  VALORPIS?: number;
  VALORCOFINS?: number;
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
  cfops?: ILancamentoFiscalCFOP[];
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
  cfops?: ILancamentoFiscalCFOP[];
}

export interface ILancamentoFiscal {
  CODIGOEMPRESA: number;
  CHAVELCTOFISENT?: number;
  CHAVELCTOFISSAI?: number;
  CODIGOESTAB: number;
  NUMERONF: number;
  ESPECIENF: string;
  DATALCTOFIS: string;
  VALORCONTABIL: number;
  ORIGEMDADO: string;
  TIPO: 'ENTRADA' | 'SAIDA';
  cfops?: ILancamentoFiscalCFOP[];
}
