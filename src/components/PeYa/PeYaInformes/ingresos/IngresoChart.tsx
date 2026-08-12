import {
    ResponsiveContainer,
    ComposedChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from "recharts";

import type {IngresoMonthlyData} from "../ingresos/IngresosMonthlyBuilder";
import styles from "./IngresoChart.module.css";

type Metric = | "sku" | "unidades" | "pallets";

interface Props {
    titulo: string;
    data: IngresoMonthlyData[];
    dataKey: Metric;
}

const IngresoChart: React.FC<Props> = ({titulo, data, dataKey}) => {
    return (
        <div className={styles.card}>
            <h3 className={styles.title}>
                {titulo}
            </h3>

            <div className={styles.chart}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={data}
                        margin={{top: 20, right: 20, left: 10, bottom: 5}}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="mes"/>
                        <YAxis allowDecimals={false} />
                        <Tooltip formatter={(value) => Number(value).toLocaleString("es-AR")}/>
                        <Bar dataKey={dataKey} fill="#2b8179" radius={[5, 5, 0, 0]}/>
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default IngresoChart;