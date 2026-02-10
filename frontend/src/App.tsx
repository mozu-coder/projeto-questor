import { BrowserRouter } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import AppRoutes from "./routes";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <AppRoutes />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
