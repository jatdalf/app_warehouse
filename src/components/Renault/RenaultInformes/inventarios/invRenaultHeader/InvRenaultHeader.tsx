import styles from "./InvRenaultHeader.module.css";
import LogoRenault from "../../../LogoRenault";
import LogoOcasa from "../../../../LogoOcasa/LogoOcasa";

const InvRenaultHeader = () => {
    return (
        <div className={styles.headerContainer}>
            <div className={styles.logoRenault}>
                <LogoRenault />
            </div>
            <div className={styles.header}>
                <h2 className={styles.headerTitle}>
                    <span className={styles.titleIcon}>📊</span>
                    INFORME GENERAL
                </h2>
            </div>
            <div className={styles.logoOcasa}>
                <LogoOcasa />
            </div>
        </div>
    );
};

export default InvRenaultHeader;