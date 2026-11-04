import { descargarExtracto, historialDrive } from "./RotacionDrive";
import { useMemo, useRef, useState } from "react";
import type { Lx03OcupacionItem } from "../Lx03OcupacionItem";
import { analizarRotacion, combinarHistorial, parseLtak, parseLtap, textoSAP } from "./RotacionData";
import type { HistorialRotacion, MaterialRotacion } from "./RotacionData";
import styles from "./RotacionReubicacion.module.css";
import SugerenciasMovimientos from "./SugerenciasMovimientos";

type Grupo = "bajar" | "subir" | "sin";
interface Fuente { historial: HistorialRotacion; desde: string; hasta: string; movimientos: string[]; cobertura: boolean }
const formato = (n: number) => n.toLocaleString("es-AR", { maximumFractionDigits: 3 });
const materialesVacios: MaterialRotacion[] = [];
const fecha = (s: string) => s ? s.split("-").reverse().join("/") : "—";

export default function RotacionReubicacion({ lx03, warehouse, disponible }: { lx03: Lx03OcupacionItem[]; warehouse: "W1" | "W2"; disponible: boolean }) {
    const [fuentes, setFuentes] = useState<Partial<Record<"W1" | "W2", Fuente>>>({});
    const [exportando, setExportando] = useState<Grupo | null>(null);
    const [errorExcel, setErrorExcel] = useState("");
    const [ltak, setLtak] = useState<File[]>([]);
    const [ltap, setLtap] = useState<File[]>([]);
    const [destino, setDestino] = useState<"W1" | "W2">(warehouse);
    const [mesesDrive, setMesesDrive] = useState<string[]>([]);
    const [borradorDrive, setBorradorDrive] = useState<string[]>([]);
    const dialogoDrive = useRef<HTMLDialogElement>(null);
    const disponiblesDrive = historialDrive[destino];
    const mesesElegidos = disponiblesDrive.filter(m => mesesDrive.includes(m.mes));
    const [sumar, setSumar] = useState(true);
    const [confirmarWarehouse, setConfirmarWarehouse] = useState(false);
    const [avance, setAvance] = useState({ hechos: 0, total: 1, etapa: "" });
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
    const resultado = useMemo(() => fuente && rangoValido && fuente.movimientos.length > 0
        ? analizarRotacion(lx03, fuente.historial, fuente.desde, fuente.hasta, fuente.movimientos) : null,
        [lx03, fuente, rangoValido]);
    const umbralesValidos = Number.isFinite(alta) && Number.isFinite(baja) && alta > baja && baja >= 1;
    const coberturaValida = Boolean(fuente?.cobertura && resultado && resultado.sinCruce === 0);
    const grupos = useMemo(() => {
        const materiales = resultado?.materiales ?? [];
        return {
            bajar: umbralesValidos ? materiales.filter(m => m.frecuencia >= alta && m.stockPiso === 0 && m.stockAltura > 0) : [],
            subir: umbralesValidos && coberturaValida ? materiales.filter(m => m.frecuencia >= 1 && m.frecuencia <= baja && m.stockPiso > 0) : [],
            sin: coberturaValida ? materiales.filter(m => m.movimientosPeriodo === 0) : [],
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
        if (Boolean(ltak.length) !== Boolean(ltap.length)) {
            setError("Para incorporar archivos locales, seleccioná ambos extractos: LTAK y LTAP.");
            return;
        }
        const warehouseDestino = destino;
        const total = mesesElegidos.length * 2 + ltak.length + ltap.length + mesesElegidos.length * 2 + 1;
        let hechos = 0;
        const paso = async (etapa: string) => {
            setAvance({ hechos, total, etapa });
            await new Promise<void>(resolve => setTimeout(resolve, 0));
        };
        setOcupado(true); setError("");
        try {
            const archivosLtak = [...ltak];
            const archivosLtap = [...ltap];
            for (const mes of mesesElegidos) {
                await paso("Descargando LTAK " + mes.mes);
                archivosLtak.push(await descargarExtracto(mes.ltak, "LTAK " + warehouseDestino + " " + mes.mes + " (Drive).dat"));
                hechos++;
                await paso("Descargando LTAP " + mes.mes);
                archivosLtap.push(await descargarExtracto(mes.ltap, "LTAP " + warehouseDestino + " " + mes.mes + " (Drive).dat"));
                hechos++;
            }
            const leer = async <T,>(archivos: File[], parsear: (texto: string) => T[]) => {
                const resultados: T[][] = [];
                for (const archivo of archivos) {
                    await paso("Leyendo " + archivo.name);
                    resultados.push(parsear(await textoSAP(archivo)));
                    hechos++;
                }
                return resultados;
            };
            const cabeceras = await leer(archivosLtak, parseLtak);
            const posiciones = await leer(archivosLtap, parseLtap);
            await paso("Integrando el historial");
            const previo = sumar ? fuentes[warehouseDestino] : undefined;
            const historial = combinarHistorial(previo?.historial, {
                cabeceras: cabeceras.flat(), movimientos: posiciones.flat(),
                archivos: [...archivosLtak, ...archivosLtap].map(f => f.name), duplicados: 0,
            });
            const fechas = historial.movimientos.filter(m => m.confirmado).map(m => m.fecha).sort();
            if (!fechas.length) throw new Error("No hay posiciones confirmadas con fecha válida.");
            const nueva: Fuente = { historial, desde: fechas[0], hasta: fechas[fechas.length - 1], movimientos: [...new Set(historial.cabeceras.map(c => `${c.movimiento}/${c.movimientoIM}`))].filter(m => m === "Y93/601" || m.startsWith("YCC/") || m.startsWith("Y95/") || previo?.movimientos.includes(m)).sort(), cobertura: false };
            setFuentes(actual => ({ ...actual, [warehouseDestino]: nueva }));
            setPagina(0);
            setAvance({ hechos: total, total, etapa: "Historial listo" });
        } catch (err) {
            setError(err instanceof Error ? err.message : "No fue posible procesar los archivos.");
        } finally { setOcupado(false); }
    };
    const cards: { key: Grupo; titulo: string; texto: string; habilitada: boolean }[] = [
        { key: "bajar", titulo: "Candidatos a bajar", texto: "Alta frecuencia · stock solo en altura", habilitada: Boolean(resultado && umbralesValidos) },
        { key: "subir", titulo: "Candidatos a subir", texto: "Baja frecuencia · stock en piso", habilitada: Boolean(resultado && umbralesValidos && coberturaValida) },
        { key: "sin", titulo: "Sin movimiento en el período", texto: "Materiales con stock actual · piso o altura", habilitada: Boolean(resultado && coberturaValida) },
    ];
    const descargarExcel = async (categoria: Grupo) => {
        const card = cards.find(item => item.key === categoria);
        const materiales = grupos[categoria];
        if (!fuente || !card?.habilitada || !materiales.length || exportando) return;
        setExportando(categoria);
        setErrorExcel("");
        try {
            const XLSX = await import("xlsx");
            const libro = XLSX.utils.book_new();
            const unidades = [...new Set(materiales.flatMap(m => Object.keys(m.cantidades)))].sort();
            const agregarHoja = (nombre: string, filas: (string | number)[][], anchos: number[]) => {
                const hoja = XLSX.utils.aoa_to_sheet(filas);
                hoja["!cols"] = anchos.map(wch => ({ wch }));
                if (hoja["!ref"]) hoja["!autofilter"] = { ref: hoja["!ref"] };
                XLSX.utils.book_append_sheet(libro, hoja, nombre);
            };
            agregarHoja("Materiales", [
                ["Material", "Descripción", "Storage", "Líneas picking", "Días con picking", "Última salida", "Stock piso", "Stock altura", ...unidades.map(um => "Extraído (" + um + ")")],
                ...materiales.map(m => [
                    m.material, m.descripcion || "Sin descripción en LTAP", [...new Set(m.ubicaciones.map(u => u.storage))].join(", "), m.frecuencia, m.dias, m.ultimaSalida, m.stockPiso, m.stockAltura,
                    ...unidades.map(um => m.cantidades[um] ?? 0),
                ]),
            ], [24, 48, 22, 18, 18, 16, 16, 16, ...unidades.map(() => 20)]);
            agregarHoja("Ubicaciones", [
                ["Material", "Descripción", "Storage", "Ubicación", "Cantidad", "Nivel"],
                ...materiales.flatMap(m => m.ubicaciones.map(u => [
                    m.material, m.descripcion || "Sin descripción en LTAP", u.storage, u.ubicacion, u.cantidad, u.piso ? "Piso" : "Altura",
                ])),
            ], [24, 48, 14, 24, 16, 14]);
            agregarHoja("Contexto", [
                ["Campo", "Valor"],
                ["Categoría", card.titulo], ["Warehouse", warehouse],
                ["Desde", fuente.desde], ["Hasta", fuente.hasta], ["Movimientos WM / IM", fuente.movimientos.join(", ")],
                ["Umbral alta", alta], ["Umbral baja", baja], ["Materiales", materiales.length],
            ], [24, 48]);
            XLSX.writeFile(libro, `rotacion-${categoria}-${warehouse}-${fuente.desde}_${fuente.hasta}.xlsx`);
        } catch {
            setErrorExcel("No se pudo descargar el listado. Volvé a intentarlo.");
        } finally {
            setExportando(null);
        }
    };
    const sugerencias = <SugerenciasMovimientos lx03={lx03} materiales={resultado?.materiales ?? materialesVacios}
        habilitado={Boolean(disponible && coberturaValida && !ocupado)} warehouse={warehouse}
        desde={fuente?.desde ?? ""} hasta={fuente?.hasta ?? ""} movimiento={fuente?.movimientos.join(", ") ?? ""} />;
    return <section hidden={!disponible} className={styles.container} aria-label="Rotación y reubicación">
        <div className={styles.heading}><div><h2>Rotación y reubicación</h2><p>{warehouse} · Historial de picking + LX03 actual</p></div><span className={styles.heatTag}>Mapa de calor 🔥</span><span className={styles.tag}>Sugerencias para revisión</span></div>
        <details className={styles.carga}>
            <summary>Registro operativo · {warehouse}</summary>
            <p>Registrá los resultados en la planilla del warehouse con tu cuenta de Google. Necesitás permiso de edición.</p>
            <ul>
                <li>Compactación: fecha, ubicaciones trabajadas y liberadas.</li>
                <li>Mapa de calor: fecha, ubicaciones bajadas y subidas.</li>
                <li>Vacías: fecha, ubicaciones relevadas y ocupadas.</li>
            </ul>
            <a target="_blank" rel="noopener noreferrer" href={warehouse === "W1"
                ? "https://docs.google.com/spreadsheets/d/1yOm2ivDf7rIsiM0i5-DhBJFk934Bkybr/edit"
                : "https://docs.google.com/spreadsheets/d/1JCHc6aBmurA2-L0vZ0xJhkuWx-8o6R6R/edit"}>
                Abrir planilla de registro · {warehouse} ↗
            </a>
        </details>
        <details className={styles.carga} open={!fuente}>
            <summary>Cargar historial LTAK / LTAP</summary>
            <p>Podés seleccionar varias semanas. Los registros idénticos no se vuelven a contar. El historial queda en memoria mientras esta pantalla esté abierta.</p>
            <div className={styles.inputs}>
                <label>LTAK (.dat o .txt)<input type="file" accept=".dat,.txt" multiple disabled={ocupado} onChange={e => { setLtak(Array.from(e.target.files ?? [])); setConfirmarWarehouse(false); }} /></label>
                <label>LTAP (.dat o .txt)<input type="file" accept=".dat,.txt" multiple disabled={ocupado} onChange={e => { setLtap(Array.from(e.target.files ?? [])); setConfirmarWarehouse(false); }} /></label>
                <label>Warehouse del historial<select value={destino} disabled={ocupado} onChange={e => { setDestino(e.target.value as "W1" | "W2"); setMesesDrive([]); setConfirmarWarehouse(false); }}><option value="W1">W1 · REP</option><option value="W2">W2 · BsAs</option></select></label>
                <label>Modo de carga<select value={sumar ? "sumar" : "reemplazar"} disabled={ocupado} onChange={e => setSumar(e.target.value === "sumar")}><option value="sumar">Agregar al historial</option><option value="reemplazar">Reemplazar historial</option></select></label>
                <button type="button" disabled={ocupado} onClick={() => {
                    setBorradorDrive(mesesDrive);
                    dialogoDrive.current?.showModal();
                }}>Cargar desde Drive{mesesElegidos.length ? ` (${mesesElegidos.length})` : ""}</button>
            </div>
            <label className={styles.check}><input type="checkbox" checked={confirmarWarehouse} disabled={ocupado} onChange={e => setConfirmarWarehouse(e.target.checked)} />Confirmo que ambos extractos corresponden a {destino} y al mismo sistema SAP.</label>
            <div className={styles.acciones}><button type="button" disabled={ocupado || (!mesesElegidos.length && (!ltak.length || !ltap.length)) || !confirmarWarehouse} onClick={() => void cargar()}>{ocupado ? "Procesando..." : "Analizar historial"}</button></div>
            {mesesElegidos.length > 0 && <p>Meses de Drive: {mesesElegidos.map(m => m.mes).join(", ")}. Se incorporan al analizar el historial.</p>}
            <dialog ref={dialogoDrive} className={styles.driveModal} aria-labelledby="titulo-drive-rotacion">
                <h3 id="titulo-drive-rotacion">Cargar desde Drive · {destino}</h3>
                {disponiblesDrive.length ? <>
                    <p>Marcá una casilla por mes para cargar el par LTAK + LTAP.</p>
                    <div className={styles.driveMeses}>
                        {disponiblesDrive.map(({ mes }) => <label key={mes} className={styles.check}>
                            <input type="checkbox" checked={borradorDrive.includes(mes)} onChange={e => {
                                const marcado = e.target.checked;
                                setBorradorDrive(prev => marcado ? [...prev, mes] : prev.filter(m => m !== mes));
                            }} />
                            LTAK + LTAP · {new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(mes + "-01T00:00:00Z"))}
                        </label>)}
                    </div>
                </> : <p>Todavía no hay meses disponibles para {destino}.</p>}
                <div className={styles.acciones}>
                    <button type="button" onClick={() => dialogoDrive.current?.close()}>Cancelar</button>
                    <button type="button" disabled={!disponiblesDrive.length} onClick={() => {
                        setMesesDrive(borradorDrive);
                        setConfirmarWarehouse(false);
                        dialogoDrive.current?.close();
                    }}>Aplicar selección</button>
                </div>
            </dialog>
            {(ocupado || (!error && avance.hechos === avance.total)) && <div className={styles.avance} role="status">
                <progress aria-label="Avance del historial" value={avance.hechos} max={avance.total} />
                <span>{Math.floor(100 * avance.hechos / avance.total)}% · {avance.etapa}</span>
            </div>}
            {error && <p className={styles.error} role="alert">{error}</p>}
        </details>
        {fuente && <>
            <div className={styles.accionesResumen}><span>Propuestas dentro de la misma familia · excluye 52P, NOC y 900–999</span>{sugerencias}</div>
            <div className={styles.filtros}>
                <label>Desde<input type="date" value={fuente.desde} onChange={e => actualizar({ desde: e.target.value, cobertura: false })} /></label>
                <label>Hasta<input type="date" value={fuente.hasta} onChange={e => actualizar({ hasta: e.target.value, cobertura: false })} /></label>
                <details>
                    <summary>Movimientos WM / IM ({fuente.movimientos.length})</summary>
                    {movimientos.map(m => <label key={m} className={styles.check}>
                        <input type="checkbox" checked={fuente.movimientos.includes(m)} onChange={e => actualizar({
                            movimientos: e.target.checked ? [...fuente.movimientos, m].sort() : fuente.movimientos.filter(item => item !== m),
                            cobertura: false,
                        })} />{m}
                    </label>)}
                </details>
                <label>Alta: líneas ≥<input type="number" min={baja + 1} step="1" value={alta} onChange={e => { setAlta(Math.max(0, Math.trunc(Number(e.target.value)))); setPagina(0); }} /></label>
                <label>Baja: líneas ≤<input type="number" min="1" max={alta - 1} step="1" value={baja} onChange={e => { setBaja(Math.max(0, Math.trunc(Number(e.target.value)))); setPagina(0); }} /></label>
            </div>
            <p className={styles.note}>Umbrales por material en todo el período elegido, medidos en posiciones de OT con extracción positiva. Confirmá con IT qué combinación WM / IM corresponde a picking. No se combinan PC y ST.</p>
            {!fuente.movimientos.length && <p className={styles.note}>Seleccioná al menos un movimiento para analizar.</p>}
            {["Y93", "YCC", "Y95"].filter(c => !movimientos.some(m => c === "Y93" ? m === "Y93/601" : m.startsWith(c + "/"))).map(c =>
                <p key={c} className={styles.note}>{c === "Y93" ? "Y93/601" : c}: no aparece en el historial cargado. Revisá el alcance de los extractos.</p>
            )}
            {!rangoValido && <p className={styles.error}>Elegí un rango de fechas válido.</p>}
            {!umbralesValidos && <p className={styles.error}>El umbral de alta debe superar al de baja; el de baja debe ser al menos 1.</p>}
            {resultado && <div className={styles.coverage}>
                <strong>Período: {fecha(fuente.desde)} al {fecha(fuente.hasta)} · {formato(resultado.incluidas)} posiciones incluidas</strong>
                <span>{formato(fuente.historial.movimientos.length)} posiciones únicas · {formato(fuente.historial.duplicados)} duplicadas omitidas · {formato(resultado.sinCruce)} sin LTAK · {formato(resultado.noConfirmadas)} no confirmadas · {formato(resultado.sinExtraccion)} sin extracción positiva en el filtro · {formato(resultado.diferencias)} con cantidad origen/destino distinta</span>
                <span>Movimientos incluidos: {fuente.movimientos.join(", ")}</span>
                <span>Archivos: {fuente.historial.archivos.join(" · ")}</span>
                <label className={styles.check}><input type="checkbox" checked={fuente.cobertura} disabled={resultado.sinCruce > 0} onChange={e => actualizar({ cobertura: e.target.checked })} />Confirmo cobertura completa de picking para este warehouse, los movimientos seleccionados y el período, sin semanas faltantes ni límites de exportación.</label>
                {!coberturaValida && <span>Las categorías de baja frecuencia y sin movimiento se habilitan al confirmar cobertura completa y resolver posiciones sin LTAK. Una fecha sin movimientos no prueba por sí sola que falten datos.</span>}
            </div>}
        </>}
        {!fuente && <p className={styles.empty}>Cargá el historial de {warehouse} para analizar la rotación. No se calcula demanda a partir de la LX03.</p>}
        <div className={styles.cards}>{cards.map(card => <div className={styles.cardConExcel} key={card.key}><button type="button" disabled={!card.habilitada} aria-pressed={grupo === card.key} className={`${styles.card} ${styles[card.key]}`} onClick={() => { setGrupo(card.key); setPagina(0); detalle.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}><span>{card.titulo}</span><strong>{card.habilitada ? formato(grupos[card.key].length) : "—"}</strong><small>{card.texto}</small></button>
            <button type="button" className={styles.excel} disabled={!card.habilitada || !grupos[card.key].length || exportando !== null}
                aria-label={`Descargar listado en Excel: ${card.titulo}`} onClick={() => void descargarExcel(card.key)}>
                {exportando === card.key ? "Preparando Excel…" : "Descargar listado en Excel"}
            </button>
        </div>)}</div>
        {errorExcel && <p className={styles.error} role="alert">{errorExcel}</p>}
        {resultado && <div ref={detalle} className={styles.detalle}>
            <div className={styles.detailHeading}><h3>{cards.find(c => c.key === grupo)?.titulo}</h3><input aria-label="Buscar material, descripción, storage o ubicación" placeholder="Buscar material o ubicación…" value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(0); }} /></div>
            <p className={styles.note}>Stock según la LX03 seleccionada. Piso: storage terminado en P. Se excluyen 52P, NOC y los storage 900–999 tanto del stock como de los movimientos del análisis. Cantidades de stock según el lector LX03 actual; no se convierten unidades. La tabla muestra candidatos; “Sugerir movimientos” permite revisar intercambios. La capacidad, los bloqueos, el peso y la compatibilidad requieren revisión física.</p>
            {!cards.find(c => c.key === grupo)?.habilitada ? <p className={styles.empty}>Completá las condiciones de análisis para habilitar esta categoría.</p> : filtrados.length === 0 ? <p className={styles.empty}>No hay materiales que cumplan estos criterios.</p> : <>
                <div className={styles.tableWrapper}><table><thead><tr><th>Material / descripción</th><th>Líneas picking</th><th>Días con picking</th><th>Última salida</th><th>Extraído por UM</th><th>Stock piso</th><th>Stock altura</th><th>Ubicaciones actuales</th></tr></thead><tbody>{filtrados.slice(paginaActual * 50, (paginaActual + 1) * 50).map((m: MaterialRotacion) => <tr key={m.material}><td><strong>{m.material}</strong><small>{m.descripcion || "Sin descripción en el historial seleccionado"}</small></td><td>{formato(m.frecuencia)}</td><td>{m.dias}</td><td>{fecha(m.ultimaSalida)}</td><td>{Object.entries(m.cantidades).map(([um, n]) => `${formato(n)} ${um}`).join(" · ") || "—"}</td><td>{formato(m.stockPiso)}</td><td>{formato(m.stockAltura)}</td><td>{m.ubicaciones.map(u => <small key={`${u.storage}|${u.ubicacion}`}>{u.storage} · {u.ubicacion} · {formato(u.cantidad)} · {u.piso ? "Piso" : "Altura"}</small>)}</td></tr>)}</tbody></table></div>
                <div className={styles.paginacion}><button type="button" disabled={paginaActual === 0} onClick={() => setPagina(paginaActual - 1)}>Anterior</button><span>{formato(filtrados.length)} materiales · Página {paginaActual + 1} de {paginas}</span><button type="button" disabled={paginaActual + 1 >= paginas} onClick={() => setPagina(paginaActual + 1)}>Siguiente</button></div>
            </>}
        </div>}
        <p className={styles.note}>Las recomendaciones son preliminares. “Sin movimiento” considera todos los movimientos confirmados del material en el LTAP cargado para el período, incluso en otras ubicaciones o fuera del filtro de picking; también puede incluir materiales nuevos. Al cambiar de LX03, los candidatos se recalculan con el stock actual.</p>
    </section>;
}
