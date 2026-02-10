// src/theme.ts
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light", // O conteúdo principal será claro para facilitar leitura
    primary: {
      main: "#1c2536", // "Obsidian Dark" - Cor da Sidebar/Cabeçalhos
    },
    secondary: {
      main: "#6366f1", // "Indigo" - Cor de destaque (botões, ativos)
    },
    background: {
      default: "#f8f9fa", // Cinza muito suave para o fundo da página
      paper: "#ffffff", // Branco puro para os cartões/tabelas
    },
    text: {
      primary: "#111927", // Quase preto, para leitura confortável
      secondary: "#6C737F", // Cinza para legendas
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      color: "#1c2536",
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Botões mais arredondados e modernos
          textTransform: "none", // Tira o CAPS LOCK automático feio
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none", // Remove sombras padrões feias do modo dark
          boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.08)", // Sombra ultra-suave
        },
      },
    },
  },
});

export default theme;
