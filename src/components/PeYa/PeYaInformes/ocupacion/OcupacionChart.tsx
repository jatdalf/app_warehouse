import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine
} from "recharts";
import type { OcupacionItem } from "../ocupacion/OcupacionItem";
import styles from "./OcupacionChart.module.css";

interface Props {
    data: OcupacionItem[];
}

const OcupacionChart: React.FC<Props> = ({data}) => {
    const chartData = data.map(item => {
            const base = Math.min(item.posiciones, 100);
            const exceso = Math.max(item.posiciones - 100, 0);
            return {
                dia: item.fecha.getDate().toString(),
                posiciones: item.posiciones,
                base,
                exceso
            };
        });

    return (
        <div className={styles.card}>
            <h2 className={styles.title}>
                Ocupación diaria
            </h2>
            <div className={styles.chart}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{
                            top: 20,
                            right: 30,
                            left: 10,
                            bottom: 10
                        }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="dia" interval={0} tick={{fontSize: 11}} />
                        <YAxis allowDecimals={false}/>
                        <Tooltip formatter={(value, name, props) => {
                                if (
                                    name === "base"
                                ) {
                                    return [
                                        props.payload
                                            .posiciones,
                                        "Posiciones"
                                    ];
                                }
                                return [
                                    value,
                                    "Exceso"
                                ];
                            }}
                        />
                        <ReferenceLine y={100} stroke="#666" strokeDasharray="5 5" label="Capacidad 100" />
                        <Bar dataKey="base" stackId="ocupacion" fill="#2b8179"/>
                        <Bar dataKey="exceso" stackId="ocupacion" fill="#e76f51" radius={[5, 5, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default OcupacionChart;