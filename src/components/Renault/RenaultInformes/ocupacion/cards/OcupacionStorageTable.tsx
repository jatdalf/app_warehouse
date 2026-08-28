import styles from "./OcupacionStorageTable.module.css";
import type { OcupacionStorage } from "../builders/OcupacionBuilder";
import type { CompactacionStorage, CompactacionCandidato } from "../Compactacion/CompactacionItem";

interface Props {
    items: OcupacionStorage[];
    compactacion: CompactacionStorage[];
    candidatos: CompactacionCandidato[];
}

const OcupacionStorageTable: React.FC<Props> = ({items, compactacion, candidatos}) => {
    const compactacionPorStorage = new Map(compactacion.map(item => [item.storage, item]));
    const abrirDetalleCompactacion = (storage: string) => {
        const candidatosStorage = candidatos.filter(candidato => candidato.storage === storage);
        sessionStorage.setItem(`compactacion-${storage}`, JSON.stringify(candidatosStorage));
        window.open( `/renault/ocupacion/compactacion/${encodeURIComponent(storage)}`, "_blank");
    };
    return (
        <section className={styles.container}>
            <h2 className={styles.title}>Ocupación por Storage</h2>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Storage</th>
                            <th>Descripción</th>
                            <th>Total</th>
                            <th>Ocupadas</th>
                            <th>Libres</th>
                            <th>% Ocupación</th>
                            <th>Capacidad</th>
                            <th>Oportunidades</th>
                        </tr>
                    </thead>

                    <tbody>
                        {items.map(item => {const oportunidad = compactacionPorStorage.get(item.storage);
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
            <div
                className={styles.progressFill}
                style={{
                    width:
                        `${Math.min(
                            item.porcentajeOcupacion,
                            100
                        )}%`
                }}
            />
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