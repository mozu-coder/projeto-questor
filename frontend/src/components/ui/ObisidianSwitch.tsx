import React from "react";
import { Switch, FormControlLabel, type SwitchProps } from "@mui/material";

interface ObisidianSwitchProps extends SwitchProps {
  label: string;
}

const ObisidianSwitch: React.FC<ObisidianSwitchProps> = ({
  label,
  sx,
  ...props
}) => {
  return (
    <FormControlLabel
      control={
        <Switch
          {...props}
          disableRipple
          sx={{
            width: 36, // Reduzi de 42 para 36
            height: 20, // Reduzi de 26 para 20
            padding: 0,
            "& .MuiSwitch-switchBase": {
              padding: 0,
              margin: 0.25, // ~2px de margem
              transitionDuration: "300ms",
              "&.Mui-checked": {
                transform: "translateX(16px)", // Ajuste do deslocamento para o novo tamanho
                color: "#fff",
                "& + .MuiSwitch-track": {
                  backgroundColor: "#6366f1",
                  opacity: 1,
                  border: 0,
                },
                "&.Mui-disabled + .MuiSwitch-track": {
                  opacity: 0.5,
                },
              },
              "&.Mui-focusVisible .MuiSwitch-thumb": {
                color: "#6366f1",
                border: "6px solid #fff",
              },
              "&.Mui-disabled .MuiSwitch-thumb": {
                color: "#e2e8f0",
              },
              "&.Mui-disabled + .MuiSwitch-track": {
                opacity: 0.7,
              },
            },
            "& .MuiSwitch-thumb": {
              boxSizing: "border-box",
              width: 16, // Reduzi de 22 para 16
              height: 16, // Reduzi de 22 para 16
            },
            "& .MuiSwitch-track": {
              borderRadius: 20 / 2,
              backgroundColor: "#e2e8f0",
              opacity: 1,
              transition: "background-color 500ms",
            },
          }}
        />
      }
      label={label}
      sx={{
        marginLeft: 0,
        marginRight: 0,
        gap: 1.5,
        color: "#475569",
        userSelect: "none",
        ...sx,
      }}
      componentsProps={{
        typography: {
          fontSize: "0.85rem",
          fontWeight: 500,
          fontFamily: "inherit",
        },
      }}
    />
  );
};

export default ObisidianSwitch;
