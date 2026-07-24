import styles from "./PeYaHeader.module.css";
import LogoOcasa from "../../LogoOcasa/LogoOcasa";
import LogoPeYa from "../../LogoPeYa/LogoPeya";

const PeYaHeader: React.FC = () => {
    return (        
        <header className={styles.header}>
            <div className={styles.logoLeft}>
                <LogoPeYa />
            </div>

            <div className={styles.center}>
                <h1>Proceso de Egresos</h1>
                <p>
                    Warehouse Management System
                </p>
            </div>

            <div className={styles.logoRight}>
                <LogoOcasa />
            </div>

        </header>
    );
};

export default PeYaHeader;