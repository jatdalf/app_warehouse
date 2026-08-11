import styles from "./Lottie.module.css"
import Lottie from "lottie-react";
import lottieLoaging from "../../assets/lottie/loading.json";

const LottieLoading: React.FC = () => {
    return (
        <div className={styles.checkAnimation}>
            <Lottie animationData={lottieLoaging} autoplay loop />
        </div>
    )
}

export default LottieLoading;