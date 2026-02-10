import { Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import ConferenciaFiscal from "../pages/ConferenciaFiscal";
import PlanosContabilizacao from "../pages/PlanosContabilizacao";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/conferencia-fiscal" element={<ConferenciaFiscal />} />
      <Route path="/planos-contabilizacao" element={<PlanosContabilizacao />} />
    </Routes>
  );
};

export default AppRoutes;
