export interface SaludStock {
    almacen: string; ubicacion: string; tipo: string; material: string; lote: string;
    cantidad: number; centro: string; fila: number;
}
export interface SaludMaterial { material: string; lote: string; descripcion: string; centro: string }
export interface SaludIncidencia {
    almacen: string; ubicacion: string; actual: string; sugerencia: string; motivo: string;
}
export interface SaludContenido {
    almacen: string; ubicacion: string;
    materiales: { material: string; descripcion: string; lotes: string[] }[];
}
export interface SaludResumen {
    total: number; ocupadas: number; libres: number; virtuales: number;
    pallet: number; estanteria: number; ubicacionesPallet: number; ubicacionesEstanteria: number;
    sinTipoValido: number; incidencias: SaludIncidencia[];
    multiMaterial: SaludContenido[]; multiLote: SaludContenido[];
    repetidas: { ubicacion: string; almacenes: string[]; materiales: string[] }[];
    sinFicha: { material: string; lote: string; centro: string }[];
    gruposSinPatron: number;
}
const disponibles = new Set([1,6,11,16,21,22,27,32]);
export const texto = (v: unknown) => String(v ?? "").trim().toUpperCase();
export const codigo = (v: unknown) => texto(v).replace(/^0+(?=\d)/, "");
export const esMaterial = (v: string) => Boolean(v && !/VAC[IÍ]A|^<|^SIN MATERIAL$/.test(v));
export const esVirtual = (r: Pick<SaludStock, "almacen" | "ubicacion">) =>
    /^9\d{2}$/.test(codigo(r.almacen)) || r.ubicacion.startsWith("9");
const tipoPosicion = (tipo: string) => {
    const match = /^(P|E)([2468])?$/.exec(tipo);
    if (!match || (match[1] === "P" && match[2] && !["2","4"].includes(match[2]))) return null;
    return { familia: match[1], divisor: Number(match[2] ?? 1) };
};
export function analizarSalud(stock: SaludStock[], catalogo: SaludMaterial[]): SaludResumen {
    const fisicas = stock.filter(r => r.ubicacion && !esVirtual(r));
    const porUbicacion = new Map<string, SaludStock[]>();
    const porGrupo = new Map<string, { almacen: string; base: string; nivel: number; posiciones: Map<string, SaludStock[]> }>();
    const fichas = new Set(catalogo.map(m => `${codigo(m.material)}|${codigo(m.lote)}|${texto(m.centro)}`));
    const descripciones = new Map<string, Set<string>>();
    for (const m of catalogo) {
        const valores = descripciones.get(codigo(m.material)) ?? new Set<string>();
        if (m.descripcion) valores.add(m.descripcion);
        descripciones.set(codigo(m.material), valores);
    }
    for (const r of fisicas) {
        const filas = porUbicacion.get(r.ubicacion) ?? []; filas.push(r); porUbicacion.set(r.ubicacion, filas);
        const match = /^(.*)\.(\d{2})$/.exec(r.ubicacion);
        if (match) {
            const sufijo = Number(match[2]); const nivel = Math.floor(sufijo / 10);
            const base = `${match[1]}.${nivel}0`; const key = `${codigo(r.almacen)}|${base}`;
            const grupo = porGrupo.get(key) ?? { almacen: codigo(r.almacen), base, nivel, posiciones: new Map<string, SaludStock[]>() };
            const registros = grupo.posiciones.get(r.ubicacion) ?? []; registros.push(r); grupo.posiciones.set(r.ubicacion, registros); porGrupo.set(key, grupo);
        }
    }
    const incidencias: SaludIncidencia[] = [];
    const agregar = (r: SaludStock, motivo: string, sugerencia: string) => incidencias.push({ almacen: codigo(r.almacen), ubicacion: r.ubicacion, actual: r.tipo || "Sin tipo", motivo, sugerencia });
    let ocupadas = 0, pallet = 0, estanteria = 0, ubicacionesPallet = 0, ubicacionesEstanteria = 0, sinTipoValido = 0;
    const repetidas: SaludResumen["repetidas"] = [];
    for (const [ubicacion, filas] of porUbicacion) {
        if (filas.some(r => esMaterial(r.material) && r.cantidad > 0)) ocupadas++;
        const tipos = [...new Set(filas.map(r => r.tipo))];
        const almacenes = [...new Set(filas.map(r => codigo(r.almacen)))].sort((a,b)=>Number(a)-Number(b));
        if (almacenes.length > 1) repetidas.push({ ubicacion, almacenes, materiales: [...new Set(filas.filter(r=>esMaterial(r.material)).map(r=>r.material))] });
        if (tipos.length !== 1 || !tipoPosicion(tipos[0])) {
            sinTipoValido++;
            agregar(filas[0], tipos.length > 1 ? `Tipos distintos para la misma ubicación: ${tipos.join(", ")}` : "Tipo de ubicación no reconocido", "Revisar tipo y configuración física; no incluida en equivalentes.");
        } else {
            const tipo = tipoPosicion(tipos[0])!;
            if (tipo.familia === "P") { pallet += 1/tipo.divisor; ubicacionesPallet++; }
            else { estanteria += 1/tipo.divisor; ubicacionesEstanteria++; }
        }
    }
    for (const grupo of porGrupo.values()) {
        const filas = [...grupo.posiciones.values()].flat();
        const familias = new Set(filas.map(r => tipoPosicion(r.tipo)?.familia).filter(Boolean));
        if (familias.size !== 1) {
            if (familias.size > 1) agregar(filas[0], `La base ${grupo.base} mezcla pallet y estantería`, "Verificar familia P/E físicamente antes de cambiar tipos.");
            continue;
        }
        const familia = [...familias][0]!;
        const maxNivel = familia === "P" ? 6 : 8;
        if (grupo.nivel < 1 || grupo.nivel > maxNivel) agregar(filas[0], `Nivel fuera de rango para ${familia}: ${grupo.base}`, "Verificar nomenclatura y nivel real del rack.");
        const hijos = [...grupo.posiciones.entries()].filter(([u]) => Number(u.slice(-2)) % 10 !== 0);
        const base = grupo.posiciones.get(grupo.base);
        if (base && hijos.length) agregar(base[0], "Existe la posición base junto con sus subdivisiones", "Revisar stock y retirar la base de la configuración si la división está vigente. No trasladar ni borrar automáticamente.");
        if (!hijos.length) {
            if (base && base.some(r=> (tipoPosicion(r.tipo)?.divisor ?? 1) > 1)) agregar(base[0], "Base sin sufijo de subdivisión con tipo fraccionado", "Verificar si faltan sububicaciones o si corresponde tipo entero.");
            continue;
        }
        const secuencia = hijos.map(([u])=>Number(u.slice(-1))).sort((a,b)=>a-b);
        const maxSufijo = Math.max(...secuencia);
        const permitidos = familia === "P" ? [2,4] : [2,4,6,8];
        const maxDeclarado = Math.max(...hijos.flatMap(([, rs])=>rs.map(r=>tipoPosicion(r.tipo)?.divisor ?? 1)));
        const completa = permitidos.includes(maxSufijo) && secuencia.length === maxSufijo && secuencia.every((n,i)=>n===i+1);
        if (completa && maxDeclarado <= maxSufijo) {
            const esperado = `${familia}${maxSufijo}`;
            for (const [, rs] of hijos) for (const tipo of new Set(rs.map(r=>r.tipo))) {
                if (tipo !== esperado) agregar({ ...rs[0], tipo }, `La base ${grupo.base} tiene ${maxSufijo} subdivisiones consecutivas`, `Corregir a ${esperado}, previa confirmación física.`);
            }
        } else {
            const r = hijos[0][1][0];
            agregar(r, `Grupo ${grupo.base} incompleto o ambiguo: sufijos ${secuencia.join(", ")}; tipos ${[...new Set(hijos.flatMap(([,rs])=>rs.map(x=>x.tipo)))].join(", ")}`, "Revisar cantidad real de divisiones y completar/corregir el grupo; no se infiere un tipo definitivo.");
        }
    }
    const porAlmacenUbicacion = new Map<string, SaludStock[]>();
    for (const r of fisicas) {
        if (!disponibles.has(Number(r.almacen)) || !esMaterial(r.material) || r.cantidad <= 0) continue;
        const key = `${codigo(r.almacen)}|${r.ubicacion}`; const filas = porAlmacenUbicacion.get(key) ?? []; filas.push(r); porAlmacenUbicacion.set(key, filas);
    }
    const multiMaterial: SaludContenido[] = [], multiLote: SaludContenido[] = [];
    const sinFicha = new Map<string, { material: string; lote: string; centro: string }>();
    for (const filas of porAlmacenUbicacion.values()) {
        const materiales = new Map<string, { material: string; descripcion: string; lotes: Map<string,string> }>();
        for (const r of filas) {
            const key = codigo(r.material);
            const item = materiales.get(key) ?? { material: r.material, descripcion: [...(descripciones.get(key) ?? [])].join(" / "), lotes: new Map<string,string>() };
            if (r.lote) item.lotes.set(codigo(r.lote),r.lote);
            materiales.set(key,item);
        }
        const contenido: SaludContenido = { almacen: codigo(filas[0].almacen), ubicacion: filas[0].ubicacion, materiales: [...materiales.values()].map(m=>({...m, lotes:[...m.lotes.values()]})) };
        if (materiales.size>1) multiMaterial.push(contenido);
        const conVariosLotes = contenido.materiales.filter(m=>m.lotes.length>1);
        if (conVariosLotes.length) multiLote.push({...contenido,materiales:conVariosLotes});
    }
    for (const r of fisicas) {
        if (!esMaterial(r.material) || r.cantidad<=0) continue;
        const key = `${codigo(r.material)}|${codigo(r.lote)}|${texto(r.centro)}`;
        if (!fichas.has(key)) sinFicha.set(key,{material:r.material,lote:r.lote,centro:r.centro});
    }
    const gruposSinPatron = [...porUbicacion.keys()].filter(u=>!/^.+\.\d{2}$/.test(u)).length;
    return { total:porUbicacion.size, ocupadas, libres:porUbicacion.size-ocupadas,
        virtuales:new Set(stock.filter(esVirtual).map(r=>r.ubicacion)).size,
        pallet, estanteria, ubicacionesPallet, ubicacionesEstanteria, sinTipoValido,
        incidencias, multiMaterial, multiLote, repetidas, sinFicha:[...sinFicha.values()], gruposSinPatron };
}
