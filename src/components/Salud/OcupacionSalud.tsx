import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import LogoOcasa from "../LogoOcasa/LogoOcasa";
import AnimatedNumber from "../../utils/AnimatedNumber";
import { analizarSalud } from "./SaludData";
import type { SaludResumen, SaludContenido } from "./SaludData";
import { leerLx03Salud, leerYwmSalud } from "./SaludReader";
import styles from "./OcupacionSalud.module.css";
const numero=(n:number)=>n.toLocaleString("es-AR",{maximumFractionDigits:2});
const porcentaje=(n:number,total:number)=>`${(total?n/total*100:0).toLocaleString("es-AR",{minimumFractionDigits:2,maximumFractionDigits:2})}%`;
type Columna<T>={titulo:string;celda:(r:T)=>ReactNode};
function Grilla<T>({filas,columnas,buscar}: {filas:T[];columnas:Columna<T>[];buscar:(r:T)=>string}){
    const [busqueda,setBusqueda]=useState(""); const [pagina,setPagina]=useState(0);
    const filtradas=useMemo(()=>filas.filter(r=>buscar(r).toUpperCase().includes(busqueda.trim().toUpperCase())),[filas,buscar,busqueda]);
    const paginas=Math.max(1,Math.ceil(filtradas.length/50));const actual=Math.min(pagina,paginas-1);
    if(!filas.length)return <p className={styles.okMessage}>✓ Sin incidencias encontradas en este control.</p>;
    return <><div className={styles.tableTools}><span>{numero(filtradas.length)} resultados</span><input aria-label="Buscar en el detalle" placeholder="Buscar ubicación, material o almacén…" value={busqueda} onChange={e=>{setBusqueda(e.target.value);setPagina(0);}}/></div><div className={styles.tableWrapper}><table><thead><tr>{columnas.map((c,i)=><th key={i} scope="col">{c.titulo}</th>)}</tr></thead><tbody>{filtradas.map((r,i)=><tr key={i} className={i>=actual*50&&i<(actual+1)*50?undefined:styles.screenHidden}>{columnas.map((c,j)=><td key={j}>{c.celda(r)}</td>)}</tr>)}</tbody></table></div><div className={styles.pagination}><button type="button" disabled={!actual} onClick={()=>setPagina(actual-1)}>Anterior</button><span>Página {actual+1} de {paginas}</span><button type="button" disabled={actual+1>=paginas} onClick={()=>setPagina(actual+1)}>Siguiente</button></div></>;
}
function Contenidos({filas}:{filas:SaludContenido[]}){return <Grilla filas={filas} buscar={r=>JSON.stringify(r)} columnas={[
    {titulo:"Tipo almacén",celda:r=>r.almacen.padStart(3,"0")},{titulo:"Ubicación",celda:r=><strong>{r.ubicacion}</strong>},
    {titulo:"Materiales / descripción",celda:r=>r.materiales.map(m=><div key={m.material} className={styles.material}><strong>{m.material}</strong><small>{m.descripcion||"Sin descripción en YWM005"}</small></div>)},
    {titulo:"Lotes SAP",celda:r=>r.materiales.map(m=><div key={m.material} className={styles.material}><strong>{m.material}</strong><small>{m.lotes.join(" · ")||"Sin lote informado"}</small></div>)},
]}/>;}
export default function OcupacionSalud(){
    const [lx03,setLx03]=useState<File|null>(null),[ywm,setYwm]=useState<File|null>(null);
    const [resultado,setResultado]=useState<SaludResumen|null>(null),[error,setError]=useState("");
    const [procesando,setProcesando]=useState(false),[version,setVersion]=useState(0);
    const detalles=useRef<HTMLDivElement>(null);
    const [tab,setTab]=useState<"tipos"|"materiales"|"lotes"|"repetidas"|"catalogo">("tipos");
    const cargar=async()=>{
        if(!lx03||!ywm||procesando)return;setProcesando(true);setError("");
        try{
            const [a,b]=await Promise.all([lx03.arrayBuffer(),ywm.arrayBuffer()]);
            const stock=leerLx03Salud(a),catalogo=leerYwmSalud(b);
            const res=analizarSalud(stock,catalogo);setResultado(res);setVersion(v=>v+1);
        }catch(e){setError(e instanceof Error?e.message:"No fue posible analizar los archivos.");}
        finally{setProcesando(false);}
    };
    const seleccionar=(tipo:typeof tab)=>{setTab(tipo);detalles.current?.scrollIntoView({behavior:"smooth",block:"start"});};
    const incidencias=resultado?.incidencias??[];
    return <main className={styles.page}>
        <header className={styles.header}><Link to="/WarehouseSalud" className={styles.back}>← Warehouse Salud</Link><LogoOcasa/></header>
        <div className={styles.heading}><span>CONTROL DEL WAREHOUSE</span><h1>Ocupación y ubicaciones</h1><p>Una vista de la capacidad y de las posibles incidencias en la configuración SAP.</p></div>
        <section className={styles.upload} aria-label="Archivos de análisis"><div><h2>Cargá los reportes</h2><p>Usá archivos de la misma operación y fecha de corte. LX03 define el stock y las ubicaciones; YWM005 aporta descripciones y el cruce material–lote–centro.</p></div><div className={styles.uploadGrid}>
            <label><span>01 · YWM005</span><input type="file" accept=".xlsx,.xls" disabled={procesando} onChange={e=>{setYwm(e.target.files?.[0]??null);setResultado(null);setError("");}}/><small>{ywm?.name??"Seleccioná el reporte de materiales y lotes"}</small></label>
            <label><span>02 · LX03</span><input type="file" accept=".xlsx,.xls" disabled={procesando} onChange={e=>{setLx03(e.target.files?.[0]??null);setResultado(null);setError("");}}/><small>{lx03?.name??"Seleccioná el reporte de ubicaciones y stock"}</small></label>
            <button type="button" disabled={!lx03||!ywm||procesando} onClick={()=>void cargar()}>{procesando?"Analizando archivos…":"Analizar warehouse ↗"}</button>
        </div>{error&&<p role="alert" className={styles.error}>{error}</p>}</section>
        {procesando&&<p role="status" className={styles.note}>Leyendo los reportes y agrupando ubicaciones…</p>}
        {!resultado&&!procesando&&<div className={styles.empty}><h2>Los controles aparecen aquí</h2><p>Cargá ambos Excel para ver ocupación, posiciones equivalentes y los detalles para revisar.</p><div><span>Ocupación real</span><span>Tipos y subdivisiones</span><span>Materiales y lotes</span><span>Ubicaciones repetidas</span></div></div>}
        {resultado&&<div key={version}>
            <section className={styles.cards} aria-label="Resumen de ocupación">
                <article className={styles.card}><span>Ubicaciones físicas</span><strong><AnimatedNumber value={resultado.total}/></strong><small>Únicas por código de ubicación</small><small>{numero(resultado.virtuales)} virtuales excluidas</small></article>
                <article className={`${styles.card} ${styles.accent}`}><span>Ubicaciones ocupadas</span><strong><AnimatedNumber value={resultado.ocupadas}/></strong><b>{porcentaje(resultado.ocupadas,resultado.total)} del total</b><small>Libres: {numero(resultado.libres)} · {porcentaje(resultado.libres,resultado.total)}</small></article>
                <article className={styles.card}><span>Posiciones pallet equivalentes</span><strong><AnimatedNumber value={resultado.pallet} decimals={2}/></strong><small>{numero(resultado.ubicacionesPallet)} ubicaciones con tipo P válido</small><small>P = 1 · P2 = ½ · P4 = ¼</small></article>
                <article className={styles.card}><span>Posiciones estantería equivalentes</span><strong><AnimatedNumber value={resultado.estanteria} decimals={2}/></strong><small>{numero(resultado.ubicacionesEstanteria)} ubicaciones con tipo E válido</small><small>E = 1 · E2 = ½ · E4 = ¼ · E6 = ⅙ · E8 = ⅛</small></article>
            </section>
            <p className={styles.note}>Capacidad equivalente según los tipos declarados en SAP, sin corregir automáticamente incidencias. {numero(resultado.sinTipoValido)} ubicaciones sin tipo único válido quedan fuera de esos equivalentes. Ocupada = al menos un material real con stock total positivo. Las ubicaciones bloqueadas también forman parte del total físico.</p>
            <div className={styles.sectionHeading}><h2>Posibles incidencias</h2><p>Revisá la configuración antes de realizar cambios en SAP.</p></div>
            <section className={styles.checkCards} aria-label="Resumen de controles">
                <button type="button" className={styles.checkCard} onClick={()=>seleccionar("tipos")}><span>Tipos y subdivisiones</span><strong><AnimatedNumber value={incidencias.length}/>{!incidencias.length&&<i>✓</i>}</strong><small>Hallazgos para revisión · ver detalle →</small></button>
                <button type="button" className={styles.checkCard} onClick={()=>seleccionar("materiales")}><span>Ubicaciones con más de un material</span><strong><AnimatedNumber value={resultado.multiMaterial.length}/>{!resultado.multiMaterial.length&&<i>✓</i>}</strong><small>Solo tipos de almacén disponibles →</small></button>
                <button type="button" className={styles.checkCard} onClick={()=>seleccionar("lotes")}><span>Mismo material con distintos lotes SAP</span><strong><AnimatedNumber value={resultado.multiLote.length}/>{!resultado.multiLote.length&&<i>✓</i>}</strong><small>Ubicaciones afectadas · ver detalle →</small></button>
                <button type="button" className={styles.checkCard} onClick={()=>seleccionar("repetidas")}><span>Ubicaciones en varios tipos de almacén</span><strong><AnimatedNumber value={resultado.repetidas.length}/>{!resultado.repetidas.length&&<i>✓</i>}</strong><small>Código físico repetido · ver detalle →</small></button>
            </section>
            <div className={styles.rules}><strong>Alcance de los controles</strong><p>Materiales y lotes: almacenes 001, 006, 011, 016, 021, 022, 027 y 032; solo stock positivo. Una ubicación se cuenta una vez por almacén en esos controles. Repetidas: mismo código en almacenes diferentes, en todo el warehouse físico.</p><p>Se excluyen tipos de almacén 901–999 y códigos de ubicación que comienzan con 9. Los grupos incompletos no reciben una corrección definitiva. {numero(resultado.gruposSinPatron)} ubicaciones no siguen el patrón de nivel .NN y no se evalúan por subdivisión.</p></div>
            <section ref={detalles} className={styles.details} aria-label="Detalle de controles">
                <div className={styles.tabs}>{([{id:"tipos",label:"Tipos y divisiones",n:incidencias.length},{id:"materiales",label:"Varios materiales",n:resultado.multiMaterial.length},{id:"lotes",label:"Varios lotes",n:resultado.multiLote.length},{id:"repetidas",label:"Repetidas",n:resultado.repetidas.length},{id:"catalogo",label:"Cobertura YWM005",n:resultado.sinFicha.length}] as const).map(t=><button type="button" key={t.id} aria-pressed={tab===t.id} onClick={()=>setTab(t.id)}>{t.label}<span>{numero(t.n)}</span></button>)}</div>
                {tab==="tipos"&&<><h3>Configuración de tipos y subdivisiones</h3><p className={styles.note}>La sugerencia se infiere solo si existe la secuencia completa y los tipos declarados no apuntan a una división mayor. Si la base y sus subdivisiones coexisten, se requiere revisar el stock antes de retirar la base.</p><Grilla key="tipos" filas={incidencias} buscar={r=>JSON.stringify(r)} columnas={[{titulo:"Almacén",celda:r=>r.almacen.padStart(3,"0")},{titulo:"Ubicación",celda:r=><strong>{r.ubicacion}</strong>},{titulo:"Tipo registrado",celda:r=>r.actual},{titulo:"Posible incidencia",celda:r=>r.motivo},{titulo:"Sugerencia",celda:r=><span className={styles.suggestion}>{r.sugerencia}</span>}]}/></>}
                {tab==="materiales"&&<><h3>Ubicaciones disponibles con varios materiales</h3><Contenidos key="materiales" filas={resultado.multiMaterial}/></>}
                {tab==="lotes"&&<><h3>Mismo material con varios lotes SAP</h3><Contenidos key="lotes" filas={resultado.multiLote}/></>}
                {tab==="repetidas"&&<><h3>Ubicaciones registradas en varios tipos de almacén</h3><Grilla key="repetidas" filas={resultado.repetidas} buscar={r=>JSON.stringify(r)} columnas={[{titulo:"Ubicación",celda:r=><strong>{r.ubicacion}</strong>},{titulo:"Tipos de almacén",celda:r=>r.almacenes.map(a=>a.padStart(3,"0")).join(" · ")},{titulo:"Materiales",celda:r=>r.materiales.join(" · ")||"Vacía"}]}/></>}
                {tab==="catalogo"&&<><h3>Materiales y lotes sin coincidencia exacta en YWM005</h3><p className={styles.note}>Cruce por material, lote SAP y centro. Es una advertencia de cobertura de archivos, no un error de ubicación ni una diferencia de cantidades. Las descripciones pueden recuperarse por material aunque el lote no coincida.</p><Grilla key="catalogo" filas={resultado.sinFicha} buscar={r=>JSON.stringify(r)} columnas={[{titulo:"Material",celda:r=>r.material},{titulo:"Lote SAP",celda:r=>r.lote||"Sin lote"},{titulo:"Centro",celda:r=>r.centro||"Sin centro"}]}/></>}
            </section>
        </div>}
        <footer className={styles.footer}>OCASA · Warehouse Salud · Análisis local de archivos</footer>
    </main>;
}
