import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
}

const ObisidianModal: React.FC<Props> = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = "sm",
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={maxWidth}
      PaperProps={{ sx: { borderRadius: "8px" } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 1,
          px: 1.5,
          fontWeight: 700,
          color: "#0f172a",
          fontSize: "0.85rem",
        }}
      >
        {title}
        <IconButton onClick={onClose} size="small" sx={{ p: 0.3 }}>
          <Close sx={{ fontSize: 16 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: "#e2e8f0", px: 1.5, py: 1 }}>
        {children}
      </DialogContent>

      {actions && (
        <DialogActions sx={{ py: 0.8, px: 1.5 }}>{actions}</DialogActions>
      )}
    </Dialog>
  );
};

export default ObisidianModal;
