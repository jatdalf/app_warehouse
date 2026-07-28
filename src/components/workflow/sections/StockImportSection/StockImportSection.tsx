import React, { useState } from "react";
import type { StockItem } from "../../../../core/stock/StockItem";
import styles from "./StockImportSection.module.css"
import Lottie from "lottie-react";
import checkAnimation from "../../../../assets/check-ok.json";
import { StockInforReader } from "../../../../readers/StockInforReader";


export interface StockInfo {
    fileName: string;
    posiciones: number;
    sku: number;
    loaded: boolean;
}

interface Props {
    onLoaded: (stock: StockItem[]) => void;
}

const StockSection: React.FC<Props> = ({ onLoaded }) => {
    const [info, setInfo] = useState<StockInfo>({
        fileName: "",
        posiciones: 0,
        sku: 0,
        loaded: false
    });   
    const [dragOver, setDragOver] = useState(false);
    const handleDrop = (
    e: React.DragEvent<HTMLDivElement>
    ) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = async (file: File) => {
        const stock = await StockInforReader.read(file);
        onLoaded(stock);
        setInfo({
            fileName: file.name,
            posiciones: stock.length,
            sku: new Set(stock.map(s => s.articulo)).size,
            loaded: true
        });
    };

    return (
        <fieldset className={styles.section}>
            <legend>1. Stock</legend>
            <div
                className={`${styles.dropZone} ${
                    dragOver ? styles.dragOver : ""
                }`}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
            >
                {!info.loaded ? (
                    <>
                        <p>Arrastre aquí el archivo de Stock Infor</p>
                        <p className={styles.small}>
                            o haga click para seleccionarlo
                        </p>
                        <input
                            type="file"
                            accept=".xlsx"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    processFile(file);
                                }
                            }}
                        />
                    </>
                ) : (
                    <div className={styles.success}>
                        <div className={styles.checkAnimation}>
                            <Lottie
                                animationData={checkAnimation}
                                autoplay
                                loop={false}
                            />
                        </div>
                        <h3>{info.fileName}</h3>
                        <p>
                            Posiciones:
                            <strong> {info.posiciones}</strong>
                        </p>
                        <p>
                            SKU:
                            <strong> {info.sku}</strong>
                        </p>
                    </div>
                )}
            </div>
        </fieldset>
    );    
};

export default StockSection;
