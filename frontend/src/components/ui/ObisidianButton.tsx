import React from "react";
import { Button, type ButtonProps, CircularProgress } from "@mui/material";

interface ObisidianButtonProps extends ButtonProps {
  variantType?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  loading?: boolean;
}

const ObisidianButton: React.FC<ObisidianButtonProps> = ({
  children,
  variantType = "primary",
  loading = false,
  sx,
  ...props
}) => {
  const styles: any = {
    primary: {
      bgcolor: "#6366f1",
      color: "#fff",
      "&:hover": { bgcolor: "#4f46e5" },
    },
    secondary: {
      bgcolor: "#e2e8f0",
      color: "#1e293b",
      "&:hover": { bgcolor: "#cbd5e1" },
    },
    danger: {
      bgcolor: "#ef4444",
      color: "#fff",
      "&:hover": { bgcolor: "#dc2626" },
    },
    ghost: {
      bgcolor: "transparent",
      color: "#64748b",
      "&:hover": { bgcolor: "rgba(0,0,0,0.05)", color: "#1e293b" },
    },
    outline: {
      bgcolor: "transparent",
      color: "#6366f1",
      border: "1px solid #6366f1",
      "&:hover": { bgcolor: "rgba(99, 102, 241, 0.04)" },
    },
  };

  const getSpinnerColor = () => {
    if (variantType === "primary" || variantType === "danger") {
      return "#fff";
    }
    if (variantType === "ghost" || variantType === "secondary") {
      return "#64748b";
    }
    return "#6366f1";
  };

  return (
    <Button
      disableElevation
      disabled={loading || props.disabled}
      {...props}
      sx={{
        textTransform: "none",
        fontWeight: 600,
        fontSize: "0.75rem",
        borderRadius: "6px",
        height: 32,
        px: props.size === "small" ? 1.2 : 1.8,
        minHeight: 0,
        lineHeight: 1.4,
        ...styles[variantType],
        ...(loading && {
          opacity: 0.8,
          animation: "pulse 1.5s ease-in-out infinite",
          "@keyframes pulse": {
            "0%, 100%": { opacity: 0.8 },
            "50%": { opacity: 0.95 },
          },
        }),
        ...sx,
      }}
    >
      {loading ? (
        <CircularProgress size={16} sx={{ color: getSpinnerColor() }} />
      ) : (
        children
      )}
    </Button>
  );
};

export default ObisidianButton;
