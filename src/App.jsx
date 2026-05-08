import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/principal";
import RegistroInsumos from "./pages/registro";
import Planificacion from "./pages/planificacion";
import AdminRegistros from "./pages/AdminRegistros";
import Login from "./pages/Login";
import Lider from "./pages/roles/Lider";
import Supervisor from "./pages/roles/Supervisor";
import Analista from "./pages/roles/Analista";
import AdminDetalleRegistro from "./pages/AdminDetalleRegistro";
import PanelRol from "./pages/PanelRol";
import AdminUsuarios from "./pages/AdminUsuarios";
import CambiarPassword from "./pages/CambiarPassword";
import Footer from "./components/Footer";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <div style={{ flex: 1 }}>
          <Routes>
        {/* ===== RUTAS PÚBLICAS ===== */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        {/* ===== RUTAS DE TRABAJO ===== */}
        <Route path="/registro" element={<RegistroInsumos />} />
        <Route path="/planificacion" element={<Planificacion />} />
        
        {/* ===== RUTAS DE ADMINISTRACIÓN ===== */}
        <Route path="/admin" element={<AdminRegistros />} />
        <Route path="/admin/registros/:id" element={<AdminDetalleRegistro />} />
        <Route path="/adminUsuarios" element={<AdminUsuarios />} />
        <Route path="/cambiar-password" element={<CambiarPassword />} />
        
        {/* ===== RUTAS POR ROL (TODAS USAN PANELROL) ===== */}
        <Route path="/panel-rol" element={<PanelRol />} />
        <Route path="/lider" element={<PanelRol />} />
        <Route path="/supervisor" element={<PanelRol />} />
        <Route path="/analista_produccion" element={<PanelRol />} />
        <Route path="/jefe_produccion" element={<PanelRol />} />
      </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}