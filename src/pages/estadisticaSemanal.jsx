import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { 
    getResumenSemanal, 
    guardarResumenSemanal 
} from '../services/api';
import '../styles/estadisticaSemanal.css'; // Crearemos este CSS

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const EstadisticaSemanal = () => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedWeek, setSelectedWeek] = useState(() => {
        const now = new Date();
        const jan4 = new Date(now.getFullYear(), 0, 4);
        const jan4Day = jan4.getDay() || 7;
        const monday = new Date(jan4);
        monday.setDate(jan4.getDate() - (jan4Day - 1));
        const diff = Math.floor((now - monday) / (7 * 24 * 60 * 60 * 1000));
        const weekNum = diff + 1;
        return `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
    });
    const [resumenData, setResumenData] = useState(null);
    const [saving, setSaving] = useState(false);
    const [weekRange, setWeekRange] = useState({ inicio: '', fin: '' });

    // Función para obtener las fechas de inicio y fin de semana
    const getWeekRange = (weekString) => {
        const [year, week] = weekString.split('-W');
        const ano = parseInt(year);
        const semana = parseInt(week);
        
        // Calcular fecha de inicio (lunes)
        const fechaInicio = new Date(ano, 0, 1);
        const diaSemana = fechaInicio.getDay();
        const diasOffset = (semana - 1) * 7;
        fechaInicio.setDate(fechaInicio.getDate() + diasOffset - diaSemana + 1);
        
        const fechaFin = new Date(fechaInicio);
        fechaFin.setDate(fechaInicio.getDate() + 6);
        
        return {
            inicio: fechaInicio.toISOString().split('T')[0],
            fin: fechaFin.toISOString().split('T')[0]
        };
    };

    // Actualizar rango de fechas cuando cambia la semana
    useEffect(() => {
        const range = getWeekRange(selectedWeek);
        setWeekRange(range);
    }, [selectedWeek]);

    // Función para cargar datos
    const cargarDatos = async () => {
        setLoading(true);
        setError('');
        try {
            const [year, week] = selectedWeek.split('-W');
            const response = await getResumenSemanal(parseInt(year), parseInt(week));
            if (response.success && response.data.length > 0) {
                setResumenData(response.data);
                prepararGrafico(response.data);
            } else {
                setError(`No hay datos para la semana ${week}/${year}`);
                setResumenData(null);
                setChartData(null);
            }
        } catch (err) {
            console.error('Error cargando datos:', err);
            setError('Estamos trabajando para mejorar el servicio. Regrese a su Panel Principal. Analista de Transformación Digital - KSZS 😊');
        } finally {
            setLoading(false);
        }
    };

    // Función para preparar el gráfico
    const prepararGrafico = (data) => {
        const productos = data.map(item => item.codigo_producto);
        const planificados = data.map(item => item.planificado);
        const elaborados = data.map(item => item.elaborado);

        setChartData({
            labels: productos,
            datasets: [
                {
                    label: 'CANT. PLANIFICADA SEMANAL',
                    data: planificados,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    borderRadius: 4,
                },
                {
                    label: 'CANT. ELABORADO REAL',
                    data: elaborados,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    borderRadius: 4,
                }
            ]
        });
    };

    // Función para guardar resumen en histórico
    const guardarResumen = async () => {
        setSaving(true);
        try {
            const [year, week] = selectedWeek.split('-W');
            const response = await guardarResumenSemanal(parseInt(year), parseInt(week));
            if (response.success) {
                alert(`✅ ${response.message}`);
                await cargarDatos();
            } else {
                alert('Error al guardar resumen');
            }
        } catch (err) {
            console.error('Error guardando:', err);
            alert('Error al guardar el resumen semanal');
        } finally {
            setSaving(false);
        }
    };

    // Cargar datos cuando cambia la semana
    useEffect(() => {
        cargarDatos();
    }, [selectedWeek]);

    // Opciones del gráfico
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: { size: 12, weight: 'bold' },
                    padding: 15,
                    usePointStyle: true,
                    boxWidth: 10,
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        let value = context.raw;
                        let porcentaje = '';
                        
                        if (context.dataset.label === 'CANT. ELABORADO REAL') {
                            const planificado = context.chart.data.datasets[0].data[context.dataIndex];
                            if (planificado > 0) {
                                const cumplimiento = (value / planificado) * 100;
                                porcentaje = ` (${cumplimiento.toFixed(1)}% de cumplimiento)`;
                            }
                        }
                        return `${label}: ${value.toLocaleString()} unidades${porcentaje}`;
                    }
                },
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleFont: { size: 13, weight: 'bold' },
                bodyFont: { size: 12 },
                padding: 10,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.05)' },
                title: {
                    display: true,
                    text: 'Cantidad (unidades)',
                    font: { weight: 'bold', size: 12 },
                    color: '#555'
                },
                ticks: {
                    callback: function(value) {
                        return value.toLocaleString();
                    }
                }
            },
            x: {
                grid: { display: false },
                title: {
                    display: true,
                    text: 'Código de Producto',
                    font: { weight: 'bold', size: 12 },
                    color: '#555'
                },
                ticks: {
                    rotation: -45,
                    autoSkip: true,
                    maxRotation: 45,
                    minRotation: 45
                }
            }
        }
    };

    return (
        <div className="estadistica-container">
            <header className="estadistica-header">
                <div>
                    <h1>📊 Dashboard de Productividad Semanal</h1>
                    <p className="estadistica-subtitle">Comparación de producción planificada vs elaborada por producto</p>
                </div>
            </header>

            {/* Panel de control con selector de semana estilo calendario */}
            <div className="estadistica-controls">
                <div className="week-selector-wrap">
                    <label className="week-selector-label" htmlFor="week-input">
                        📅 Seleccionar Semana
                    </label>
                    <input
                        id="week-input"
                        type="week"
                        className="week-input"
                        value={selectedWeek}
                        onChange={(e) => setSelectedWeek(e.target.value)}
                    />
                    {weekRange.inicio && (
                        <span className="week-range-label">
                            {new Date(weekRange.inicio + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                            {' — '}
                            {new Date(weekRange.fin + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                    )}
                </div>

                <div className="estadistica-actions">
                    <button
                        onClick={guardarResumen}
                        disabled={saving || loading}
                        className="btn-guardar"
                    >
                        {saving ? '💾 Guardando...' : '💾 Guardar Resumen Semanal'}
                    </button>
                    <button
                        onClick={cargarDatos}
                        disabled={loading}
                        className="btn-actualizar"
                    >
                        {loading ? '🔄 Cargando...' : '🔄 Actualizar'}
                    </button>
                </div>
            </div>

            {/* Mostrar error */}
            {error && (
                <div className="estadistica-error">
                    ⚠️ {error}
                </div>
            )}

            {/* Mostrar loading */}
            {loading && (
                <div className="estadistica-loading">
                    <div className="spinner"></div>
                    <p>Cargando datos...</p>
                </div>
            )}

            {/* Mostrar gráfico */}
            {!loading && chartData && (
                <div className="estadistica-chart-container">
                    <div className="chart-header">
                        <h3>📈 Comparación Semanal</h3>
                        <span className="chart-badge">
                            Semana {selectedWeek.split('-W')[1]} - {selectedWeek.split('-W')[0]}
                        </span>
                    </div>
                    <div className="chart-wrapper">
                        <Bar data={chartData} options={options} />
                    </div>
                </div>
            )}

            {/* Mostrar tabla resumen */}
            {!loading && resumenData && resumenData.length > 0 && (
                <div className="estadistica-table-container">
                    <div className="table-header">
                        <h3>📋 Detalle por Producto</h3>
                        <span className="table-count">{resumenData.length} productos</span>
                    </div>
                    <div className="table-wrapper">
                        <table className="estadistica-table">
                            <thead>
                                <tr>
                                    <th>Código Producto</th>
                                    <th>Planificado</th>
                                    <th>Elaborado</th>
                                    <th>Diferencia</th>
                                    <th>Cumplimiento</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resumenData.map((item, index) => {
                                    const diferencia = item.elaborado - item.planificado;
                                    const cumplimiento = item.planificado > 0 
                                        ? (item.elaborado / item.planificado) * 100 
                                        : 0;
                                    const diferenciaColor = diferencia >= 0 ? '#10b981' : '#ef4444';
                                    const cumplimientoColor = cumplimiento >= 100 ? '#10b981' : cumplimiento >= 80 ? '#f59e0b' : '#ef4444';
                                    
                                    let estado = '';
                                    let estadoColor = '';
                                    if (cumplimiento >= 100) {
                                        estado = '✅ Meta superada';
                                        estadoColor = '#10b981';
                                    } else if (cumplimiento >= 80) {
                                        estado = '⚠️ Cerca de meta';
                                        estadoColor = '#f59e0b';
                                    } else {
                                        estado = '❌ Por debajo';
                                        estadoColor = '#ef4444';
                                    }
                                    
                                    return (
                                        <tr key={index}>
                                            <td className="producto-code">{item.codigo_producto}</td>
                                            <td>{item.planificado.toLocaleString()} unit.</td>
                                            <td>{item.elaborado.toLocaleString()} unit.</td>
                                            <td style={{ color: diferenciaColor, fontWeight: 'bold' }}>
                                                {diferencia >= 0 ? `+${diferencia.toLocaleString()}` : diferencia.toLocaleString()}
                                            </td>
                                            <td style={{ color: cumplimientoColor, fontWeight: 'bold' }}>
                                                {cumplimiento.toFixed(1)}%
                                            </td>
                                            <td style={{ color: estadoColor }}>
                                                {estado}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EstadisticaSemanal;