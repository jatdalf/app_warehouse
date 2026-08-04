import React, { useRef, useState } from "react";
import type { StockItem } from "../../../../core/stock/StockItem";
import { StockInforReader } from "../../../../readers/StockInforReader";
import styles from "./StockCardContent.module.css";

export interface StockInfo {
    fileName: string;
    posiciones: number;
    sku: number;
    loaded: boolean;
}

interface Props {
    onLoaded: (stock: StockItem[]) => void;
}

const StockCardContent: React.FC<Props> = ({ onLoaded }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [info, setInfo] = useState<StockInfo>({
        fileName: "",
        posiciones: 0,
        sku: 0,
        loaded: false
    });   

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
        <div className={styles.section}>
            {!info.loaded ? (
                <>
                    <p className={styles.small}>
                        cargar stock desde Excel
                    </p>
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".xlsx"
                        style={{ display: "none" }}
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                processFile(file);
                            }
                        }}
                    />
                    <button
                        className={styles.button}
                        onClick={() => inputRef.current?.click()}
                    >
                        Elegir archivo
                    </button>
                </>
            ) : (
                <div className={styles.success}>
                    <p>{info.fileName}</p>   
                </div>
            )}
        </div>
    );    
};

export default StockCardContent;
