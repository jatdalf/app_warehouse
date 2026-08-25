import styles from "./InvRenaultHeader.module.css"
import LogoRenault from "../../../LogoRenault";
import LogoOcasa from "../../../../LogoOcasa/LogoOcasa";

const InvRenaultHeader = () =>{
    return(
        <div className={styles.headerContainer}>
            <LogoRenault />
            <div className={styles.header}>
                <h2 className={styles.headerTitle}>📊INFORME GENERAL - SEMANA LABORAL</h2>                
            </div>
            <LogoOcasa />
        </div>
    )
}

export default InvRenaultHeader;

