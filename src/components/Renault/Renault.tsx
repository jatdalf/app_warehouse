import { Link } from "react-router-dom";
import styles from "./Renault.module.css";
import LogoOcasa from "../LogoOcasa/LogoOcasa";
import LogoRenault from "./LogoRenault";

const Renault = () => {
  return (
    <div className={styles.container}>
      {/* Header con logos */}
      <div className={styles.header}>
        <div className={styles.logoLeft}>
          <LogoRenault />
        </div>
        <div className={styles.logoRight}>
          <LogoOcasa />
        </div>
      </div>
      {/* Fieldsets */}
      <div className={styles.fieldsetContainer}>
        <fieldset className={styles.fieldsetPeya}>
          <legend>Informes</legend>
          <Link to="/RenaultInformes">
            <button className={styles.peyaButton}>📊 Ver Informes</button>
          </Link>
        </fieldset>
      </div>
    </div>
  );
};

export default Renault;