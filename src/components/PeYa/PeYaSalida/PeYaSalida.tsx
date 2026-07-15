    import React from "react";
    import { useLocation } from "react-router-dom";  
    import styles from "../PeYaSalida/PeYaSalida.module.css";
    import LogoOcasa from "../../LogoOcasa/LogoOcasa";
    import LogoPeYa from "../../LogoPeYa/LogoPeya";
    import { generarSalidaInfor } from "../../../services/inforExcel";

    const PeYaSalida: React.FC = () => {
    const location = useLocation();
    const data = (location.state as { data: any[] })?.data || [];

   const handleGenerateExcel=async()=>{
    await generarSalidaInfor(data);
    };


    return (
        <div className={styles.container}>
        {/* Header con logos */}
        <div className={styles.header}>
            <div className={styles.logoLeft}>
            <LogoPeYa />
            </div>
            <div className={styles.logoRight}>
            <LogoOcasa />
            </div>
        </div>

        <h2 className={styles.title}>Generar Salida Infor</h2>
        <p className={styles.info}>
            Se procesarán <strong>{data.length}</strong> filas y se completará el archivo <strong>Infor00000.xlsx</strong> desde la fila 3 en adelante.
        </p>

        <div className={styles.actionsBox}>
            <button className={styles.actionButton} onClick={handleGenerateExcel}>
            Completar y Guardar Excel
            </button>
        </div>
        </div>
    );
    };

    export default PeYaSalida;
