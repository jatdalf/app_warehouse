import type { Lx03OcupacionItem } from "../Lx03OcupacionItem";

export interface CabeceraOT {
    key: string;
    movimiento: string;
    movimientoIM: string;
}
export interface MovimientoPicking {
    key: string;
    otKey: string;
    material: string;
    descripcion: string;
    centro: string;
    unidad: string;
    confirmado: boolean;
    fecha: string;
    storage: string;
    ubicacion: string;
    cantidad: number;
    cantidadDestino: number;
}
export interface HistorialRotacion {
    cabeceras: CabeceraOT[];
    movimientos: MovimientoPicking[];
    archivos: string[];
    duplicados: number;
}
export interface MaterialRotacion {
    material: string;
    descripcion: string;
    frecuencia: number;
    dias: number;
    ultimaSalida: string;
    cantidades: Record<string, number>;
    stockPiso: number;
    stockAltura: number;
    ubicaciones: { storage: string; ubicacion: string; cantidad: number; piso: boolean }[];
}

const normalizar = (value: string) => value.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").trim().toUpperCase().replace(/\s+/g, " ");
const id = (value: string) => value.trim().replace(/^0+(?=\d)/, "");

function tabla(texto: string, tipo: "LTAK" | "LTAP"): string[][] {
    if (!new RegExp(`Tabla:\\s*${tipo}\\b`, "i").test(texto)) {
        throw new Error(`El archivo debe ser una exportación de la tabla ${tipo}.`);
    }
    const lineas = texto.split(/\r?\n/);
    const indice = lineas.findIndex(linea => linea.includes("|") &&
        linea.split("|").some(celda => ["NUMERO OT", "TANUM"].includes(normalizar(celda))));
    if (indice < 0) throw new Error(`No se encontró el encabezado de ${tipo}.`);
    const encabezado = lineas[indice].split("|").map(normalizar);
    const filas = lineas.slice(indice + 1).filter(linea => linea.trimStart().startsWith("|"))
        .map(linea => linea.split("|").map(celda => celda.trim()));
    if (filas.some(fila => fila.length !== encabezado.length)) {
        throw new Error(`${tipo}: hay filas truncadas o separadores adicionales. Exportá nuevamente con todas las columnas.`);
    }
    return [encabezado, ...filas];
}
function columna(h: string[], nombres: string[], ocurrencia = 0): number {
    const indices = h.flatMap((nombre, indice) => nombres.map(normalizar).includes(nombre) ? [indice] : []);
    const indice = indices[ocurrencia];
    if (indice === undefined) throw new Error(`Falta la columna ${nombres[0]}. Revisá la variante de exportación.`);
    return indice;
}
function numero(valor: string): number {
    const texto = valor.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
    if (!texto) throw new Error("Hay cantidades vacías en LTAP.");
    const numero = Number(texto);
    if (!Number.isFinite(numero)) throw new Error(`Cantidad SAP inválida: ${valor}`);
    return numero;
}
function fechaSAP(valor: string): string {
    const partes = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(valor);
    if (!partes) throw new Error(`Fecha de confirmación inválida: ${valor}`);
    const [, d, m, a] = partes;
    const fecha = new Date(Number(a), Number(m) - 1, Number(d));
    if (fecha.getFullYear() !== Number(a) || fecha.getMonth() !== Number(m) - 1 || fecha.getDate() !== Number(d)) {
        throw new Error(`Fecha de confirmación inválida: ${valor}`);
    }
    return `${a}-${m}-${d}`;
}
export function parseLtak(texto: string): CabeceraOT[] {
    const [h, ...filas] = tabla(texto, "LTAK");
    const almacen = columna(h, ["Núm.almacén", "LGNUM"]);
    const ot = columna(h, ["Número OT", "TANUM"]);
    const wm = columna(h, ["Cl.movimiento", "BWLVS"]);
    const im = h.includes("BWART") ? h.indexOf("BWART") : columna(h, ["Cl.movimiento"], 1);
    return filas.filter(f => /^\d+$/.test(f[ot])).map(f => ({
        key: `${id(f[almacen])}|${id(f[ot])}`,
        movimiento: f[wm], movimientoIM: f[im],
    }));
}
export function parseLtap(texto: string): MovimientoPicking[] {
    const [h, ...filas] = tabla(texto, "LTAP");
    const campos = {
        almacen: columna(h, ["Núm.almacén", "LGNUM"]), ot: columna(h, ["Número OT", "TANUM"]),
        posicion: columna(h, ["Posición OT", "TAPOS"]), material: columna(h, ["Material", "MATNR"]),
        centro: columna(h, ["Centro", "WERKS"]), unidad: columna(h, ["UM base", "MEINS"]),
        confirmado: columna(h, ["Confirmación", "PQUIT"]), fecha: columna(h, ["Fe.confirmación", "QDATU"]),
        storage: columna(h, ["Tp.alm.proced.", "VLTYP"]), ubicacion: columna(h, ["Ubic.proced.", "VLPLA"]),
        cantidad: columna(h, ["CtdRealDesde", "VISTM"]), destino: columna(h, ["Ctd.real dest.", "NISTM"]),
        descripcion: columna(h, ["Denominación", "MAKTX"]),
    };
    return filas.filter(f => /^\d+$/.test(f[campos.ot])).map(f => {
        const c = campos;
        const otKey = `${id(f[c.almacen])}|${id(f[c.ot])}`;
        if (!/^\d+$/.test(f[c.posicion]) || !f[c.material] || !f[c.storage] || !f[c.ubicacion] || !f[c.unidad]) {
            throw new Error(`La OT ${f[c.ot]} tiene una posición sin identificador, material, unidad u origen.`);
        }
        const confirmado = f[c.confirmado].toUpperCase() === "X";
        return {
            key: `${otKey}|${id(f[c.posicion])}`, otKey,
            material: f[c.material].toUpperCase(), descripcion: f[c.descripcion], centro: f[c.centro],
            unidad: f[c.unidad], confirmado, fecha: confirmado ? fechaSAP(f[c.fecha]) : "",
            storage: f[c.storage].toUpperCase(), ubicacion: f[c.ubicacion].toUpperCase(),
            cantidad: numero(f[c.cantidad]), cantidadDestino: numero(f[c.destino]),
        };
    });
}
export async function textoSAP(file: File): Promise<string> {
    const bytes = new Uint8Array(await file.arrayBuffer());
    try { return new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
    catch { return new TextDecoder("windows-1252").decode(bytes); }
}
function unicos<T extends { key: string }>(items: T[]): { items: T[]; duplicados: number } {
    const mapa = new Map<string, T>();
    let duplicados = 0;
    for (const item of items) {
        const anterior = mapa.get(item.key);
        if (anterior) {
            if (JSON.stringify(anterior) !== JSON.stringify(item)) {
                throw new Error(`La clave ${item.key} tiene datos distintos entre archivos. Cargá un conjunto consistente con “Reemplazar historial”.`);
            }
            duplicados++;
        } else mapa.set(item.key, item);
    }
    return { items: [...mapa.values()], duplicados };
}
export function combinarHistorial(anterior: HistorialRotacion | undefined, nuevo: HistorialRotacion): HistorialRotacion {
    const cabeceras = unicos([...(anterior?.cabeceras ?? []), ...nuevo.cabeceras]);
    const movimientos = unicos([...(anterior?.movimientos ?? []), ...nuevo.movimientos]);
    if (!cabeceras.items.length || !movimientos.items.length) throw new Error("Los archivos no contienen registros válidos.");
    const almacenes = new Set([...cabeceras.items.map(c => c.key.split("|")[0]), ...movimientos.items.map(m => m.otKey.split("|")[0])]);
    const centros = new Set(movimientos.items.map(m => m.centro));
    if (almacenes.size !== 1 || centros.size !== 1) throw new Error("Cargá archivos de un solo almacén y centro SAP por warehouse.");
    return { cabeceras: cabeceras.items, movimientos: movimientos.items,
        archivos: [...new Set([...(anterior?.archivos ?? []), ...nuevo.archivos])],
        duplicados: (anterior?.duplicados ?? 0) + movimientos.duplicados };
}
export function analizarRotacion(lx03: Lx03OcupacionItem[], historial: HistorialRotacion,
    desde: string, hasta: string, movimiento: string) {
    const cabeceras = new Map(historial.cabeceras.map(c => [c.key, c]));
    const materiales = new Map<string, MaterialRotacion>();
    for (const fila of lx03) {
        const material = fila.material.trim().toUpperCase();
        if (!material || !Number.isFinite(fila.cantidad) || fila.cantidad <= 0) continue;
        const item = materiales.get(material) ?? { material, descripcion: "", frecuencia: 0, dias: 0,
            ultimaSalida: "", cantidades: {}, stockPiso: 0, stockAltura: 0, ubicaciones: [] };
        const storage = fila.storage.trim().toUpperCase();
        const piso = storage.endsWith("P");
        if (piso) item.stockPiso += fila.cantidad; else item.stockAltura += fila.cantidad;
        const ubicacion = fila.ubicacion.trim().toUpperCase();
        const existente = item.ubicaciones.find(u => u.storage === storage && u.ubicacion === ubicacion);
        if (existente) existente.cantidad += fila.cantidad;
        else item.ubicaciones.push({ storage, ubicacion, cantidad: fila.cantidad, piso });
        materiales.set(material, item);
    }
    const dias = new Map<string, Set<string>>();
    let sinCruce = 0, noConfirmadas = 0, sinExtraccion = 0, diferencias = 0, incluidas = 0;
    for (const fila of historial.movimientos) {
        const cabecera = cabeceras.get(fila.otKey);
        if (!cabecera) { sinCruce++; continue; }
        if (!fila.confirmado) { noConfirmadas++; continue; }
        if (`${cabecera.movimiento}/${cabecera.movimientoIM}` !== movimiento || fila.fecha < desde || fila.fecha > hasta) continue;
        if (fila.cantidad <= 0) { sinExtraccion++; continue; }
        incluidas++;
        if (fila.cantidad !== fila.cantidadDestino) diferencias++;
        const item = materiales.get(fila.material);
        if (!item) continue;
        item.descripcion ||= fila.descripcion;
        item.frecuencia++;
        item.ultimaSalida = fila.fecha > item.ultimaSalida ? fila.fecha : item.ultimaSalida;
        item.cantidades[fila.unidad] = (item.cantidades[fila.unidad] ?? 0) + fila.cantidad;
        const fechas = dias.get(fila.material) ?? new Set<string>(); fechas.add(fila.fecha); dias.set(fila.material, fechas);
    }
    for (const item of materiales.values()) item.dias = dias.get(item.material)?.size ?? 0;
    return { materiales: [...materiales.values()].sort((a, b) => b.frecuencia - a.frecuencia || a.material.localeCompare(b.material)),
        sinCruce, noConfirmadas, sinExtraccion, diferencias, incluidas };
}
