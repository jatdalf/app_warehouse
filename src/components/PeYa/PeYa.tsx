import { Link } from "react-router-dom";
import styles from "../PeYa/PeYa.module.css";
import LogoOcasa from "../LogoOcasa/LogoOcasa";
import LogoPeYa from "../LogoPeYa/LogoPeya";

const PeYa = () => {
  return (
    <div className={styles.container}>
      {/* Header con logos */}
      <div className={styles.header}>
        <div className={styles.logoLeft}>
          <LogoPeYa />
        </div>
        <div className={styles.logoRight}>
          <LogoOcasa />
        </div>
      </div>

      {/* Fieldsets */}
      <div className={styles.fieldsetContainer}>
        <fieldset className={styles.fieldsetPeya}>
          <legend>Utilidades</legend>
          <Link to="/PeYaIngresos">
            <button className={styles.peyaButton}>Ingresos <br /> (en desarrollo)</button>
          </Link>
          <Link to="/PeYaEgresos">
            <button className={styles.peyaButton}>Egresos (Simple)</button>
          </Link>

          <Link to="/PeYaWorkflow">
            <button className={styles.peyaButton}>Egresos con ubicacion</button>
          </Link>

        </fieldset>

        <fieldset className={styles.fieldsetPeya}>
          <legend>Informes</legend>
          <Link to="/PeYaInformes">
            <button className={styles.peyaButton}>Ver Informes<br /> (en desarrollo)</button>
          </Link>
        </fieldset>
      </div>
    </div>
  );
};

export default PeYa;
