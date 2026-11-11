import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Lx22Reader, type Lx22InventarioItem } from "../../../../readers/Lx22Reader";
import renault from "../../../../assets/renault-claro.png";

import styles from "./InventarioSapInforme.module.css";

import { dia, esCiclico, clave, buscarInventario, paginarInventarios } from "./RegistroEntregaData";

export function GestionMeses({ warehouse, meses, seleccion, aplicar }: {
    warehouse: string; meses: string[]; seleccion: readonly string[]; aplicar: (meses: string[]) => void;
}) {
    const modal = useRef<HTMLDialogElement>(null);
    const [borrador, setBorrador] = useState<string[]>([]);
    const [vista, setVista] = useState("");
    const version = useRef(0);
    return <div className={styles.noImprimir}>
        <button type="button" title="Cargar meses adicionales" aria-label="Cargar meses adicionales" onClick={() => {
            setBorrador([...seleccion]); setVista(""); modal.current?.showModal();
        }}>+</button>
        <dialog ref={modal} className={styles.inventarioModal} aria-label="Datos del informe">
            <h2>Datos del informe · {warehouse}</h2>
            <div className={styles.panelDatos}>
                <section><h3>Meses incluidos</h3>
                    {meses.map(mes => <label key={mes}><input type="checkbox" checked={borrador.includes(mes)} onChange={e => {
                        const checked = e.target.checked;
                        setBorrador(prev => checked ? [...prev, mes] : prev.filter(m => m !== mes));
                    }} />{mes}</label>)}
                    <button type="button" disabled={!borrador.length} onClick={() => { modal.current?.close(); aplicar(borrador); }}>Aplicar meses</button>
                </section>
                <section><h3>Revisar extracto LX22</h3>
                    <p>Vista previa local. Esta revisión no guarda cambios en la base compartida.</p>
                    <input type="file" accept=".xlsx,.xls" aria-label="Revisar archivo LX22" onChange={async e => {
                        const archivo = e.target.files?.[0];
                        if (!archivo) return;
                        const intento = ++version.current;
                        setVista("Leyendo LX22…");
                        try {
                            const registros = Lx22Reader.parse(new Uint8Array(await archivo.arrayBuffer()));
                            if (!registros.length) throw new Error("No se encontraron documentos LX22 válidos.");
                            const fechas = registros.map(r => dia(r.fecha)).sort();
                            const mesesArchivo = [...new Set(fechas.map(f => f.slice(0,7)))];
                            if (intento === version.current) setVista(`${new Set(registros.map(r => r.documento)).size} documentos · ${fechas[0]} a ${fechas[fechas.length - 1]} · Meses: ${mesesArchivo.join(", ")}`);
                        } catch (err) {
                            if (intento === version.current) setVista(err instanceof Error ? err.message : "No se pudo leer LX22.");
                        }
                    }} />
                    <p role="status">{vista}</p>
                    <small>La actualización compartida de LX22, ZSAPPR110 y LINV requiere un servicio de guardado.</small>
                </section>
            </div>
            <button type="button" onClick={() => modal.current?.close()}>Cerrar</button>
        </dialog>
    </div>;
}

export function IconoAccion({ tipo = "documento" }: { tipo?: "documento" | "avance" | "impresora" }) {
    return <svg className={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        {tipo === "avance" ? <><path d="M4 4v16h16M7 15l4-5 4 3 5-7"/></> : tipo === "impresora" ? <><path d="M7 8V3h10v5M7 17H4V9h16v8h-3M7 14h10v7H7z"/><path d="M16 11h2"/></> : <><path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6M9 16h6"/></>}
    </svg>;
}
const formatoFecha = (f: string) => f.split("-").reverse().join("/");
export function RegistroEntrega({ documentos, warehouse }: { documentos: Lx22InventarioItem[]; warehouse: string }) {
    const modal = useRef<HTMLDialogElement>(null);
    const hoja = useRef<HTMLDivElement>(null);
    const [fecha, setFecha] = useState("");
    const [manual, setManual] = useState(false);
    const [numero, setNumero] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [omitidos, setOmitidos] = useState<Set<string>>(new Set());
    const [elegidos, setElegidos] = useState<Lx22InventarioItem[]>([]);
    const fechas = [...new Set(documentos.map(d => dia(d.fecha)))].sort().reverse();
    const disponibles = [...new Map(documentos.filter(d => dia(d.fecha) === fecha && d.documento).map(d => [clave(d), d])).values()];
    const filas = (manual ? elegidos : disponibles.filter(d => !omitidos.has(clave(d))))
        .slice().sort((a,b) => Number(esCiclico(b)) - Number(esCiclico(a)) || a.documento.localeCompare(b.documento,"es",{numeric:true}));
    const paginas = paginarInventarios(filas);
    const quitar = (d: Lx22InventarioItem) => manual
        ? setElegidos(actual => actual.filter(f => clave(f) !== clave(d)))
        : setOmitidos(actual => new Set([...actual, clave(d)]));
    const agregar = () => {
        const encontrados = buscarInventario(documentos, numero);
        if (!encontrados.length) { setMensaje("No se encontró ese inventario. Cargá el mes correspondiente desde + y volvé a intentarlo."); return; }
        if (encontrados.length > 1) { setMensaje("Ese número aparece en más de una fecha. Seleccionalo desde el registro por fecha para evitar confusiones."); return; }
        const d = encontrados[0];
        if (elegidos.some(f => clave(f) === clave(d))) { setMensaje("Ese inventario ya está en el listado."); return; }
        setElegidos(actual => [...actual, d]); setNumero(""); setMensaje("");
    };
    const imprimir = async () => {
        await Promise.all(Array.from(hoja.current?.querySelectorAll("img") ?? []).map(img => img.decode().catch(() => undefined)));
        document.body.classList.add("imprimir-entrega-inventario");
        try { window.print(); } finally { document.body.classList.remove("imprimir-entrega-inventario"); }
    };
    return <>
        <button type="button" className={styles.coverageButton} onClick={() => {
            setFecha(fechas.find(f => f < dia(new Date())) ?? fechas[0] ?? ""); setManual(false); setOmitidos(new Set()); setMensaje(""); modal.current?.showModal();
        }}><IconoAccion/><span className={styles.coverageButtonContent}><strong>Imprimir registro</strong><small>Inventarios a entregar</small></span></button>
        <dialog className={styles.entregaModal} ref={modal} aria-labelledby="entrega-titulo">
            <header className={styles.entregaEncabezado}><span className={styles.entregaBadge}>{warehouse} · ENTREGA DE DOCUMENTOS</span>
                <h2 id="entrega-titulo">{manual ? "Ingresar inventarios manualmente" : "Preparar registro de entrega"}</h2>
                <p>{manual ? "Ingresá un número y presioná Enter. La fecha y el tipo se obtienen de LX22." : "Seleccioná la fecha y quitá los documentos que todavía no vas a entregar."}</p></header>
            <div className={styles.entregaContenido}>
                {manual ? <form className={styles.entregaEntrada} onSubmit={e => {e.preventDefault(); agregar();}}><label htmlFor="numero-inventario">Número de inventario</label><div><input id="numero-inventario" autoFocus inputMode="numeric" value={numero} onChange={e => setNumero(e.target.value)} placeholder="Ej.: 51234"/><button type="submit">Agregar</button></div><p role="status">{mensaje}</p></form>
                    : <label className={styles.entregaFecha}>Fecha del inventario<select value={fecha} onChange={e => {setFecha(e.target.value); setOmitidos(new Set());}}>{fechas.map(f => <option key={f} value={f}>{formatoFecha(f)}</option>)}</select></label>}
                <div className={styles.entregaResumen}><span><strong>{filas.filter(esCiclico).length}</strong> Cíclicos</span><span><strong>{filas.filter(d => !esCiclico(d)).length}</strong> Operativos</span><span><strong>{filas.length}</strong> A entregar</span></div>
                <div className={styles.entregaGrilla}><table><thead><tr><th>N.º de inventario</th><th>Fecha</th><th>Tipo / referencia</th><th><span className={styles.soloLectores}>Quitar</span></th></tr></thead><tbody>
                    {filas.map(d => <tr key={clave(d)}><td><strong>{d.documento}</strong></td><td>{formatoFecha(dia(d.fecha))}</td><td><span className={esCiclico(d) ? styles.tipoCiclico : styles.tipoOperativo}>{esCiclico(d) ? "Cíclico" : d.referencia}</span></td><td><button type="button" className={styles.quitarInventario} aria-label={`Quitar inventario ${d.documento}`} onClick={() => quitar(d)}>×</button></td></tr>)}
                    {!filas.length && <tr><td colSpan={4}>No hay inventarios seleccionados.</td></tr>}
                </tbody></table></div>
                {!manual && omitidos.size > 0 && <button type="button" className={styles.entregaRestaurar} onClick={() => setOmitidos(new Set())}>Restaurar documentos quitados</button>}
                <small>Quitar un documento solo modifica este listado; no cambia los datos del informe.</small>
            </div>
            <footer className={styles.entregaAcciones}><button type="button" onClick={() => modal.current?.close()}>Cerrar</button><button type="button" onClick={() => {setManual(!manual); setMensaje(""); setNumero("");}}>{manual ? "Elegir por fecha" : "Ingresar manualmente"}</button><button type="button" className={styles.entregaPrimario} disabled={!filas.length} onClick={() => void imprimir()}>Imprimir registro</button></footer>
        </dialog>
        {createPortal(<div ref={hoja} className={styles.hojaEntrega}>{paginas.map((pagina, indice) => <article className={styles.entregaPagina} key={indice}>
            <header><img src={renault} alt="Renault"/><div><h1>Registro de entrega de inventarios</h1><p>{warehouse} · {formatoFecha(manual ? dia(new Date()) : fecha)}</p></div><img src="/assets/ocasa-logo.svg" alt="OCASA"/></header>
            {[true, false].map(ciclico => {const grupo = pagina.filter(d => esCiclico(d) === ciclico); return grupo.length > 0 && <section key={String(ciclico)}><h2>Inventarios {ciclico ? "cíclicos" : "operativos"}</h2><table><colgroup><col style={{width:"15%"}}/><col style={{width:"17%"}}/><col style={{width:"14%"}}/><col style={{width:"9%"}}/><col style={{width:"44%"}}/></colgroup><thead><tr><th>Fecha</th><th>Referencia</th><th>N.º de inventario</th><th>Check</th><th>Observación</th></tr></thead><tbody>{grupo.map(d => <tr key={clave(d)}><td>{formatoFecha(dia(d.fecha))}</td><td>{esCiclico(d) ? "" : d.referencia}</td><td><strong>{d.documento}</strong></td><td className={styles.entregaCheck}><span/></td><td/></tr>)}</tbody></table></section>;})}
            <footer><p>Firma: __________________________　 Aclaración: __________________________</p><small>Trazar una línea en el espacio libre. No agregar números de inventario a mano.</small><span>Página {indice + 1} de {paginas.length}</span></footer>
        </article>)}</div>, document.body)}
    </>;
}
