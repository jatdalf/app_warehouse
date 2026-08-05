import {forwardRef, useImperativeHandle, useState} from "react";
import type { OrderItem } from "../../../../core/orders/OrderItem";
import { OrdersClipboardReader } from "../../../../readers/OrdersClipboardReader";
import styles from "./OrdersCardContent.module.css";

export interface OrdersCardContentRef {
    readClipboard(): void;
}

interface Props {
    onLoaded(orders: OrderItem[]): void;
    onError(message: string): void;
}

const OrdersCardContent = forwardRef<
    OrdersCardContentRef,
    Props
>(({ onLoaded, onError }, ref) => {
    const [loading, setLoading] =
        useState(false);

    const processClipboard = async () => {
        try {
            setLoading(true);
            const text = await navigator.clipboard.readText();
            if (!text.trim()) {
                onError("El portapapeles está vacío");
                return;
            }
            const orders = OrdersClipboardReader.read(text);
            const pedidos = new Set(orders.map(item => item.st)).size;
            const sku = new Set(orders.map(item => item.sku)).size;
            const bultos = orders.reduce((total, item) => total + item.bultos, 0);
            if (
                orders.length === 0 ||
                pedidos === 0 ||
                sku === 0 ||
                bultos === 0
            ) {
                onError(
                    "El contenido no contiene pedidos válidos"
                );
                return;
            }
            onLoaded(orders);
        } catch (error) {
            console.error(error);
            onError("No fue posible leer el portapapeles");
        } finally {
            setLoading(false);
        }
    };
    useImperativeHandle(ref, () => ({
        readClipboard() {
            void processClipboard();
        }
    }));

    return (
        <div className={styles.cardContent}>
            <div className={styles.icon}>
                📋
            </div>
            <div className={styles.text}>
                {loading
                    ? "Analizando pedidos..."
                    : "Haga clic aquí"}
            </div>
            {!loading && (
                <div className={styles.subtext}>
                    para cargar los pedidos desde el portapapeles
                </div>
            )}
        </div>
    );
});

OrdersCardContent.displayName =
    "OrdersCardContent";

export default OrdersCardContent;