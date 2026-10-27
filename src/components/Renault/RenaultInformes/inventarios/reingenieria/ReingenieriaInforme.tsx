import { useMemo } from "react";
import type {ReingenieriaData,} from "../../../../../readers/RenaultReingenieriaReader";
import styles from "./ReingenieriaInforme.module.css";

interface Props {
    data: ReingenieriaData;
    desde: Date;
    hasta: Date;
}

interface Fila {
    fecha: Date;
    primera: number;
    segunda: number;
}

interface TablaProps {
    titulo: string;
    primeraColumna: string;
    segundaColumna: string;
    filas: Fila[];
    variante: "azul" | "marron";
}

const numero = (valor: number) => valor.toLocaleString("es-AR");

const Tabla = ({titulo, primeraColumna, segundaColumna, filas, variante,}: TablaProps) => {
    const totalPrimera = filas.reduce((total, fila) => total + fila.primera, 0,);
    const totalSegunda = filas.reduce((total, fila) => total + fila.segunda, 0,);

    return (
        <div className={`${styles.block} ${styles[variante]}`}>
            <h4>{titulo}</h4>

            {filas.length === 0 ? (
                <p className={styles.empty}>
                    No hay registros para este período.
                </p>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>{primeraColumna}</th>
                                <th>{segundaColumna}</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filas.map(fila => (
                                <tr key={fila.fecha.getTime()}>
                                    <td>
                                        {fila.fecha.toLocaleDateString("es-AR")}
                                    </td>
                                    <td>{numero(fila.primera)}</td>
                                    <td>{numero(fila.segunda)}</td>
                                </tr>
                            ))}
                        </tbody>

                        <tfoot>
                            <tr>
                                <td>TOTAL</td>
                                <td>{numero(totalPrimera)}</td>
                                <td>{numero(totalSegunda)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}
        </div>
    );
};

function agruparPorDia(filas: Fila[], desde: Date, hasta: Date): Fila[] {
    const inicio = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate(),);
    const fin = new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate(), 23, 59, 59, 999,);
    const dias = new Map<number, Fila>();

    for (const fila of filas) {
        if (Number.isNaN(fila.fecha.getTime()) || fila.fecha < inicio || fila.fecha > fin) {
            continue;
        }

        const fecha = new Date(fila.fecha.getFullYear(), fila.fecha.getMonth(), fila.fecha.getDate(),);
        const clave = fecha.getTime();
        const dia = dias.get(clave) ?? {fecha, primera: 0, segunda: 0,};
        dia.primera += fila.primera;
        dia.segunda += fila.segunda;
        dias.set(clave, dia);
    }

    return [...dias.values()].sort((a, b) => a.fecha.getTime() - b.fecha.getTime(),);
}

const ReingenieriaInforme = ({ data, desde, hasta }: Props) => {
    const compactacion = useMemo(() => agruparPorDia(
            data.compactacion.map(item => ({fecha: item.fecha, primera: item.trabajadas, segunda: item.liberadas,})),
            desde, hasta,), [data.compactacion, desde, hasta],);

    const mapaCalor = useMemo(() => agruparPorDia(data.mapaCalor.map(item => ({
            fecha: item.fecha, primera: item.bajadas, segunda: item.subidas,})),
            desde, hasta,),[data.mapaCalor, desde, hasta],);

    return (
        <section className={styles.container}>
            <h3 className={styles.title}>Reingeniería</h3>
            <Tabla
                titulo="Compactación de ubicaciones"
                primeraColumna="Ubicaciones trabajadas"
                segundaColumna="Ubicaciones liberadas"
                filas={compactacion}
                variante="azul"
            />

            <Tabla
                titulo="Mapa de calor"
                primeraColumna="Ubicaciones bajadas"
                segundaColumna="Ubicaciones subidas"
                filas={mapaCalor}
                variante="marron"
            />
        </section>
    );
};

export default ReingenieriaInforme;