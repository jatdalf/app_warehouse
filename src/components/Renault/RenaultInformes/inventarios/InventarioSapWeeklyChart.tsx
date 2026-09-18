import {ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Rectangle} from "recharts";
import type { InventarioSemana } from "./InventarioSemana";
import type { InventarioDia } from "./InventarioDia";
import type { TipoPeriodo } from "./builders/InventarioPeriodoBuilder";
import styles from "./InventarioSapWeeklyChart.module.css";

interface InventarioMesChart {
    key: string;
    label: string;
    fecha: Date;
    realizados: number;
    target: number;
    porReferencia: Record<string, number>;
}
interface Props {
    semana: InventarioSemana;
    tipoPeriodo: TipoPeriodo;
    mesesPeriodo: InventarioMesChart[];
}
const InventarioSapWeeklyChart: React.FC<Props> = ({semana, tipoPeriodo, mesesPeriodo}) => {
    const esAnual = tipoPeriodo === "ANIO";
    const targetDiario = semana.dias.find(dia => dia.target > 0)?.target ?? 0;
    const chartData = esAnual ? mesesPeriodo.map(mes => ({...mes,chartKey: mes.key}))
    : semana.dias.map(dia => ({
        ...dia, chartKey: [
            dia.fecha.getFullYear(),
            String(dia.fecha.getMonth() + 1).padStart(2, "0"),
            String(dia.fecha.getDate()).padStart(2, "0")
        ].join("-")
    }));
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>
                        {esAnual ? "Inventarios realizados por mes" : "Inventarios realizados por día"}
                    </h2>
                    <div className={styles.subtitle}>
                        {formatDate(semana.desde)} {" al "} {formatDate(semana.hasta)}
                    </div>
                </div>
                <div className={styles.targetInfo}>
                    {esAnual ? (
                        <span>Vista acumulada anual</span>
                    ) : (
                        <>
                            Target diario:<strong>{targetDiario}</strong>
                        </>
                    )}
                </div>
            </div>

            <div className={styles.chart}>
               <ResponsiveContainer width="100%" height="100%">
                <BarChart key={semana.key} data={chartData} margin={{top: 25, right: 30, left: 10, bottom: 10}}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="chartKey" interval={0} tick={{fontSize: 12}} tickFormatter={(_, index) =>
                    chartData[index]?.label ?? ""}/>
                    <YAxis allowDecimals={false}/>
                   <Tooltip cursor={{ fill: "rgba(43, 129, 121, 0.05)" }}
                    content={props => {
                        if (!props.active || !props.payload || props.payload.length === 0) {
                            return null;
                        }
                    const payload = props.payload.find(item => item.payload);
                    if (!payload) {
                        return null;
                    }
                    if (esAnual) {
                        const mes = payload.payload as InventarioMesChart;
                        return (<CustomMonthTooltip mes={mes} />);
                    }
                    const dia = payload.payload as InventarioDia;
                    return (<CustomTooltip dia={dia} />);}}/>
                   <Bar
                    dataKey="realizados"
                    name="Realizados"
                    maxBarSize={70}
                    isAnimationActive={false}
                    shape={(props: any) => {
                    const { x, y, width, height, payload } = props;
                    const item = payload as { realizados: number; target: number; };
                    const fill = item.target === 0 ? "#2b8179" : item.realizados >= item.target  ? "#2b8179" : "#e58a2b";
                    return (
                 <Rectangle x={x} y={y} width={width} height={height} fill={fill} radius={[6, 6, 0, 0]} />);
            }}/>
        </BarChart>
    </ResponsiveContainer>
        </div>
    </div>);
};

/* TOOLTIP */
interface TooltipProps {
    dia: InventarioDia;
}
const CustomTooltip: React.FC<TooltipProps> = ({dia}) => {
    const diferencia = dia.realizados - dia.target;
    /* Ordenamos referencias:
     * CICLICOS primero.
     * El resto alfabéticamente.
     */
    const referencias = Object.entries(dia.porReferencia).filter(([, cantidad]) => cantidad > 0).sort(([a], [b]) => {
            if (a === "CICLICOS") {
                return -1;
            }
            if (b === "CICLICOS") {
                return 1;
            }
            return a.localeCompare(b);
        }
    );
    return (
        <div className={styles.tooltip}>
            <div className={styles.tooltipTitle}>
                {nombreDiaCompleto(dia.fecha)}
                {" "}
                {formatDate(dia.fecha)}
            </div>
            <div className={styles.tooltipMain}>
                <span>Realizados</span>
                <strong>{dia.realizados}</strong>
            </div>
            <div className={styles.tooltipRow}>
                <span>Target</span>
                <strong>{dia.target}</strong>
            </div>
            {dia.target > 0 ? (
                <div className={styles.tooltipRow}>
                    <span>Diferencia</span>
                    <strong>{diferencia > 0 ? `+${diferencia}` : diferencia}</strong>
                </div>
            ) : dia.realizados > 0 ? (
                <div className={styles.tooltipRow}>
                    <span>Extra</span>
                    <strong>+{dia.realizados}</strong>
                </div>
            ) : null}
            {referencias.length > 0 && (
                <>
                    <div className={styles.tooltipDivider}/>
                    <div className={styles.tooltipSectionTitle}>
                        Tipo de inventario
                    </div>
                    {referencias.map(
                        ([referencia, cantidad]) => (
                            <div key={referencia} className={styles.tooltipRow}>
                                <span>{formatReferencia(referencia)}</span>
                                <strong>{cantidad}</strong>
                            </div>
                        )
                    )}
                </>
            )}
        </div>
    );
};
interface MonthTooltipProps {
    mes: InventarioMesChart;
}

const CustomMonthTooltip: React.FC<MonthTooltipProps> = ({
    mes
}) => {

    const diferencia =
        mes.realizados - mes.target;

    const referencias =
        Object.entries(mes.porReferencia)
            .filter(([, cantidad]) => cantidad > 0)
            .sort(([a], [b]) => {
                if (a === "CICLICOS") {
                    return -1;
                }

                if (b === "CICLICOS") {
                    return 1;
                }

                return a.localeCompare(b);
            });

    return (
        <div className={styles.tooltip}>

            <div className={styles.tooltipTitle}>
                {nombreMesCompleto(mes.fecha)}
            </div>

            <div className={styles.tooltipMain}>
                <span>Realizados</span>
                <strong>{mes.realizados}</strong>
            </div>

            <div className={styles.tooltipRow}>
                <span>Target</span>
                <strong>{mes.target}</strong>
            </div>

            <div className={styles.tooltipRow}>
                <span>Diferencia</span>

                <strong>
                    {diferencia > 0
                        ? `+${diferencia}`
                        : diferencia}
                </strong>
            </div>

            {referencias.length > 0 && (
                <>
                    <div
                        className={
                            styles.tooltipDivider
                        }
                    />

                    <div
                        className={
                            styles.tooltipSectionTitle
                        }
                    >
                        Tipo de inventario
                    </div>

                    {referencias.map(
                        ([referencia, cantidad]) => (
                            <div
                                key={referencia}
                                className={
                                    styles.tooltipRow
                                }
                            >
                                <span>
                                    {formatReferencia(
                                        referencia
                                    )}
                                </span>

                                <strong>
                                    {cantidad}
                                </strong>
                            </div>
                        )
                    )}
                </>
            )}

        </div>
    );
};
/* HELPERS */
function formatDate(fecha: Date): string {
    return fecha.toLocaleDateString("es-AR",{ day: "2-digit", month: "2-digit", year: "numeric" });
}

function nombreDiaCompleto(fecha: Date): string {
    const nombre = new Intl.DateTimeFormat("es-AR",{weekday: "long"}).format(fecha);
    return (nombre.charAt(0).toUpperCase() + nombre.slice(1));
}
function formatReferencia(value: string): string {
    const texto = value.toLowerCase();
    return (texto.charAt(0).toUpperCase() + texto.slice(1));
}
function nombreMesCompleto(fecha: Date): string {

    const texto =
        new Intl.DateTimeFormat(
            "es-AR",
            {
                month: "long",
                year: "numeric"
            }
        ).format(fecha);

    return (
        texto.charAt(0).toUpperCase() +
        texto.slice(1)
    );
}

export default InventarioSapWeeklyChart;