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
  conta_credito: string;
  conta_debito: string;
  criado_em: string;
  atualizado_em: string;
}