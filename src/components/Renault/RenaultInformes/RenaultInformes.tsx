import { useNavigate } from "react-router-dom";
import RenaultInformesHeader from "../LogoRenault";
import InformeCard from "../../PeYa/PeYaInformes/InformeCard";
import styles from "../../PeYa/PeYaInformes/PeYaInformes.module.css";

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
            <RenaultInformesHeader />
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
                        onClick={() => navigate(`/RenaultInformes/${informe.id}`)}
                    />
                ))}
            </div>
                <div className={styles.controlKeyAction}>
                <button type="button" className={styles.controlKeyButton} onClick={() =>
                    navigate("/Renault/resumenOperativo")} >
                    Resumen Operativo
                </button>
            </div>
        </div>
    );
};

export default PeYaInformes;