import { Link } from "react-router-dom";
import LogoOcasa from "../LogoOcasa/LogoOcasa";
import PortalIcon from "../Home/PortalIcon";
import styles from "./WarehouseSalud.module.css";
const accesos=[
    { to:"/Uom", icon:"uom", titulo:"Comprobar UOM", texto:"Verificá unidades de medida y detectá diferencias en el stock.", etiqueta:"VALIDACIÓN" },
    { to:"/Traslados", icon:"traslados", titulo:"Traslados", texto:"Prepará y controlá movimientos entre ubicaciones.", etiqueta:"OPERACIÓN" },
    { to:"/Inventarios", icon:"inventario", titulo:"Inventarios", texto:"Consultá el avance y los resultados de los inventarios.", etiqueta:"SEGUIMIENTO" },
    { to:"/WarehouseSalud/ubicaciones", icon:"analisis", titulo:"Ocupación y ubicaciones", texto:"Analizá capacidad, subdivisiones, materiales y lotes SAP.", etiqueta:"NUEVO ANÁLISIS" },
];
export default function WarehouseSalud(){return <main className={styles.page}><header className={styles.header}><Link to="/Home" className={styles.back}>← Portal de operaciones</Link><LogoOcasa/></header><div className={styles.intro}><span>OPERACIÓN SALUD</span><h1>Warehouse Salud</h1><p>Herramientas para ordenar, controlar y mejorar la operación.</p></div><section className={styles.grid} aria-label="Herramientas de Warehouse Salud">{accesos.map(a=><Link to={a.to} key={a.to} className={styles.card}><span className={styles.icon}><PortalIcon name={a.icon}/></span><small>{a.etiqueta}</small><h2>{a.titulo}</h2><p>{a.texto}</p><span className={styles.enter}>Abrir herramienta <span aria-hidden="true">↗</span></span></Link>)}</section><footer className={styles.footer}>OCASA · Warehouse Salud</footer></main>;}
