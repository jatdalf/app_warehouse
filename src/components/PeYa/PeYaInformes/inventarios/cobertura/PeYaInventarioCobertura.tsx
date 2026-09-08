import { useMemo, useState } from "react";
import {Cell, Pie, PieChart, ResponsiveContainer, Tooltip} from "recharts";
import { usePeYaInventariosData } from "../hooks/usePeYaInventariosData";
import { PeYaInventarioCoberturaBuilder } from "../builders/PeYaInventarioCoberturaBuilder";
import styles from "./PeYaInventarioCobertura.module.css";

const PeYaInventarioCobertura = () => {
    const [mes, setMes] = useState<number | null>(null);
    const [mostrarPendientes, setMostrarPendientes] = useState(false);
    const {inventarios, locations, loading, error} = usePeYaInventariosData();
    const cobertura = useMemo(() => {
        return PeYaInventarioCoberturaBuilder.build(
            inventarios,
            locations,
            {year: 2026, mes}
        );
    }, [inventarios, locations, mes]);
    const porcentajePendiente = 100 - cobertura.porcentajeCobertura;
    if (loading) {
        return (
            <div className={styles.message}>
                Cargando avance de inventarios...
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.error}>
                {error}
            </div>
        );
    }

    const donutData = [
        {
            name: "Inventariadas",
            value: cobertura.posicionesInventariadas
        },{
            name: "Pendientes",
            value: cobertura.posicionesPendientes
        }
    ];

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <h2 className={styles.title}>🧾 🖊️ Ubicaciones inventariadas</h2>
            </div>

            <div className={styles.controls}>
                <div className={styles.controlGroup}>
                    <span>Visualizar</span>
                    <select className={styles.select} value={mes ?? ""} onChange={event => {
                        const value = event.target.value;
                        setMes(value === "" ? null : Number(value));
                    }}>
                        <option value="">Acumulado 2026</option>
                        <option value="6">Julio</option>
                        <option value="7">Agosto</option>
                        <option value="8">Septiembre</option>
                    </select>
                </div>
            </div>

            <main className={styles.content}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>
                        {mes === null
                            ? "Relevado anual acumulado 2026" : "Relevado del mes seleccionado"}
                    </h3>
                    <p className={styles.availableData}>Datos disponibles: julio → septiembre</p>
                </div>

                <div className={styles.cards}>
                    <div className={styles.card}>
                        <span className={styles.cardTitle}>Total posiciones</span>
                        <strong className={styles.cardValue}>
                            {cobertura.totalPosiciones.toLocaleString("es-AR")}
                        </strong>
                        <span className={styles.cardText}>Ubicaciones inventariables</span>
                    </div>

                    <div className={styles.card}>
                        <span className={styles.cardTitle}>Inventariadas</span>
                        <strong className={styles.cardValue}>
                            {cobertura.posicionesInventariadas.toLocaleString("es-AR")}
                        </strong>
                        <span className={styles.cardPercent}>
                            {cobertura.porcentajeCobertura.toFixed(2)}%
                        </span>
                        <span className={styles.cardText}>del universo seleccionado</span>
                    </div>

                    <div className={styles.card}>
                        <span className={styles.cardTitle}>Pendientes</span>
                        <strong className={styles.cardValue}>
                            {cobertura.posicionesPendientes.toLocaleString("es-AR")}
                        </strong>
                        <span className={styles.cardPercent}>{porcentajePendiente.toFixed(2)}%</span>
                        <span className={styles.cardText}>aún sin inventariar</span>
                    </div>
                </div>

                <div className={styles.donutWrapper}>
                    <div className={styles.donut}>
                        <ResponsiveContainer width="100%" height="100%" >
                            <PieChart>
                                <Pie
                                    data={donutData}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius="65%"
                                    outerRadius="92%"
                                    paddingAngle={2}
                                    stroke="#ffffff"
                                    strokeWidth={2}
                                    onClick={(_, index) => {
                                        if (index === 1) {setMostrarPendientes(true);}
                                    }}
                                >
                                    <Cell fill="#16847d" />
                                    <Cell fill="#b8b8b8" style={{ cursor: "pointer" }}/>
                                </Pie>

                                <Tooltip
                                    formatter={(value, name) => [
                                        `${Number(value).toLocaleString( "es-AR")} posiciones`,
                                        String(name)
                                    ]}
                                    contentStyle={{
                                        backgroundColor: "#ffffff",
                                        border: "1px solid #d7e1e1",
                                        borderRadius: "8px",
                                        color: "#454545",
                                        fontSize: "13px"
                                    }}
                                    itemStyle={{color: "#11322b"}}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className={styles.donutCenter}>
                            <strong>{cobertura.porcentajeCobertura.toFixed(2)} %</strong>
                            <span>cubierto</span>
                        </div>
                    </div>
                    {mostrarPendientes && (
                    <div className={styles.pendingDetail}>
                        <div className={styles.pendingHeader}>
                            <div>
                                <h3>Ubicaciones pendientes de inventariar</h3>
                                <span>
                                    {cobertura.ubicacionesPendientes.length.toLocaleString(
                                        "es-AR")}{" "}ubicaciones
                                </span>
                            </div>

                            <button type="button" className={styles.closeButton} onClick={() =>
                                    setMostrarPendientes(false)}>
                                ✕
                            </button>
                        </div>

                        <div className={styles.pendingGrid}>
                            {cobertura.ubicacionesPendientes.map(
                                ubicacion => (
                                    <div key={ubicacion} className={styles.pendingLocation}>
                                        {ubicacion}
                                    </div>
                                )
                            )}
                        </div>
                    </div>)}
                </div>
            </main>
        </div>
    );
};

export default PeYaInventarioCobertura;