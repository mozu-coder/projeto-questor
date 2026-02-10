export interface IPlanoContas {
  CODIGOEMPRESA: number;
  CONTACTB: number;
  CLASSIFCONTA: string;
  DESCRCONTA: string;
}

export interface IPlanoContasNode extends IPlanoContas {
  nivel: number;
  pai?: string;
  filhos: IPlanoContasNode[];
  valor?: number;
  valorTotal?: number;
}

export interface IPlanoContasTree {
  raizes: IPlanoContasNode[];
  mapa: Map<number, IPlanoContasNode>;
  mapaClassif: Map<string, IPlanoContasNode>;
}
