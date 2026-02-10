import React from "react";
import { Box, Typography } from "@mui/material";
import ObisidianCard from "./ObisidianCard";

interface Props {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendColor?: "success" | "error" | "warning";
}

const ObisidianStatCard: React.FC<Props> = ({
  title,
  value,
  icon,
  trend,
  trendColor = "success",
}) => {
  return (
    <ObisidianCard
      sx={{
        p: 1.2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 0.3,
        }}
      >
        <Typography
          sx={{
            color: "#64748b",
            fontWeight: 600,
            letterSpacing: 0.3,
            textTransform: "uppercase",
            fontSize: "0.58rem",
          }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            p: 0.4,
            borderRadius: "4px",
            bgcolor: "rgba(99, 102, 241, 0.1)",
            color: "#6366f1",
            display: "flex",
            "& svg": { fontSize: 14 },
          }}
        >
          {icon}
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.6 }}>
        <Typography
          sx={{
            fontWeight: 700,
            color: "#0f172a",
            fontSize: "1.1rem",
            lineHeight: 1.2,
          }}
        >
          {value}
        </Typography>

        {trend && (
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "0.58rem",
              color: trendColor === "success" ? "#16a34a" : "#dc2626",
              bgcolor: trendColor === "success" ? "#dcfce7" : "#fee2e2",
              px: 0.4,
              py: 0.1,
              borderRadius: "3px",
              lineHeight: 1.3,
            }}
          >
            {trend}
          </Typography>
        )}
      </Box>
    </ObisidianCard>
  );
};

export default ObisidianStatCard;
