import { useMemo } from "react";
import { useParams } from "react-router-dom";
import type { IngresoItem } from "../ingresos/IngresoItem";
import type { EgresoItem } from "../egresos/EgresoItem";
import type { OcupacionItem } from "../ocupacion/OcupacionItem";
import type { FeriadoItem } from "../inventarios/FeriadoItem";
import { ClaveControlDetalleBuilder } from "../claveControl/ClaveControlDetalleBuilder";
import styles from "./PeYaClaveControlDetalle.module.css";
import * as XLSX from "xlsx";

type TipoDetalle = | "ingresos" | "egreso-normal" | "egreso-especial" | "pallet-adicional";

interface StoredIngresos {
    ingresos: IngresoItem[];
}

interface StoredEgresos {
    egresos: EgresoItem[];
    feriados: FeriadoItem[];
}

interface StoredOcupacion {
    ocupacion: OcupacionItem[];
}

const PeYaClaveControlDetalle = () => {
    const {tipo, month} = useParams<{tipo: TipoDetalle; month: string;}>();
    /* Label del mes seleccionado. */
    const mesLabel = useMemo(() => {
        if (!month) {
            return "";
        }
        const [yearText, monthText] = month.split("-");
        const year = Number(yearText);
        const monthIndex = Number(monthText);
        if (Number.isNaN(year) || Number.isNaN(monthIndex)) {
            return "";
        }
        const fecha = new Date(year, monthIndex, 1);
        const texto = new Intl.DateTimeFormat("es-AR", {month: "long", year: "numeric"}).format(fecha);
        return (texto.charAt(0).toUpperCase() + texto.slice(1));
    }, [month]);
    /* =========================================
     * PALLET ADICIONAL
     * ========================================= */
    const ocupacionDetalle = useMemo(() => {
        if (tipo !== "pallet-adicional" || !month) {
            return null;
        }
        const key = `clave-control-pallet-adicional-${month}`;
        const stored = sessionStorage.getItem(key);
        if (!stored) {
            return null;
        }
        try {
            const parsed = JSON.parse(stored) as StoredOcupacion;
            /* JSON convierte Date a string. Hay que reconstruirlo. */
            const ocupacion = parsed.ocupacion.map(item => ({...item, fecha: new Date(item.fecha)}));
            return (ClaveControlDetalleBuilder.buildOcupacion(ocupacion));
        } catch (error) {
            console.error("Error leyendo detalle de ocupación:", error);
            return null;
        }
    }, [tipo, month]);
    /* =========================================
     * EGRESOS
     * ========================================= */
    const egresosDetalle = useMemo(() => {
        if (tipo !== "egreso-normal" && tipo !== "egreso-especial") {
            return [];
        }
        if (!month) {
            return [];
        }
        const key = `clave-control-${tipo}-${month}`;
        const stored = sessionStorage.getItem(key);
        if (!stored) {
            return [];
        }
        try {
            const parsed = JSON.parse(stored) as StoredEgresos;
            const egresos = parsed.egresos.map(item => ({
                ...item, fecha: new Date(item.fecha)}));
            const feriados = parsed.feriados.map(item => ({
                ...item, fecha: new Date(item.fecha)}));
            const detalle = ClaveControlDetalleBuilder.buildEgresos(egresos, feriados);
            if (tipo === "egreso-especial") {
                return detalle.filter(item => item.especial);
            }
            return detalle.filter(item => !item.especial);
        } catch (error) {
            console.error("Error leyendo detalle de egresos:", error);
            return [];
        }
    }, [tipo, month]);

    const totalEgresos = useMemo(() => {
        return egresosDetalle.reduce((total, item) => total + item.bultos, 0);
    }, [egresosDetalle]);
    /* =========================================
     * TITULO
     * ========================================= */

    const titulo = useMemo(() => {
        switch (tipo) {
            case "ingresos":
                return "ZN22 · Ingreso por pallet";
            case "egreso-normal":
                return "YZ09 · Egreso por bulto";
            case "egreso-especial":
                return "YZ09 · Egreso por bulto";
            case "pallet-adicional":
                return "ZN24 · Pallet Adicional";
            default:
                return "Detalle de clave de control";
        }
    }, [tipo]);

    const ingresosDetalle = useMemo(() => {
        if (tipo !== "ingresos" || !month) {
            return [];
        }
        const key = `clave-control-ingresos-${month}`;
        const stored = sessionStorage.getItem(key);
        if (!stored) {
            return [];
        }
        try {
            const parsed = JSON.parse(stored) as StoredIngresos;
            return parsed.ingresos
                .map(item => ({...item, dateReceived: new Date(item.dateReceived)}))
                .filter(item => item.toLoc.trim() !== "").sort(
                    (a, b) => a.dateReceived.getTime() - b.dateReceived.getTime());
        } catch (error) {
            console.error("Error leyendo detalle de ingresos:", error );
            return [];
        }
    }, [tipo, month]);
    const totalIngresos = ingresosDetalle.length;
    const descargarRespaldo = () => {
        if (!tipo || !month) {
            return;
        }
        let filas: Record<string, string | number>[] = [];
        let nombreArchivo = "respaldo-clave-control.xlsx";
        if (tipo === "pallet-adicional" && ocupacionDetalle) {
            filas = ocupacionDetalle.lineas.map(item => ({
                Fecha: item.fecha.toLocaleDateString("es-AR"),
                Posiciones: item.posiciones,
                Capacidad: item.capacidad,
                Exceso: item.exceso
            }));
            /* Agregamos también el resumen final debajo del detalle. */
            filas.push(
                {
                    Fecha: ""
                },{
                    Fecha: "Exceso acumulado",
                    Exceso: ocupacionDetalle.totalExceso
                },{
                    Fecha: "Registros considerados",
                    Exceso: ocupacionDetalle.cantidadRegistros
                },{
                    Fecha: "Promedio sobrecapacidad",
                    Exceso: ocupacionDetalle.promedioSobrecapacidad
                }
            );
            nombreArchivo = `ZN24-Pallet-Adicional-${mesLabel}.xlsx`;
        }

        if (tipo === "egreso-normal" || tipo === "egreso-especial") {
            filas = egresosDetalle.map(item => ({
                ST: item.st,
                SKU: item.sku,
                "Fecha origen": item.fechaOriginal.toLocaleDateString("es-AR"),
                "Fecha entrega": item.fechaEntrega.toLocaleDateString("es-AR"),
                Clasificacion: item.tipo,
                Bultos: item.bultos
            }));

            filas.push(
                {
                    Fecha: ""
                },{
                    ST: "TOTAL",
                    Bultos: totalEgresos
                }
            );

            nombreArchivo = tipo === "egreso-normal"
                ? `YZ09-Egreso-Normal-${mesLabel}.xlsx` : `YZ09-Egreso-Especial-${mesLabel}.xlsx`;
        }

        if (tipo === "ingresos") {
            filas = ingresosDetalle.map(item => ({
                Fecha: item.dateReceived.toLocaleDateString("es-AR"),
                SKU: item.sku,
                "Cantidad recibida": item.qtyReceived,
                "Ubicacion destino": item.toLoc,
                Pallet: 1
            }));

            filas.push(
                {
                    Fecha: ""
                },{
                    Fecha: "TOTAL PALLETS",
                    Pallet: totalIngresos
                }
            );

            nombreArchivo = `ZN22-Ingreso-Pallet-${mesLabel}.xlsx`;
        }

        const worksheet = XLSX.utils.json_to_sheet(filas);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Respaldo");
        XLSX.writeFile(workbook, nombreArchivo);
    };
    /* =========================================
     * SIN DATOS
     * ========================================= */
    if (!tipo || !month) {
        return (
            <main className={styles.container}>
                <div className={styles.empty}>
                    No fue posible identificar el detalle solicitado.
                </div>
            </main>
        );
    }
    /* =========================================
     * PALLET ADICIONAL
     * =========================================*/
    if (tipo === "pallet-adicional") {
        if (!ocupacionDetalle) {
            return (
                <main className={styles.container}>
                    <div className={styles.empty}>
                        No se encontró el respaldo de ocupación.
                    </div>
                </main>
            );
        }
        return (
            <main className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <h1>{titulo}</h1>
                        <p>{mesLabel}</p>
                    </div>

                    <div className={styles.resultCard}>
                        <span>Resultado</span>
                        <strong>
                            {ocupacionDetalle.promedioSobrecapacidad.toLocaleString("es-AR")}
                        </strong>
                        <small>pallets adicionales</small>
                        <div className={styles.headerActions}>
                            <button type="button" className={styles.downloadButton} onClick={descargarRespaldo}>
                                ⬇ Descargar respaldo
                            </button> 
                        </div>
                    </div>

                  
                </header>

                <section className={styles.summaryGrid}>
                    <div className={styles.summaryCard}>
                        <span>Exceso acumulado</span>
                        <strong>{ocupacionDetalle.totalExceso.toLocaleString("es-AR")}</strong>
                    </div>

                    <div className={styles.summaryCard}>
                        <span>Registros considerados</span>
                        <strong>{ocupacionDetalle.cantidadRegistros.toLocaleString("es-AR")}</strong>
                    </div>

                    <div className={styles.summaryCard}>
                        <span>Cálculo</span>
                        <strong className={styles.formula}>
                            {ocupacionDetalle.totalExceso.toLocaleString("es-AR")}
                            {" / "}
                            {ocupacionDetalle.cantidadRegistros.toLocaleString("es-AR")}
                        </strong>
                    </div>
                </section>
                <div className={styles.notice}>
                    El pallet adicional se obtiene promediando
                    el exceso sobre la capacidad base de 100 posiciones
                    en todos los registros del período.
                </div>
                <section className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Posiciones</th>
                                <th>Capacidad</th>
                                <th>Exceso</th>
                            </tr>
                        </thead>

                        <tbody>
                            {ocupacionDetalle.lineas.map((item, index) => (
                                <tr
                                    key={`${item.fecha.getTime()}-${index}`}
                                    className={item.exceso > 0 ? styles.excesoRow : undefined}>
                                    <td>{item.fecha.toLocaleDateString("es-AR")}</td>
                                    <td>{item.posiciones.toLocaleString("es-AR")}</td>
                                    <td>{item.capacidad.toLocaleString("es-AR")}</td>
                                    <td><strong>{item.exceso.toLocaleString("es-AR")}</strong></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </main>
        );
    }


    /*
     * =========================================
     * EGRESOS
     * =========================================
     */

    if (tipo === "egreso-normal" || tipo === "egreso-especial") {
        return (
            <main className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <h1>{titulo}</h1>
                        <p>
                            {tipo === "egreso-normal" ? "Lunes a sábados" : "Domingos y feriados"}
                            {" · "}
                            {mesLabel}
                        </p>
                    </div>

                    <div className={styles.resultCard}>
                        <span>Total</span>
                        <strong>{totalEgresos.toLocaleString("es-AR")}</strong>
                        <small>bultos</small>
                        <div className={styles.headerActions}>
                            <button type="button" className={styles.downloadButton} onClick={descargarRespaldo}>
                                ⬇ Descargar respaldo
                            </button> 
                        </div>
                    </div>
                </header>

                <div className={styles.notice}>
                    La clasificación utiliza la fecha de entrega
                    calculada por el calendario de facturación.
                    Los domingos y feriados se consideran tarifa especial.
                </div>

                <section className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ST</th>
                                <th>SKU</th>
                                <th>Fecha origen</th>
                                <th>Fecha entrega</th>
                                <th>Clasificación</th>
                                <th>Bultos</th>
                            </tr>
                        </thead>

                        <tbody>
                            {egresosDetalle.map((item, index) => (
                                    <tr key={`${item.st}-${item.sku}-${index}`}>
                                        <td className={styles.codeCell}>{item.st}</td>
                                        <td>{item.sku}</td>
                                        <td>{item.fechaOriginal.toLocaleDateString("es-AR")}</td>
                                        <td>{item.fechaEntrega.toLocaleDateString("es-AR")}</td>
                                        <td>
                                            <span
                                                className={
                                                    item.especial ? styles.badgeEspecial : styles.badgeNormal}
                                            >
                                                {item.tipo}
                                            </span>
                                        </td>

                                        <td>
                                            <strong>
                                                {item.bultos.toLocaleString("es-AR")}
                                            </strong>
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </section>
            </main>
        );
    }


    /*
     * =========================================
     * INGRESOS
     * =========================================
     */

   return (
        <main className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1> {titulo} </h1>
                    <p> {mesLabel} </p>
                </div>

                <div className={styles.resultCard}>
                    <span> Total </span>
                    <strong>{totalIngresos.toLocaleString("es-AR")}</strong>
                    <small> pallets recibidos </small>
                    <div className={styles.headerActions}>
                        <button type="button" className={styles.downloadButton} onClick={descargarRespaldo}>
                            ⬇ Descargar respaldo
                        </button> 
                    </div>
                </div>
            </header>

            <div className={styles.notice}>
                Se considera pallet recibido cada registro
                que posee ubicación de destino informada.
            </div>

            <section className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>SKU</th>
                            <th>Cantidad recibida</th>
                            <th>Ubicación destino</th>
                            <th>Pallet</th>
                        </tr>
                    </thead>

                    <tbody>
                        {ingresosDetalle.map((item, index) => (
                        <tr key={`${item.sku}-${item.toLoc}-${item.dateReceived.getTime()}-${index}`} >
                            <td>{item.dateReceived.toLocaleDateString("es-AR")}</td>
                            <td className={styles.codeCell}>{item.sku}</td>
                            <td>{item.qtyReceived.toLocaleString("es-AR")}</td>
                            <td>{item.toLoc}</td>
                            <td><span className={styles.badgeNormal}>1</span></td>
                        </tr>))}
                    </tbody>
                </table>
            </section>
        </main>
    );
};

export default PeYaClaveControlDetalle;