import React from "react";
import { Box, Typography, Checkbox } from "@mui/material";

interface ObisidianCheckboxProps {
  label: string;
  sublabel?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const ObisidianCheckbox: React.FC<ObisidianCheckboxProps> = ({
  label,
  sublabel,
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <Box
      onClick={() => !disabled && onChange(!checked)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1.2,
        py: 0.8,
        borderRadius: "6px",
        border: `1px solid ${checked ? "rgba(99, 102, 241, 0.3)" : "#e2e8f0"}`,
        bgcolor: checked ? "rgba(99, 102, 241, 0.05)" : "#fff",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.15s",
        "&:hover": !disabled
          ? {
              bgcolor: checked ? "rgba(99, 102, 241, 0.08)" : "#f8fafc",
              borderColor: checked ? "rgba(99, 102, 241, 0.4)" : "#cbd5e1",
            }
          : {},
      }}
    >
      <Checkbox
        checked={checked}
        disabled={disabled}
        size="small"
        sx={{
          p: 0,
          color: "#cbd5e1",
          "&.Mui-checked": { color: "#6366f1" },
          pointerEvents: "none",
        }}
      />
      <Box>
        <Typography
          sx={{
            fontSize: "0.78rem",
            fontWeight: 600,
            color: checked ? "#6366f1" : "#334155",
            lineHeight: 1.3,
          }}
        >
          {label}
        </Typography>
        {sublabel && (
          <Typography sx={{ fontSize: "0.65rem", color: "#94a3b8" }}>
            {sublabel}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ObisidianCheckbox;
