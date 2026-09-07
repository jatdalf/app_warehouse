import * as XLSX from "xlsx";
import styles from "./RenaultInventarioCobertura.module.css";
import type {
    InventarioCoberturaPendiente
} from "./InventarioCoberturaResultado";

import type {
    WarehouseInventario
} from "../InventarioWarehouseConfig";

interface CoberturaPendientesDetailProps {
    items: InventarioCoberturaPendiente[];
    warehouse: WarehouseInventario;
    mes: number | null;
    storage: string | null;
    onVolver: () => void;
}

const MESES = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre"
];

const CoberturaPendientesDetail = ({
    items,
    warehouse,
    mes,
    storage,
    onVolver
}: CoberturaPendientesDetailProps) => {

    const periodo =
        mes === null
            ? "Año acumulado"
            : MESES[mes];

    const descargarExcel = () => {

        const rows =
            items.map(item => ({
                Warehouse: warehouse,
                Periodo: periodo,
                Storage: item.storage,
                Ubicacion: item.ubicacion,
                Material: item.material,
                Cantidad: item.cantidad
            }));

        const worksheet =
            XLSX.utils.json_to_sheet(rows);

        const workbook =
            XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Pendientes"
        );

        const storageNombre =
            storage ?? "TODOS";

        const periodoNombre =
            mes === null
                ? "ANUAL"
                : MESES[mes]
                    .toUpperCase();

        XLSX.writeFile(
            workbook,
            `Cobertura_${warehouse}_${periodoNombre}_${storageNombre}_Pendientes.xlsx`
        );
    };

    return (
        <div className={styles.page}>

            <div className={styles.detailTopBar}>

                <button
                    type="button"
                    className={styles.closeButton}
                    onClick={onVolver}
                >
                    ← Volver a cobertura
                </button>

                <button
                    type="button"
                    className={styles.excelButton}
                    onClick={descargarExcel}
                    disabled={items.length === 0}
                >
                    Descargar Excel
                </button>

            </div>

            <div className={styles.detailHeader}>

                <h1 className={styles.detailTitle}>
                    Posiciones pendientes de inventariar
                </h1>

                <div className={styles.detailFilters}>
                    <span>
                        <strong>Warehouse:</strong>{" "}
                        {warehouse}
                    </span>

                    <span>
                        <strong>Período:</strong>{" "}
                        {periodo}
                    </span>

                    <span>
                        <strong>Storage:</strong>{" "}
                        {storage ?? "Todos"}
                    </span>
                </div>

                <div className={styles.detailTotal}>
                    {items.length.toLocaleString("es-AR")}
                    {" "}
                    posiciones pendientes
                </div>

            </div>

            <div className={styles.tableWrapper}>

                <table className={styles.storageTable}>
                    <thead>
                        <tr>
                            <th>Storage</th>
                            <th>Ubicación</th>
                            <th>Material</th>
                            <th>Cantidad</th>
                        </tr>
                    </thead>

                    <tbody>
                        {items.map((item, index) => (
                            <tr
                                key={`${item.storage}-${item.ubicacion}-${index}`}
                            >
                                <td>
                                    {item.storage}
                                </td>

                                <td className={styles.storageName}>
                                    {item.ubicacion}
                                </td>

                                <td>
                                    {item.material}
                                </td>

                                <td>
                                    {item.cantidad.toLocaleString(
                                        "es-AR"
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>

        </div>
    );
};

export default CoberturaPendientesDetail;