import React from "react";
import { Box, Typography } from "@mui/material";
import { CheckCircle, Error, Warning } from "@mui/icons-material";

interface Props {
  title: string;
  status: "success" | "error" | "warning";
  total: number;
  conferidos: number;
  onClick?: () => void;
}

const ObisidianResultCard: React.FC<Props> = ({
  title,
  status,
  total,
  conferidos,
  onClick,
}) => {
  const configs = {
    success: {
      // Reduzi o tamanho do ícone de 26 para 20
      icon: <CheckCircle sx={{ fontSize: 20, color: "#10b981" }} />,
      borderColor: "#10b981",
      bgcolor: "#f0fdf4",
      titleColor: "#065f46",
      textColor: "#059669",
      errorColor: "#10b981",
    },
    error: {
      icon: <Error sx={{ fontSize: 20, color: "#ef4444" }} />,
      borderColor: "#ef4444",
      bgcolor: "#fef2f2",
      titleColor: "#991b1b",
      textColor: "#dc2626",
      errorColor: "#dc2626",
    },
    warning: {
      icon: <Warning sx={{ fontSize: 20, color: "#f59e0b" }} />,
      borderColor: "#f59e0b",
      bgcolor: "#fffbeb",
      titleColor: "#92400e",
      textColor: "#d97706",
      errorColor: "#f59e0b",
    },
  };

  const config = configs[status];
  const divergencias = total - conferidos;

  return (
    <Box
      onClick={onClick}
      className={`status-card-${status}`}
      sx={{
        p: 1.5, // Reduzi o padding de 2 para 1.5
        borderRadius: "8px",
        border: `1px solid ${config.borderColor}`, // Borda mais fina (opcional, de 2px para 1px)
        bgcolor: config.bgcolor,
        transition: "all 0.2s ease",
        cursor: onClick ? "pointer" : "default",
        minHeight: "100px", // Reduzi a altura mínima de 140px para 100px
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        "&:hover": onClick
          ? {
              transform: "translateY(-2px)",
              boxShadow: `0 4px 12px ${config.borderColor}40`,
            }
          : {},
      }}
    >
      {config.icon}

      <Typography
        sx={{
          fontSize: "0.85rem", // Leve redução na fonte do título
          fontWeight: 600,
          color: config.titleColor,
          mt: 0.5, // Menos margem superior
          mb: 0.2, // Menos margem inferior
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          fontSize: "0.75rem",
          color: config.textColor,
          fontWeight: 500,
        }}
      >
        {conferidos} de {total} conferidas
      </Typography>

      {divergencias > 0 && (
        <Typography
          sx={{
            fontSize: "0.7rem",
            color: config.errorColor,
            mt: 0.2,
            fontWeight: 600,
          }}
        >
          {divergencias} divergências
        </Typography>
      )}
    </Box>
  );
};

export default ObisidianResultCard;
