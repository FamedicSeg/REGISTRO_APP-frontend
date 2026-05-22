import React, {useState} from 'react';
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

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const ProduuctividadChart = () =>{
    const [_chartData, _setChartData] = useState(null);
    const [_fileName, _setFileName] = useState('');
    const [_loading, _setLoading] = useState(false);
    const [_error, _setError] = useState('');

    const _processExcelData = (data) => {
        try{
            const headers = data[0];
            const codProductoColIndex = headers.indexOf('CONSOLIDADO');
            const cantPlanificadaColIndex = headers.indexOf('CANT. SEMANAL PROGRAMADA');
            const codProductoHeader = headers[codProductoColIndex];
            const cantPlanificadaHeader = headers[cantPlanificadaColIndex];  

            console.log('Encabezados encontrados:', {
                'CONSOLIDADO': codProductoHeader,
                'CANT. SEMANAL PROGRAMADA': cantPlanificadaHeader
            });

            const productos = [];
            const cantidadesPlanificadas = [];

            for(let i=6; i < data.length; i++){
                const row = data[i];
                if(!row || row.length === 0) continue;

                const codProducto = row[codProductoColIndex];
                const cantPlanificada = row[cantPlanificadaColIndex];

                if(codProducto && codProducto.toString().trim() !== ''){
                    productos.push(codProducto.toString());

                    const planificado = parseFloat(cantPlanificada) || 0;
                    cantidadesPlanificadas.push(planificado); 
                }
            }    
            console.log('Productos encontrados:', productos);
            console.log('Cantidades planificadas:', cantidadesPlanificadas);

            return {
                productos,
                planificados: cantidadesPlanificadas,
                elaborados: cantidadesPlanificadas.map(p => p * 0.85)
            };
        } catch(err){
            console.error('Error al procesar los datos del Excel:', err);
        }
    }


    return (
        <div style={{ width: '600px', margin: '0 auto' }}>
            <h2>GRÁFICO DE BARRAS DOBLE</h2>

        </div>
    );
};

export default ProduuctividadChart;