import logo from '../../assets/PeYa.png';
import styles from './LogoPeYa.module.css';

const LogoPeYa = () => {   
    return(
        <div className={styles.logoContainer}>
        
              <img src={logo} alt="Pedidos Ya Logo" className={styles.peyaLogo} />
          
        </div>
    )
}           


export default LogoPeYa;