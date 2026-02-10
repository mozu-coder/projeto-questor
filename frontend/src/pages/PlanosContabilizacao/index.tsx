import { useState, useEffect } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import Grid from "@mui/material/Grid";
import { Add, Edit, Delete, ListAlt, Search } from "@mui/icons-material";
import axios from "axios";

import ObisidianInput from "../../components/ui/ObisidianInput";
import ObisidianButton from "../../components/ui/ObisidianButton";
import ObisidianCard from "../../components/ui/ObisidianCard";
import ObisidianCardHeader from "../../components/ui/ObisidianCardHeader";
import ObisidianModal from "../../components/ui/ObisidianModal";
import ObisidianTable from "../../components/ui/ObisidianTable";
import ObisidianPageHeader from "../../components/ui/ObisidianPageHeader";

import "./styles.css";

const API = "http://localhost:3000";

interface PlanoItem {
  id: number;
  plano_id: number;
  cfop: string;
  conta_credito: string;
  conta_debito: string;
}

interface Plano {
  id: number;
  nome: string;
  total_itens: number;
}

const PlanosContabilizacao = () => {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [planoSelecionado, setPlanoSelecionado] = useState<Plano | null>(null);
  const [itens, setItens] = useState<PlanoItem[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(false);

  const [modalPlanoOpen, setModalPlanoOpen] = useState(false);
  const [editingPlano, setEditingPlano] = useState<Plano | null>(null);
  const [formPlanoNome, setFormPlanoNome] = useState("");

  const [modalItemOpen, setModalItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PlanoItem | null>(null);
  const [formCfop, setFormCfop] = useState("");
  const [formContaCredito, setFormContaCredito] = useState("");
  const [formContaDebito, setFormContaDebito] = useState("");

  const [deleteModal, setDeleteModal] = useState<{
    type: "plano" | "item";
    target: any;
  } | null>(null);

  useEffect(() => {
    carregarPlanos();
  }, []);

  const carregarPlanos = async () => {
    try {
      const res = await axios.get(`${API}/planos`);
      setPlanos(res.data);
      if (planoSelecionado) {
        const atualizado = res.data.find(
          (p: Plano) => p.id === planoSelecionado.id,
        );
        if (atualizado) setPlanoSelecionado(atualizado);
        else setPlanoSelecionado(null);
      }
    } catch (err) {
      console.error("Erro ao carregar planos:", err);
    }
  };

  const selecionarPlano = async (plano: Plano) => {
    setPlanoSelecionado(plano);
    await carregarItens(plano.id);
  };

  const carregarItens = async (planoId: number) => {
    try {
      const res = await axios.get(`${API}/planos/${planoId}/itens`);
      setItens(res.data);
    } catch (err) {
      console.error("Erro ao carregar itens:", err);
      setItens([]);
    }
  };

  const planosFiltrados = planos.filter(
    (p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      String(p.id).includes(busca),
  );

  const handleNovoPlano = () => {
    setEditingPlano(null);
    setFormPlanoNome("");
    setModalPlanoOpen(true);
  };

  const handleEditPlano = (plano: Plano) => {
    setEditingPlano(plano);
    setFormPlanoNome(plano.nome);
    setModalPlanoOpen(true);
  };

  const handleSavePlano = async () => {
    if (!formPlanoNome.trim()) return;
    setLoading(true);
    try {
      if (editingPlano) {
        await axios.put(`${API}/planos/${editingPlano.id}`, {
          nome: formPlanoNome,
        });
      } else {
        const res = await axios.post(`${API}/planos`, { nome: formPlanoNome });
        setPlanoSelecionado(res.data);
        setItens([]);
      }
      await carregarPlanos();
      setModalPlanoOpen(false);
    } catch (err) {
      console.error("Erro ao salvar plano:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeletePlano = async () => {
    if (!deleteModal || deleteModal.type !== "plano") return;
    setLoading(true);
    try {
      await axios.delete(`${API}/planos/${deleteModal.target.id}`);
      if (planoSelecionado?.id === deleteModal.target.id) {
        setPlanoSelecionado(null);
        setItens([]);
      }
      await carregarPlanos();
      setDeleteModal(null);
    } catch (err) {
      console.error("Erro ao excluir plano:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNovoItem = () => {
    setEditingItem(null);
    setFormCfop("");
    setFormContaCredito("");
    setFormContaDebito("");
    setModalItemOpen(true);
  };

  const handleEditItem = (item: PlanoItem) => {
    setEditingItem(item);
    setFormCfop(item.cfop);
    setFormContaCredito(item.conta_credito);
    setFormContaDebito(item.conta_debito);
    setModalItemOpen(true);
  };

  const handleSaveItem = async () => {
    if (!planoSelecionado || !formCfop.trim()) return;
    setLoading(true);
    try {
      const payload = {
        cfop: formCfop,
        contaCredito: formContaCredito,
        contaDebito: formContaDebito,
      };

      if (editingItem) {
        await axios.put(`${API}/planos/itens/${editingItem.id}`, payload);
      } else {
        await axios.post(`${API}/planos/${planoSelecionado.id}/itens`, payload);
      }

      await carregarItens(planoSelecionado.id);
      await carregarPlanos();
      setModalItemOpen(false);
    } catch (err) {
      console.error("Erro ao salvar item:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeleteItem = async () => {
    if (!deleteModal || deleteModal.type !== "item" || !planoSelecionado)
      return;
    setLoading(true);
    try {
      await axios.delete(`${API}/planos/itens/${deleteModal.target.id}`);
      await carregarItens(planoSelecionado.id);
      await carregarPlanos();
      setDeleteModal(null);
    } catch (err) {
      console.error("Erro ao excluir item:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="planos-container">
      <ObisidianPageHeader
        title="Planos de Contabilização"
        subtitle="Gerencie os planos e seus itens de contabilização por CFOP."
      />

      <Grid container spacing={1.5}>
        {/* ── COLUNA ESQUERDA: Lista de planos ── */}
        <Grid size={{ xs: 12, md: 3.5 }}>
          <ObisidianCard
            noPadding
            sx={{
              height: "calc(100vh - 160px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <ObisidianCardHeader>
              <Box sx={{ flex: 1 }}>
                <ObisidianInput
                  placeholder="Buscar plano por nome ou ID..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  startIcon={<Search sx={{ fontSize: 16 }} />}
                  noMargin
                />
              </Box>
              <ObisidianButton
                variantType="primary"
                startIcon={<Add sx={{ fontSize: 16 }} />}
                onClick={handleNovoPlano}
              >
                Novo Plano
              </ObisidianButton>
            </ObisidianCardHeader>

            <Box sx={{ flex: 1, overflow: "auto", px: 1.5, pb: 1.5 }}>
              {planosFiltrados.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 3, opacity: 0.5 }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    Nenhum plano encontrado
                  </Typography>
                </Box>
              ) : (
                planosFiltrados.map((plano) => {
                  const isActive = planoSelecionado?.id === plano.id;
                  return (
                    <Box
                      key={plano.id}
                      onClick={() => selecionarPlano(plano)}
                      sx={{
                        px: 1.2,
                        py: 0.8,
                        mb: 0.3,
                        borderRadius: "6px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        bgcolor: isActive
                          ? "rgba(99, 102, 241, 0.08)"
                          : "transparent",
                        border: isActive
                          ? "1px solid rgba(99, 102, 241, 0.2)"
                          : "1px solid transparent",
                        "&:hover": {
                          bgcolor: isActive
                            ? "rgba(99, 102, 241, 0.08)"
                            : "#f8fafc",
                        },
                        transition: "all 0.15s",
                      }}
                    >
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          sx={{
                            fontSize: "0.78rem",
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? "#6366f1" : "#334155",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {plano.nome}
                        </Typography>
                        <Typography
                          sx={{ fontSize: "0.62rem", color: "#94a3b8" }}
                        >
                          {plano.total_itens}{" "}
                          {Number(plano.total_itens) === 1 ? "item" : "itens"}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", gap: 0.2, flexShrink: 0 }}>
                        <IconButton
                          size="small"
                          sx={{
                            p: 0.3,
                            color: "#94a3b8",
                            "&:hover": { color: "#6366f1" },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditPlano(plano);
                          }}
                        >
                          <Edit sx={{ fontSize: 14 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{
                            p: 0.3,
                            color: "#94a3b8",
                            "&:hover": { color: "#ef4444" },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteModal({ type: "plano", target: plano });
                          }}
                        >
                          <Delete sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    </Box>
                  );
                })
              )}
            </Box>
          </ObisidianCard>
        </Grid>

        {/* ── COLUNA DIREITA: Itens do plano ── */}
        <Grid size={{ xs: 12, md: 8.5 }}>
          <ObisidianCard
            noPadding
            sx={{
              height: "calc(100vh - 160px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {planoSelecionado ? (
              <>
                <ObisidianCardHeader>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "#1e293b",
                      }}
                    >
                      {planoSelecionado.nome}
                    </Typography>
                    <Typography sx={{ fontSize: "0.65rem", color: "#94a3b8" }}>
                      {itens.length} itens cadastrados
                    </Typography>
                  </Box>
                  <Box sx={{ marginLeft: "auto" }}>
                    <ObisidianButton
                      variantType="primary"
                      startIcon={<Add sx={{ fontSize: 16 }} />}
                      onClick={handleNovoItem}
                    >
                      Novo Item
                    </ObisidianButton>
                  </Box>
                </ObisidianCardHeader>

                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    px: 1.5,
                    pb: 1.5,
                  }}
                >
                  {itens.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 4, opacity: 0.5 }}>
                      <ListAlt
                        sx={{ fontSize: 36, color: "#cbd5e1", mb: 0.5 }}
                      />
                      <Typography
                        sx={{ fontSize: "0.75rem", color: "#94a3b8" }}
                      >
                        Nenhum item cadastrado neste plano
                      </Typography>
                    </Box>
                  ) : (
                    <ObisidianTable
                      columns={[
                        { id: "cfop", label: "CFOP", minWidth: 80 },
                        {
                          id: "conta_credito",
                          label: "Conta Crédito",
                          minWidth: 140,
                          format: (v: string) => v || "—",
                        },
                        {
                          id: "conta_debito",
                          label: "Conta Débito",
                          minWidth: 140,
                          format: (v: string) => v || "—",
                        },
                      ]}
                      rows={itens}
                      onEdit={(row) => handleEditItem(row)}
                      onDelete={(row) =>
                        setDeleteModal({ type: "item", target: row })
                      }
                    />
                  )}
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.5,
                  p: 1.5,
                }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <ListAlt sx={{ fontSize: 40, color: "#cbd5e1", mb: 0.5 }} />
                  <Typography
                    sx={{
                      fontSize: "0.78rem",
                      color: "#94a3b8",
                      fontWeight: 500,
                    }}
                  >
                    Selecione um plano para ver seus itens
                  </Typography>
                </Box>
              </Box>
            )}
          </ObisidianCard>
        </Grid>
      </Grid>

      {/* Modal: Criar/Editar Plano */}
      <ObisidianModal
        open={modalPlanoOpen}
        onClose={() => setModalPlanoOpen(false)}
        title={editingPlano ? "Editar Plano" : "Novo Plano"}
        maxWidth="xs"
        actions={
          <Box sx={{ display: "flex", gap: 1 }}>
            <ObisidianButton
              variantType="ghost"
              onClick={() => setModalPlanoOpen(false)}
            >
              Cancelar
            </ObisidianButton>
            <ObisidianButton
              variantType="primary"
              onClick={handleSavePlano}
              loading={loading}
            >
              Salvar
            </ObisidianButton>
          </Box>
        }
      >
        <ObisidianInput
          label="Nome do Plano"
          placeholder="Ex: Plano Padrão Comércio"
          value={formPlanoNome}
          onChange={(e) => setFormPlanoNome(e.target.value)}
        />
      </ObisidianModal>

      {/* Modal: Criar/Editar Item */}
      <ObisidianModal
        open={modalItemOpen}
        onClose={() => setModalItemOpen(false)}
        title={editingItem ? "Editar Item" : "Novo Item"}
        maxWidth="sm"
        actions={
          <Box sx={{ display: "flex", gap: 1 }}>
            <ObisidianButton
              variantType="ghost"
              onClick={() => setModalItemOpen(false)}
            >
              Cancelar
            </ObisidianButton>
            <ObisidianButton
              variantType="primary"
              onClick={handleSaveItem}
              loading={loading}
            >
              Salvar
            </ObisidianButton>
          </Box>
        }
      >
        <Grid container spacing={1.5}>
          <Grid size={12}>
            <ObisidianInput
              label="CFOP"
              placeholder="Ex: 1101"
              value={formCfop}
              onChange={(e) => setFormCfop(e.target.value)}
            />
          </Grid>
          <Grid size={6}>
            <ObisidianInput
              label="Conta Crédito"
              placeholder="Ex: 31012"
              value={formContaCredito}
              onChange={(e) => setFormContaCredito(e.target.value)}
            />
          </Grid>
          <Grid size={6}>
            <ObisidianInput
              label="Conta Débito"
              placeholder="Ex: 11030"
              value={formContaDebito}
              onChange={(e) => setFormContaDebito(e.target.value)}
            />
          </Grid>
        </Grid>
      </ObisidianModal>

      {/* Modal: Confirmar Exclusão */}
      <ObisidianModal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Confirmar Exclusão"
        maxWidth="xs"
        actions={
          <Box sx={{ display: "flex", gap: 1 }}>
            <ObisidianButton
              variantType="ghost"
              onClick={() => setDeleteModal(null)}
            >
              Cancelar
            </ObisidianButton>
            <ObisidianButton
              variantType="danger"
              loading={loading}
              onClick={
                deleteModal?.type === "plano"
                  ? handleConfirmDeletePlano
                  : handleConfirmDeleteItem
              }
            >
              Excluir
            </ObisidianButton>
          </Box>
        }
      >
        <Typography sx={{ fontSize: "0.82rem", color: "#475569" }}>
          {deleteModal?.type === "plano"
            ? `Tem certeza que deseja excluir o plano "${deleteModal?.target?.nome}"? Todos os itens serão removidos.`
            : `Tem certeza que deseja excluir o item CFOP "${deleteModal?.target?.cfop}"?`}
        </Typography>
      </ObisidianModal>
    </Box>
  );
};

export default PlanosContabilizacao;
