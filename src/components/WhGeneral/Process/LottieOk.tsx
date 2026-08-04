import styles from "./LottieOk.module.css"
import Lottie from "lottie-react";
import checkAnimation from "../../../assets/check-ok.json";

const LotttieOk: React.FC = () => {
    return (
        <div className={styles.checkAnimation}>
            <Lottie
                animationData={checkAnimation}
                autoplay
                loop={false}
            />
        </div>
    )
}

export default LotttieOk;