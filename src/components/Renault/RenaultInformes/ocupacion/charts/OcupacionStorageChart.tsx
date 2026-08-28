import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

import type { OcupacionStorage } from "../builders/OcupacionBuilder";
import styles from "./OcupacionStorageChart.module.css";

interface Props {
    items: OcupacionStorage[];
}

const OcupacionStorageChart: React.FC<Props> = ({
    items
}) => {

    const data = items
        .map(item => ({
            storage: item.storage,
            descripcion: item.descripcion,
            ocupadas: item.ocupadas,
            libres: item.libres,
            total: item.totalUbicaciones,
            porcentajeOcupacion:
                item.porcentajeOcupacion
        }))
        .sort(
            (a, b) =>
                b.porcentajeOcupacion -
                a.porcentajeOcupacion
        );


    return (
        <section className={styles.container}>

            <h2 className={styles.title}>
                Ocupación por Storage
            </h2>

            <div className={styles.chartWrapper}>

                <ResponsiveContainer
                    width="100%"
                    height={Math.max(
                        420,
                        data.length * 42
                    )}
                >

                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{
                            top: 10,
                            right: 30,
                            left: 15,
                            bottom: 10
                        }}
                    >

                        <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={false}
                        />

                        <XAxis
                            type="number"
                            tickFormatter={formatNumber}
                        />

                        <YAxis
                            type="category"
                            dataKey="storage"
                            width={65}
                            tick={{
                                fontSize: 12
                            }}
                        />

                        <Tooltip
                            content={
                                <CustomTooltip />
                            }
                        />

                        <Legend />

                        <Bar
                            dataKey="ocupadas"
                            name="Ocupadas"
                            stackId="capacidad"
                            fill="#2b8179"
                            radius={[
                                6,
                                0,
                                0,
                                6
                            ]}
                        />

                        <Bar
                            dataKey="libres"
                            name="Libres"
                            stackId="capacidad"
                            fill="#dce8e6"
                            radius={[
                                0,
                                6,
                                6,
                                0
                            ]}
                        />

                    </BarChart>

                </ResponsiveContainer>

            </div>

        </section>
    );
};


interface TooltipProps {
    active?: boolean;

    payload?: Array<{
        payload: {
            storage: string;
            descripcion: string;
            ocupadas: number;
            libres: number;
            total: number;
            porcentajeOcupacion: number;
        };
    }>;
}


const CustomTooltip: React.FC<TooltipProps> = ({
    active,
    payload
}) => {

    if (
        !active ||
        !payload ||
        payload.length === 0
    ) {
        return null;
    }


    const item =
        payload[0].payload;


    return (
        <div className={styles.tooltip}>

            <div className={styles.tooltipStorage}>
                {item.storage}
            </div>

            <div className={styles.tooltipDescription}>
                {item.descripcion}
            </div>

            <div>
                Total:
                <strong>
                    {" "}
                    {formatNumber(item.total)}
                </strong>
            </div>

            <div>
                Ocupadas:
                <strong>
                    {" "}
                    {formatNumber(
                        item.ocupadas
                    )}
                </strong>
            </div>

            <div>
                Libres:
                <strong>
                    {" "}
                    {formatNumber(
                        item.libres
                    )}
                </strong>
            </div>

            <div>
                Ocupación:
                <strong>
                    {" "}
                    {formatPercent(
                        item.porcentajeOcupacion
                    )}
                </strong>
            </div>

        </div>
    );
};


function formatNumber(
    value: number
): string {

    return value.toLocaleString(
        "es-AR"
    );
}


function formatPercent(
    value: number
): string {

    return value.toLocaleString(
        "es-AR",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ) + "%";
}


export default OcupacionStorageChart;