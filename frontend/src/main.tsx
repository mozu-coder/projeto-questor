import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme"; // Importe o tema
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      {" "}
      {/* Envolve tudo com o tema */}
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
