import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend} from "chart.js";
import { excelDateToJSDate } from "../../utils/dateUtils";

ChartJS.register( CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Props {
    registros: any[];
    feriados: Date[];
    fechaCorte: string;
    mesesSeleccionados: string[];
}

interface Semana {
    key: string;
    label: string;
    desde: Date;
    hasta: Date;
    realizados: number;
    esperados: number;
}

const InventariosWeeklyChart: React.FC<Props> = ({registros, feriados, fechaCorte, mesesSeleccionados}) => {
    const semanas = useMemo(() => {
        if (registros.length === 0) {
            return [];
        }
        const fechas = registros.map(item => excelDateToJSDate(item.fecha)).filter(fecha =>
            !Number.isNaN(fecha.getTime()));
        if (fechas.length === 0) {
            return [];
        }
        const fechaActualizacion = parseFechaCorte(fechaCorte);
        if (!fechaActualizacion) {
            return [];
        }
        const indicesMeses = mesesSeleccionados.map(mes =>
        ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ].indexOf(mes)).filter(index => index >= 0);
        if (indicesMeses.length === 0) {
            return [];
        }
        const primerMesSeleccionado = Math.min(...indicesMeses);
        const ultimoMesSeleccionado = Math.max(...indicesMeses);
        const year = fechaActualizacion.getFullYear();
        const primeraFecha = new Date(year, primerMesSeleccionado, 1, 0, 0, 0, 0);
        const inicio = inicioSemana(primeraFecha);
        const resultado: Semana[] = [];
        let actual = new Date(inicio);
        const finMesSeleccionado = new Date(year, ultimoMesSeleccionado + 1, 0, 23, 59, 59, 999);
        const ultimaFecha = finMesSeleccionado.getTime() < fechaActualizacion.getTime() ? finMesSeleccionado : fechaActualizacion;
        while (actual.getTime() <= ultimaFecha.getTime()) {
            const fin = new Date(actual);
            fin.setDate(fin.getDate() + 6); 
            const desdeReal = actual < primeraFecha ? primeraFecha : actual;
            const hastaReal = fin > ultimaFecha ? ultimaFecha : fin;
            const realizados = registros.filter(item => {
                const fecha = excelDateToJSDate(item.fecha);
                return (fecha >= desdeReal && fecha <= finDelDia(hastaReal));}).length;
            const diasHabiles = contarDiasHabiles(desdeReal, hastaReal, feriados);
            /* 1250 semanales / 5 días = 250 inventarios por día hábil */
            const esperados = diasHabiles * 250;
            resultado.push({
                key: `${actual.getFullYear()}-${actual.getMonth()}-${actual.getDate()}`,
                label: `${formatearDia(desdeReal)} - ${formatearDia(hastaReal)}`,
                desde: desdeReal,
                hasta: hastaReal,
                realizados,
                esperados
            });
            actual = new Date(actual);
            actual.setDate(actual.getDate() + 7);
        }
        return resultado;
    }, [registros, feriados, fechaCorte, mesesSeleccionados]);

    const data = {
        labels: semanas.map(semana => semana.label),
        datasets: [{
            label: `Realizados ${mesesSeleccionados}`,
            data: semanas.map(semana => semana.realizados),
            backgroundColor: semanas.map(semana => semana.realizados >= semana.esperados
                            ? "#2d9a8f" : "#d7cc3b"),
            borderRadius: 5
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {position: "bottom" as const},
            tooltip: {callbacks: 
                {afterBody: (context: any[]) => {
                const index = context[0].dataIndex;
                const semana = semanas[index];
                const diasHabiles = semana.esperados / 250;
                const diferencia = semana.realizados - semana.esperados;
                return [
                    `Target: ${semana.esperados}`,
                    `Diferencia: ${diferencia > 0 ? "+" : ""}${diferencia}`, 
                    `Dias habiles: ${diasHabiles}`,                  
                ];
            }}}
        },
        scales: {
            y: {beginAtZero: true, ticks: {precision: 0}},
            x: {grid: {display: false}}
        }
    };
    return (
        <div style={{width: "100%", height: "260px"}} >
            <Bar data={data} options={options} />
        </div>
    );
};


function inicioSemana(fecha: Date): Date {
    const result = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    const dia = result.getDay();
    const diferencia = dia === 0 ? -6 : 1 - dia;
    result.setDate(result.getDate() + diferencia);
    return result;
}
function contarDiasHabiles(desde: Date, hasta: Date, feriados: Date[]): number {
    let cantidad = 0;
    const actual = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());
    while (actual.getTime() <= hasta.getTime()) {
        const dia = actual.getDay();
        const esFinDeSemana = dia === 0 || dia === 6;
        const esFeriado = feriados.some(feriado => feriado.getFullYear() === actual.getFullYear() &&
            feriado.getMonth() === actual.getMonth() &&
            feriado.getDate() === actual.getDate());
        if (!esFinDeSemana && !esFeriado) {
            cantidad++;
        }
        actual.setDate(actual.getDate() + 1);
    }
    return cantidad;
}

function finDelDia(fecha: Date): Date {
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 23, 59, 59, 999);
}

function formatearDia(fecha: Date): string {
    return fecha.getDate().toString().padStart(2, "0");
}

function parseFechaCorte(value: string): Date | null {
    if (!value) {
        return null;
    }
    const partes = value.split("/");
    if (partes.length !== 3) {
        return null;
    }
    const dia = Number(partes[0]);
    const mes = Number(partes[1]);
    const anio = Number(partes[2]);
    const fecha = new Date(anio, mes - 1, dia);

    return Number.isNaN(fecha.getTime()) ? null : fecha;
}

export default InventariosWeeklyChart;