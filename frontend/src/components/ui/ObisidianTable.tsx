import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: "right" | "left" | "center";
  format?: (value: any) => string;
}

interface Props {
  columns: Column[];
  rows: any[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onRowClick?: (row: any) => void;
}

const ObisidianTable: React.FC<Props> = ({
  columns,
  rows,
  onEdit,
  onDelete,
  onRowClick,
}) => {
  return (
    <TableContainer
      sx={{
        flex: 1,
        minHeight: 0,
        overflow: "auto",
        maxHeight: "100%",
      }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.id}
                align={col.align}
                style={{ minWidth: col.minWidth }}
                sx={{
                  fontWeight: 600,
                  color: "#64748b",
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                  py: 0.8,
                  px: 1,
                  bgcolor: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                {col.label}
              </TableCell>
            ))}
            {(onEdit || onDelete) && (
              <TableCell
                align="center"
                sx={{
                  fontWeight: 600,
                  color: "#64748b",
                  fontSize: "0.65rem",
                  py: 0.8,
                  px: 1,
                  bgcolor: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                AÇÕES
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow
              hover
              key={idx}
              onClick={() => onRowClick && onRowClick(row)}
              sx={{
                "&:last-child td, &:last-child th": { border: 0 },
                cursor: onRowClick ? "pointer" : "default",
                "&:hover": { bgcolor: onRowClick ? "#f1f5f9" : undefined },
              }}
            >
              {columns.map((col) => {
                const value = row[col.id];
                return (
                  <TableCell
                    key={col.id}
                    align={col.align}
                    sx={{
                      color: "#334155",
                      fontSize: "0.75rem",
                      py: 0.6,
                      px: 1,
                    }}
                  >
                    {col.format ? col.format(value) : value}
                  </TableCell>
                );
              })}

              {(onEdit || onDelete) && (
                <TableCell align="center" sx={{ py: 0.3, px: 1 }}>
                  {onEdit && (
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(row);
                        }}
                        sx={{ color: "#6366f1", p: 0.3 }}
                      >
                        <Edit sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                  {onDelete && (
                    <Tooltip title="Excluir">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(row);
                        }}
                        sx={{ color: "#ef4444", p: 0.3 }}
                      >
                        <Delete sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ObisidianTable;
