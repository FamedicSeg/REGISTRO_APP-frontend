import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/home.css";

export default function Home() {
  const nav = useNavigate();
  const [hoveredBtn, setHoveredBtn] = useState(null);

  // Calcular fecha directamente
  const fecha = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Capitalizar primera letra
  const fechaFormateada = fecha.charAt(0).toUpperCase() + fecha.slice(1);

  const handleMouseEnter = (btn) => setHoveredBtn(btn);
  const handleMouseLeave = () => setHoveredBtn(null);

  return (
    <div className="home-container">
      {/* Barra superior */}
      <div className="home-top-bar">
        <div className="home-logo-area">
          
          <span className="home-logo-text">DHISVE - SISTEMA DE GESTIÓN</span>
        </div>
        <div className="home-date-area">
          <span className="home-date-icon">📅</span>
          <span className="home-date-text">{fechaFormateada}</span>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="home-content">
        {/* Header con título y descripción */}
        <div className="home-header">
          <h1 className="home-title">DIGITAL REGISTRY SYSTEM</h1>
          <p className="home-subtitle">
            Sistema Integral para el Control y Seguimiento de Registros de Producción
          </p>
          <div className="home-divider"></div>
        </div>

        {/* Grid de tarjetas */}
        <div className="home-card-grid">
          {/* Tarjeta 1 - Nuevo Registro */}
          <div 
            className={`home-card card-registro ${hoveredBtn === 'registro' ? 'hover' : ''}`}
            onMouseEnter={() => handleMouseEnter('registro')}
            onMouseLeave={handleMouseLeave}
            onClick={() => nav("/registro")}
          >
            <div className="home-card-icon-container">
              <span className="home-card-icon">➕📑</span>
            </div>
            <div className="home-card-content">
              <h3 className="home-card-title">Nuevo Registro</h3>
              <p className="home-card-description">
                Ingresar un nuevo registro de producción con todos los detalles
              </p>
            </div>
            <div className="home-card-arrow">→</div>
          </div>

          {/* Tarjeta 2 - Planificación */}
          <div 
            className={`home-card card-planificacion ${hoveredBtn === 'planificacion' ? 'hover' : ''}`}
            onMouseEnter={() => handleMouseEnter('planificacion')}
            onMouseLeave={handleMouseLeave}
            onClick={() => nav("/planificacion")}
          >
            <div className="home-card-icon-container">
              <span className="home-card-icon">📅</span>
            </div>
            <div className="home-card-content">
              <h3 className="home-card-title">Planificación</h3>
              <p className="home-card-description">
                Visualizar y gestionar la planificación de la producción
              </p>
            </div>
            <div className="home-card-arrow">→</div>
          </div>

          {/* Tarjeta 3 - Iniciar Sesión */}
          <div 
            className={`home-card card-login ${hoveredBtn === 'login' ? 'hover' : ''}`}
            onMouseEnter={() => handleMouseEnter('login')}
            onMouseLeave={handleMouseLeave}
            onClick={() => nav("/login")}
          >
            <div className="home-card-icon-container">
              <span className="home-card-icon">🔐</span>
            </div>
            <div className="home-card-content">
              <h3 className="home-card-title">Iniciar Sesión</h3>
              <p className="home-card-description">
                Accede al sistema con tus credenciales
              </p>
            </div>
            <div className="home-card-arrow">→</div>
          </div>
        </div>
      </div>
    </div>
  );
}