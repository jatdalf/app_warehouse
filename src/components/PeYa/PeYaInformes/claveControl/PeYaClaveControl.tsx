import { useEffect, useMemo, useState } from "react";
import { PeYaIngresosReader } from "../../../../readers/PeYaIngresosReader";
import { PeYaEgresosReader } from "../../../../readers/PeYaEgresosReader";
import { PeYaOcupacionReader } from "../../../../readers/PeYaOcupacionReader";
import { PeYaFeriadosReader } from "../../../../readers/PeYaFeriadosReader";
import type { IngresoItem } from "../ingresos/IngresoItem";
import type { EgresoItem } from "../egresos/EgresoItem";
import type { OcupacionItem } from "../ocupacion/OcupacionItem";
import type { FeriadoItem } from "../inventarios/FeriadoItem";
import { ClaveControlBuilder } from "../claveControl/ClaveControlBuilder";
import styles from "./PeYaClaveControl.module.css";
import PeYaHeader from "../PeYaInformesHeader";

interface MesDisponible {
    key: string;
    year: number;
    month: number;
    label: string;
}
type TipoDetalle = | "ingresos" | "egreso-normal" | "egreso-especial" | "pallet-adicional";

const PeYaClaveControl = () => {
    const [ingresos, setIngresos] = useState<IngresoItem[]>([]);
    const [egresos, setEgresos] = useState<EgresoItem[]>([]);
    const [ocupacion, setOcupacion] = useState<OcupacionItem[]>([]);
    const [feriados, setFeriados] = useState<FeriadoItem[]>([]);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {const cargar = async () => {
        try {
            setLoading(true);
            const [ingresosData, egresosData, ocupacionData, feriadosData] = await Promise.all([
                PeYaIngresosReader.read(),
                PeYaEgresosReader.read(),
                PeYaOcupacionReader.read(),
                PeYaFeriadosReader.read()]);

                setIngresos(ingresosData);
                setEgresos(egresosData.items);
                setOcupacion(ocupacionData);
                setFeriados(feriadosData);
            } finally {
                setLoading(false);
            }
        };
        void cargar();
    }, []);

    const mesesDisponibles = useMemo(() => {
        const meses = new Map< string, MesDisponible >();
        egresos.forEach(item => {
            const year = item.fecha.getFullYear();
            const month = item.fecha.getMonth();
            const key = `${year}-${month}`;
            if (!meses.has(key)) {
                const texto = new Intl.DateTimeFormat("es-AR",{ month: "long", year: "numeric"}
                    ).format(item.fecha);
                const label = texto.charAt(0).toUpperCase() + texto.slice(1);
                meses.set(key, {key, year, month, label});
            }
        });
        return [...meses.values()].sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
    }, [egresos]);
    /*
     * Mes actual por defecto.
     */
    useEffect(() => {
        if (selectedMonth || mesesDisponibles.length === 0) {
            return;
        }
        const hoy = new Date();
        const actual = `${hoy.getFullYear()}-${hoy.getMonth()}`;
        const encontrado = mesesDisponibles.find(item => item.key === actual);
        setSelectedMonth(encontrado?.key ?? mesesDisponibles[mesesDisponibles.length - 1].key);
    }, [mesesDisponibles, selectedMonth]);

    const mesSeleccionado = mesesDisponibles.find( item => item.key === selectedMonth);

    /*
     * Filtramos los tres universos
     * por el mismo mes.
     */
    const ingresosMes = useMemo(() => {
        if (!mesSeleccionado) {
            return [];
        }

        return ingresos.filter(item => item.dateReceived.getFullYear() === mesSeleccionado.year &&
            item.dateReceived.getMonth() === mesSeleccionado.month);
        }, [ingresos, mesSeleccionado]);

    const egresosMes = useMemo(() => {
        if (!mesSeleccionado) {
            return [];
        }

        return egresos.filter(item => item.fecha.getFullYear() === mesSeleccionado.year &&
            item.fecha.getMonth() === mesSeleccionado.month
        );}, [egresos, mesSeleccionado]);

    const ocupacionMes = useMemo(() => {
        if (!mesSeleccionado) {
            return [];
        }

        return ocupacion.filter(item => item.fecha.getFullYear() === mesSeleccionado.year &&
            item.fecha.getMonth() === mesSeleccionado.month);
    }, [ocupacion, mesSeleccionado]);

    const resumen = useMemo( () =>
        ClaveControlBuilder.build(ingresosMes, egresosMes, ocupacionMes, feriados),
        [ingresosMes, egresosMes, ocupacionMes, feriados]);
    /*
     * Un mes actual necesariamente
     * todavía está incompleto.
     */
    const datosParciales = useMemo(() => {
        if (!mesSeleccionado) {
            return false;
        }
        const hoy = new Date();
        return (mesSeleccionado.year === hoy.getFullYear() && mesSeleccionado.month === hoy.getMonth());
    }, [mesSeleccionado]);

    if (loading) {
        return (
            <div className={styles.loading}>
                Cargando clave de control...
            </div>
        );
    }
    const abrirDetalle = (tipo: TipoDetalle) => {
        if (!mesSeleccionado) {
            return;
        }
        const key = `clave-control-${tipo}-${selectedMonth}`;
        let data: unknown;
        switch (tipo) {
            case "ingresos":
                data = { ingresos: ingresosMes };
                break;
            case "egreso-normal":
            case "egreso-especial":
                data = { egresos: egresosMes, feriados };
                break;
            case "pallet-adicional":
                data = { ocupacion: ocupacionMes };
                break;
        }
        sessionStorage.setItem(key, JSON.stringify(data));
        window.open(`/PeYa/clave-control/detalle/${tipo}/${selectedMonth}`, "_blank");
    };

    return (
        <div className={styles.container}>
            <PeYaHeader />
            <h2 className={styles.title}>Clave de control AP 40043036</h2>
            <div className={styles.controls}>
                <select value={selectedMonth} onChange={event => setSelectedMonth(event.target.value)} >
                    {mesesDisponibles.map(mes => (<option key={mes.key} value={mes.key} >
                        {mes.label}</option>))}
                </select>
            </div>

            {datosParciales && (
                <div className={styles.warning}>
                    ⚠️ Datos parciales
                </div>
            )}

            <div className={styles.controlTable}>
                <div className={styles.row}>
                    <div className={styles.code}>ZN22</div>
                    <div className={styles.description}>Ingreso por pallet (IN)</div>
                    <strong>{resumen.ingresosPallets.toLocaleString("es-AR")}</strong>
                     <button type="button" className={styles.detailButton} onClick={() =>
                    abrirDetalle("ingresos")} aria-label="Ver respaldo de ingresos">🔎</button>
                </div>

                <div className={styles.row}>
                    <div className={styles.code}>YZ09</div>
                    <div className={styles.description}>Egreso por bulto (OUT) - Lunes a Sábados</div>
                    <strong>{resumen.egresoNormal.toLocaleString("es-AR")}</strong>
                    <button type="button" className={styles.detailButton} onClick={() =>
                    abrirDetalle("egreso-normal")} aria-label="Ver respaldo de egresos normales">🔎</button>
                </div>

                <div className={styles.row}>
                    <div className={styles.code}>YZ09</div>
                    <div className={styles.description}>Egreso por bulto (OUT) - Domingos y feriados</div>
                    <strong>{resumen.egresoEspecial.toLocaleString("es-AR")}</strong>
                    <button type="button" className={styles.detailButton} onClick={() =>
                    abrirDetalle("egreso-especial")} aria-label="Ver respaldo de egresos especiales">🔎</button>
                </div>

                <div className={styles.row}>
                    <div className={styles.code}>ZN24</div>
                    <div className={styles.description}>Pallet Adicional</div>
                    <strong>{resumen.palletAdicional.toLocaleString("es-AR")}</strong>
                    <button type="button" className={styles.detailButton} onClick={() =>
                    abrirDetalle("pallet-adicional")} aria-label="Ver respaldo de pallet adicional">🔎</button>
                </div>
            </div>
        </div>
    );
};

export default PeYaClaveControl;