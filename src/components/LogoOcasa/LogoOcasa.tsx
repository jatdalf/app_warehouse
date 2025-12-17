import logo from '../../assets/OcasaLogoSmall.png';
import styles from './LogoOcasa.module.css';

const LogoOcasa = () => {   
    return(
        <div className={styles.logoContainer}>
            <div className={styles.logoTextRow}>
            <h1 className={styles.ocasaTitle}>OCASA</h1>
            {logo && (
              <img src={logo} alt="OCASA Logo" className={styles.ocasaLogo} />
            )}
          </div>
        </div>
    )
}           


export default LogoOcasa;