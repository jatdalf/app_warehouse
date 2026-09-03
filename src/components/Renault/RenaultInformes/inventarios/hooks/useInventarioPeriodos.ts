import { useEffect, useMemo, useState} from "react";
import { InventarioSapWeeklyBuilder } from "../builders/InventarioSapWeeklyBuilder ";
import { InventarioPeriodoBuilder, type TipoPeriodo } from "../builders/InventarioPeriodoBuilder";
import { InventarioSapDailyBuilder } from "../builders/InventarioSapDailyBuilder";
import type { InventarioSapLinea } from "../InventarioSapLinea";
import type { InventarioSemana } from "../InventarioSemana";
import type { FeriadoItem } from "../FeriadoItem";

interface UseInventarioPeriodosProps {
    lineas: InventarioSapLinea[];
    feriados: FeriadoItem[];
    tipoPeriodo: TipoPeriodo;
    targetDiario: number;
}

export const useInventarioPeriodos = ({lineas, feriados, tipoPeriodo, targetDiario}: UseInventarioPeriodosProps) => {
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState("");
    /* RANGO TOTAL DISPONIBLE */
    const rango = useMemo(() => {
        if (lineas.length === 0) {
            return null;
        }
        const fechas = lineas.map(item => item.fecha.getTime()).filter(fecha => !Number.isNaN(fecha));
        if (fechas.length === 0) {
            return null;
        }
        return {
            desde: new Date(Math.min(...fechas)),
            hasta: new Date(Math.max(...fechas))
        };
    }, [lineas]);
    /* INVENTARIOS CERRADOS */
    const lineasCerradas = useMemo(() => {
        return lineas.filter(item => item.statusInventario.trim().toUpperCase() === "ELIMINADOS");
    }, [lineas]);
    /* SEMANAS */
    const semanas = useMemo<InventarioSemana[]>(() => {
        if (!rango) {
            return [];
        }
        return InventarioSapWeeklyBuilder.build(lineasCerradas, feriados, rango.desde, rango.hasta, targetDiario);
    }, [lineasCerradas, feriados, rango, targetDiario]);

    /* PERÍODOS */
    const periodos = useMemo(() => {
        return InventarioPeriodoBuilder.build(semanas, tipoPeriodo);
    }, [semanas, tipoPeriodo]);
    /* Seleccionamos automáticamente el último período disponible. */
    useEffect(() => {
        if (periodos.length === 0) {
            setPeriodoSeleccionado("");
            return;
        }
        const existe = periodos.some(item => item.key === periodoSeleccionado);
        if (existe) {
            return;
        }
        setPeriodoSeleccionado(periodos[periodos.length - 1].key);
    }, [periodos, periodoSeleccionado]);
    /* PERÍODO ACTUAL */
    const periodo = useMemo(() => {
        return (periodos.find(item => item.key === periodoSeleccionado) ?? null);
    }, [periodos, periodoSeleccionado]);
    /* TODAS LAS LÍNEAS DEL PERÍODO */
    const lineasPeriodo = useMemo(() => {
            if (!periodo) {
                return [];
            }
            const desde = startOfDay(periodo.desde);
            const hasta = endOfDay(periodo.hasta);
            return lineas.filter(item => item.fecha >= desde && item.fecha <= hasta);
        }, [lineas, periodo]);
    /* SOLAMENTE INVENTARIOS CERRADOS DEL PERÍODO */
    const lineasPeriodoCerradas = useMemo(() => {
        return lineasPeriodo.filter(item => item.statusInventario.trim().toUpperCase() === "ELIMINADOS");
        }, [lineasPeriodo]);
    /* DÍAS DEL PERÍODO */
    const diasPeriodo = useMemo(() => {
        if (!periodo) {
            return [];
        }
        return InventarioSapDailyBuilder.build(lineasPeriodoCerradas, feriados, periodo.desde, periodo.hasta, targetDiario);
    }, [lineasPeriodoCerradas, feriados, periodo, targetDiario]);
    /* OBJETO UTILIZADO POR LOS GRÁFICOS */
    const periodoVisual = useMemo(() => {
        if (!periodo) {
            return null;
        }
        return {
            key: periodo.key,
            label: periodo.label,
            desde: periodo.desde,
            hasta: periodo.hasta,
            dias: diasPeriodo
        };
    }, [periodo, diasPeriodo]);

    return {
        periodos,
        periodoSeleccionado,
        setPeriodoSeleccionado,
        periodo,
        periodoVisual,
        lineasPeriodo,
        lineasPeriodoCerradas
    };
};

/* HELPERS */

function startOfDay(fecha: Date): Date {
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}
function endOfDay(fecha: Date): Date {
    return new Date( fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 23, 59, 59, 999);
}