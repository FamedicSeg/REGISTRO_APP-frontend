import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, LineController, BarController, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { getResumenSemanal, guardarResumenSemanal, getHistoricoSemanal, getSemanasGuardadas, getTendenciaAnual } from '../services/api';
import '../styles/estadisticaSemanal.css';

ChartJS.register( CategoryScale, LinearScale, BarElement, LineElement, PointElement, LineController, BarController, Title, Tooltip, Legend );

// Helpers
function getSemanaActual() {
    const now = new Date();
    const jan4 = new Date(now.getFullYear(), 0, 4);
    const jan4Day = jan4.getDay() || 7;
    const monday = new Date(jan4);
    monday.setDate(jan4.getDate() - (jan4Day - 1));
    const diff = Math.floor((now - monday) / (7 * 24 * 60 * 60 * 1000));
    const weekNum = diff + 1;
    return `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function getWeekRange(weekString) {
    const [year, week] = weekString.split('-W');
    const ano = parseInt(year);
    const semana = parseInt(week);
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
}

function formatNum(n) {
    return Number(n || 0).toLocaleString('es-EC');
}

const colorCumplimiento = (pct) => {
    if (pct >= 100) return '#10b981';
    if (pct >= 80) return '#f59e0b';
    return '#ef4444';
};

const estadoCumplimiento = (pct) => {
    if (pct >= 100) return 'Meta cumplida';
    if (pct >= 80) return 'Cerca de meta';
    return 'Por debajo de la meta';
};

const EstadisticaSemanal = () => {
    const [selectedWeek, setSelectedWeek] = useState(getSemanaActual);
    const [weekRange, setWeekRange] = useState({ inicio: '', fin: '' });
    const [_chartData, setChartData] = useState(null);
    const [largeChartData, setLargeChartData] = useState(null);
    const [smallChartData, setSmallChartData] = useState(null);
    const [resumenData, setResumenData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const prevWeekRef = useRef(null);
    const [activeTab, setActiveTab] = useState('actual');
    const [anioHistorico, setAnioHistorico] = useState(new Date().getFullYear());
    const [semanasGuardadas, setSemanasGuardadas] = useState([]);
    const [semanaHistSel, setSemanaHistSel] = useState('');
    const [histData, setHistData] = useState(null);
    const [histChart, setHistChart] = useState(null);
    const [histLargeChart, setHistLargeChart] = useState(null); // NUEVO
    const [histSmallChart, setHistSmallChart] = useState(null); // NUEVO
    const [loadingHist, setLoadingHist] = useState(false);
    const [tendenciaData, setTendenciaData] = useState(null);
    const [loadingTendencia, setLoadingTendencia] = useState(false);
    
    const [_chartVersion, setChartVersion] = useState(0);

    useEffect(() => {
        setWeekRange(getWeekRange(selectedWeek));
    }, [selectedWeek]);

    useEffect(() => {
        const prev = prevWeekRef.current;
        const run = async () => {
            if (prev && prev !== selectedWeek) {
                setResumenData(null);
                setChartData(null);
                setLargeChartData(null);
                setSmallChartData(null);
                setError('');
                
                if (resumenData && resumenData.length > 0) {
                    const [py, pw] = prev.split('-W');
                    try { 
                        await guardarResumenSemanal(parseInt(py), parseInt(pw)); 
                        console.log(`✅ Semana ${pw}/${py} guardada automáticamente`);
                    } catch (err) { 
                        console.error(err); 
                        alert('Error al guardar el resumen semanal anterior. Asegúrate de que la conexión con OneDrive esté activa.');
                    }
                }
            }
            prevWeekRef.current = selectedWeek;
            console.log(`📅 Cambiando a semana: ${selectedWeek}`);
            await cargarDatos();
        };
        run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedWeek]);

    useEffect(() => {
        if (activeTab === 'historico') {
            cargarSemanasGuardadas();
            cargarTendencia();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, anioHistorico]);

    useEffect(() => {
        if (semanaHistSel) cargarHistoricoSemana(semanaHistSel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [semanaHistSel]);

    const cargarDatos = async () => {
        setLoading(true); 
        setError('');
        try {
            const [year, week] = selectedWeek.split('-W');
            const response = await getResumenSemanal(parseInt(year), parseInt(week));
            console.log(`📊 Datos recibidos para semana ${week}/${year}:`, {
                success: response.success,
                productosCount: response.data?.length || 0,
                totalPlanificado: response.data?.reduce((s, r) => s + r.planificado, 0) || 0
            });
            
            if (response.success && response.data.length > 0) {
                setResumenData(response.data);
                prepararGraficos(response.data);
                setChartVersion(prev => prev + 1);
            } else {
                setError(`No hay datos para la semana ${week}/${year}`);
                setResumenData(null); 
                setChartData(null); 
                setLargeChartData(null); 
                setSmallChartData(null);
            }
        } catch (err) {
            setError('Error al cargar los datos. Verifique la conexión con OneDrive.');
            console.error('Error cargando datos:', err);
        } finally { 
            setLoading(false); 
        }
    };

    const guardarResumen = async (silencioso = false) => {
        setSaving(true);
        try {
            const [year, week] = selectedWeek.split('-W');
            const response = await guardarResumenSemanal(parseInt(year), parseInt(week));
            if (response.success) {
                if (!silencioso) alert(`✅ ${response.message}`);
                if (activeTab === 'historico') { await cargarSemanasGuardadas(); await cargarTendencia(); }
            } else if (!silencioso) alert('Error al guardar resumen');
        } catch (err) { if (!silencioso) alert('Error al guardar el resumen semanal'); console.error(err); }
        finally { setSaving(false); }
    };

    const cargarSemanasGuardadas = async () => {
        try {
            const response = await getSemanasGuardadas(anioHistorico);
            if (response.success) {
                setSemanasGuardadas(response.data || []);
                if (response.data && response.data.length > 0 && !semanaHistSel)
                    setSemanaHistSel(String(response.data[response.data.length - 1].semana));
            }
        } catch (err) { console.error(err); }
    };

    const cargarHistoricoSemana = async (semana) => {
        setLoadingHist(true);
        try {
            const response = await getHistoricoSemanal(anioHistorico, semana);
            if (response.success && response.data.length > 0) {
                setHistData(response.data);
                prepararGraficosHistorico(response.data);
            } else { 
                setHistData([]); 
                setHistChart(null);
                setHistLargeChart(null);
                setHistSmallChart(null);
            }
        } catch (err) { 
            console.error(err); 
        }
        finally { 
            setLoadingHist(false); 
        }
    };

    const cargarTendencia = async () => {
        setLoadingTendencia(true);
        try {
            const response = await getTendenciaAnual(anioHistorico);
            if (response.success && response.tendencia.length > 0) setTendenciaData(response.tendencia);
            else setTendenciaData(null);
        } catch (err) { console.error(err); }
        finally { setLoadingTendencia(false); }
    };

    const prepararGraficos = (data) => {
        const productosPequeños = data.filter(item => item.elaborado < 4000);
        const productosGrandes = data.filter(item => item.elaborado >= 4000);
        
        setChartData({
            labels: data.map(i => i.codigo_producto),
            datasets: [
                { label: 'CANT. PLANIFICADA', data: data.map(i => i.planificado), backgroundColor: 'rgba(148, 163, 184, 0.9)', borderColor: 'rgba(148, 163, 184, 0.9)', borderWidth: 1, borderRadius: 4 },
                { label: 'CANT. ELABORADA',   data: data.map(i => i.elaborado),   backgroundColor: 'rgba(6, 182, 212, 0.9)', borderColor: 'rgba(6, 182, 212, 0.9)',  borderWidth: 1, borderRadius: 4 }
            ]
        });

        if (productosGrandes.length > 0) {
            setLargeChartData({
                labels: productosGrandes.map(i => i.codigo_producto),
                datasets: [
                    { label: 'CANT. PLANIFICADA', data: productosGrandes.map(i => i.planificado), backgroundColor: 'rgba(148, 163, 184, 0.9)', borderColor: 'rgba(148, 163, 184, 0.9)', borderWidth: 1, borderRadius: 4 },
                    { label: 'CANT. ELABORADA',   data: productosGrandes.map(i => i.elaborado),   backgroundColor: 'rgba(6, 182, 212, 0.9)', borderColor: 'rgba(6, 182, 212, 0.9)',  borderWidth: 1, borderRadius: 4 }
                ]
            });
        } else {
            setLargeChartData(null);
        }

        if (productosPequeños.length > 0) {
            setSmallChartData({
                labels: productosPequeños.map(i => i.codigo_producto),
                datasets: [
                    { label: 'CANT. PLANIFICADA', data: productosPequeños.map(i => i.planificado), backgroundColor: 'rgba(148, 163, 184, 0.9)', borderColor: 'rgba(148, 163, 184, 0.9)', borderWidth: 1, borderRadius: 4 },
                    { label: 'CANT. ELABORADA',   data: productosPequeños.map(i => i.elaborado),   backgroundColor: 'rgba(6, 182, 212, 0.9)', borderColor: 'rgba(6, 182, 212, 0.9)',  borderWidth: 1, borderRadius: 4 }
                ]
            });
        } else {
            setSmallChartData(null);
        }
    };

    // MODIFICADA: Ahora divide los gráficos históricos
    const prepararGraficosHistorico = (data) => {
        // Gráfico completo (todos los productos)
        setHistChart({
            labels: data.map(i => i.codigo_producto),
            datasets: [
                { label: 'PLANIFICADO', data: data.map(i => Number(i.planificado || 0)), backgroundColor: 'rgba(54,162,235,0.75)', borderColor: 'rgba(54,162,235,1)', borderWidth: 1, borderRadius: 4 },
                { label: 'ELABORADO',   data: data.map(i => Number(i.elaborado || 0)), backgroundColor: 'rgba(245,158,11,0.75)', borderColor: 'rgba(245,158,11,1)',  borderWidth: 1, borderRadius: 4 }
            ]
        });

        // Dividir por cantidad (usando el mismo criterio de 4000)
        const productosPequeños = data.filter(item => Number(item.elaborado || 0) < 4000);
        const productosGrandes = data.filter(item => Number(item.elaborado || 0) >= 4000);
        
        // Gráfico de productos grandes (mayores o iguales a 4000 unidades)
        if (productosGrandes.length > 0) {
            setHistLargeChart({
                labels: productosGrandes.map(i => i.codigo_producto),
                datasets: [
                    { 
                        label: 'PLANIFICADO', 
                        data: productosGrandes.map(i => Number(i.planificado || 0)), 
                        backgroundColor: 'rgba(54,162,235,0.75)', 
                        borderColor: 'rgba(54,162,235,1)', 
                        borderWidth: 1, 
                        borderRadius: 4 
                    },
                    { 
                        label: 'ELABORADO',   
                        data: productosGrandes.map(i => Number(i.elaborado || 0)), 
                        backgroundColor: 'rgba(245,158,11,0.75)', 
                        borderColor: 'rgba(245,158,11,1)',  
                        borderWidth: 1, 
                        borderRadius: 4 
                    }
                ]
            });
        } else {
            setHistLargeChart(null);
        }

        // Gráfico de productos pequeños (menos de 4000 unidades)
        if (productosPequeños.length > 0) {
            setHistSmallChart({
                labels: productosPequeños.map(i => i.codigo_producto),
                datasets: [
                    { 
                        label: 'PLANIFICADO', 
                        data: productosPequeños.map(i => Number(i.planificado || 0)), 
                        backgroundColor: 'rgba(54,162,235,0.75)', 
                        borderColor: 'rgba(54,162,235,1)', 
                        borderWidth: 1, 
                        borderRadius: 4 
                    },
                    { 
                        label: 'ELABORADO',   
                        data: productosPequeños.map(i => Number(i.elaborado || 0)), 
                        backgroundColor: 'rgba(245,158,11,0.75)', 
                        borderColor: 'rgba(245,158,11,1)',  
                        borderWidth: 1, 
                        borderRadius: 4 
                    }
                ]
            });
        } else {
            setHistSmallChart(null);
        }
    };

    const prepararGraficoTendencia = (tendencia) => ({
        labels: tendencia.map(t => `Sem. ${t.semana}`),
        datasets: [
            { type: 'bar',  label: 'Total Planificado', data: tendencia.map(t => t.total_planificado), backgroundColor: 'rgba(54,162,235,0.5)',  borderColor: 'rgba(54,162,235,1)',  borderWidth: 1, borderRadius: 4, yAxisID: 'y' },
            { type: 'bar',  label: 'Total Elaborado',   data: tendencia.map(t => t.total_elaborado),   backgroundColor: 'rgba(16,185,129,0.5)',  borderColor: 'rgba(16,185,129,1)',  borderWidth: 1, borderRadius: 4, yAxisID: 'y' },
            { type: 'line', label: '% Cumplimiento',    data: tendencia.map(t => t.cumplimiento_global), borderColor: 'rgba(239,68,68,1)', backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 2, pointRadius: 5, pointHoverRadius: 7, tension: 0.3, fill: false, yAxisID: 'y2' }
        ]
    });

    const opcionesBarras = {
        responsive: true, 
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                position: 'top', 
                labels: { font: { size: 12, weight: 'bold' }, padding: 15, usePointStyle: true } 
            },
            tooltip: {
                callbacks: {
                    label(ctx) {
                        const v = ctx.raw;
                        let extra = '';
                        if (ctx.datasetIndex === 1) {
                            const plan = ctx.chart.data.datasets[0].data[ctx.dataIndex];
                            if (plan > 0) extra = ` — ${((v / plan) * 100).toFixed(1)}% cumplimiento`;
                        }
                        return `${ctx.dataset.label}: ${formatNum(v)} unid.${extra}`;
                    }
                },
                backgroundColor: 'rgba(0,0,0,0.8)', 
                titleFont: { size: 13, weight: 'bold' }, 
                bodyFont: { size: 12 }, 
                padding: 10
            }
        },
        scales: {
            y: { 
                type: 'linear',
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.05)' }, 
                title: { 
                    display: true, 
                    text: 'Cantidad (unidades)', 
                    font: { weight: 'bold', size: 12 }, 
                    color: '#555' 
                }, 
                ticks: { callback: v => formatNum(v) }
            },
            x: { 
                grid: { display: false }, 
                title: { display: true, text: 'Código de Producto', font: { weight: 'bold', size: 12 }, color: '#555' }, 
                ticks: { rotation: -45, autoSkip: true, maxRotation: 45, minRotation: 45 } 
            }
        }
    };

    const opcionesBarrasPequeños = {
        responsive: true, 
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                position: 'top', 
                labels: { font: { size: 12, weight: 'bold' }, padding: 15, usePointStyle: true } 
            },
            tooltip: {
                callbacks: {
                    label(ctx) {
                        const v = ctx.raw;
                        let extra = '';
                        if (ctx.datasetIndex === 1) {
                            const plan = ctx.chart.data.datasets[0].data[ctx.dataIndex];
                            if (plan > 0) extra = ` — ${((v / plan) * 100).toFixed(1)}% cumplimiento`;
                        }
                        return `${ctx.dataset.label}: ${formatNum(v)} unid.${extra}`;
                    }
                },
                backgroundColor: 'rgba(0,0,0,0.8)', 
                titleFont: { size: 13, weight: 'bold' }, 
                bodyFont: { size: 12 }, 
                padding: 10
            }
        },
        scales: {
            y: { 
                type: 'linear',
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.05)' }, 
                title: { 
                    display: true, 
                    text: 'Cantidad (unidades)', 
                    font: { weight: 'bold', size: 12 }, 
                    color: '#555' 
                }, 
                ticks: { callback: v => formatNum(v) }
            },
            x: { 
                grid: { display: false }, 
                title: { display: true, text: 'Código de Producto', font: { weight: 'bold', size: 12 }, color: '#555' }, 
                ticks: { rotation: -25, autoSkip: true, maxRotation: 25, minRotation: 25 }
            }
        }
    };

    const opcionesBarrasGrandes = opcionesBarras;

    const opcionesTendencia = {
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { font: { size: 12, weight: 'bold' }, padding: 15, usePointStyle: true } },
            tooltip: {
                callbacks: {
                    label(ctx) {
                        return ctx.dataset.yAxisID === 'y2'
                            ? `${ctx.dataset.label}: ${ctx.raw}%`
                            : `${ctx.dataset.label}: ${formatNum(ctx.raw)} unid.`;
                    }
                },
                backgroundColor: 'rgba(0,0,0,0.85)', titleFont: { size: 13, weight: 'bold' }, bodyFont: { size: 12 }, padding: 10
            }
        },
        scales: {
            y:  { beginAtZero: true, position: 'left',  title: { display: true, text: 'Cantidad (unidades)', font: { weight: 'bold' }, color: '#555' }, ticks: { callback: v => formatNum(v) }, grid: { color: 'rgba(0,0,0,0.05)' } },
            y2: { beginAtZero: true, max: 100, position: 'right', title: { display: true, text: '% Cumplimiento', font: { weight: 'bold' }, color: '#ef4444' }, ticks: { callback: v => `${v}%`, color: '#ef4444' }, grid: { drawOnChartArea: false } },
            x:  { grid: { display: false } }
        }
    };

    const totalPlan = resumenData ? resumenData.reduce((s, r) => s + r.planificado, 0) : 0;
    const totalElab = resumenData ? resumenData.reduce((s, r) => s + r.elaborado, 0) : 0;
    const pctGlobal = totalPlan > 0 ? (totalElab / totalPlan) * 100 : 0;
    const metasCumplidas = resumenData ? resumenData.filter(r => r.planificado > 0 && r.elaborado >= r.planificado).length : 0;
    const totalProductosConPlan = resumenData ? resumenData.filter(r => r.planificado > 0).length : 0;

    const productosPequeñosCount = resumenData ? resumenData.filter(r => r.elaborado < 4000).length : 0;
    const productosGrandesCount = resumenData ? resumenData.filter(r => r.elaborado >= 4000).length : 0;

    return (
        <div className="estadistica-container">
            <header className="estadistica-header">
                <div>
                    <h1> DASHBOARD - COMPARATIVA SEMANAL DE CUMPLIMIENTO (%) </h1>
                    <p className="estadistica-subtitle">Análisis Comparativo del Porcentaje de Cumplimiento Semanal</p>
                </div>
            </header>

            <div className="estadistica-tabs">
                <button className={`tab-btn ${activeTab === 'actual' ? 'active' : ''}`} onClick={() => setActiveTab('actual')}>Semana Actual</button>
                <button className={`tab-btn ${activeTab === 'historico' ? 'active' : ''}`} onClick={() => setActiveTab('historico')}>Base Histórica</button>
            </div>

            {activeTab === 'actual' && (
                <>
                    <div className="estadistica-controls">
                        <div className="week-selector-wrap">
                            <label className="week-selector-label" htmlFor="week-input">Selecciona la Semana</label>
                            <input id="week-input" type="week" className="week-input" value={selectedWeek} onChange={e => setSelectedWeek(e.target.value)} />
                            {weekRange.inicio && (
                                <span className="week-range-label">
                                    {new Date(weekRange.inicio + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                    {' — '}
                                    {new Date(weekRange.fin + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                            )}
                        </div>
                        <div className="estadistica-actions">
                            <button onClick={() => guardarResumen(false)} disabled={saving || loading} className="btn-guardar">
                                {saving ? ' ⏱ Guardando...' : ' 🌐 Guardar en la Base Histórica'}
                            </button>
                            <button onClick={cargarDatos} disabled={loading} className="btn-actualizar">
                                {loading ? '⏳ Cargando...' : '⟳ Actualizar'}
                            </button>
                        </div>
                    </div>

                    {error && <div className="estadistica-error">⚠️ {error}</div>}
                    {loading && <div className="estadistica-loading"><div className="spinner"></div><p>Cargando datos desde Excel y Base de Datos...</p></div>}

                    {!loading && resumenData && resumenData.length > 0 && (
                        <div className="kpi-grid">
                            <div className="kpi-card kpi-blue"><span className="kpi-label">Total Planificado</span><span className="kpi-value">{formatNum(totalPlan)}</span><span className="kpi-unit">unidades</span></div>
                            <div className="kpi-card kpi-green"><span className="kpi-label">Total Elaborado</span><span className="kpi-value">{formatNum(totalElab)}</span><span className="kpi-unit">unidades</span></div>
                            <div className="kpi-card" style={{ borderTop: `4px solid ${colorCumplimiento(pctGlobal)}` }}>
                                <span className="kpi-label">% Cumplimiento Global</span>
                                <span className="kpi-value" style={{ color: colorCumplimiento(pctGlobal) }}>{pctGlobal.toFixed(1)}%</span>
                                <span className="kpi-unit">{estadoCumplimiento(pctGlobal)}</span>
                            </div>
                            <div className="kpi-card kpi-purple"><span className="kpi-label">Metas Cumplidas</span><span className="kpi-value">{metasCumplidas} / {totalProductosConPlan}</span><span className="kpi-unit">productos</span></div>
                        </div>
                    )}

                    {!loading && largeChartData && productosGrandesCount > 0 && (
                        <div className="estadistica-chart-container" style={{ marginTop: '2rem', borderTop: '3px solid #e5e7eb', paddingTop: '2rem' }}>
                            <div className="chart-header">
                                <h3>ENFOQUE EN PRODUCTOS DE ALTA CANTIDAD</h3>
                                <span className="chart-badge">
                                    {productosGrandesCount} productos con alta planificación - Semana {selectedWeek.split('-W')[1]}
                                </span>
                            </div>
                            <div className="chart-wrapper">
                                <Bar data={largeChartData} options={opcionesBarrasGrandes} />
                            </div>
                        </div>
                    )}

                    {!loading && smallChartData && productosPequeñosCount > 0 && (
                        <div className="estadistica-chart-container" style={{ marginTop: '2rem', borderTop: '3px solid #e5e7eb', paddingTop: '2rem' }}>
                            <div className="chart-header">
                                <h3>ENFOQUE EN PRODUCTOS DE BAJA CANTIDAD</h3>
                                <span className="chart-badge">
                                    {productosPequeñosCount} productos con baja planificación - Semana {selectedWeek.split('-W')[1]}
                                </span>
                            </div>
                            <div className="chart-wrapper">
                                <Bar data={smallChartData} options={opcionesBarrasPequeños} />
                            </div>
                        </div>
                    )}

                    {!loading && resumenData && productosPequeñosCount === 0 && (
                        <div className="estadistica-info" style={{ margin: '1rem 0', padding: '1rem', background: '#f0fdf4', borderRadius: '8px', textAlign: 'center' }}>
                            ✅ No hay productos con planificación menor a 4000 unidades esta semana.
                        </div>
                    )}

                    {!loading && resumenData && resumenData.length > 0 && (
                        <div className="estadistica-table-container">
                            <div className="table-header">
                                <h3>DETALLE POR PRODUCTO</h3>
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
                                            <th>% Cumplimiento</th>
                                            <th>Estado</th>
                                        </tr>
                                        </thead>
                                    <tbody>
                                        {resumenData.map((item, i) => {
                                            const dif = item.elaborado - item.planificado;
                                            const pct = item.planificado > 0 ? (item.elaborado / item.planificado) * 100 : 0;
                                            const esBajoVolumen = item.planificado < 4000;
                                            return (
                                                <tr key={i} style={esBajoVolumen ? { backgroundColor: '#fffbeb' } : {}}>
                                                    <td className="producto-code" style={esBajoVolumen ? { fontWeight: 'bold', color: '#d97706' } : {}}>
                                                        {item.codigo_producto}
                                                        {item.es_cambio && (
                                                            <span style={{ marginLeft: '6px', fontSize: '10px', fontWeight: 'bold', background: '#7c3aed', color: '#fff', borderRadius: '4px', padding: '2px 6px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                                                Cambio de Producción
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>{formatNum(item.planificado)} unit.</td>
                                                    <td>{formatNum(item.elaborado)} unit.</td>
                                                    <td style={{ color: dif >= 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{dif >= 0 ? `+${formatNum(dif)}` : formatNum(dif)}</td>
                                                    <td><span className="pct-badge" style={{ background: colorCumplimiento(pct) }}>{pct.toFixed(1)}%</span></td>
                                                    <td style={{ color: colorCumplimiento(pct) }}>{estadoCumplimiento(pct)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {activeTab === 'historico' && (
                <>
                    <div className="estadistica-controls">
                        <div className="week-selector-wrap">
                            <label className="week-selector-label">AÑO</label>
                            <select className="week-input" value={anioHistorico} onChange={e => { setAnioHistorico(parseInt(e.target.value)); setSemanaHistSel(''); setHistData(null); setHistChart(null); setHistLargeChart(null); setHistSmallChart(null); }}>
                                {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            {semanasGuardadas.length > 0 && (
                                <>
                                    <label className="week-selector-label">Semana guardada</label>
                                    <select className="week-input" value={semanaHistSel} onChange={e => setSemanaHistSel(e.target.value)}>
                                        <option value="">— Seleccione —</option>
                                        {semanasGuardadas.map(s => (
                                            <option key={s.semana} value={s.semana}>Semana {s.semana} — {s.total_productos} prod. — {s.cumplimiento_promedio}% cumpl.</option>
                                        ))}
                                    </select>
                                </>
                            )}
                        </div>
                        <div className="estadistica-actions">
                            <button onClick={() => { cargarSemanasGuardadas(); cargarTendencia(); }} className="btn-actualizar">🗘 Refrescar</button>
                        </div>
                    </div>

                    {semanasGuardadas.length === 0 && !loadingTendencia && (
                        <div className="estadistica-error">⚠️ No hay semanas guardadas para {anioHistorico}. Ve a "Semana Actual" y presiona "Guardar en la Base Histórica".</div>
                    )}

                    {semanasGuardadas.length > 0 && (
                        <div className="semanas-grid">
                            {semanasGuardadas.map(s => (
                                <div key={s.semana} className={`semana-card ${semanaHistSel === String(s.semana) ? 'semana-card--active' : ''}`} onClick={() => setSemanaHistSel(String(s.semana))}>
                                    <span className="semana-card__num">Sem. {s.semana}</span>
                                    <span className="semana-card__pct" style={{ color: colorCumplimiento(s.cumplimiento_promedio) }}>{s.cumplimiento_promedio}%</span>
                                    <span className="semana-card__label">cumplimiento prom.</span>
                                    <span className="semana-card__prods">{s.total_productos} productos</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {loadingTendencia && <div className="estadistica-loading"><div className="spinner"></div><p>Cargando tendencia anual...</p></div>}
                    {!loadingTendencia && tendenciaData && tendenciaData.length > 0 && (
                        <div className="estadistica-chart-container">
                            <div className="chart-header">
                                <h3>TENDENCIA DE CUMPLIMIENTO — {anioHistorico}</h3>
                                <span className="chart-badge">Barras: volumen · Línea roja: % cumplimiento</span>
                            </div>
                            <div className="chart-wrapper">
                                <Bar data={prepararGraficoTendencia(tendenciaData)} options={opcionesTendencia} />
                            </div>
                        </div>
                    )}

                    {loadingHist && <div className="estadistica-loading"><div className="spinner"></div><p>Cargando semana {semanaHistSel}...</p></div>}

                    {/* GRÁFICO HISTÓRICO - PRODUCTOS DE ALTA CANTIDAD */}
                    {!loadingHist && histLargeChart && semanaHistSel && (
                        <div className="estadistica-chart-container" style={{ marginTop: '2rem', borderTop: '3px solid #e5e7eb', paddingTop: '2rem' }}>
                            <div className="chart-header">
                                <h3>ENFOQUE EN PRODUCTOS DE ALTA CANTIDAD - SEMANA {semanaHistSel}</h3>
                                <span className="chart-badge">
                                    {histLargeChart.labels.length} productos con alta planificación
                                </span>
                            </div>
                            <div className="chart-wrapper">
                                <Bar 
                                    key={`hist-large-${anioHistorico}-${semanaHistSel}`} 
                                    data={histLargeChart} 
                                    options={opcionesBarrasGrandes} 
                                />
                            </div>
                        </div>
                    )}

                    {/* GRÁFICO HISTÓRICO - PRODUCTOS DE BAJA CANTIDAD */}
                    {!loadingHist && histSmallChart && semanaHistSel && (
                        <div className="estadistica-chart-container" style={{ marginTop: '2rem', borderTop: '3px solid #e5e7eb', paddingTop: '2rem' }}>
                            <div className="chart-header">
                                <h3>ENFOQUE EN PRODUCTOS DE BAJA CANTIDAD - SEMANA {semanaHistSel}</h3>
                                <span className="chart-badge">
                                    {histSmallChart.labels.length} productos con baja planificación
                                </span>
                            </div>
                            <div className="chart-wrapper">
                                <Bar 
                                    key={`hist-small-${anioHistorico}-${semanaHistSel}`} 
                                    data={histSmallChart} 
                                    options={opcionesBarrasPequeños} 
                                />
                            </div>
                        </div>
                    )}

                    {/* MENSAJES INFORMATIVOS */}
                    {!loadingHist && histData && histData.length > 0 && (
                        <>
                            {histLargeChart === null && histSmallChart !== null && (
                                <div className="estadistica-info" style={{ margin: '1rem 0', padding: '1rem', background: '#f0fdf4', borderRadius: '8px', textAlign: 'center' }}>
                                    ℹ️ No hay productos con planificación mayor o igual a 4000 unidades en esta semana.
                                </div>
                            )}
                            {histSmallChart === null && histLargeChart !== null && (
                                <div className="estadistica-info" style={{ margin: '1rem 0', padding: '1rem', background: '#f0fdf4', borderRadius: '8px', textAlign: 'center' }}>
                                    ℹ️ No hay productos con planificación menor a 4000 unidades en esta semana.
                                </div>
                            )}
                        </>
                    )}

                    {/* GRÁFICO COMPLETO (OPCIONAL - TODOS LOS PRODUCTOS) */}
                    {!loadingHist && histChart && semanaHistSel && (
                        <div className="estadistica-chart-container" style={{ borderTop: '3px solid #e5e7eb', paddingTop: '2rem', marginTop: '2rem' }}>
                            <div className="chart-header">
                                <h3>DETALLE COMPLETO - SEMANA {semanaHistSel} — {anioHistorico}</h3>
                                <span className="chart-badge">Todos los productos</span>
                            </div>
                            <div className="chart-wrapper">
                                <Bar key={`hist-${anioHistorico}-${semanaHistSel}`} data={histChart} options={opcionesBarras} />
                            </div>
                        </div>
                    )}

                    {!loadingHist && histData && histData.length > 0 && (
                        <div className="estadistica-table-container">
                            <div className="table-header">
                                <h3>Detalle Semana {semanaHistSel} — {anioHistorico}</h3>
                                <span className="table-count">{histData.length} productos</span>
                            </div>
                            <div className="table-wrapper">
                                <table className="estadistica-table">
                                    <thead>
                                        <tr>
                                            <th>Código Producto</th>
                                            <th>Planificado</th>
                                            <th>Elaborado</th>
                                            <th>Diferencia</th>
                                            <th>% Cumplimiento</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {histData.map((item, i) => {
                                            const dif = item.elaborado - item.planificado;
                                            const pct = item.planificado > 0 ? (item.elaborado / item.planificado) * 100 : 0;
                                            return (
                                                <tr key={i}>
                                                    <td className="producto-code">{item.codigo_producto}</td>
                                                    <td>{formatNum(item.planificado)} unit.</td>
                                                    <td>{formatNum(item.elaborado)} unit.</td>
                                                    <td style={{ color: dif >= 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{dif >= 0 ? `+${formatNum(dif)}` : formatNum(dif)}</td>
                                                    <td><span className="pct-badge" style={{ background: colorCumplimiento(pct) }}>{pct.toFixed(1)}%</span></td>
                                                    <td style={{ color: colorCumplimiento(pct) }}>{estadoCumplimiento(pct)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default EstadisticaSemanal;