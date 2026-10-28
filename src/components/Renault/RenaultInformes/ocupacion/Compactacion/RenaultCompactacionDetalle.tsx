import { Fragment, useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { useParams } from "react-router-dom";
import type { CompactacionCandidato } from "./CompactacionItem";
import CompactacionPropuesta from "./CompactacionPropuesta";
import styles from "./RenaultCompactacionDetalle.module.css";
import ocasaLogo from "../../../../../assets/OcasaLogoSmall.png";
import renaultLogo from "../../../../../assets/Renault01.png";

type EstadoPropuesta = "programada" | "pospuesta";
type ModoImpresion = "actual" | "programadas";

const RenaultCompactacionDetalle = () => {
    const { warehouse, storage } = useParams();

    const [materialExpandido, setMaterialExpandido] = useState<string | null>(
        null,
    );
    const [estados, setEstados] = useState<Record<string, EstadoPropuesta>>({});
    const [modoImpresion, setModoImpresion] =
        useState<ModoImpresion>("actual");

    const candidatos = useMemo<CompactacionCandidato[]>(() => {
        if (!storage || !warehouse) {
            return [];
        }

        const data = sessionStorage.getItem(
            `compactacion-${warehouse}-${storage}`,
        );

        if (!data) {
            return [];
        }

        try {
            return JSON.parse(data) as CompactacionCandidato[];
        } catch {
            return [];
        }
    }, [warehouse, storage]);

    // Separar las marcas por warehouse y storage.
    const claveCandidato = (candidato: CompactacionCandidato) =>
        `${warehouse}|${storage}|${candidato.material}`;

    const candidatoSeleccionado = candidatos.find(
        candidato => candidato.material === materialExpandido,
    );

    const programadas = candidatos.filter(
        candidato => estados[claveCandidato(candidato)] === "programada",
    );

    const totalLiberables = candidatos.reduce(
        (total, item) => total + item.ubicacionesLiberables,
        0,
    );

    const ubicacionesProgramadas = programadas.reduce(
        (total, item) => total + item.ubicacionesActuales,
        0,
    );

    const liberablesProgramadas = programadas.reduce(
        (total, item) => total + item.ubicacionesLiberables,
        0,
    );

    const candidatosImpresion =
        modoImpresion === "programadas"
            ? programadas
            : candidatoSeleccionado
                ? [candidatoSeleccionado]
                : [];

    const imprimirDetalle = candidatosImpresion.length > 0;

    // Tras imprimir o cancelar, Ctrl + P vuelve al modo individual.
    useEffect(() => {
        const finalizarImpresion = () => setModoImpresion("actual");

        window.addEventListener("afterprint", finalizarImpresion);

        return () => {
            window.removeEventListener("afterprint", finalizarImpresion);
        };
    }, []);

    const cambiarEstado = (
        candidato: CompactacionCandidato,
        estado: EstadoPropuesta | null,
    ) => {
        const clave = claveCandidato(candidato);

        setEstados(actuales => {
            const siguientes = { ...actuales };

            if (estado) {
                siguientes[clave] = estado;
            } else {
                delete siguientes[clave];
            }

            return siguientes;
        });
    };

    const imprimir = (modo: ModoImpresion) => {
        if (modo === "programadas" && programadas.length === 0) {
            return;
        }

        // Actualizar el contenido imprimible antes de abrir el diálogo.
        flushSync(() => setModoImpresion(modo));
        window.print();
    };

    return (
        <main
            className={`${styles.container} ${
                imprimirDetalle ? styles.imprimirPropuesta : ""
            }`}
        >
            <header className={styles.header}>
                <div className={styles.brandHeader}>
                    <img
                        src={renaultLogo}
                        alt="Renault"
                        className={styles.renaultLogo}
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
                        <strong>{formatNumber(candidatos.length)}</strong>
                    </div>

                    <div>
                        <span>Ubicaciones liberables</span>
                        <strong>{formatNumber(totalLiberables)}</strong>
                    </div>
                </div>
            </header>

            <div className={styles.notice}>
                💡 Estimación basada en la capacidad máxima actualmente
                observada para cada material dentro del Storage.
            </div>

            {candidatos.length === 0 ? (
                <div className={styles.empty}>
                    No hay información de compactación disponible para este
                    Storage.
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
                                const clave = claveCandidato(candidato);
                                const estado = estados[clave];
                                const abierto =
                                    materialExpandido === candidato.material;

                                const claseEstado =
                                    estado === "programada"
                                        ? styles.filaProgramada
                                        : estado === "pospuesta"
                                            ? styles.filaPospuesta
                                            : "";

                                return (
                                    <Fragment key={clave}>
                                        <tr
                                            className={`${styles.candidateRow} ${claseEstado}`}
                                            aria-expanded={abierto}
                                            onClick={() =>
                                                setMaterialExpandido(
                                                    abierto
                                                        ? null
                                                        : candidato.material,
                                                )
                                            }
                                        >
                                            <td className={styles.material}>
                                                {candidato.material}

                                                {estado && (
                                                    <span
                                                        className={
                                                            styles.estadoEtiqueta
                                                        }
                                                    >
                                                        {estado === "programada"
                                                            ? "Programada"
                                                            : "Pospuesta"}
                                                    </span>
                                                )}
                                            </td>

                                            <td>
                                                {formatNumber(
                                                    candidato.cantidadTotal,
                                                )}
                                            </td>
                                            <td>
                                                {formatNumber(
                                                    candidato.capacidadObservada,
                                                )}
                                            </td>
                                            <td>
                                                {formatNumber(
                                                    candidato.ubicacionesActuales,
                                                )}
                                            </td>
                                            <td>
                                                {formatNumber(
                                                    candidato.ubicacionesNecesarias,
                                                )}
                                            </td>
                                            <td>
                                                <span
                                                    className={styles.liberables}
                                                >
                                                    {formatNumber(
                                                        candidato.ubicacionesLiberables,
                                                    )}
                                                </span>
                                            </td>
                                            <td className={styles.expandCell}>
                                                <span
                                                    className={styles.expandIcon}
                                                >
                                                    {abierto ? "▲" : "▼"}
                                                </span>
                                            </td>
                                        </tr>

                                        {abierto && (
                                            <tr className={styles.detailRow}>
                                                <td colSpan={7}>
                                                    <CompactacionPropuesta
                                                        candidato={candidato}
                                                    />

                                                    <div
                                                        className={
                                                            styles.propuestaAcciones
                                                        }
                                                    >
                                                        <button
                                                            type="button"
                                                            className={
                                                                styles.imprimirIndividual
                                                            }
                                                            onClick={() =>
                                                                imprimir("actual")
                                                            }
                                                        >
                                                            🖨️ Imprimir esta
                                                        </button>

                                                        {estado && (
                                                            <button
                                                                type="button"
                                                                className={
                                                                    styles.quitarButton
                                                                }
                                                                onClick={() =>
                                                                    cambiarEstado(
                                                                        candidato,
                                                                        null,
                                                                    )
                                                                }
                                                            >
                                                                Quitar selección
                                                            </button>
                                                        )}

                                                        <button
                                                            type="button"
                                                            className={
                                                                styles.posponerButton
                                                            }
                                                            aria-pressed={
                                                                estado ===
                                                                "pospuesta"
                                                            }
                                                            onClick={() =>
                                                                cambiarEstado(
                                                                    candidato,
                                                                    "pospuesta",
                                                                )
                                                            }
                                                        >
                                                            Posponer
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className={
                                                                styles.programarButton
                                                            }
                                                            aria-pressed={
                                                                estado ===
                                                                "programada"
                                                            }
                                                            onClick={() =>
                                                                cambiarEstado(
                                                                    candidato,
                                                                    "programada",
                                                                )
                                                            }
                                                        >
                                                            {estado ===
                                                            "programada"
                                                                ? "✓ Programada"
                                                                : "Programar"}
                                                        </button>
                                                    </div>
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

            {programadas.length > 0 && (
                <div className={styles.trabajosBar}>
                    <div className={styles.trabajosResumen}>
                        <strong>
                            Compactaciones a realizar: {programadas.length}
                        </strong>

                        <span>
                            {formatNumber(ubicacionesProgramadas)} ubicaciones
                            a analizar ·{" "}
                            {formatNumber(liberablesProgramadas)} potencialmente
                            liberables
                        </span>
                    </div>

                    <button
                        type="button"
                        className={styles.imprimirLoteButton}
                        onClick={() => imprimir("programadas")}
                    >
                        🖨️ Imprimir seleccionadas ({programadas.length})
                    </button>
                </div>
            )}

            <section className={styles.printOnly}>
                {candidatosImpresion.map(candidato => (
                    <article
                        key={`print-${claveCandidato(candidato)}`}
                        className={styles.printCandidate}
                    >
                        <header className={styles.printJobHeader}>
                            <img src={renaultLogo} alt="Renault" className={styles.renaultLogo}/>
                            <div className={styles.heading}>
                                <h2>Orden de compactación</h2>
                                <p>{warehouse === "W1" ? "W1 · REP" : "W2 · BsAs"}{" · "} Storage {storage}</p>
                            </div>
                            <img src={ocasaLogo} alt="OCASA" className={styles.ocasaLogo}/>
                        </header>
                        <div className={styles.printMetrics}>
                            <span>
                                Stock total:{" "}<strong>{formatNumber(candidato.cantidadTotal)}</strong>
                            </span>
                            <span>
                                Capacidad observada:{" "}
                                <strong>{formatNumber(candidato.capacidadObservada,)}</strong>
                            </span>
                            <span>
                                Ubicaciones actuales:{" "}<strong>{formatNumber(candidato.ubicacionesActuales,)}</strong>
                            </span>

                            <span>
                                Ubicaciones necesarias:{" "}
                                <strong>{formatNumber(candidato.ubicacionesNecesarias,)}</strong>
                            </span>
                        </div>
                        <CompactacionPropuesta candidato={candidato} />
                    </article>
                ))}
            </section>
        </main>
    );
};

function formatNumber(value: number): string {
    return value.toLocaleString("es-AR");
}

export default RenaultCompactacionDetalle;