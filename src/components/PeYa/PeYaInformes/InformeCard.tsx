import styles from "./InformeCard.module.css";

interface Props {
    titulo: string;
    descripcion: string;
    icono: string;
    onClick(): void;
}

const InformeCard: React.FC<Props> = ({titulo, descripcion, icono, onClick}) => {
    return (
        <button
            type="button"
            className={styles.card}
            onClick={onClick}
        >
            <div className={styles.icon}>
                {icono}
            </div>

            <div className={styles.title}>
                {titulo}
            </div>

            <div className={styles.description}>
                {descripcion}
            </div>
        </button>
    );
};

export default InformeCard;