import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Cell
} from "recharts";

import type { InventarioWeeklyData } from "../inventarios/InventarioWeeklyBuilder";
import styles from "./InventarioWeeklyChart.module.css";

interface Props {
    data: InventarioWeeklyData[];
}

const InventarioWeeklyChart: React.FC<Props> = ({data}) => {
    return (
        <div className={styles.card}>
            <h2 className={styles.title}>
                Cumplimiento semanal de inventarios
            </h2>
            <div className={styles.chart}>
                <ResponsiveContainer width="100%" height="100%" >
                    <BarChart data={data} margin={{top: 25, right: 30, left: 10, bottom: 10}}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" interval={0} tick={{fontSize: 12}} />
                        <YAxis allowDecimals={false} />
                        <Tooltip formatter={(value, name) => {
                            const valor = Number(value).toLocaleString("es-AR");
                            if (name === "esperados") {
                                return [valor, "Esperados"];
                            }
                            return [valor, "Realizados"];
                        }}/>
                        <Legend formatter={value => value === "esperados" ? "Esperados" : "Realizados"} />
                        {/* OBJETIVO */}
                        <Bar dataKey="esperados" name="esperados" fill="#aeb8b8" radius={[ 5, 5, 0, 0 ]} />
                        {/* REALIZADOS */}
                        <Bar dataKey="realizados" name="realizados" radius={[ 5, 5, 0, 0]}>
                            {data.map(semana => (
                                <Cell key={semana.key}
                                    fill={semana.realizados >= semana.esperados ? "#2b8179" : "#e58a2b"}
                                />
                                )
                            )}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};


export default InventarioWeeklyChart;