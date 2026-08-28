import type { CompactacionCandidato } from "./CompactacionItem";
import styles from "./CompactacionPropuesta.module.css";

interface Props {
    candidato: CompactacionCandidato;
}

const CompactacionPropuesta = ({ candidato }: Props) => {

    return (
        <div className={styles.container}>

            <div className={styles.header}>
                <div>
                    <h3>
                        Propuesta de compactación
                    </h3>

                    <p>
                        Material{" "}
                        <strong>
                            {candidato.material}
                        </strong>
                    </p>
                </div>

                <div className={styles.resultado}>
                    <strong>
                        {candidato.ubicacionesLiberables}
                    </strong>

                    <span>
                        ubicaciones potencialmente liberables
                    </span>
                </div>
            </div>


            <div className={styles.comparacion}>

                <div className={styles.columna}>

                    <div className={styles.columnaTitulo}>
                        ANTES
                    </div>

                    {candidato.propuesta.map(item => (

                        <div
                            key={item.ubicacion}
                            className={styles.ubicacion}
                        >
                            <span className={styles.nombreUbicacion}>
                                {item.ubicacion}
                            </span>

                            <span className={styles.cantidad}>
                                {formatNumber(
                                    item.cantidadActual
                                )}
                            </span>
                        </div>

                    ))}

                </div>


                <div className={styles.flecha}>
                    →
                </div>


                <div className={styles.columna}>

                    <div className={styles.columnaTitulo}>
                        PROPUESTA
                    </div>

                    {candidato.propuesta.map(item => (

                        <div
                            key={item.ubicacion}
                            className={styles.ubicacion}
                        >
                            <span className={styles.nombreUbicacion}>
                                {item.ubicacion}
                            </span>

                            {item.liberada ? (

                                <span className={styles.libre}>
                                    ✓ LIBRE
                                </span>

                            ) : (

                                <span className={styles.cantidad}>
                                    {formatNumber(
                                        item.cantidadPropuesta
                                    )}
                                </span>

                            )}
                        </div>

                    ))}

                </div>

            </div>


            {candidato.movimientos.length > 0 && (

                <div className={styles.movimientos}>

                    <h4>
                        Movimientos sugeridos
                    </h4>

                    <div className={styles.movimientosLista}>

                        {candidato.movimientos.map(
                            (movimiento, index) => (

                                <div
                                    key={`${movimiento.desde}-${movimiento.hacia}-${index}`}
                                    className={styles.movimiento}
                                >

                                    <span className={styles.movimientoUbicacion}>
                                        {movimiento.desde}
                                    </span>

                                    <span className={styles.movimientoFlecha}>
                                        →
                                    </span>

                                    <span className={styles.movimientoUbicacion}>
                                        {movimiento.hacia}
                                    </span>

                                    <strong>
                                        {formatNumber(
                                            movimiento.cantidad
                                        )}
                                    </strong>

                                    <span className={styles.unidades}>
                                        unidades
                                    </span>

                                </div>

                            )
                        )}

                    </div>

                </div>

            )}

        </div>
    );
};


function formatNumber(value: number): string {
    return value.toLocaleString("es-AR");
}

export default CompactacionPropuesta;