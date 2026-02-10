import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Business,
  ReceiptLong,
  Storage,
  TrendingUp,
} from "@mui/icons-material";
import axios from "axios";

import ObisidianCard from "../../components/ui/ObisidianCard";
import ObisidianBarChart from "../../components/ui/ObisidianBarChart";
import ObisidianPageHeader from "../../components/ui/ObisidianPageHeader";
import ObisidianStatCard from "../../components/ui/ObisidianStatCard";

import "./styles.css";

const Dashboard = () => {
  const [totalEmpresas, setTotalEmpresas] = useState(0);
  const [totalLancamentosMes, setTotalLancamentosMes] = useState(0);
  const [dadosGrafico, setDadosGrafico] = useState([
    { name: "Anterior", valor: 0 },
    { name: "Atual", valor: 0 },
  ]);

  const formatDate = (date: Date) => date.toISOString().split("T")[0];
  const getMonthName = (date: Date) =>
    date.toLocaleString("pt-BR", { month: "short" }).replace(".", "");

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      axios
        .get("http://localhost:3000/empresas")
        .then((res) => setTotalEmpresas(res.data.length));

      const hoje = new Date();
      const inicioAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fimAtual = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
      const inicioPassado = new Date(
        hoje.getFullYear(),
        hoje.getMonth() - 1,
        1,
      );
      const fimPassado = new Date(hoje.getFullYear(), hoje.getMonth(), 0);

      const [reqPassado, reqAtual] = await Promise.all([
        axios.get("http://localhost:3000/contabilidade/lancamentos/total", {
          params: {
            inicio: formatDate(inicioPassado),
            fim: formatDate(fimPassado),
          },
        }),
        axios.get("http://localhost:3000/contabilidade/lancamentos/total", {
          params: {
            inicio: formatDate(inicioAtual),
            fim: formatDate(fimAtual),
          },
        }),
      ]);

      setTotalLancamentosMes(reqAtual.data);
      setDadosGrafico([
        {
          name:
            getMonthName(inicioPassado).charAt(0).toUpperCase() +
            getMonthName(inicioPassado).slice(1),
          valor: reqPassado.data,
        },
        {
          name:
            getMonthName(inicioAtual).charAt(0).toUpperCase() +
            getMonthName(inicioAtual).slice(1),
          valor: reqAtual.data,
        },
      ]);
    } catch (err) {
      console.error("Erro dashboard:", err);
    }
  };

  return (
    <Box className="dashboard-container">
      <ObisidianPageHeader
        title="Dashboard"
        subtitle="Visão geral da operação."
      />

      <Grid container spacing={1.2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ObisidianStatCard
            title="Empresas Ativas"
            value={totalEmpresas}
            icon={<Business />}
            trend="ON"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ObisidianStatCard
            title="Lançamentos (Mês)"
            value={totalLancamentosMes.toLocaleString("pt-BR")}
            icon={<ReceiptLong />}
            trend="+12%"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ObisidianStatCard
            title="Integrações"
            value="Questor API"
            icon={<Storage />}
            trend="Estável"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ObisidianStatCard
            title="Performance"
            value="98%"
            icon={<TrendingUp />}
            trendColor="success"
            trend="Ótimo"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ObisidianCard sx={{ height: "100%", p: 1.2 }}>
            <ObisidianBarChart
              title="Lançamentos Contábeis"
              data={dadosGrafico}
            />
          </ObisidianCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ObisidianCard
            sx={{
              height: "100%",
              p: 1.2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#f8fafc",
              border: "1px dashed #e2e8f0",
              minHeight: "170px",
            }}
          >
            <Typography
              sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8" }}
            >
              Em breve: Ranking de Movimentação
            </Typography>
          </ObisidianCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
