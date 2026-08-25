import logoRenault from '../../assets/Renault01.png';
import styles from './LogoRenault.module.css';

const LogoRenault = () => {   
    return(
        <div className={styles.logoContainer}>        
              <img src={logoRenault} alt="Renault Logo" className={styles.RenaultLogo} />          
        </div>
    )
}           
export default LogoRenault;