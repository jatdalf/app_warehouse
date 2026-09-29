import { useEffect, useRef, useState } from "react";
import { PeYaInventariosReader } from "../../../../../readers/PeYaInventariosReader";
import { PeYaFeriadosReader } from "../../../../../readers/PeYaFeriadosReader";
import type { InventarioItem } from "../InventarioItem";
import type { FeriadoItem } from "../FeriadoItem";
import { PEYA_INVENTARIOS_MESES, PEYA_LOCATIONS_FILE_ID } from "../PeYaInventariosConfig";
import { PeYaLocationsReader } from "../../../../../readers/PeYaLocationsReader";
import { PeYaInventariosContabilizadosReader } from "../../../../../readers/PeYaInventariosContabilizadosReader";

type InventariosMesCache = Record<
    string,
    {
        items: InventarioItem[];
        createdAt: Date | null;
    }
>;

export const usePeYaInventariosData = () => {
    const [inventarios, setInventarios] = useState<InventarioItem[]>([]);
    const [feriados, setFeriados] = useState<FeriadoItem[]>([]);
    const [fechaActualizacion, setFechaActualizacion] = useState<Date | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [locations, setLocations] = useState<string[]>([]);
    const inventariosCache = useRef<InventariosMesCache>({});
    const feriadosCache = useRef<FeriadoItem[] | null>(null);
    const locationsCache = useRef<string[] | null>(null);

    useEffect(() => {
    let cancelado = false;
    const cargarMes = async (mes: string) => {
            const cached = inventariosCache.current[mes];
            if (cached) {
                return cached;
            }
            const config = PEYA_INVENTARIOS_MESES[mes];
            if (!config) {
                return {
                    items: [],
                    createdAt: null
                };
            }
            const fileId = config.inventariosFileId;
            const inforFileId = config.inforFileId;

            if (!fileId) {
                return {
                    items: [],
                    createdAt: null
                };
            }
            const resultado = await PeYaInventariosReader.read(fileId);
            let resultadoFinal = resultado;
if (inforFileId) {
    const infor =
        await PeYaInventariosContabilizadosReader.read(inforFileId);

    /*
     * La clave de un inventario es:
     * fecha + ubicación.
     */
    const claveInventario = (
        fecha: Date,
        ubicacion: string
    ) => {
        const year = fecha.getFullYear();
        const month = String(
            fecha.getMonth() + 1
        ).padStart(2, "0");
        const day = String(
            fecha.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}|${ubicacion
            .trim()
            .toUpperCase()}`;
    };

    /*
     * Los registros de la fuente original
     * tienen prioridad.
     */
    const clavesExistentes = new Set(
        resultado.items.map(item =>
            claveInventario(
                item.fecha,
                item.ubicacion
            )
        )
    );

    /*
     * Agregamos solamente los inventarios
     * de INFOR que no existen en la
     * fuente original.
     */
    const nuevosInfor: InventarioItem[] = [];

    for (const item of infor.items) {
        const clave = claveInventario(
            item.fecha,
            item.ubicacion
        );

        if (clavesExistentes.has(clave)) {
            continue;
        }

        nuevosInfor.push({
            fecha: new Date(item.fecha),
            ubicacion: item.ubicacion,

            /*
             * Los builders actuales solamente
             * distinguen entre 0 y distinto de 0.
             */
            quantityAdjusted:
                item.conDiferencia ? 1 : 0
        });

        /*
         * También incorporamos la nueva clave
         * para protegernos de duplicados
         * dentro del propio INFOR.
         */
        clavesExistentes.add(clave);
    }

   resultadoFinal = {
        ...resultado,
        items: [
            ...resultado.items,
            ...nuevosInfor
        ]
    };
    inventariosCache.current[mes] = resultadoFinal;
    return resultadoFinal;
}
            inventariosCache.current[mes] = resultado;
            return resultado;
        };
        const cargarFeriados = async () => {
            if (feriadosCache.current) {
                return feriadosCache.current;
            }
            const resultado = await PeYaFeriadosReader.read();
            feriadosCache.current = resultado;
            return resultado;
        };
        const cargarLocations = async () => {
            if (locationsCache.current) {
                return locationsCache.current;
            }
            const resultado = await PeYaLocationsReader.read(PEYA_LOCATIONS_FILE_ID);
            locationsCache.current = resultado;
            return resultado;
        };
        const cargar = async () => {
            try {
                setLoading(true);
                setError("");
                setInventarios([]);
                const meses = Object.keys(PEYA_INVENTARIOS_MESES).sort();
                const mesesConArchivo = meses.filter(
                        mes => PEYA_INVENTARIOS_MESES[mes].inventariosFileId !== null);
                if (mesesConArchivo.length === 0) {
                    throw new Error("No hay archivos de inventarios configurados.");
                }
                const [feriadosData, locationsData] = await Promise.all([
                    cargarFeriados(), cargarLocations()]);
                if (cancelado) {
                    return;
                }
                setFeriados(feriadosData);
                setLocations(locationsData);
                /* MES MÁS RECIENTE */
                const mesActual = mesesConArchivo[mesesConArchivo.length - 1];
                const inventariosActuales = await cargarMes(mesActual);
                if (cancelado) {
                    return;
                }
                setInventarios(inventariosActuales.items);
                setFechaActualizacion(inventariosActuales.createdAt);
                setLoading(false);
                /*
                 * HISTÓRICO
                 * EN SEGUNDO PLANO
                 */
                const mesesHistoricos =
                    mesesConArchivo
                        .slice(0, -1)
                        .reverse();

                for (
                    const mes
                    of mesesHistoricos
                ) {
                    if (cancelado) {
                        return;
                    }
                    try {
                        const resultado = await cargarMes(mes);
                        if (cancelado) {
                            return;
                        }
                        setInventarios(actuales => {
    const clavesNuevas = new Set(
        resultado.items.map(item => {
            const year = item.fecha.getFullYear();
            const month = String(
                item.fecha.getMonth() + 1
            ).padStart(2, "0");
            const day = String(
                item.fecha.getDate()
            ).padStart(2, "0");

            return `${year}-${month}-${day}|${item.ubicacion
                .trim()
                .toUpperCase()}`;
        })
    );

    const actualesSinDuplicados =
        actuales.filter(item => {
            const year = item.fecha.getFullYear();
            const month = String(
                item.fecha.getMonth() + 1
            ).padStart(2, "0");
            const day = String(
                item.fecha.getDate()
            ).padStart(2, "0");

            const clave =
                `${year}-${month}-${day}|${item.ubicacion
                    .trim()
                    .toUpperCase()}`;

            return !clavesNuevas.has(clave);
        });

    return [
        ...resultado.items,
        ...actualesSinDuplicados
    ];
});
                    } catch (err) {
                        console.error(`Error cargando inventarios PeYa ${mes}:`, err);
                    }
                }
            } catch (err) {
                if (cancelado) {
                    return;
                }
                console.error("Error cargando inventarios PeYa:", err);
                setError(err instanceof Error
                        ? err.message : "No fue posible cargar los datos de inventarios.");
                setLoading(false);
            }
        };
        void cargar();
        return () => { cancelado = true; };
    }, []);
    return {inventarios, feriados,locations, fechaActualizacion, loading, error};
};