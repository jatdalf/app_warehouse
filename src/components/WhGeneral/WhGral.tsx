import { Link } from "react-router-dom";
import styles from "./WhGral.module.css";
import logo from "../../assets/OcasaLogoSmall.png";
import peYa from "../../assets/PeYa.png";
import Renault from "../../assets/Renault01.png";

const WhGral = () => {
    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <div className={styles.logoTextRow}>
                    <h1 className={styles.ocasaTitle}>OCASA </h1>
                    <img src={logo} alt="OCASA" className={styles.ocasaLogo} />
                </div>

                <div className={styles.intro}>
                    <h2>Portal de Operaciones</h2>
                    <p>Seleccioná la operación para ingresar</p>
                </div>
            </header>

            <section className={styles.grid}>
                <Link to="/PeYa" className={styles.card}>
                    <div className={styles.iconContainer}>
                        <img src={peYa} alt="Pedidos Ya" className={styles.icon}/>
                    </div>

                    <div className={styles.cardContent}>
                        <h3>Pedidos Ya</h3>
                        <p>Gestión e informes de la operación</p>
                        <span className={styles.enter}>Ingresar →</span>
                    </div>
                </Link>

                <Link to="/Renault" className={styles.card}>
                    <div className={styles.iconContainer}>
                        <img src={Renault} alt="Renault" className={styles.icon} />
                    </div>

                    <div className={styles.cardContent}>
                        <h3>Renault</h3>
                        <p>Informes de warehouse</p>
                        <span className={styles.enter}>Ingresar →</span>
                    </div>
                </Link>
            </section>

            <footer className={styles.footer}>
                Operaciones Warehouse · OCASA
            </footer>
        </main>
    );
};

export default WhGral;