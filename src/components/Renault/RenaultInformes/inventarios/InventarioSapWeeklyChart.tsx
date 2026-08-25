import {ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell} from "recharts";
import type { InventarioSemana } from "./InventarioSemana";
import type { InventarioDia } from "./InventarioDia";
import styles from "./InventarioSapWeeklyChart.module.css";

interface Props {
    semana: InventarioSemana;
}
const InventarioSapWeeklyChart: React.FC<Props> = ({semana}) => {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>
                        Inventarios realizados por día
                    </h2>
                    <div className={styles.subtitle}>
                        {formatDate(semana.desde)}
                        {" al "}
                        {formatDate(semana.hasta)}
                    </div>
                </div>
                <div className={styles.targetInfo}>
                    Target diario:
                    <strong> 135</strong>
                </div>
            </div>

            <div className={styles.chart}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={semana.dias}
                        margin={{top: 25, right: 30, left: 10, bottom: 10}}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" interval={0} tick={{fontSize: 12}}/>
                        <YAxis allowDecimals={false}/>
                        <Tooltip
                            cursor={{fill: "rgba(43, 129, 121, 0.05)"}}
                            content={props => {
                                if (!props.active || !props.payload || props.payload.length === 0) {
                                    return null;
                                }
                                const dia = props.payload[0].payload as InventarioDia;
                                return (<CustomTooltip dia={dia}/>);
                            }}
                        />
                        <Bar dataKey="realizados" name="Realizados" radius={[6, 6, 0, 0]} maxBarSize={70}>
                            {semana.dias.map(dia => (
                                    <Cell key={dia.fecha.toISOString()} fill={getBarColor(dia)}/>
                                )
                            )}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
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
/* COLOR DE LA BARRA */
function getBarColor(dia: InventarioDia): string {
    /* Día sin target:
     * si hubo actividad,
    consideramos trabajo extra.  */
    if (dia.target === 0) {
        return dia.realizados > 0 ? "#2b8179" : "#d9dfdf";
    }
    /* Día hábil. */
    return dia.realizados >= dia.target ? "#2b8179" : "#e58a2b";
}
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

export default InventarioSapWeeklyChart;