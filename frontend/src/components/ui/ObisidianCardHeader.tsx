import React from "react";
import { Box, Divider } from "@mui/material";

interface Props {
  children: React.ReactNode;
  divider?: boolean;
}

const ObisidianCardHeader: React.FC<Props> = ({ children, divider = true }) => {
  return (
    <>
      <Box
        sx={{
          minHeight: "56px",
          display: "flex",
          alignItems: "flex-end",
          gap: 1,
          flexShrink: 0,
          px: 1.5,
          pt: 1.5,
          pb: 1,
        }}
      >
        {children}
      </Box>
      {divider && (
        <Divider
          sx={{ borderColor: "#f1f5f9", mx: 1.5, mb: 0.8, flexShrink: 0 }}
        />
      )}
    </>
  );
};

export default ObisidianCardHeader;
