import { useParams } from "react-router-dom";
import type {CompactacionCandidato } from "./CompactacionItem";
import styles from "./RenaultCompactacionDetalle.module.css";
import { Fragment, useMemo, useState } from "react";
import CompactacionPropuesta from "./CompactacionPropuesta";
import ocasaLogo from "../../../../../assets/OcasaLogoSmall.png";
import renaultVideo from "../../../../../assets/renault-claro.mp4";
import renaultImagen from "../../../../../assets/renault-claro.png";

const RenaultCompactacionDetalle = () => {
    const {warehouse, storage} = useParams();
    const [materialExpandido, setMaterialExpandido] = useState<string | null>(null);
    const candidatos = useMemo<CompactacionCandidato[]>(() => {
        if (!storage) {
            return [];
        }
        const data = sessionStorage.getItem(`compactacion-${warehouse}-${storage}`);
        if (!data) {
            return [];
        }
        try {
            return JSON.parse(data) as CompactacionCandidato[];
        } catch {
            return [];
        }
    }, [warehouse, storage]);
    const totalLiberables = candidatos.reduce((total, item) => total + item.ubicacionesLiberables, 0);
    const candidatoSeleccionado = candidatos.find(candidato => candidato.material === materialExpandido,);

    return (
        <main className={`${styles.container} ${candidatoSeleccionado ? styles.imprimirPropuesta : ""}`}>
            <header className={styles.header}>
                <div className={styles.brandHeader}>
                    <video
                        className={`${styles.renaultLogo} ${styles.logoAnimado}`}
                        autoPlay
                        muted
                        loop
                        playsInline
                        poster={renaultImagen}
                        aria-label="Renault"
                    >
                        <source src={renaultVideo} type="video/mp4" />
                    </video>

                    <img
                        src={renaultImagen}
                        alt="Renault"
                        className={`${styles.renaultLogo} ${styles.logoEstatico}`}
                    />

                    <div className={styles.heading}>
                        <h1>Oportunidades de compactación</h1>
                        <p>
                            {warehouse === "W1" ? "W1 · REP" : "W2 · BsAs"}
                            {" · "} Storage {storage}
                        </p>
                    </div>

                    <img
                        src={ocasaLogo}
                        alt="OCASA"
                        className={styles.ocasaLogo}
                    />
                </div>
                <div className={styles.summary}>
                    <div>
                        <span>Materiales candidatos</span>
                        <strong>{candidatos.length}</strong>
                    </div>
                    <div>
                        <span>Ubicaciones liberables</span>
                        <strong>{totalLiberables}</strong>
                    </div>
                </div>
            </header>

            <div className={styles.notice}>
                💡 Estimación basada en la capacidad
                máxima actualmente observada para
                cada material dentro del Storage.
            </div>

            {candidatos.length === 0 ? (
                <div className={styles.empty}>
                    No hay información de compactación
                    disponible para este Storage.
                </div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Material</th>
                                <th>Stock total</th>
                                <th>Capacidad observada</th>
                                <th>Ubicaciones actuales</th>
                                <th>Ubicaciones necesarias</th>
                                <th>Ubicaciones liberables</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {candidatos.map(candidato => {
                    const abierto = materialExpandido === candidato.material;
                    return (
                        <Fragment key={`${candidato.storage}-${candidato.material}`}>
                            <tr
                                className={styles.candidateRow} aria-expanded={abierto}
                                onClick={() => setMaterialExpandido(abierto ? null : candidato.material)}
                            >
                                <td className={styles.material}>
                                    {candidato.material}
                                </td>
                                <td>
                                    {formatNumber(candidato.cantidadTotal)}
                                </td>
                                <td>
                                    {formatNumber(candidato.capacidadObservada)}
                                </td>
                                <td>
                                    {formatNumber(candidato.ubicacionesActuales)}
                                </td>
                                <td>
                                    {formatNumber(candidato.ubicacionesNecesarias)}
                                </td>
                                <td>
                                    <span className={styles.liberables}>
                                        {formatNumber(candidato.ubicacionesLiberables)}
                                    </span>
                                </td>
                                <td className={styles.expandCell}>
                                    <span className={styles.expandIcon}>{abierto ? "▲" : "▼"}</span>
                                </td>
                            </tr>

                            {abierto && (
                                <tr className={styles.detailRow}>
                                    <td colSpan={7}>
                                        <CompactacionPropuesta candidato={candidato}/>
                                    </td>
                                </tr>
                            )}
                        </Fragment>
                    );
                })}
                        </tbody>
                    </table>
                </div>
            )}
            <section className={styles.printOnly}>
            {candidatoSeleccionado && (
                <article className={styles.printCandidate}>
                    <div className={styles.printMetrics}>
                        <span>
                            Stock total:{" "}
                            <strong>{formatNumber(candidatoSeleccionado.cantidadTotal)}</strong>
                        </span>
                        <span>
                            Capacidad observada:{" "}
                            <strong>
                                {formatNumber(candidatoSeleccionado.capacidadObservada,)}
                            </strong>
                        </span>
                        <span>
                            Ubicaciones actuales:{" "}
                            <strong>
                                {formatNumber(candidatoSeleccionado.ubicacionesActuales,)}
                            </strong>
                        </span>

                        <span>
                            Ubicaciones necesarias:{" "}
                            <strong>
                                {formatNumber(candidatoSeleccionado.ubicacionesNecesarias,)}
                            </strong>
                        </span>
                    </div>
                    <CompactacionPropuesta candidato={candidatoSeleccionado}/>
                </article>
            )}
        </section>
        </main>
    );
};

function formatNumber(value: number): string {
    return value.toLocaleString("es-AR");
}

export default RenaultCompactacionDetalle;