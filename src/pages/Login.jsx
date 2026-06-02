import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "../styles/login.css";
import { toUpperCase } from "../utils/textUtils";

export default function Login() {
  const [usuarios, setUsuarios] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [cargandoLogin, setCargandoLogin] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    const cargarUsuarios = async () => {
      setCargando(true);
      try {
        const { data } = await api.get("/usuarios");
        setUsuarios(data);
      } catch (error) {
        console.error("Error cargando usuarios", error);
        alert("Error al cargar la lista de usuarios");
      } finally {
        setCargando(false);
      }
    };
    cargarUsuarios();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setCargandoLogin(true);

    try {
      const res = await api.post("/login", {
        username,
        password,
      });

      console.log("RESPUESTA LOGIN:", res.data); 

      const user = {
        id: res.data.user.id,
        username: res.data.user.username,
        nombre: res.data.user.nombre,
        rol: res.data.user.rol,
        primerLogin: res.data.user.primerLogin 
      };

      console.log("USUARIO GUARDADO:", user);
      localStorage.setItem("user", JSON.stringify(user));

      // 👈 Verificar si es primer login
      if (user.primerLogin) {
        // Redirigir a página de cambio de contraseña
        nav("/cambiar-password");
      } else {
        // Redirección normal según el rol
        const rol = user.rol;
        
        // Mapeo de roles a rutas
        const rutas = {
          "JEFE DE PRODUCCIÓN": "/jefe_produccion",
          "ANALISTA DE PRODUCCIÓN": "/analista_produccion",
          "SUPERVISOR": "/supervisor",
          "LÍDER": "/lider"
        };

        // Si el rol existe en el mapa, usar esa ruta, si no, ir a panel-rol
        const ruta = rutas[rol] || "/panel-rol";
        nav(ruta);
      }
      
    } catch (err) {
      alert("Usuario o contraseña incorrectos");
      console.error(err);
    } finally {
      setCargandoLogin(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">⚙</div>
          <h2>PRODUCTION SYSTEM</h2>
          <h2>INICIO DE SESIÓN</h2>
          <p>Selecciona tu usuario y escribe tu contraseña</p>
        </div>

        <form onSubmit={handleLogin}>
          <label>Usuario</label>
          <div className="input-group">
            <select
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={cargando}
            >
              <option value="">
                {cargando ? "Cargando usuarios..." : "Seleccione su nombre..."}
              </option>
              {usuarios.map((u) => (
                <option key={u.username} value={u.username}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </div>

          <label>Contraseña</label>
          <div className="input-group">
            <input
              placeholder="Ingresa tu contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={cargandoLogin}
            />
          </div>

          <button 
            className="btn-login" 
            type="submit"
            disabled={cargandoLogin}
          >
            {cargandoLogin ? "ACCEDIENDO..." : "ACCEDER"}
          </button>
          {/* botón para regresar al menú principal */}
          <button
            className="btn-login btn-secondary"
            type="button"
            onClick={() => nav("/")}
            style={{ marginTop: "10px" }}
          >
            Volver al Menú Principal
          </button>
        </form>
      </div>
    </div>
  );
}