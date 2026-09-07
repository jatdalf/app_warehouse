import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import styles from "./RenaultInventarioCobertura.module.css";

interface CoberturaDonutProps {
    inventariadas: number;
    pendientes: number;
    porcentajeCobertura: number;
    mesIncorporado?: string | null;
    historicoDesdeCache?: boolean;
    onPendientesClick?: () => void;
}

const CoberturaDonut = ({
    inventariadas,
    pendientes,
    porcentajeCobertura,
    mesIncorporado,
    historicoDesdeCache,
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

    const nombreMes = (mes: string | null | undefined): string => {
        if (!mes) {
            return "";
        }
        const numeroMes = Number(mes.split("-")[1]);
        const nombres = ["", "enero", "febrero", "marzo", "abril", "mayo", "junio",
            "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre" ];
        return nombres[numeroMes] ?? "";
    };

    return (
        <div className={styles.coberturaDonutWrapper}>
            <div className={styles.coberturaDonut}>
                {historicoDesdeCache ? (
                    <div className={styles.historicoCargado}>✓ histórico cargado</div>
                ) : mesIncorporado ? (
                    <div key={mesIncorporado} className={styles.mesIncorporado}>
                        + {nombreMes(mesIncorporado)}
                    </div>
                ) : null}
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