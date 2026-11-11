import type { Lx22InventarioItem } from "../../../../readers/Lx22Reader";
export const dia = (f: Date) => [f.getFullYear(), f.getMonth()+1, f.getDate()].map(n => String(n).padStart(2,"0")).join("-");
export const esCiclico = (d: Lx22InventarioItem) => !d.referencia.trim() || d.referencia.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase() === "CICLICOS";
export const clave = (d: Lx22InventarioItem) => `${dia(d.fecha)}:${d.documento}`;
export const normalizarNumero = (numero: string) => numero.trim().replace(/^0+/, "");
export const buscarInventario = (documentos: Lx22InventarioItem[], numero: string) => {
    const n = normalizarNumero(numero);
    return n ? [...new Map(documentos.filter(d => normalizarNumero(d.documento) === n).map(d => [clave(d), d])).values()] : [];
};
export const paginarInventarios = (filas: Lx22InventarioItem[]) => {
    const paginas: Lx22InventarioItem[][] = [];
    for (let i = 0; i < filas.length; i += 35) paginas.push(filas.slice(i, i + 35));
    return paginas;
};
