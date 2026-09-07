import type { InventarioSapLinea } from "../InventarioSapLinea";
import type { Lx03OcupacionItem } from "../../ocupacion/Lx03OcupacionItem";
import type { InventarioCoberturaResultado, InventarioCoberturaStorage, InventarioCoberturaPendiente} from "../cobertura/InventarioCoberturaResultado";

interface InventarioCoberturaFiltros {
    year: number;
    mes?: number | null;
    storage?: string | null;
}

export class InventarioCoberturaBuilder {
    static build( lineas: InventarioSapLinea[], lx03: Lx03OcupacionItem[], filtros: InventarioCoberturaFiltros
    ): InventarioCoberturaResultado {
        const { year, mes = null, storage = null} = filtros;
        /*
         * ==========================================
         * UNIVERSO LX03
         * ==========================================
         *
         * Una ubicación puede aparecer varias veces
         * en LX03.
         *
         * Para cobertura nos interesa solamente
         * una vez.
         */
        const ubicacionesWarehouse = new Map<string, Lx03OcupacionItem>();

        for (const item of lx03) {
            const ubicacion = this.normalizar(item.ubicacion);
            const storageItem = this.normalizar(item.storage);
            const numeroStorage = Number(storageItem);
            if (Number.isFinite(numeroStorage) && numeroStorage >= 900 && numeroStorage <= 999) {
                continue;
            }
            if (!ubicacion) {
                continue;
            }
            /*
             * Nos quedamos con una sola entrada
             * por ubicación.
             */
            if ( !ubicacionesWarehouse.has(ubicacion)) {
                ubicacionesWarehouse.set(ubicacion, {...item, ubicacion, storage: storageItem});
            }
        }
        /*
         * Total real del warehouse,
         * independientemente del storage elegido.
         *
         * Lo necesitamos para calcular:
         *
         * "% del warehouse"
         */
        const totalWarehouse = ubicacionesWarehouse.size;
        /*
         * ==========================================
         * FILTRO DE INVENTARIOS POR FECHA
         * ==========================================
         */
        const lineasPeriodo = lineas.filter(item => {
                const fecha = item.fecha;
                if (fecha.getFullYear() !== year) {
                    return false;
                }
                if (mes !== null && fecha.getMonth() !== mes) {
                    return false;
                }
                return true;
            });
        /*
         * Conteos realizados.
         *
         * Todavía puede haber varias líneas
         * correspondientes a la misma ubicación.
         */
        const conteosRealizados = lineasPeriodo.length;
        /*
         * ==========================================
         * UBICACIONES INVENTARIADAS ÚNICAS
         * ==========================================
         */
        const ubicacionesInventariadas = new Set<string>();

        for (const item of lineasPeriodo) {
            const posicion = this.normalizar(item.posicion);
            if (!posicion) {
                continue;
            }
            /*
             * IMPORTANTE:
             *
             * Solo consideramos cobertura si
             * la posición existe actualmente
             * en LX03.
             */
            if (ubicacionesWarehouse.has(posicion)) {
                ubicacionesInventariadas.add(posicion);
            }
        }
        /*
         * ==========================================
         * UNIVERSO SEGÚN STORAGE SELECCIONADO
         * ==========================================
         */
        const ubicacionesFiltradas = [...ubicacionesWarehouse.values()].filter(item => {
            if (!storage) {
                return true;
            }
            return (this.normalizar(item.storage) === this.normalizar(storage));});

        const totalPosiciones = ubicacionesFiltradas.length;
        const inventariadasFiltradas = ubicacionesFiltradas.filter(item => ubicacionesInventariadas.has(
            this.normalizar(item.ubicacion)));

        const posicionesInventariadas = inventariadasFiltradas.length;
        const posicionesPendientes = totalPosiciones - posicionesInventariadas;
        /*
         * ==========================================
         * COBERTURA
         * ==========================================
         */
        const porcentajeCobertura = totalPosiciones > 0 ? (posicionesInventariadas / totalPosiciones) * 100 : 0;
        /*
         * Qué porcentaje del WH representan
         * las posiciones contadas con el filtro
         * actual.
         */
        const porcentajeWarehouse = totalWarehouse > 0 ? (posicionesInventariadas / totalWarehouse) * 100 : 0;
        /*
         * ==========================================
         * PENDIENTES
         * ==========================================
         */
        const pendientes:
            InventarioCoberturaPendiente[] =
            ubicacionesFiltradas
                .filter(item => !ubicacionesInventariadas.has(this.normalizar(item.ubicacion)))
                .map(item => ({
                    storage: item.storage,
                    ubicacion: item.ubicacion,
                    material: item.material,
                    cantidad: item.cantidad
                }));
        /*
         * ==========================================
         * RESUMEN POR STORAGE
         * ==========================================
         */
        const resumenPorStorage =
            this.buildResumenStorage(
                [...ubicacionesWarehouse.values()],
                ubicacionesInventariadas,
                totalWarehouse
            );
        /*
         * Una ubicación inventariada varias veces
         * cuenta una sola vez para cobertura.
         *
         * Esto queda como indicador complementario.
         */
        const reconteos = Math.max(0, conteosRealizados - ubicacionesInventariadas.size);
        return {
            totalPosiciones,
            posicionesInventariadas,
            posicionesPendientes,
            porcentajeCobertura,
            conteosRealizados,
            reconteos,
            porcentajeWarehouse,
            pendientes,
            resumenPorStorage
        };
    }

    private static buildResumenStorage(
        ubicaciones: Lx03OcupacionItem[],
        inventariadas: Set<string>,
        totalWarehouse: number
    ): InventarioCoberturaStorage[] {
        const storages = new Map<string, Lx03OcupacionItem[]>();
        for (const item of ubicaciones) {
            const storage = this.normalizar(item.storage);
            if (!storage) {
                continue;
            }
            const actuales = storages.get(storage) ?? [];
            actuales.push(item);
            storages.set(storage, actuales);
        }
        const resultado: InventarioCoberturaStorage[] = [];
        for (const [storage, posiciones] of storages) {
            const totalPosiciones = posiciones.length;
            const posicionesInventariadas = posiciones.filter(
                    item => inventariadas.has(this.normalizar(item.ubicacion))).length;

            const posicionesPendientes = totalPosiciones - posicionesInventariadas;
            const porcentajeCobertura = totalPosiciones > 0 ? (posicionesInventariadas / totalPosiciones) * 100 : 0;
            const porcentajeWarehouse = totalWarehouse > 0  ? (posicionesInventariadas / totalWarehouse) * 100 : 0;

            resultado.push({
                storage,
                totalPosiciones,
                posicionesInventariadas,
                posicionesPendientes,
                porcentajeCobertura,
                porcentajeWarehouse
            });
        }
        /*
         * Los storages que necesitan más atención
         * aparecen primero.
         */
        return resultado.sort((a, b) => a.porcentajeCobertura - b.porcentajeCobertura);
    }

    private static normalizar(value: string): string {
        return String(value ?? "").trim().toUpperCase();
    }
}