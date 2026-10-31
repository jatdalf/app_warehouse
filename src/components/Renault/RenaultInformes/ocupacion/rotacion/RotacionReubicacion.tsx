import { useMemo, useRef, useState } from "react";
import type { Lx03OcupacionItem } from "../Lx03OcupacionItem";
import { analizarRotacion, combinarHistorial, parseLtak, parseLtap, textoSAP } from "./RotacionData";
import type { HistorialRotacion, MaterialRotacion } from "./RotacionData";
import styles from "./RotacionReubicacion.module.css";

type Grupo = "bajar" | "subir" | "sin";
interface Fuente { historial: HistorialRotacion; desde: string; hasta: string; movimiento: string; cobertura: boolean }
const formato = (n: number) => n.toLocaleString("es-AR", { maximumFractionDigits: 3 });
const fecha = (s: string) => s ? s.split("-").reverse().join("/") : "—";

export default function RotacionReubicacion({ lx03, warehouse, disponible }: { lx03: Lx03OcupacionItem[]; warehouse: "W1" | "W2"; disponible: boolean }) {
    const [fuentes, setFuentes] = useState<Partial<Record<"W1" | "W2", Fuente>>>({});
    const [ltak, setLtak] = useState<File[]>([]);
    const [ltap, setLtap] = useState<File[]>([]);
    const [destino, setDestino] = useState<"W1" | "W2">(warehouse);
    const [sumar, setSumar] = useState(true);
    const [confirmarWarehouse, setConfirmarWarehouse] = useState(false);
    const [ocupado, setOcupado] = useState(false);
    const [error, setError] = useState("");
    const [alta, setAlta] = useState(20);
    const [baja, setBaja] = useState(3);
    const [grupo, setGrupo] = useState<Grupo>("bajar");
    const [busqueda, setBusqueda] = useState("");
    const [pagina, setPagina] = useState(0);
    const detalle = useRef<HTMLDivElement>(null);
    const fuente = fuentes[warehouse];
    const rangoValido = Boolean(fuente && fuente.desde && fuente.hasta && fuente.desde <= fuente.hasta);
    const resultado = useMemo(() => fuente && rangoValido && fuente.movimiento
        ? analizarRotacion(lx03, fuente.historial, fuente.desde, fuente.hasta, fuente.movimiento) : null,
        [lx03, fuente, rangoValido]);
    const umbralesValidos = Number.isFinite(alta) && Number.isFinite(baja) && alta > baja && baja >= 1;
    const coberturaValida = Boolean(fuente?.cobertura && resultado && resultado.sinCruce === 0);
    const grupos = useMemo(() => {
        const materiales = resultado?.materiales ?? [];
        return {
            bajar: umbralesValidos ? materiales.filter(m => m.frecuencia >= alta && m.stockPiso === 0 && m.stockAltura > 0) : [],
            subir: umbralesValidos && coberturaValida ? materiales.filter(m => m.frecuencia >= 1 && m.frecuencia <= baja && m.stockPiso > 0) : [],
            sin: coberturaValida ? materiales.filter(m => m.frecuencia === 0) : [],
        };
    }, [resultado, alta, baja, umbralesValidos, coberturaValida]);
    const filtrados = grupos[grupo].filter(m => `${m.material} ${m.descripcion} ${m.ubicaciones.map(u => `${u.storage} ${u.ubicacion}`).join(" ")}`.toUpperCase().includes(busqueda.trim().toUpperCase()));
    const paginas = Math.max(1, Math.ceil(filtrados.length / 50));
    const paginaActual = Math.min(pagina, paginas - 1);
    const movimientos = [...new Set(fuente?.historial.cabeceras.map(c => `${c.movimiento}/${c.movimientoIM}`) ?? [])].sort();
    const actualizar = (cambio: Partial<Fuente>) => {
        setFuentes(actual => {
            const previo = actual[warehouse];
            return previo ? { ...actual, [warehouse]: { ...previo, ...cambio } } : actual;
        });
        setPagina(0);
    };
    const cargar = async () => {
        const warehouseDestino = destino;
        setOcupado(true); setError("");
        try {
            const [cabeceras, posiciones] = await Promise.all([
                Promise.all(ltak.map(async f => parseLtak(await textoSAP(f)))),
                Promise.all(ltap.map(async f => parseLtap(await textoSAP(f)))),
            ]);
            const previo = sumar ? fuentes[warehouseDestino] : undefined;
            const historial = combinarHistorial(previo?.historial, {
                cabeceras: cabeceras.flat(), movimientos: posiciones.flat(),
                archivos: [...ltak, ...ltap].map(f => f.name), duplicados: 0,
            });
            const fechas = historial.movimientos.filter(m => m.confirmado).map(m => m.fecha).sort();
            if (!fechas.length) throw new Error("No hay posiciones confirmadas con fecha válida.");
            const nueva: Fuente = { historial, desde: fechas[0], hasta: fechas[fechas.length - 1], movimiento: previo?.movimiento ?? "", cobertura: false };
            setFuentes(actual => ({ ...actual, [warehouseDestino]: nueva }));
            setPagina(0);
        } catch (err) {
            setError(err instanceof Error ? err.message : "No fue posible procesar los archivos.");
        } finally { setOcupado(false); }
    };
    const cards: { key: Grupo; titulo: string; texto: string; habilitada: boolean }[] = [
        { key: "bajar", titulo: "Candidatos a bajar", texto: "Alta frecuencia · stock solo en altura", habilitada: Boolean(resultado && umbralesValidos) },
        { key: "subir", titulo: "Candidatos a subir", texto: "Baja frecuencia · stock en piso", habilitada: Boolean(resultado && umbralesValidos && coberturaValida) },
        { key: "sin", titulo: "Sin picking en el período", texto: "Materiales con stock actual · piso o altura", habilitada: Boolean(resultado && coberturaValida) },
    ];
    return <section hidden={!disponible} className={styles.container} aria-label="Rotación y reubicación">
        <div className={styles.heading}><div><h2>Rotación y reubicación</h2><p>{warehouse} · Historial de picking + LX03 actual</p></div><span className={styles.tag}>Sugerencias para revisión</span></div>
        <details className={styles.carga} open={!fuente}>
            <summary>Cargar historial LTAK / LTAP</summary>
            <p>Podés seleccionar varias semanas. Los registros idénticos no se vuelven a contar. El historial queda en memoria mientras esta pantalla esté abierta.</p>
            <div className={styles.inputs}>
                <label>LTAK (.dat o .txt)<input type="file" accept=".dat,.txt" multiple disabled={ocupado} onChange={e => { setLtak(Array.from(e.target.files ?? [])); setConfirmarWarehouse(false); }} /></label>
                <label>LTAP (.dat o .txt)<input type="file" accept=".dat,.txt" multiple disabled={ocupado} onChange={e => { setLtap(Array.from(e.target.files ?? [])); setConfirmarWarehouse(false); }} /></label>
                <label>Warehouse del historial<select value={destino} disabled={ocupado} onChange={e => { setDestino(e.target.value as "W1" | "W2"); setConfirmarWarehouse(false); }}><option value="W1">W1 · REP</option><option value="W2">W2 · BsAs</option></select></label>
                <label>Modo de carga<select value={sumar ? "sumar" : "reemplazar"} disabled={ocupado} onChange={e => setSumar(e.target.value === "sumar")}><option value="sumar">Agregar al historial</option><option value="reemplazar">Reemplazar historial</option></select></label>
            </div>
            <label className={styles.check}><input type="checkbox" checked={confirmarWarehouse} disabled={ocupado} onChange={e => setConfirmarWarehouse(e.target.checked)} />Confirmo que ambos extractos corresponden a {destino} y al mismo sistema SAP.</label>
            <button type="button" disabled={ocupado || !ltak.length || !ltap.length || !confirmarWarehouse} onClick={() => void cargar()}>{ocupado ? "Procesando..." : "Analizar historial"}</button>
            {error && <p className={styles.error} role="alert">{error}</p>}
        </details>
        {fuente && <>
            <div className={styles.filtros}>
                <label>Desde<input type="date" value={fuente.desde} onChange={e => actualizar({ desde: e.target.value, cobertura: false })} /></label>
                <label>Hasta<input type="date" value={fuente.hasta} onChange={e => actualizar({ hasta: e.target.value, cobertura: false })} /></label>
                <label>Movimiento WM / IM<select value={fuente.movimiento} onChange={e => actualizar({ movimiento: e.target.value, cobertura: false })}><option value="">Seleccionar picking…</option>{movimientos.map(m => <option key={m} value={m}>{m}</option>)}</select></label>
                <label>Alta: líneas ≥<input type="number" min={baja + 1} step="1" value={alta} onChange={e => { setAlta(Math.max(0, Math.trunc(Number(e.target.value)))); setPagina(0); }} /></label>
                <label>Baja: líneas ≤<input type="number" min="1" max={alta - 1} step="1" value={baja} onChange={e => { setBaja(Math.max(0, Math.trunc(Number(e.target.value)))); setPagina(0); }} /></label>
            </div>
            <p className={styles.note}>Umbrales por material en todo el período elegido, medidos en posiciones de OT con extracción positiva. Confirmá con IT qué combinación WM / IM corresponde a picking. No se combinan PC y ST.</p>
            {!rangoValido && <p className={styles.error}>Elegí un rango de fechas válido.</p>}
            {!umbralesValidos && <p className={styles.error}>El umbral de alta debe superar al de baja; el de baja debe ser al menos 1.</p>}
            {resultado && <div className={styles.coverage}>
                <strong>Período: {fecha(fuente.desde)} al {fecha(fuente.hasta)} · {formato(resultado.incluidas)} posiciones incluidas</strong>
                <span>{formato(fuente.historial.movimientos.length)} posiciones únicas · {formato(fuente.historial.duplicados)} duplicadas omitidas · {formato(resultado.sinCruce)} sin LTAK · {formato(resultado.noConfirmadas)} no confirmadas · {formato(resultado.sinExtraccion)} sin extracción positiva en el filtro · {formato(resultado.diferencias)} con cantidad origen/destino distinta</span>
                <span>Archivos: {fuente.historial.archivos.join(" · ")}</span>
                <label className={styles.check}><input type="checkbox" checked={fuente.cobertura} disabled={resultado.sinCruce > 0} onChange={e => actualizar({ cobertura: e.target.checked })} />Confirmo cobertura completa de picking para este warehouse, movimiento y período, sin semanas faltantes ni límites de exportación.</label>
                {!coberturaValida && <span>Las categorías de baja frecuencia y sin picking se habilitan al confirmar cobertura completa y resolver posiciones sin LTAK. Una fecha sin movimientos no prueba por sí sola que falten datos.</span>}
            </div>}
        </>}
        {!fuente && <p className={styles.empty}>Cargá el historial de {warehouse} para analizar la rotación. No se calcula demanda a partir de la LX03.</p>}
        <div className={styles.cards}>{cards.map(card => <button type="button" key={card.key} disabled={!card.habilitada} aria-pressed={grupo === card.key} className={`${styles.card} ${styles[card.key]}`} onClick={() => { setGrupo(card.key); setPagina(0); detalle.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}><span>{card.titulo}</span><strong>{card.habilitada ? formato(grupos[card.key].length) : "—"}</strong><small>{card.texto}</small></button>)}</div>
        {resultado && <div ref={detalle} className={styles.detalle}>
            <div className={styles.detailHeading}><h3>{cards.find(c => c.key === grupo)?.titulo}</h3><input aria-label="Buscar material, descripción, storage o ubicación" placeholder="Buscar material o ubicación…" value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(0); }} /></div>
            <p className={styles.note}>Stock según la LX03 seleccionada. Piso: storage terminado en P. Cantidades de stock según el lector LX03 actual; no se convierten unidades. Las propuestas no asignan destino ni validan capacidad, peso o compatibilidad.</p>
            {!cards.find(c => c.key === grupo)?.habilitada ? <p className={styles.empty}>Completá las condiciones de análisis para habilitar esta categoría.</p> : filtrados.length === 0 ? <p className={styles.empty}>No hay materiales que cumplan estos criterios.</p> : <>
                <div className={styles.tableWrapper}><table><thead><tr><th>Material / descripción</th><th>Líneas picking</th><th>Días con picking</th><th>Última salida</th><th>Extraído por UM</th><th>Stock piso</th><th>Stock altura</th><th>Ubicaciones actuales</th></tr></thead><tbody>{filtrados.slice(paginaActual * 50, (paginaActual + 1) * 50).map((m: MaterialRotacion) => <tr key={m.material}><td><strong>{m.material}</strong><small>{m.descripcion || "Sin descripción en el historial seleccionado"}</small></td><td>{formato(m.frecuencia)}</td><td>{m.dias}</td><td>{fecha(m.ultimaSalida)}</td><td>{Object.entries(m.cantidades).map(([um, n]) => `${formato(n)} ${um}`).join(" · ") || "—"}</td><td>{formato(m.stockPiso)}</td><td>{formato(m.stockAltura)}</td><td>{m.ubicaciones.map(u => <small key={`${u.storage}|${u.ubicacion}`}>{u.storage} · {u.ubicacion} · {formato(u.cantidad)} · {u.piso ? "Piso" : "Altura"}</small>)}</td></tr>)}</tbody></table></div>
                <div className={styles.paginacion}><button type="button" disabled={paginaActual === 0} onClick={() => setPagina(paginaActual - 1)}>Anterior</button><span>{formato(filtrados.length)} materiales · Página {paginaActual + 1} de {paginas}</span><button type="button" disabled={paginaActual + 1 >= paginas} onClick={() => setPagina(paginaActual + 1)}>Siguiente</button></div>
            </>}
        </div>}
        <p className={styles.note}>Las recomendaciones son preliminares. “Sin picking” solo describe el período y movimiento declarados; también puede incluir materiales nuevos. Al cambiar de LX03, los candidatos se recalculan con el stock actual.</p>
    </section>;
}
