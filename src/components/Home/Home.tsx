import { Link } from "react-router-dom";
import styles from "./Home.module.css";
import logo from "../../assets/OcasaLogoSmall.png";
import UOM from "../../assets/UOM.png";
// import calendarIcon from "../../assets/calendar.gif";
// import reportIcon from "../../assets/report.gif";
// import accidentIcon from "../../assets/accident.gif";
// import riskIcon from "../../assets/risk.gif";
// import environmentIcon from "../../assets/environment.gif";
// import ideaIcon from "../../assets/idea.gif";
// import heartIcon from "../../assets/heart.gif";
// import hashtagIcon from "../../assets/hashtag.gif";

const Home: React.FC = () => {
 
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

   
        
        <Link to="/Uom" className={styles.card}>
          <img src={UOM} alt="Control de UOM" className={styles.icon} />
          <p className={styles.cardText}>Comprobar UOM</p>
        </Link>

        {/* <Link to="/informe" className={styles.card}>
          <img src={reportIcon} alt="Informe" className={styles.icon} />
          <p className={styles.cardText}>Stand By</p>
        </Link>

        <Link to="/accidentes" className={styles.card}>
          <img src={accidentIcon} alt="Accidentes" className={styles.icon} />
          <p className={styles.cardText}>Stand By</p>
        </Link>

        <Link to="/noticias" className={`${styles.card} ${styles.cardNoticias}`}>
          <div>
          <img src={hashtagIcon} alt="Hastag" className={styles.SmallIcon} />
          <img src={heartIcon} alt="Me gusta" className={styles.SmallIcon2} />
          </div>
          <img src={newsIcon} alt="Noticias" className={styles.LargeIcon} />
          <p className={styles.cardText}>Stand By</p>
        </Link>

        <Link to="/riesgo" className={styles.card}>
          <img src={riskIcon} alt="Riesgo" className={styles.icon} />
          <p className={styles.cardText}>Stand By</p>
        </Link>

        <Link to="/ambientales" className={styles.card}>
          <img src={environmentIcon} alt="Impactos ambientales" className={styles.icon} />
          <p className={styles.cardText}>Stand By</p>
        </Link>

        <Link to="/consulta" className={styles.card}>
          <img src={ideaIcon} alt="Consulta" className={styles.icon} />
          <p className={styles.cardText}>Stand By</p>
        </Link> */}
      </section>

      <div className={styles.footer}>
        <p className={styles.footerText}>© 2025 OCASA. Todos los derechos reservados. (Version: 1.15)</p>  
        <p className={styles.footerText}>Desarrollado por Jorge Toso</p>
      </div>  

    </div>
  );
};

export default Home;