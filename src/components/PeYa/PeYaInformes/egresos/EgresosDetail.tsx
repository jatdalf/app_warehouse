import { useMemo, useState} from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import type { EgresoItem } from "../egresos/EgresoItem";
import type { FeriadoItem } from "../inventarios/FeriadoItem";
import { CalendarioLaboral } from "../inventarios/CalendarioLaboral";
import styles from "./EgresosDetail.module.css";
import { EgresoBillingCalendar } from "../egresos/EgresoBillingCalendar";

interface Props {
    egresos: EgresoItem[];
    feriados: FeriadoItem[];
    initialMonth: string;
    onClose(): void;
}

type TipoDia = | "todos" | "normal" | "especial";

const EgresosDetail: React.FC<Props> = ({egresos, feriados, initialMonth, onClose}) => {
    const mesesDisponibles = useMemo(() => {
        const mapa = new Map<string,{key: string; label: string; year: number; month: number;}>();
            egresos.forEach(item => {
                const year = item.fecha.getFullYear();
                const month = item.fecha.getMonth();
                const key = `${year}-${month}`;
                if (!mapa.has(key)) {
                    const rawLabel = new Intl.DateTimeFormat("es-AR",{month: "long", year: "numeric"}
                        ).format(item.fecha);
                    const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);
                    mapa.set(key, {key, label, year, month});
                }
            });

            return [...mapa.values()].sort((a, b) => a.year !== b.year ? a.year - b.year
                        : a.month - b.month);
        }, [egresos]);

    const [selectedMonths, setSelectedMonths] = useState<string[]>(initialMonth ? [initialMonth]
            : mesesDisponibles.map( item => item.key));
    const [tipoDia, setTipoDia] = useState<TipoDia>("todos");
    const rows = useMemo(() => {
        return egresos.filter(item => {const key = `${item.fecha.getFullYear()}-${item.fecha.getMonth()}`;
            if (selectedMonths.length > 0 && !selectedMonths.includes(key)) {
                return false;
            }
            if (tipoDia === "todos") {
                return true;
            }
            const fechaEntrega = EgresoBillingCalendar.fechaEntrega(item.fecha);
            const esDomingo = fechaEntrega.getDay() === 0;
            const esFeriado = CalendarioLaboral.esFeriado(fechaEntrega, feriados);
            const esEspecial = esDomingo || esFeriado;
            if (tipoDia === "especial") {
                return esEspecial;
            }
            return !esEspecial;
        }).map((item, index) => ({id: index + 1, fecha: item.fecha.toLocaleDateString("es-AR"),
            st: item.st,
            sku: item.sku,
            bultos: item.bultos,
            tipoDia: (item.fecha.getDay() === 0 || CalendarioLaboral.esFeriado(item.fecha, feriados))
                ? "Domingo / Feriado" : "Día hábil / Sábado"}));
        }, [egresos, feriados, selectedMonths, tipoDia]);

    const columns: GridColDef[] = [
        {
            field: "fecha",
            headerName: "Fecha",
            width: 120
        },{
            field: "st",
            headerName: "ST",
            width: 140
        },{
            field: "sku",
            headerName: "SKU",
            width: 140
        },{
            field: "bultos",
            headerName: "Bultos",
            width: 100,
            type: "number"
        },{
            field: "tipoDia",
            headerName: "Tipo de día",
            width: 180
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Detalle de egresos</h2>
                <button className={styles.closeButton} onClick={onClose}>✕</button>
            </div>

          <div className={styles.contentLayout}>

            {/* =========================
                DATAGRID
            ========================= */}

            <div className={styles.gridArea}>

                <div className={styles.gridWrapper}>
                   <DataGrid rows={rows} columns={columns} disableColumnMenu disableRowSelectionOnClick     
                    pageSizeOptions={[25, 50, 100]}
                    initialState={{
                        pagination: {
                            paginationModel: {pageSize: 100, page: 0 }
                        }
                    }}/>
                </div>

            </div>


            {/* =========================
                FILTROS
            ========================= */}

            <aside className={styles.filtersPanel}>

                <div className={styles.filterGroup}>

                    <label>
                        Mes / período
                    </label>

                    <select
                        multiple
                        size={Math.min(
                            mesesDisponibles.length,
                            8
                        )}
                        className={styles.monthSelect}
                        value={selectedMonths}
                        onChange={(event) => {

                            const values =
                                Array.from(
                                    event.target.selectedOptions
                                ).map(
                                    option =>
                                        option.value
                                );

                            setSelectedMonths(
                                values
                            );
                        }}
                    >

                        {mesesDisponibles.map(
                            mes => (
                                <option
                                    key={mes.key}
                                    value={mes.key}
                                >
                                    {mes.label}
                                </option>
                            )
                        )}

                    </select>

                    <span className={styles.selectHint}>
                        Ctrl + click para seleccionar varios meses
                    </span>

                </div>


                <div className={styles.filterGroup}>

                    <label>
                        Visualizar
                    </label>

                    <select
                        value={tipoDia}
                        onChange={event =>
                            setTipoDia(
                                event.target.value as TipoDia
                            )
                        }
                    >

                        <option value="todos">
                            Todos
                        </option>

                        <option value="normal">
                            Días de semana + sábado
                        </option>

                        <option value="especial">
                            Domingos + feriados
                        </option>

                    </select>

                </div>


                <div className={styles.summary}>
                    {rows.length.toLocaleString("es-AR")}
                    {" "}líneas visibles
                </div>

            </aside>

        </div>
        </div>
    );
};

export default EgresosDetail;