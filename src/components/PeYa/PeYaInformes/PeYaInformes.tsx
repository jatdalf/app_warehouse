import { useNavigate } from "react-router-dom";
import PeyaInformesHeader from "./PeYaInformesHeader";
import InformeCard from "./InformeCard";
import styles from "./PeYaInformes.module.css";

const informes = [
    {
        id: "ingresos",
        titulo: "Ingresos",
        descripcion: "Recepciones y novedades",
        icono: "📥"
    },
    {
        id: "ocupacion",
        titulo: "Ocupación",
        descripcion: "Uso de posiciones y capacidad",
        icono: "📦"
    },
    {
        id: "inventarios",
        titulo: "Inventarios",
        descripcion: "Conteos y diferencias",
        icono: "📋"
    },
    {
        id: "egresos",
        titulo: "Egresos",
        descripcion: "Despachos y movimientos",
        icono: "🚚"
    }
];

const PeYaInformes = () => {
    const navigate = useNavigate();
    return (
        <div className={styles.container}>
            <PeyaInformesHeader />
            <h2 className={styles.title}>
                Informes Operativos
            </h2>
            <div className={styles.cardsGrid}>
                {informes.map(informe => (
                    <InformeCard
                        key={informe.id}
                        titulo={informe.titulo}
                        descripcion={informe.descripcion}
                        icono={informe.icono}
                        onClick={() => navigate(`/PeYaInformes/${informe.id}`)}
                    />
                ))}
            </div>
                <div className={styles.controlKeyAction}>
                <button type="button" className={styles.controlKeyButton} onClick={() =>
                    navigate("/PeYaInformes/clave-control")} >
                    🔑 Clave de control
                </button>
            </div>
        </div>
    );
};

export default PeYaInformes;