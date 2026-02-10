import { useState, useEffect, useCallback } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import Grid from "@mui/material/Grid";
import { Search, CalendarMonth, PlayArrow, ListAlt } from "@mui/icons-material";
import axios from "axios";

import ObisidianInput from "../../components/ui/ObisidianInput";
import ObisidianButton from "../../components/ui/ObisidianButton";
import ObisidianCard from "../../components/ui/ObisidianCard";
import ObisidianModal from "../../components/ui/ObisidianModal";
import ObisidianTable from "../../components/ui/ObisidianTable";
import ObisidianPageHeader from "../../components/ui/ObisidianPageHeader";
import ObisidianResultCard from "../../components/ui/ObisidianResultCard";
import ObisidianCardHeader from "../../components/ui/ObisidianCardHeader";

import "./styles.css";

const API = "http://localhost:3000";

interface INotaConferida {
  numeroNf: number;
  tipoLancamento: "ENTRADA" | "SAIDA";
  chaveFiscal: number;
  chaveContabil: number;
  valorFiscal: number;
  valorContabil: number;
  contaDebito: number;
  contaCredito: number;
}

interface IDivergencia {
  tipo: string;
  numeroNf: number;
  tipoLancamento: "ENTRADA" | "SAIDA";
  chaveFiscal?: number;
  valorFiscal?: number;
  chaveContabil?: number;
  valorContabil?: number;
  contaDebito?: number;
  contaCredito?: number;
  descricao: string;
}

interface IResultadoConferencia {
  totalEntradas: number;
  totalSaidas: number;
  entradasConferidas: number;
  saidasConferidas: number;
  divergenciasEncontradas: number;
  divergencias: IDivergencia[];
  notasCorretas: INotaConferida[];
}

const ConferenciaFiscal = () => {
  const [codEmpresa, setCodEmpresa] = useState("");
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [codPlano, setCodPlano] = useState("");
  const [descPlano, setDescPlano] = useState("");
  const [listaEmpresas, setListaEmpresas] = useState<any[]>([]);
  const [listaPlanos, setListaPlanos] = useState<any[]>([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"empresa" | "plano">("empresa");
  const [resultado, setResultado] = useState<IResultadoConferencia | null>(
    null,
  );
  const [processando, setProcessando] = useState(false);

  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);
  const [tipoDetalhes, setTipoDetalhes] = useState<"ENTRADA" | "SAIDA" | null>(
    null,
  );
  const [statusDetalhes, setStatusDetalhes] = useState<
    "corretas" | "divergencias"
  >("corretas");
  const [filtros, setFiltros] = useState<Record<string, string>>({});
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    carregarEmpresas();
    carregarPlanos();
  }, []);

  const formatarData = (valor: string) => {
    const v = valor.replace(/\D/g, "");
    if (v.length > 4)
      return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4, 8)}`;
    if (v.length > 2) return `${v.slice(0, 2)}/${v.slice(2)}`;
    return v;
  };

  const converterDataParaISO = (data: string) => {
    const [dia, mes, ano] = data.split("/");
    return `${ano}-${mes}-${dia}`;
  };

  const carregarEmpresas = async () => {
    try {
      const response = await axios.get(`${API}/empresas`);
      const dadosNormalizados = response.data.map((item: any) => ({
        CODIGO: item.CODIGO || item.codigo || item.CODIGOEMPRESA || item.id,
        NOME:
          item.NOME || item.nome || item.NOMEEMPRESA || item.RAZAOSOCIAL || "",
        CNPJ: item.CNPJ || item.cnpj || "",
        ...item,
      }));
      setListaEmpresas(dadosNormalizados);
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
    }
  };

  const carregarPlanos = async () => {
    try {
      const response = await axios.get(`${API}/planos`);
      setListaPlanos(response.data);
    } catch (error) {
      console.error("Erro ao buscar planos:", error);
    }
  };

  const handleOpenModal = (tipo: "empresa" | "plano") => {
    setModalType(tipo);
    setModalOpen(true);
  };

  const handleSelecionarItem = (row: any) => {
    if (modalType === "empresa") {
      setCodEmpresa(String(row.CODIGO || ""));
      setNomeEmpresa(row.NOME || "");
    } else {
      setCodPlano(String(row.id || ""));
      setDescPlano(row.nome || "");
    }
    setModalOpen(false);
  };

  const handleBuscaManualEmpresa = (val: string) => {
    setCodEmpresa(val);
    const found = listaEmpresas.find((e) => String(e.CODIGO) === val);
    setNomeEmpresa(found ? found.NOME : "");
  };

  const handleBuscaManualPlano = (val: string) => {
    setCodPlano(val);
    const found = listaPlanos.find((p) => String(p.id) === val);
    setDescPlano(found ? found.nome : "");
  };

  const handleProcessar = async () => {
    if (!codEmpresa || !dataInicio || !dataFim || !codPlano) {
      alert("Preencha todos os campos!");
      return;
    }

    setProcessando(true);
    setResultado(null);

    try {
      const response = await axios.post(`${API}/conferencia-fiscal/executar`, {
        codigoEmpresa: parseInt(codEmpresa),
        dataInicio: converterDataParaISO(dataInicio),
        dataFim: converterDataParaISO(dataFim),
        planoContabilizacaoId: parseInt(codPlano),
      });

      setResultado(response.data);
    } catch (error) {
      console.error("Erro ao processar conferência:", error);
      alert("Erro ao processar conferência fiscal!");
    } finally {
      setProcessando(false);
    }
  };

  const handleClickCard = (tipo: "ENTRADA" | "SAIDA") => {
    setTipoDetalhes(tipo);
    setStatusDetalhes("corretas");
    setModalDetalhesOpen(true);
  };

  const obterDadosFiltrados = () => {
    if (!resultado || !tipoDetalhes) return [];

    let dados: any[] = [];

    if (statusDetalhes === "corretas") {
      dados = resultado.notasCorretas
        .filter((n) => n.tipoLancamento === tipoDetalhes)
        .map((n) => ({
          numeroNf: n.numeroNf,
          chaveFiscal: n.chaveFiscal,
          chaveContabil: n.chaveContabil,
          valor: `R$ ${n.valorFiscal.toFixed(2)}`,
          contaDebito: n.contaDebito,
          contaCredito: n.contaCredito,
          status: "OK",
        }));
    } else {
      dados = resultado.divergencias
        .filter((d) => d.tipoLancamento === tipoDetalhes)
        .map((d) => {
          const valorFiscal = d.valorFiscal || 0;
          const valorContabil = d.valorContabil || 0;
          const diferenca = Math.abs(valorFiscal - valorContabil);

          return {
            numeroNf: d.numeroNf,
            tipo:
              d.tipo === "VALOR_DIVERGENTE"
                ? "Valor Divergente"
                : "Não Encontrado no Contábil",
            valorFiscal: d.valorFiscal ? `R$ ${d.valorFiscal.toFixed(2)}` : "-",
            valorContabil: d.valorContabil
              ? `R$ ${d.valorContabil.toFixed(2)}`
              : "-",
            diferenca: diferenca > 0 ? `R$ ${diferenca.toFixed(2)}` : "-",
            contaDebito: d.contaDebito || "-",
            contaCredito: d.contaCredito || "-",
          };
        });
    }

    // Aplicar filtros por coluna
    Object.entries(filtros).forEach(([coluna, valor]) => {
      if (valor) {
        dados = dados.filter((d) =>
          String(d[coluna]).toLowerCase().includes(valor.toLowerCase()),
        );
      }
    });

    return dados;
  };

  const handleLimparFiltros = () => {
    setFiltros({});
  };

  const handleFiltroChange = useCallback((coluna: string, valor: string) => {
    setFiltros((prev) => ({
      ...prev,
      [coluna]: valor,
    }));
  }, []);

  const FiltroColuna = useCallback(
    ({ coluna, valor, onChange }: any) => (
      <Box sx={{ mt: 0.5, mb: 0.5 }}>
        <ObisidianInput
          placeholder={`Filtrar ${coluna.label.toLowerCase()}...`}
          value={valor || ""}
          onChange={(e) => onChange(coluna.id, e.target.value)}
          noMargin
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              height: 28,
              fontSize: "0.7rem",
            },
          }}
        />
      </Box>
    ),
    [],
  );

  const dadosFiltrados = obterDadosFiltrados();
  const totalSemFiltro =
    resultado && tipoDetalhes
      ? statusDetalhes === "corretas"
        ? resultado.notasCorretas.filter(
            (n) => n.tipoLancamento === tipoDetalhes,
          ).length
        : resultado.divergencias.filter(
            (d) => d.tipoLancamento === tipoDetalhes,
          ).length
      : 0;

  const entradasOk =
    resultado && resultado.entradasConferidas === resultado.totalEntradas;
  const saidasOk =
    resultado && resultado.saidasConferidas === resultado.totalSaidas;

  const colunas =
    statusDetalhes === "corretas"
      ? [
          { id: "numeroNf", label: "Nº NF", minWidth: 80 },
          { id: "chaveFiscal", label: "Chave Fiscal", minWidth: 100 },
          { id: "chaveContabil", label: "Chave Contábil", minWidth: 100 },
          { id: "valor", label: "Valor", minWidth: 100 },
          { id: "contaDebito", label: "Conta Débito", minWidth: 100 },
          { id: "contaCredito", label: "Conta Crédito", minWidth: 100 },
          { id: "status", label: "Status", minWidth: 80 },
        ]
      : [
          { id: "numeroNf", label: "Nº NF", minWidth: 80 },
          { id: "tipo", label: "Tipo Erro", minWidth: 150 },
          {
            id: "valorFiscal",
            label: "Valor Fiscal",
            minWidth: 110,
            align: "right" as const,
          },
          {
            id: "valorContabil",
            label: "Valor Contábil",
            minWidth: 110,
            align: "right" as const,
          },
          {
            id: "diferenca",
            label: "Diferença",
            minWidth: 100,
            align: "right" as const,
          },
          { id: "contaDebito", label: "Conta Débito", minWidth: 90 },
          { id: "contaCredito", label: "Conta Crédito", minWidth: 90 },
        ];

  return (
    <Box className="conferencia-container">
      <ObisidianPageHeader
        title="Conferência Fiscal"
        subtitle="Selecione os parâmetros para iniciar a auditoria."
      />

      <ObisidianCard
        sx={{
          mb: 1.5,
          bgcolor: "#fff",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.02)",
        }}
      >
        <Grid container spacing={1.5} alignItems="flex-end">
          <Grid size={{ xs: 12, md: 1.5 }}>
            <ObisidianInput
              label="Cód. Empresa"
              placeholder="000"
              value={codEmpresa}
              onChange={(e) => handleBuscaManualEmpresa(e.target.value)}
              endIcon={
                <IconButton
                  size="small"
                  sx={{ p: 0.2 }}
                  onClick={() => handleOpenModal("empresa")}
                >
                  <ListAlt sx={{ fontSize: 16 }} />
                </IconButton>
              }
            />
          </Grid>
          <Grid size={{ xs: 12, md: 10.5 }}>
            <ObisidianInput
              label="Razão Social"
              placeholder="Selecione a empresa..."
              value={nomeEmpresa}
              disabled={true}
              className="input-disabled-custom"
            />
          </Grid>
        </Grid>

        <Grid container spacing={1.5} alignItems="flex-end">
          <Grid size={{ xs: 6, md: 1.5 }}>
            <ObisidianInput
              label="Data Inicial"
              placeholder="DD/MM/AAAA"
              value={dataInicio}
              onChange={(e) => setDataInicio(formatarData(e.target.value))}
              inputProps={{ maxLength: 10 }}
              endIcon={
                <CalendarMonth sx={{ fontSize: 16, color: "#94a3b8" }} />
              }
            />
          </Grid>
          <Grid size={{ xs: 6, md: 1.5 }}>
            <ObisidianInput
              label="Data Final"
              placeholder="DD/MM/AAAA"
              value={dataFim}
              onChange={(e) => setDataFim(formatarData(e.target.value))}
              inputProps={{ maxLength: 10 }}
              endIcon={
                <CalendarMonth sx={{ fontSize: 16, color: "#94a3b8" }} />
              }
            />
          </Grid>
          <Grid size={{ xs: 12, md: 1.5 }}>
            <ObisidianInput
              label="Cód. Plano"
              placeholder="0"
              value={codPlano}
              onChange={(e) => handleBuscaManualPlano(e.target.value)}
              endIcon={
                <IconButton
                  size="small"
                  sx={{ p: 0.2 }}
                  onClick={() => handleOpenModal("plano")}
                >
                  <ListAlt sx={{ fontSize: 16 }} />
                </IconButton>
              }
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6.5 }}>
            <ObisidianInput
              label="Nome do Plano"
              placeholder="Selecione o plano..."
              value={descPlano}
              disabled={true}
              className="input-disabled-custom"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 1 }}>
            <Box sx={{ mb: "8px" }}>
              <ObisidianButton
                variantType="primary"
                fullWidth
                startIcon={!processando && <PlayArrow sx={{ fontSize: 16 }} />}
                onClick={handleProcessar}
                loading={processando}
              >
                Processar
              </ObisidianButton>
            </Box>
          </Grid>
        </Grid>
      </ObisidianCard>

      {resultado ? (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <ObisidianResultCard
              title="ENTRADAS"
              status={entradasOk ? "success" : "error"}
              total={resultado.totalEntradas}
              conferidos={resultado.entradasConferidas}
              onClick={() => handleClickCard("ENTRADA")}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <ObisidianResultCard
              title="SAÍDAS"
              status={saidasOk ? "success" : "error"}
              total={resultado.totalSaidas}
              conferidos={resultado.saidasConferidas}
              onClick={() => handleClickCard("SAIDA")}
            />
          </Grid>
        </Grid>
      ) : (
        <ObisidianCard
          sx={{
            minHeight: "160px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderStyle: "dashed",
            borderColor: "#cbd5e1",
          }}
        >
          <Box sx={{ textAlign: "center", opacity: 0.5 }}>
            <Search sx={{ fontSize: 40, color: "#cbd5e1", mb: 0.5 }} />
            <Typography
              sx={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 500 }}
            >
              Aguardando processamento para exibir resultados...
            </Typography>
          </Box>
        </ObisidianCard>
      )}

      <ObisidianModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          modalType === "empresa" ? "Selecionar Empresa" : "Selecionar Plano"
        }
        maxWidth="md"
        actions={
          <ObisidianButton
            variantType="ghost"
            onClick={() => setModalOpen(false)}
          >
            Cancelar
          </ObisidianButton>
        }
      >
        {modalType === "empresa" ? (
          <ObisidianTable
            columns={[
              { id: "CODIGO", label: "Cód", minWidth: 50 },
              { id: "NOME", label: "Razão Social", minWidth: 300 },
            ]}
            rows={listaEmpresas}
            onRowClick={(row) => handleSelecionarItem(row)}
          />
        ) : (
          <ObisidianTable
            columns={[
              { id: "id", label: "Cód", minWidth: 50 },
              { id: "nome", label: "Nome do Plano", minWidth: 300 },
            ]}
            rows={listaPlanos}
            onRowClick={(row) => handleSelecionarItem(row)}
          />
        )}
      </ObisidianModal>

      <ObisidianModal
        open={modalDetalhesOpen}
        onClose={() => {
          setModalDetalhesOpen(false);
          handleLimparFiltros();
        }}
        title={`Detalhes - ${tipoDetalhes === "ENTRADA" ? "Entradas" : "Saídas"}`}
        maxWidth="lg"
        actions={
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Typography
              sx={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}
            >
              Mostrando {dadosFiltrados.length} de {totalSemFiltro} registros
              {Object.values(filtros).some((v) => v) && ` (filtrado)`}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {Object.values(filtros).some((v) => v) && (
                <ObisidianButton
                  variantType="ghost"
                  onClick={handleLimparFiltros}
                >
                  Limpar Filtros
                </ObisidianButton>
              )}
              <ObisidianButton
                variantType="ghost"
                onClick={() => setModalDetalhesOpen(false)}
              >
                Fechar
              </ObisidianButton>
            </Box>
          </Box>
        }
      >
        <ObisidianCard
          noPadding
          sx={{
            height: "calc(100vh - 240px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <ObisidianCardHeader>
            <Grid
              container
              spacing={1.5}
              alignItems="flex-end"
              sx={{ width: "100%" }}
            >
              <Grid size={{ xs: 12, md: 2 }}>
                <ObisidianButton
                  variantType={mostrarFiltros ? "primary" : "outline"}
                  onClick={() => setMostrarFiltros(!mostrarFiltros)}
                  fullWidth
                >
                  {mostrarFiltros ? "Ocultar Filtros" : "Filtros"}
                </ObisidianButton>
              </Grid>
              <Grid size={{ xs: 12, md: 10 }}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <ObisidianButton
                    variantType={
                      statusDetalhes === "corretas" ? "primary" : "ghost"
                    }
                    onClick={() => {
                      setStatusDetalhes("corretas");
                      handleLimparFiltros();
                    }}
                    fullWidth
                  >
                    Corretas (
                    {resultado?.notasCorretas.filter(
                      (n) => n.tipoLancamento === tipoDetalhes,
                    ).length || 0}
                    )
                  </ObisidianButton>
                  <ObisidianButton
                    variantType={
                      statusDetalhes === "divergencias" ? "danger" : "ghost"
                    }
                    onClick={() => {
                      setStatusDetalhes("divergencias");
                      handleLimparFiltros();
                    }}
                    fullWidth
                  >
                    Divergências (
                    {resultado?.divergencias.filter(
                      (d) => d.tipoLancamento === tipoDetalhes,
                    ).length || 0}
                    )
                  </ObisidianButton>
                </Box>
              </Grid>

              {mostrarFiltros && (
                <Grid size={12}>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: "#f8fafc",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        color: "#64748b",
                        mb: 1,
                        textTransform: "uppercase",
                      }}
                    >
                      Filtrar por coluna
                    </Typography>
                    <Grid container spacing={1.5}>
                      {colunas.map((col) => (
                        <Grid size={{ xs: 6, md: 3 }} key={col.id}>
                          <Typography
                            sx={{
                              fontSize: "0.65rem",
                              fontWeight: 600,
                              color: "#475569",
                              mb: 0.3,
                            }}
                          >
                            {col.label}
                          </Typography>
                          <FiltroColuna
                            coluna={col}
                            valor={filtros[col.id]}
                            onChange={handleFiltroChange}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Grid>
              )}
            </Grid>
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
            <ObisidianTable columns={colunas} rows={dadosFiltrados} />
          </Box>
        </ObisidianCard>
      </ObisidianModal>
    </Box>
  );
};

export default ConferenciaFiscal;
