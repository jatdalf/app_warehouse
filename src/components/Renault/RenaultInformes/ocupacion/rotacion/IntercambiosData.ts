import type { Lx03OcupacionItem } from "../Lx03OcupacionItem";
import type { MaterialRotacion } from "./RotacionData";
import { storageElegible } from "./RotacionData";

export interface CandidatoIntercambio {
    material: string; descripcion: string; frecuencia: number;
    storage: string; ubicacion: string; cantidad: number;
}
export interface Intercambio {
    id: string; bajar: CandidatoIntercambio; subir: CandidatoIntercambio;
}
const normalizar = (v: string) => v.trim().toUpperCase();
const clave = (storage: string, ubicacion: string) => `${storage}|${ubicacion}`;
/** La cantidad pedida es un máximo; nunca se fuerza un intercambio sin mejora. */
export function sugerirIntercambios(stock: Lx03OcupacionItem[], materiales: MaterialRotacion[], cantidad: number): Intercambio[] {
    if (!Number.isInteger(cantidad) || cantidad < 1) return [];
    const rotacion = new Map(materiales.map(m => [normalizar(m.material), m]));
    const posiciones = new Map<string, { storage: string; ubicacion: string; materiales: Map<string, number> }>();
    // Se incluyen todos los materiales con stock de cada posición antes de decidir
    // elegibilidad, para no convertir una posición mixta en aparentemente unitaria.
    for (const fila of stock) {
        const storage = normalizar(fila.storage), ubicacion = normalizar(fila.ubicacion), material = normalizar(fila.material);
        if (!storageElegible(storage) || !ubicacion || !material || !Number.isFinite(fila.cantidad) || fila.cantidad <= 0) continue;
        const key = clave(storage, ubicacion);
        const posicion = posiciones.get(key) ?? { storage, ubicacion, materiales: new Map<string, number>() };
        posicion.materiales.set(material, (posicion.materiales.get(material) ?? 0) + fila.cantidad);
        posiciones.set(key, posicion);
    }
    const altos: CandidatoIntercambio[] = [], pisos: CandidatoIntercambio[] = [];
    for (const p of posiciones.values()) {
        // Solo códigos de storage de tres caracteres: dos de familia + nivel.
        if (!/^[A-Z0-9]{3}$/.test(p.storage) || p.materiales.size !== 1) continue;
        const [material, cantidad] = [...p.materiales][0];
        const m = rotacion.get(material);
        if (!m) continue;
        const candidato = { material, cantidad, descripcion: m.descripcion, frecuencia: m.frecuencia, storage: p.storage, ubicacion: p.ubicacion };
        if (p.storage.endsWith("P")) {
            if (m.frecuencia > 0 || m.movimientosPeriodo === 0) pisos.push(candidato);
        }
        else if (m.frecuencia > 0 && m.stockPiso === 0) altos.push(candidato);
    }
    // No se deduce una altura física desde una nomenclatura no documentada.
    altos.sort((a,b) => b.frecuencia-a.frecuencia || a.storage.localeCompare(b.storage) || a.ubicacion.localeCompare(b.ubicacion));
    pisos.sort((a,b) => a.frecuencia-b.frecuencia || a.storage.localeCompare(b.storage) || a.ubicacion.localeCompare(b.ubicacion));
    const usados = new Set<string>();
    const resultado: Intercambio[] = [];
    for (const bajar of altos) {
        const subir = pisos.find(p => p.storage.slice(0,2) === bajar.storage.slice(0,2) && p.material !== bajar.material && p.frecuencia < bajar.frecuencia && !usados.has(clave(p.storage,p.ubicacion)));
        if (!subir) continue;
        usados.add(clave(subir.storage,subir.ubicacion));
        resultado.push({ id: `${clave(bajar.storage,bajar.ubicacion)}>${clave(subir.storage,subir.ubicacion)}`, bajar, subir });
        if (resultado.length >= cantidad) break;
    }
    return resultado;
}
