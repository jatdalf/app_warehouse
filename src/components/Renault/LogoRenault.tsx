import styles from './LogoRenault.module.css';
import renaultVideo from "../../assets/renault-claro.mp4";
import renaultImagen from "../../assets/renault-claro.png";

const LogoRenault = () => {   
    return(
        <div className={styles.logoContainer}>        
           <video
    className={`${styles.renaultLogo} ${styles.logoAnimado}`}
    autoPlay
    muted
    loop
    playsInline
    disablePictureInPicture
    poster={renaultImagen}
    aria-label="Renault"
>
    <source src={renaultVideo} type="video/mp4" />
</video>
            <img src={renaultImagen} alt="Renault" className={`${styles.renaultLogo} ${styles.logoEstatico}`}/>        
        </div>
    )
}           
export default LogoRenault;