export interface IPlano {
  id: number;
  nome: string;
  total_itens?: number;
  criado_em: string;
  atualizado_em: string;
}

export interface IPlanoItem {
  id: number;
  plano_id: number;
  cfop: string;
  conta_credito: string | null;
  conta_debito: string | null;
  contabiliza: boolean;
  retido: boolean;
  conta_inss: string | null;
  conta_issqn: string | null;
  conta_irpj: string | null;
  conta_csll: string | null;
  conta_irrf: string | null;
  conta_pis: string | null;
  conta_cofins: string | null;
  criado_em: string;
  atualizado_em: string;
}
