import {forwardRef, useImperativeHandle, useRef, useState} from "react";
import type { StockItem } from "../../../../core/stock/StockItem";
import { StockInforReader } from "../../../../readers/StockInforReader";
import styles from "./StockCardContent.module.css";

export interface StockCardContentRef {
    openFileSelector(): void;
}

interface Props {
    onLoaded(stock: StockItem[], fileName: string): void;
    onError(message: string): void;
}

const StockCardContent = forwardRef<StockCardContentRef, Props>(({ onLoaded, onError }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    useImperativeHandle(ref, () => ({
        openFileSelector() {
            inputRef.current?.click();
        }
    }));

    const processFile = async (file: File) => {
        try {
            setLoading(true);
            const stock = await StockInforReader.read(file);
            const posiciones = stock.length;
            const sku = new Set(stock.map(item => item.articulo)).size;
             if (posiciones === 0 || sku === 0) {
                onError("El archivo no contiene stock válido");
                return;
            }
            onLoaded(stock, file.name);
        } catch (error) {
            console.error(error);
            onError("No fue posible leer el archivo");
        } finally {
            setLoading(false);
        }
    };

    const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            void processFile(file);
        }
        // Permite volver a seleccionar el mismo archivo.
        event.target.value = "";
    };

    return (
        <div className={styles.cardContent}>
            <input
                ref={inputRef}
                type="file"
                accept=".xlsx"
                className={styles.hiddenInput}
                onChange={handleFile}
            />

            <div className={styles.folder}>
                📂
            </div>

            <div className={styles.text}>
                {loading
                    ? "Leyendo archivo..."
                    : "Haga clic aquí"}
            </div>

            {!loading && (
                <div className={styles.subtext}>
                    para seleccionar el archivo Excel
                </div>
            )}
        </div>
    );
});

StockCardContent.displayName = "StockCardContent";

export default StockCardContent;
