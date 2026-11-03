import { useEffect, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import type { Lx03OcupacionItem } from "../Lx03OcupacionItem";
import type { MaterialRotacion } from "./RotacionData";
import { sugerirIntercambios } from "./IntercambiosData";
import type { Intercambio } from "./IntercambiosData";
import renault from "../../../../../assets/renault-claro.png";
import styles from "./SugerenciasMovimientos.module.css";
import ocasaCompleto from "../../../../../assets/ocasa-logo.svg";

interface Props {
    lx03: Lx03OcupacionItem[]; materiales: MaterialRotacion[]; habilitado: boolean;
    warehouse: string; desde: string; hasta: string; movimiento: string;
}
const numero = (n: number) => n.toLocaleString("es-AR", { maximumFractionDigits: 3 });
const fecha = (s: string) => s.split("-").reverse().join("/");
export default function SugerenciasMovimientos({ lx03, materiales, habilitado, warehouse, desde, hasta, movimiento }: Props) {
    const [abierto, setAbierto] = useState(false), [cantidad, setCantidad] = useState("5");
    const [propuestas, setPropuestas] = useState<Intercambio[] | null>(null);
    const [seleccion, setSeleccion] = useState<Set<string>>(new Set());
    const [revisado, setRevisado] = useState(false), [imprimiendo, setImprimiendo] = useState(false);
    const [hojas, setHojas] = useState<Intercambio[][]>([]);
    const dialogo = useRef<HTMLDialogElement>(null), boton = useRef<HTMLButtonElement>(null), impresion = useRef<HTMLDivElement>(null);
    const cantidadValida = Number.isInteger(Number(cantidad)) && Number(cantidad) >= 1 && Number(cantidad) <= 100;
    const cerrar = () => { setAbierto(false); boton.current?.focus(); };
    useEffect(() => {
        if (abierto && !dialogo.current?.open) dialogo.current?.showModal();
        if (!abierto && dialogo.current?.open) dialogo.current?.close();
    }, [abierto]);
    useEffect(() => {
        setAbierto(false); setPropuestas(null); setSeleccion(new Set()); setRevisado(false);
    }, [lx03, materiales, warehouse, desde, hasta, movimiento, habilitado]);
    const generar = () => {
        if (!cantidadValida || !habilitado) return;
        const nuevas = sugerirIntercambios(lx03, materiales, Number(cantidad));
        setPropuestas(nuevas); setSeleccion(new Set(nuevas.map(p => p.id))); setRevisado(false);
    };
    const imprimir = async () => {
        if (!revisado || !habilitado || imprimiendo) return;
        const elegidas = propuestas?.filter(p => seleccion.has(p.id)) ?? [];
        if (!elegidas.length) return;
        const paginas: Intercambio[][] = [];
        for (let i=0; i<elegidas.length; i+=5) paginas.push(elegidas.slice(i,i+5));
        setImprimiendo(true);
        flushSync(() => setHojas(paginas));
        try {
            await Promise.all(Array.from(impresion.current?.querySelectorAll("img") ?? []).map(img => img.decode().catch(() => undefined)));
            document.body.classList.add("rotacion-imprimiendo");
            window.print();
        } finally {
            document.body.classList.remove("rotacion-imprimiendo");
            setImprimiendo(false);
        }
    };
    return <>
        <button ref={boton} type="button" className={styles.trigger} disabled={!habilitado} onClick={() => { setAbierto(true); setPropuestas(null); setRevisado(false); }} title={!habilitado ? "Elegí movimiento y período y confirmá la cobertura completa del historial." : undefined}>Sugerir movimientos ↗</button>
        {abierto && createPortal(<dialog ref={dialogo} className={styles.modal} aria-labelledby="titulo-intercambios" onCancel={e => { e.preventDefault(); cerrar(); }}>
            <div className={styles.modalHeader}><div><span>MAPA DE CALOR</span><h2 id="titulo-intercambios">Sugerir reubicaciones</h2></div><button type="button" aria-label="Cerrar" onClick={cerrar}>×</button></div>
            <p>Indicá la cantidad de intercambios a sugerir. Cada uno incluye una ubicación de altura para bajar a piso y una de piso para subir a altura.</p>
            <div className={styles.form}><label>Cantidad de intercambios<input autoFocus type="number" min="1" max="100" step="1" value={cantidad} onChange={e => { setCantidad(e.target.value); setPropuestas(null); setRevisado(false); }} /></label><button type="button" className={styles.primary} disabled={!cantidadValida || !habilitado} onClick={generar}>Generar propuestas</button></div>
            <p className={styles.note}>Mismo prefijo de storage (ej.: T1R ↔ T1P). Se excluyen 52P, NOC, 900–999 y ubicaciones con varios materiales. Se prioriza mayor frecuencia de picking para bajar y cero picking para subir; como alternativa, la menor frecuencia. El material a bajar no debe tener stock actual en piso.</p>
            <p className={styles.note}>La LX03 no informa altura física, bloqueos, dimensiones ni capacidad verificable. Los empates se ordenan por storage y ubicación; el analista debe revisar altura y compatibilidad. Cada propuesta mueve todo el stock de ambas ubicaciones y requiere una posición temporal autorizada.</p>
            {propuestas && <>
                <div className={styles.resultHeader} role="status"><strong>{propuestas.length} de {cantidad} intercambios encontrados</strong><span>{seleccion.size} seleccionados · {seleccion.size*2} reubicaciones</span></div>
                {propuestas.length < Number(cantidad) && <p className={styles.note}>No hay más pares elegibles con mejora de frecuencia dentro del mismo storage. No se completan propuestas mezclando storage ni reutilizando ubicaciones.</p>}
                <div className={styles.lista}>{propuestas.map((p,i) => <article key={p.id} className={styles.propuesta}>
                    <label className={styles.check}><input type="checkbox" checked={seleccion.has(p.id)} onChange={e => { const checked=e.target.checked; setSeleccion(prev => { const next=new Set(prev); if(checked)next.add(p.id);else next.delete(p.id);return next; }); setRevisado(false); }} /><strong>Intercambio {i+1} · Storage {p.bajar.storage.slice(0,2)}</strong></label>
                    <div className={styles.par}><div><b>↓ BAJAR · {p.bajar.material}</b><span>{p.bajar.descripcion}</span><strong>{p.bajar.storage} · {p.bajar.ubicacion} → {p.subir.storage} · {p.subir.ubicacion}</strong><span>Stock: {numero(p.bajar.cantidad)} · {numero(p.bajar.frecuencia)} líneas de picking</span></div><div><b>↑ SUBIR · {p.subir.material}</b><span>{p.subir.descripcion}</span><strong>{p.subir.storage} · {p.subir.ubicacion} → {p.bajar.storage} · {p.bajar.ubicacion}</strong><span>Stock: {numero(p.subir.cantidad)} · {p.subir.frecuencia === 0 ? "Sin picking registrado en el período" : `${numero(p.subir.frecuencia)} líneas de picking`}</span></div></div>
                </article>)}</div>
                {propuestas.length > 0 && <label className={styles.check}><input type="checkbox" checked={revisado} onChange={e => setRevisado(e.target.checked)} />Revisé las propuestas seleccionadas, bloqueos, altura, capacidad, compatibilidad y disponibilidad de una posición temporal con el sector.</label>}
                <div className={styles.footer}><button type="button" onClick={cerrar}>Cerrar</button><button type="button" className={styles.primary} disabled={!seleccion.size || !revisado || imprimiendo || !habilitado} onClick={() => void imprimir()}>{imprimiendo ? "Preparando…" : `Imprimir seleccionados (${seleccion.size})`}</button></div>
            </>}
        </dialog>, document.body)}
        {createPortal(<div ref={impresion} className={styles.printRoot}>{hojas.map((pagina,n) => <section className={styles.printPage} key={n}>
            <header className={styles.printHeader}><img src={renault} alt="Renault"/><div><h1>Mapa de calor · Reubicaciones</h1><p>{warehouse} · Fecha: {new Date().toLocaleDateString("es-AR")}</p><small>Picking: {fecha(desde)} al {fecha(hasta)} · WM/IM {movimiento}</small></div>
            <div className={styles.brand}>
                <img src={ocasaCompleto} alt="OCASA" className={styles.ocasaCompleto}/>
            </div>
            </header>
            <p className={styles.printInstruction}>Coordinar una posición temporal autorizada antes de intercambiar stock. Si no puede realizar el traslado, registrar el motivo. Cantidades según LX03; verificar físicamente y confirmar en SAP.</p>
            {pagina.map((p,i) => <article className={styles.printJob} key={p.id}>
                <h2>Intercambio {n*5+i+1} · Storage {p.bajar.storage.slice(0,2)}</h2>
                <div className={styles.printMove}><span className={styles.box}/><div><b>BAJAR · {p.bajar.material}</b><span>{p.bajar.storage} · {p.bajar.ubicacion} → {p.subir.storage} · {p.subir.ubicacion}</span></div><strong>Cant.: {numero(p.bajar.cantidad)}</strong></div>
                <div className={styles.printMove}><span className={styles.box}/><div><b>SUBIR · {p.subir.material}</b><span>{p.subir.storage} · {p.subir.ubicacion} → {p.bajar.storage} · {p.bajar.ubicacion}</span></div><strong>Cant.: {numero(p.subir.cantidad)}</strong></div>
                <div className={styles.observacion}>Observaciones: <span/></div>
            </article>)}
            <footer className={styles.printFooter}><span>Operario: ____________________ · Firma: ____________________</span><span>Página {n+1} de {hojas.length}</span></footer>
        </section>)}</div>, document.body)}
    </>;
}
