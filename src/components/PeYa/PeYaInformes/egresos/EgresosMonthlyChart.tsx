import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from "recharts";
import type { EgresosMonthlyData } from "../egresos/EgresosMonthlyBuilder";
import styles from "./EgresosMonthlyChart.module.css";

interface Props {
    data: EgresosMonthlyData[];
}

const EgresosMonthlyChart: React.FC<Props> = ({data}) => {
    return (
        <div className={styles.card}>
            <h2 className={styles.title}>
                Bultos despachados por mes
            </h2>
            <div className={styles.chart}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{top: 25, right: 30, left: 15, bottom: 10}}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="mes" interval={0} tick={{ fontSize: 12 }}/>
                    <YAxis allowDecimals={false} tickFormatter={value => Number(value).toLocaleString("es-AR")}/>
                    <Tooltip formatter={(value, name) => {
                        const valor = Number(value).toLocaleString("es-AR");
                        if (name === "normal") {
                            return [valor, "Días hábiles + sábado"];
                        }
                        return [valor, "Domingos + feriados"];}} />
                    <Legend formatter={value => value === "normal" ? "Días hábiles + sábado" : "Domingos + feriados"}/>
                    <Bar dataKey="normal" stackId="bultos" fill="#2b8179"/>
                    <Bar dataKey="especial" stackId="bultos" fill="#e58a2b" radius={[6, 6, 0, 0]}/>
                </BarChart>
            </ResponsiveContainer>
            </div>
        </div>
    );
};

export default EgresosMonthlyChart;