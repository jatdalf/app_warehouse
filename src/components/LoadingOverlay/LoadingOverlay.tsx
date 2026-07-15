import Lottie from "lottie-react";
import loadingAnimation from "../../assets/lottie/loading.json";
import styles from "./LoadingOverlay.module.css";

interface LoadingOverlayProps{
    open:boolean;
    title:string;
    message:string;
    animationData?:object;
}

const LoadingOverlay:React.FC<LoadingOverlayProps>=({open, title, message, animationData})=>{
  if(!open){
    return null;
  }

  return(
    <div className={styles.overlay}>
      <div className={styles.box}>

        <Lottie
            animationData={animationData ?? loadingAnimation}
            loop
            className={styles.animation}
        />

        <h2 className={styles.title}>
          {title}
        </h2>

        <p className={styles.message}>
          {message}
        </p>

      </div>
    </div>
  );
};

export default LoadingOverlay;