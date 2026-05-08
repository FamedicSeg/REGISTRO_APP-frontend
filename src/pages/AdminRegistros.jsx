import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function AdminRegistros() {
    
    const [registros, setRegistros] = useState([]);
    const [tab, setTab] = useState ("pendientes");
    const nav = useNavigate();
    
    const cargarRegistros = async () => {
        let url ="";
        if(tab === "pendientes"){
            url = "/registros/pendientes";
        } else{
            url = "/registros/admin/aprobados";
        }
        const res = await api.get(url);
        setRegistros(res.data);
    };

    useEffect(() => {
        const fetchData = async () => {
            
            let url = "";
            
            if (tab === "pendientes") {
                url = "/registros/admin/pendientes";
            } else {
                url = "/registros/admin/aprobados";
            }
            
            try {
                const res = await api.get(url);
                setRegistros(res.data);
            } catch (err) {
                console.error("Error cargando registros:", err);
            }
        };
        
        fetchData();
    
    }, [tab]);

    const _aprobar = async (id) => {
        await api.put(`/registros/${id}/aprobar`);
        cargarRegistros();
    };

    const _eliminar = async (id) => {
        if (!window.confirm("¿Eliminar este registro?")) return;
        await api.delete(`/registros/${id}`);
        cargarRegistros();
    };

    const verDetalle = (id) =>{
        nav(`/admin/registros/${id}`);
    };

    return (
        <div style={{ padding: 30 }}>
            <h2>Panel Administrador</h2>
            
            {/* Pestañas */}
            <div style={{ marginBottom: 20 }}>
                <button onClick={() => setTab("pendientes")}
                style={{
                    marginRight: 10,
                    background: tab === "pendientes" ? "#007bff" : "#ccc",
                    color: "white",
                    padding: "8px 15px",
                    border: "none",
                    borderRadius: 6
                }}
                >
                    Pendientes
                </button>
                <button onClick={() => setTab("aprobados")}
                style={{
                    background: tab === "aprobados" ? "#28a745" : "#ccc",
                    color: "white",
                    padding: "8px 15px",
                    border: "none",
                    borderRadius: 6
                }}
                >
                    Aprobados
                </button>
                </div>
                
                {/* Tabla */}
                <table border="1" cellPadding="10">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>OP</th>
                            <th>Turno</th>
                            <th>Módulo</th>
                            <th>Responsable</th>
                            <th>Supervisor</th>
                            <th>Personal Asignado</th>
                            <th>Personal Otro</th>
                            <th>Personal Presente</th>
                            <th>Referencia</th>
                            <th>Producto</th>
                            <th>Descripción</th>
                            <th>Cantidad Planificada</th>
                            <th>Lote</th>
                            <th>Reposición No Conforme</th>
                            <th>Cantidad Elaborado</th>
                            <th>Cantidad Proceso</th>
                            <th>Cantidad Merma</th>
                            <th>Hora INICIO</th>
                            <th>Hora FIN</th>
                            <th>Destino</th>
                            <th>N. CLIENTE</th>
                            <th>Estéril</th>
                            <th>Leyenda</th>
                            <th>Leyenda OTRA</th>
                            <th>Talla</th>
                            <th>Maquinaria</th>
                            <th>Detalles de la Actividad</th>
                            <th>Cantidad Planificada</th>
                            <th>Cantidad Elaborada</th>
                            <th>Insumos</th>
                            <th>Etiquetas</th>
                            <th>Integrantes</th>
                            <th>Observaciones Generales</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registros.map((r) => (
                            <tr key={r.id}>
                                <td>{r.fecha}</td>
                                <td>{r.codigo_producto}</td>
                                <td>{r.descripcion}</td>
                                <td>{r.estado}</td>
                                <td>
                                    <button onClick={() => verDetalle(r.id)}>
                                        Ver detalle
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }