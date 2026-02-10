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
      icon: <CheckCircle sx={{ fontSize: 32, color: "#10b981" }} />,
      borderColor: "#10b981",
      bgcolor: "#f0fdf4",
      titleColor: "#065f46",
      textColor: "#059669",
      errorColor: "#10b981",
    },
    error: {
      icon: <Error sx={{ fontSize: 32, color: "#ef4444" }} />,
      borderColor: "#ef4444",
      bgcolor: "#fef2f2",
      titleColor: "#991b1b",
      textColor: "#dc2626",
      errorColor: "#dc2626",
    },
    warning: {
      icon: <Warning sx={{ fontSize: 32, color: "#f59e0b" }} />,
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
        p: 2,
        borderRadius: "8px",
        border: `2px solid ${config.borderColor}`,
        bgcolor: config.bgcolor,
        transition: "all 0.2s ease",
        cursor: onClick ? "pointer" : "default",
        minHeight: "140px",
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
          fontSize: "0.95rem",
          fontWeight: 600,
          color: config.titleColor,
          mt: 1,
          mb: 0.5,
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
            mt: 0.5,
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
