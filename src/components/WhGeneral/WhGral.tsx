import { Link } from "react-router-dom";
import styles from "./WhGral.module.css";
import logo from "../../assets/OcasaLogoSmall.png";
import peYa from "../../assets/PeYa.png"
import Renault from "../../assets/Renault01.png"

const whGral  = () => {
  return (
    <div className={styles.headerContainer}>      

      <div className={styles.titleContainer}>
        <div className={styles.logoTextRow}>
          <h1 className={styles.ocasaTitle}>OCASA</h1>
          <img
            src={logo}
            alt="OCASA Logo"
            className={styles.ocasaLogo}
          />
        </div>    
      </div>

      {/* Grid de tarjetas */}
      <section className={styles.grid}>   
        
        <Link to="/PeYa" className={styles.card}>
          <img src={peYa} alt="Pedidos Ya" className={styles.icon} />
          <p className={styles.cardText}>Pedidos Ya</p>
        </Link>
        <Link to="/Renault" className={styles.card}>
          <img src={Renault} alt="Renault" className={styles.icon} />
          <p className={styles.cardText}>Renault</p>
        </Link>

        </section>
        </div>
  )
}

export default whGral