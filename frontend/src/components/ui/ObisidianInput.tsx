import React, { useState } from "react";
import {
  TextField,
  type TextFieldProps,
  InputAdornment,
  IconButton,
  InputLabel,
  Box,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

type Props = TextFieldProps & {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  isPassword?: boolean;
  noMargin?: boolean; // Nova prop para remover margin
};

const ObisidianInput: React.FC<Props> = ({
  startIcon,
  endIcon,
  isPassword,
  label,
  noMargin = false,
  sx,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  return (
    <Box sx={{ mb: noMargin ? 0 : 1, width: "100%" }}>
      {label && (
        <InputLabel
          sx={{
            fontSize: "0.72rem",
            fontWeight: 600,
            color: "#475569",
            mb: 0.2,
            ml: 0.3,
          }}
        >
          {label}
        </InputLabel>
      )}
      <TextField
        fullWidth
        size="small"
        type={isPassword ? (showPassword ? "text" : "password") : props.type}
        {...props}
        label=""
        InputProps={{
          ...props.InputProps,
          sx: { fontSize: "0.8rem", height: 32 },
          startAdornment: startIcon ? (
            <InputAdornment position="start" sx={{ color: "#94a3b8" }}>
              {startIcon}
            </InputAdornment>
          ) : null,
          endAdornment: isPassword ? (
            <InputAdornment position="end">
              <IconButton
                onClick={handleClickShowPassword}
                edge="end"
                size="small"
                sx={{ p: 0.3 }}
              >
                {showPassword ? (
                  <VisibilityOff sx={{ fontSize: 16 }} />
                ) : (
                  <Visibility sx={{ fontSize: 16 }} />
                )}
              </IconButton>
            </InputAdornment>
          ) : endIcon ? (
            <InputAdornment position="end" sx={{ color: "#94a3b8" }}>
              {endIcon}
            </InputAdornment>
          ) : null,
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            bgcolor: "#fff",
            borderRadius: "6px",
            "& fieldset": { borderColor: "#e2e8f0" },
            "&:hover fieldset": { borderColor: "#cbd5e1" },
            "&.Mui-focused fieldset": {
              borderColor: "#6366f1",
              borderWidth: "2px",
            },
          },
          ...sx,
        }}
      />
    </Box>
  );
};

export default ObisidianInput;
