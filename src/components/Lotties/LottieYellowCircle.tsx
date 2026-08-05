import styles from "./Lottie.module.css"
import Lottie from "lottie-react";
import checkAnimation from "../../assets/Circle.json";

const LottieYellowCircle: React.FC = () => {
    return (
        <div className={styles.checkAnimation}>
            <Lottie animationData={checkAnimation} autoplay loop />
        </div>
    )
}

export default LottieYellowCircle;