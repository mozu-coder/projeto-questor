import React from "react";
import { Box, Typography, Divider } from "@mui/material";

interface Props {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  searchBar?: React.ReactNode;
}

const ObisidianPageHeader: React.FC<Props> = ({
  title,
  subtitle,
  actions,
  searchBar,
}) => {
  return (
    <Box
      sx={{
        mb: 1.5,
        p: 1.5,
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        bgcolor: "#fff",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: "44px",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontWeight: 600,
              color: "#1e293b",
              letterSpacing: "-0.3px",
              fontSize: "1rem",
              lineHeight: 1.3,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              sx={{
                color: "#64748b",
                mt: 0.15,
                fontSize: "0.72rem",
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {actions && (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {actions}
          </Box>
        )}
      </Box>

      {searchBar && (
        <>
          <Divider sx={{ borderColor: "#f1f5f9", my: 1.2 }} />
          <Box>{searchBar}</Box>
        </>
      )}
    </Box>
  );
};

export default ObisidianPageHeader;
