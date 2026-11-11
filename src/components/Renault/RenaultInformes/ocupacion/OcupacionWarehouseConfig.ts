import type { Lx03OcupacionItem } from "./Lx03OcupacionItem";
const excluidos: Record<"W1" | "W2", ReadonlySet<string>> = {
    W1: new Set(["CRO", "QRP", "SER", "NOC", "TP3", "INS"]),
    W2: new Set(["INI", "QRP", "SER", "NOC"]),
};
/** Se aplica tanto a Drive como a cargas locales, antes de calcular los indicadores. */
export const filtrarStoragesMedibles = (filas: Lx03OcupacionItem[], warehouse: "W1" | "W2") =>
    filas.filter(f => !excluidos[warehouse].has(f.storage.trim().toUpperCase()));
