import styles from "./OcupacionRenaultHeader.module.css"
import LogoRenault from "../../../LogoRenault";
import LogoOcasa from "../../../../LogoOcasa/LogoOcasa";

const OcupacionRenaultHeader = () =>{
    return(
        <div className={styles.headerContainer}>
            <div className={styles.LogoRenault}> <LogoRenault /> </div>
            <div className={styles.header}>
                <h3 className={styles.headerTitle}>informe de Ocupacion</h3>                
            </div>
            <div className={styles.LogoOcasa}><LogoOcasa /> </div>
        </div>
    )
}

export default OcupacionRenaultHeader;