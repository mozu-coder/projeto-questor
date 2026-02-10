import React from "react";
import { Paper, Box, Typography } from "@mui/material";

interface Props {
  children?: React.ReactNode;
  variant?: "default" | "stats";
  title?: string;
  value?: string | number;
  icon?: React.ReactNode;
  iconColor?: string;
  noPadding?: boolean;
  className?: string;
  sx?: any;
}

const ObisidianCard: React.FC<Props> = ({
  children,
  variant = "default",
  title,
  value,
  icon,
  iconColor = "#6366f1",
  noPadding,
  className,
  sx,
}) => {
  if (variant === "stats") {
    return (
      <Paper
        elevation={0}
        className={className}
        sx={{
          p: 1.5,
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          bgcolor: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 1.2,
          ...sx,
        }}
      >
        <Box
          sx={{
            p: 0.8,
            borderRadius: "6px",
            bgcolor: `${iconColor}15`,
            color: iconColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography
            sx={{
              fontWeight: 600,
              color: "#64748b",
              textTransform: "uppercase",
              fontSize: "0.58rem",
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              fontWeight: 700,
              color: "#0f172a",
              fontSize: "1rem",
              lineHeight: 1.2,
            }}
          >
            {value}
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      className={className}
      sx={{
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        bgcolor: "#fff",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        ...sx,
      }}
    >
      <Box
        sx={{
          p: noPadding ? 0 : 1.5,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        {children}
      </Box>
    </Paper>
  );
};

export default ObisidianCard;
