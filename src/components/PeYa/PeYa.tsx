import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../PeYa/PeYa.module.css";
import LogoOcasa from "../LogoOcasa/LogoOcasa";
import LogoPeYa from "../LogoPeYa/LogoPeya";

type PeyaBranch = "COR" | "BUE";

const PEYA_BRANCH_KEY = "peya_branch";

const PeYa = () => {
  const [branch, setBranch] = useState<PeyaBranch | "">(() => {
    const savedBranch = localStorage.getItem(PEYA_BRANCH_KEY);

    if (savedBranch === "COR" || savedBranch === "BUE") {
      return savedBranch;
    }

    return "";
  });

  const handleBranchChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value as PeyaBranch | "";

    setBranch(value);

    if (value) {
      localStorage.setItem(PEYA_BRANCH_KEY, value);
    } else {
      localStorage.removeItem(PEYA_BRANCH_KEY);
    }
  };

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

      {/* Selección de sucursal */}
      <div className={styles.branchSelector}>
        <label htmlFor="peya-branch">
          Sucursal
        </label>

        <select
          id="peya-branch"
          value={branch}
          onChange={handleBranchChange}
        >
          <option value="">
            Seleccionar sucursal
          </option>

          <option value="COR">
            Córdoba
          </option>

          <option value="BUE">
            Buenos Aires
          </option>
        </select>
      </div>

      {/* Fieldsets */}
      <div className={styles.fieldsetContainer}>
        <fieldset
          className={styles.fieldsetPeya}
          disabled={!branch}
        >
          <legend>Utilidades</legend>

          <Link to="/PeYaIngresos">
            <button className={styles.peyaButton} disabled={true}>
              Ingresos <br /> (en desarrollo)
            </button>
          </Link>

          <Link to="/PeYaEgresos">
            <button className={styles.peyaButton}>
              Egresos (Simple)
            </button>
          </Link>

          <Link to="/PeYaWorkflow">
            <button className={styles.peyaButton}>
              Egresos con ubicacion
            </button>
          </Link>
        </fieldset>

        <fieldset
          className={styles.fieldsetPeya}
          disabled={!branch}
        >
          <legend>Informes</legend>

          <Link to="/PeYaInformes">
            <button className={styles.peyaButton}>
              📊 Ver Informes
            </button>
          </Link>
        </fieldset>
      </div>
    </div>
  );
};

export default PeYa;