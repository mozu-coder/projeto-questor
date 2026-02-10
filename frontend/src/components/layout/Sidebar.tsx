import { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Tooltip,
  Box,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import {
  Dashboard,
  Settings,
  Calculate,
  CheckCircle,
  Tune,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

const SIDEBAR_W = 48;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openFiscalMenu = Boolean(anchorEl);

  const handleFiscalClick = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleFiscalClose = () => setAnchorEl(null);
  const handleNavigate = (path: string) => {
    navigate(path);
    handleFiscalClose();
  };

  const isFiscalActive =
    location.pathname.includes("/conferencia-fiscal") ||
    location.pathname.includes("/planos-contabilizacao");

  const btnSx = (active: boolean) => ({
    minHeight: 34,
    justifyContent: "center",
    borderRadius: "8px",
    backgroundColor: active ? "rgba(99, 102, 241, 0.15)" : "transparent",
    color: active ? "#818cf8" : "#94a3b8",
    px: 0,
    "&:hover": { backgroundColor: "rgba(255,255,255,0.08)", color: "#fff" },
  });

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: SIDEBAR_W,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: SIDEBAR_W,
          boxSizing: "border-box",
          backgroundColor: "#0f172a",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRight: "none",
          overflowX: "hidden",
        },
      }}
    >
      <Box sx={{ py: 1.2 }}>
        <Box
          sx={{
            width: 30,
            height: 30,
            background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "15px",
            color: "#fff",
            boxShadow: "0 3px 10px rgba(99, 102, 241, 0.4)",
            cursor: "pointer",
            transition: "transform 0.2s",
            "&:hover": { transform: "scale(1.05)" },
          }}
          onClick={() => navigate("/")}
        >
          Q
        </Box>
      </Box>

      <List sx={{ width: "100%", px: 0.7, pt: 0.5 }}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <Tooltip title="Dashboard" placement="right" arrow>
            <ListItemButton
              onClick={() => navigate("/")}
              sx={btnSx(location.pathname === "/")}
            >
              <ListItemIcon sx={{ minWidth: 0, color: "inherit" }}>
                <Dashboard sx={{ fontSize: 18 }} />
              </ListItemIcon>
            </ListItemButton>
          </Tooltip>
        </ListItem>

        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <Tooltip title="Fiscal" placement="right" arrow>
            <ListItemButton
              onClick={handleFiscalClick}
              sx={btnSx(isFiscalActive || openFiscalMenu)}
            >
              <ListItemIcon sx={{ minWidth: 0, color: "inherit" }}>
                <Calculate sx={{ fontSize: 18 }} />
              </ListItemIcon>
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <List sx={{ width: "100%", px: 0.7, pb: 1.5 }}>
        <Tooltip title="Configurações" placement="right" arrow>
          <ListItemButton
            sx={{
              justifyContent: "center",
              borderRadius: "8px",
              minHeight: 34,
              px: 0,
              color: "#64748b",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "#fff",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, color: "inherit" }}>
              <Settings sx={{ fontSize: 18 }} />
            </ListItemIcon>
          </ListItemButton>
        </Tooltip>
      </List>

      <Menu
        anchorEl={anchorEl}
        open={openFiscalMenu}
        onClose={handleFiscalClose}
        onClick={handleFiscalClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 0.5,
              ml: 0.8,
              bgcolor: "#1e293b",
              color: "#fff",
              borderRadius: "8px",
              minWidth: 160,
              py: 0.5,
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 16,
                left: -4,
                width: 8,
                height: 8,
                bgcolor: "#1e293b",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "top" }}
      >
        <Box
          sx={{
            px: 1.2,
            py: 0.6,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Typography
            sx={{
              color: "#94a3b8",
              fontWeight: 700,
              textTransform: "uppercase",
              fontSize: "0.6rem",
              letterSpacing: 0.5,
            }}
          >
            Módulo Fiscal
          </Typography>
        </Box>

        <MenuItem
          onClick={() => handleNavigate("/conferencia-fiscal")}
          sx={{ py: 0.7, px: 1.2, mt: 0.3, minHeight: 0 }}
        >
          <ListItemIcon sx={{ color: "#a5b4fc", minWidth: 24 }}>
            <CheckCircle sx={{ fontSize: 15 }} />
          </ListItemIcon>
          <Typography fontSize="0.75rem" fontWeight={500}>
            Conferência Fiscal
          </Typography>
        </MenuItem>

        <MenuItem
          onClick={() => handleNavigate("/planos-contabilizacao")}
          sx={{ py: 0.7, px: 1.2, mb: 0.3, minHeight: 0 }}
        >
          <ListItemIcon sx={{ color: "#a5b4fc", minWidth: 24 }}>
            <Tune sx={{ fontSize: 15 }} />
          </ListItemIcon>
          <Typography fontSize="0.75rem" fontWeight={500}>
            Planos de Contabilização
          </Typography>
        </MenuItem>
      </Menu>
    </Drawer>
  );
};

export default Sidebar;
