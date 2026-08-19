import {ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell} from "recharts";
import type { InventarioWeeklyItem } from "../inventarios/InventarioWeeklyBuilder";
import styles from "./InventarioWeeklyChart.module.css";

interface Props {
    data: InventarioWeeklyItem[];
}

const InventarioWeeklyChart: React.FC<Props> = ({ data }) => {
    return (
        <div className={styles.card}>
            <h2 className={styles.title}>Detalle semanal de inventarios</h2>
            <div className={styles.chart}>
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{top: 25, right: 30, left: 10, bottom: 10}}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" interval={0} tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip content={({ active, payload }) => {
                        if (!active || !payload || payload.length === 0) {
                            return null;
                        }
                        const semana = payload[0].payload as InventarioWeeklyItem;
                        const cumplimiento = semana.target > 0 ? (semana.realizados / semana.target) * 100 : 0;
                        const diferencia = semana.realizados - semana.target;
                        return (
                            <div style={{
                                    background: "#ffffff",
                                    border: "1px solid #d9e2e2",
                                    borderRadius: "8px",
                                    padding: "10px 14px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.10)"
                                }}>
                                <strong> {semana.label} </strong>
                                <div>Realizados:{" "}
                                    <b> {semana.realizados} </b>
                                </div>
                                <div>Sin diferencias:{" "}
                                    <b> {semana.sinDiferencias} </b>
                                </div>
                                <div>Con diferencias:{" "}
                                    <b> {semana.conDiferencias} </b>
                                </div>
                                <hr />
                                <div>Días hábiles:{" "}
                                    <b> {semana.diasHabiles} </b>
                                </div>
                                <div>Target:{" "}
                                    <b> {semana.target} </b>
                                </div>
                                <div>Diferencia vs target:{" "}
                                    <b> {diferencia > 0 ? `+${diferencia}` : diferencia} </b>
                                </div>
                                <div>Cumplimiento:{" "}
                                    <b>{cumplimiento.toLocaleString("es-AR",
                                            {minimumFractionDigits: 1, maximumFractionDigits: 1})}
                                        %
                                    </b>
                                </div>
                            </div>
                        );
                    }}
                />

                    <Bar dataKey="realizados" name="Realizados" radius={[5, 5, 0, 0]}>
                        {data.map(semana => (
                            <Cell key={semana.label}
                                fill={semana.realizados >= semana.target ? "#2b8179" : "#e58a2b"}
                            />
                        ))}
                    </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default InventarioWeeklyChart;