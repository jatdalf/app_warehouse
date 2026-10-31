import { Link } from "react-router-dom";
import LogoOcasa from "../LogoOcasa/LogoOcasa";
import PortalIcon from "./PortalIcon";
import styles from "./Home.module.css";
const proximas = [
    { titulo:"Capital Humano", icono:"personas", texto:"Personas y desarrollo" },
    { titulo:"Distribución / Tráfico", icono:"camion", texto:"Coordinación y transporte" },
    { titulo:"Seguridad e Higiene", icono:"seguridad", texto:"Prevención y cuidado" },
    { titulo:"Calidad", icono:"calidad", texto:"Control y mejora continua" },
];
export default function Home(){return <main className={styles.page}>
    <header className={styles.header}>
        <div className={styles.headerIntro}>
            <span className={styles.eyebrow}>OPERACIONES · OCASA</span>
            <p>Seleccioná el área para acceder a sus herramientas.</p>
        </div>
        <div className={styles.headerLogo}><LogoOcasa /></div>
    </header>
    <section className={styles.activeGrid} aria-label="Warehouses">
        <Link to="/WarehouseSalud" className={`${styles.card} ${styles.featured}`}><span className={styles.icon}><PortalIcon name="salud"/></span><div><span className={styles.kicker}>OPERACIÓN SALUD</span><h2>Warehouse Salud</h2><p>UOM, traslados, inventarios y análisis de ubicaciones.</p></div><span className={styles.enter}>Ingresar <span aria-hidden="true">↗</span></span></Link>
        <Link to="/WhGral" className={styles.card}><span className={styles.icon}><PortalIcon name="warehouse"/></span><div><span className={styles.kicker}>OPERACIÓN GENERAL</span><h2>Warehouse General</h2><p>Gestión e informes de las operaciones del warehouse.</p></div><span className={styles.enter}>Ingresar <span aria-hidden="true">↗</span></span></Link>
    </section>
    <section className={styles.futureSection} aria-label="Próximas áreas"><div className={styles.sectionLabel}><span>Un portal que sigue creciendo</span><span>Próximas áreas</span></div><div className={styles.futureGrid}>{proximas.map(p=><div key={p.titulo} className={styles.disabledCard} aria-disabled="true"><PortalIcon name={p.icono}/><h2>{p.titulo}</h2><p>{p.texto}</p><span className={styles.soon}>Próximamente…</span></div>)}</div></section>
    <footer className={styles.footer}><span>© {new Date().getFullYear()} OCASA · Operaciones Warehouse</span><span>Desarrollado por Jorge Toso</span></footer>
</main>;}
