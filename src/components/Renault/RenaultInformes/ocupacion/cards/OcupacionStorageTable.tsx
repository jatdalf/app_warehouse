import styles from "./OcupacionStorageTable.module.css";
import type { OcupacionStorage } from "../builders/OcupacionBuilder";
import type { CompactacionStorage, CompactacionCandidato } from "../Compactacion/CompactacionItem";
import { useState } from "react";


type Warehouse = "W1" | "W2";
type ColumnaOrden =
    | "storage"
    | "descripcion"
    | "total"
    | "ocupadas"
    | "libres"
    | "ocupacion"
    | "capacidad"
    | "oportunidades";

type DireccionOrden = "asc" | "desc";

interface Props {
    items: OcupacionStorage[];
    compactacion: CompactacionStorage[];
    candidatos: CompactacionCandidato[];
    warehouse: Warehouse;
}

const OcupacionStorageTable: React.FC<Props> = ({items, compactacion, candidatos, warehouse}) => {
    const compactacionPorStorage = new Map(compactacion.map(item => [item.storage, item]));
    const [orden, setOrden] = useState<{columna: ColumnaOrden; direccion: DireccionOrden;} | null>(null);
    const ordenarPor = (columna: ColumnaOrden) => {
        setOrden(actual => ({columna, direccion: actual?.columna === columna
                    ? actual.direccion === "desc" ? "asc" : "desc"
                    : columna === "storage" || columna === "descripcion" ? "asc" : "desc",}));
    };

    const valorOrden = (item: OcupacionStorage, columna: ColumnaOrden,): string | number => {
        switch (columna) {
            case "storage":
                return item.storage;
            case "descripcion":
                return item.descripcion;
            case "total":
                return item.totalUbicaciones;
            case "ocupadas":
                return item.ocupadas;
            case "libres":
                return item.libres;
            case "ocupacion":
            case "capacidad":
                return item.porcentajeOcupacion;
            case "oportunidades":
                return compactacionPorStorage.get(item.storage) ?.ubicacionesLiberables ?? 0;
        }
    };

    const itemsOrdenados = [...items].sort((a, b) => {
        if (!orden) {
            return 0;
        }
        const valorA = valorOrden(a, orden.columna);
        const valorB = valorOrden(b, orden.columna);
        const diferencia = typeof valorA === "number" && typeof valorB === "number"
            ? valorA - valorB : String(valorA).localeCompare(String(valorB),
                "es", { numeric: true, sensitivity: "base" },);

        return orden.direccion === "asc" ? diferencia : -diferencia;
    });

    const columnas: { columna: ColumnaOrden; titulo: string }[] = [
        { columna: "storage", titulo: "Storage" },
        { columna: "descripcion", titulo: "Descripción" },
        { columna: "total", titulo: "Total" },
        { columna: "ocupadas", titulo: "Ocupadas" },
        { columna: "libres", titulo: "Libres" },
        { columna: "ocupacion", titulo: "% Ocupación" },
        { columna: "capacidad", titulo: "Capacidad" },
        { columna: "oportunidades", titulo: "Oportunidades" },
    ];
    const abrirDetalleCompactacion = ( storage: string) => {
        const candidatosStorage = candidatos.filter(candidato => candidato.storage === storage);
        sessionStorage.setItem(`compactacion-${warehouse}-${storage}`, JSON.stringify(candidatosStorage));
        window.open(`/renault/ocupacion/compactacion/${warehouse}/${encodeURIComponent(storage)}`, "_blank");
    };
    return (
        <section className={styles.container}>
            <h2 className={styles.title}>Ocupación por Storage</h2>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                    <tr>
                    {columnas.map(({ columna, titulo }) => (
                    <th key={columna} scope="col" aria-sort={orden?.columna === columna ? orden.direccion === "asc" ? "ascending" : "descending" : "none"}>
                    <button type="button" className={styles.sortButton} onClick={() => ordenarPor(columna)}>
                        {titulo}
                        <span className={styles.sortIcon} aria-hidden="true">
                        {orden?.columna === columna ? orden.direccion === "asc" ? "↑" : "↓" : "↕"}
                        </span>
                    </button>
                    </th>))}
                    </tr>
                </thead>
                    <tbody>
                       {itemsOrdenados.map(item => {const oportunidad = compactacionPorStorage.get(item.storage);
            return (
                <tr key={item.storage}>     
                    <td className={styles.storage}>{item.storage}</td>
                    <td className={styles.description}>{item.descripcion}</td>
                    <td>{formatNumber(item.totalUbicaciones)}</td>
                    <td>{formatNumber(item.ocupadas)}</td>
                    <td>{formatNumber(item.libres)}</td>
                    <td className={styles.percent}>{formatPercent(item.porcentajeOcupacion)}</td>

            <td>
                <div className={styles.capacityCell}>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{width: `${Math.min(item.porcentajeOcupacion, 100)}%`}}/>
                    </div>
                    <span className={styles.capacityText}>
                        {item.ocupadas.toLocaleString("es-AR")}
                        {" / "}
                        {item.totalUbicaciones.toLocaleString("es-AR")}
                    </span>
                </div>
            </td>
            <td className={styles.oportunidadesCell}>
                {oportunidad && oportunidad.ubicacionesLiberables > 0 ? (
                <button type="button" className={styles.compactacionBadge}
                    title={
                        `${oportunidad.materialesCandidatos} materiales candidatos · ` +
                        `${oportunidad.ubicacionesLiberables} ubicaciones potencialmente liberables`
                    }
                    onClick={() => abrirDetalleCompactacion(item.storage)}
                >
                    <span>💡</span>
                    <strong> {oportunidad.ubicacionesLiberables} </strong>
                </button>
                ) : (<span className={styles.sinOportunidad}> — </span>)}
            </td>
       
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

function formatNumber(
    value: number
): string { return value.toLocaleString("es-AR");}


function formatPercent(value: number): string {

    return value.toLocaleString("es-AR", {minimumFractionDigits: 2, maximumFractionDigits: 2}) + "%";
}

export default OcupacionStorageTable;