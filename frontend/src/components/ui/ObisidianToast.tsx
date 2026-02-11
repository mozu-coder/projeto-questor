import { Box, IconButton } from "@mui/material";
import { CheckCircle, Error, Warning, Info, Close } from "@mui/icons-material";
import { useEffect, useRef } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ObisidianToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const ObisidianToast = ({
  message,
  type,
  onClose,
  duration = 3000,
}: ObisidianToastProps) => {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (duration > 0) {
      timerRef.current = window.setTimeout(() => {
        onClose();
      }, duration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const config = {
    success: {
      icon: <CheckCircle sx={{ fontSize: 20 }} />,
      bg: "#10b981",
      border: "#059669",
    },
    error: {
      icon: <Error sx={{ fontSize: 20 }} />,
      bg: "#ef4444",
      border: "#dc2626",
    },
    warning: {
      icon: <Warning sx={{ fontSize: 20 }} />,
      bg: "#f59e0b",
      border: "#d97706",
    },
    info: {
      icon: <Info sx={{ fontSize: 20 }} />,
      bg: "#3b82f6",
      border: "#2563eb",
    },
  };

  const { icon, bg, border } = config[type];

  return (
    <Box
      className="obsidian-toast"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        minWidth: 320,
        maxWidth: 480,
        padding: "12px 16px",
        backgroundColor: bg,
        color: "#fff",
        borderRadius: "8px",
        border: `1px solid ${border}`,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        animation: "slideInRight 0.3s ease-out",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", color: "#fff" }}>
        {icon}
      </Box>
      <Box sx={{ flex: 1, fontSize: "0.8rem", fontWeight: 500 }}>{message}</Box>
      <IconButton
        size="small"
        onClick={onClose}
        sx={{
          color: "#fff",
          opacity: 0.8,
          "&:hover": { opacity: 1, backgroundColor: "rgba(255,255,255,0.1)" },
          p: 0.5,
        }}
      >
        <Close sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );
};

export default ObisidianToast;
