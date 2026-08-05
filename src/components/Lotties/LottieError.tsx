import styles from "./Lottie.module.css"
import Lottie from "lottie-react";
import checkAnimation from "../../assets/Tomato Error.json";

const LottieError: React.FC = () => {
    return (
        <div className={styles.checkAnimation}>
            <Lottie animationData={checkAnimation} autoplay loop={false} />
        </div>
    )
}

export default LottieError;