import styles from "./Lottie.module.css"
import Lottie from "lottie-react";
import checkAnimation from "../../assets/Under Maintenance.json";

const LottieProcessing: React.FC = () => {
    return (
        <div className={styles.checkAnimation}>
            <Lottie animationData={checkAnimation} autoplay loop />
        </div>
    )
}

export default LottieProcessing;