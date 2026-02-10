import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";
import { Box, Typography } from "@mui/material";

interface Props {
  data: { name: string; valor: number }[];
  title?: string;
}

const ObisidianBarChart: React.FC<Props> = ({ data, title }) => {
  return (
    <Box sx={{ width: "100%", height: 150 }}>
      {title && (
        <Typography
          sx={{
            mb: 0.3,
            fontWeight: 700,
            color: "#1e293b",
            fontSize: "0.78rem",
          }}
        >
          {title}
        </Typography>
      )}
      <Box sx={{ width: "100%", height: "calc(100% - 18px)" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 4, right: 4, left: -32, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 10, fontWeight: 500 }}
              dy={4}
              padding={{ left: 15, right: 15 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 10 }}
              tickCount={4}
            />
            <Tooltip
              cursor={{ fill: "rgba(99, 102, 241, 0.05)" }}
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "5px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                fontSize: "10px",
                fontWeight: 600,
                color: "#1e293b",
                padding: "3px 6px",
              }}
            />
            <Bar dataKey="valor" barSize={28} radius={[4, 4, 0, 0]}>
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === data.length - 1 ? "#6366f1" : "#cbd5e1"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default ObisidianBarChart;
