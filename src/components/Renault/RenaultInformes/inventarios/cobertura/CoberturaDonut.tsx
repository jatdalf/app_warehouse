import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import styles from "./RenaultInventarioCobertura.module.css";

interface CoberturaDonutProps {
    inventariadas: number;
    pendientes: number;
    porcentajeCobertura: number;
    onPendientesClick?: () => void;
}

const CoberturaDonut = ({
    inventariadas,
    pendientes,
    porcentajeCobertura,
    onPendientesClick
}: CoberturaDonutProps) => {
    const data = [
        {
            name: "Inventariadas",
            value: inventariadas
        },{
            name: "Pendientes",
            value: pendientes
        }
    ];

    return (
        <div className={styles.coberturaDonutWrapper}>
            <div className={styles.coberturaDonut}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            innerRadius="65%"
                            outerRadius="92%"
                            paddingAngle={2}
                            stroke="#ffffff"
                            strokeWidth={2}
                            onClick={(_, index) => {
                                if (index === 1) {
                                    onPendientesClick?.();
                                }
                            }}
                        >  
                            <Cell fill="#16847d" />
                            <Cell fill="#b8b8b8" />
                            {data.map((_, index) => (<Cell key={index}/>))}
                        </Pie>
                        <Tooltip
                            formatter={(value, name) => [
                                `${Number(value).toLocaleString("es-AR")} posiciones`,
                                String(name)
                            ]}
                            contentStyle={{
                                backgroundColor: "#ffffff",
                                border: "1px solid #d7e1e1",
                                borderRadius: "8px",
                                color: "#454545",
                                fontSize: "13px"
                            }}
                            itemStyle={{ color: "#11322b" }}
                            labelStyle={{ color: "#11322b" }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className={styles.coberturaDonutCenter}>
                    <strong>{porcentajeCobertura.toFixed(2)}%</strong>
                    <span> cubierto </span>
                </div>
            </div>
        </div>
    );
};

export default CoberturaDonut;