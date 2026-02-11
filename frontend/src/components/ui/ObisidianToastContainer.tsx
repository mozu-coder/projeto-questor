// components/ui/ObisidianToastContainer.tsx
import { Box } from "@mui/material";
import ObisidianToast, { type ToastType } from "./ObisidianToast";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ObisidianToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ObisidianToastContainer = ({
  toasts,
  onRemove,
}: ObisidianToastContainerProps) => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      {toasts.map((toast) => (
        <ObisidianToast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </Box>
  );
};

export default ObisidianToastContainer;
