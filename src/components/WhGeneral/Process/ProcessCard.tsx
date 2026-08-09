import { useRef } from "react";
import type { ProcessStep } from "./ProcessStep";
import type {
    StockCardProps, OrdersCardProps, ExecutionCardProps, PickingCardProps, RemitoCardProps, ExportCardProps
} from "./ProcessDashboardProps";
import styles from "./ProcessCard.module.css";
import StockCardContent, {type StockCardContentRef} from "../../workflow/sections/StockImportSection/StockCardContent";
import OrdersCardContent, { type OrdersCardContentRef} from "../../workflow/sections/OrdersSection/OrdersCardContent";
import ProcessCardContent from "../../ExecutionPanel/ProcessCardContent";
import LottieOk from "../../Lotties/LottieOk";
import LottieError from "../../Lotties/LottieError";
import LottieYellowCircle from "../../Lotties/LottieYellowCircle";
import LottieProcessing from "../../Lotties/LottieProcessing";

interface Props {
    step: ProcessStep;
    opened: boolean;
    onToggle(): void;
    stockProps: StockCardProps;
    ordersProps: OrdersCardProps;
    executionProps: ExecutionCardProps;
    pickingProps: PickingCardProps;
    remitoProps: RemitoCardProps;
    exportProps: ExportCardProps;
}

const ProcessCard: React.FC<Props> = ({
    step,
    opened,
    onToggle,
    stockProps,
    ordersProps,
    pickingProps,
    remitoProps,
    executionProps,
    exportProps    
    }) => {
    const stockContentRef = useRef<StockCardContentRef>(null);
    const ordersContentRef = useRef<OrdersCardContentRef>(null);
    const isStockCard = step.id === "stock";
    const isOrdersCard = step.id === "pedidos";
    const isClickable = isStockCard || isOrdersCard;
    const isProcessCard = step.id === "proceso";
    const isPickingCard = step.id === "picking";
    const isRemitoCard = step.id === "remito";
    const isExportCard = step.id === "Exportar";
  
    const handleCardClick = () => {
        if (isStockCard) {
            stockContentRef.current?.openFileSelector();
            return;
        }
        if (isOrdersCard) {
            ordersContentRef.current?.readClipboard();
        }
    };

    const renderIcon = () => {
        switch (step.estado) {
            case "pending":
                return <LottieYellowCircle />;
            case "running":
                return <LottieProcessing />;
            case "success":
                return (<LottieOk key={`${step.id}-${step.animationKey ?? 0}`}/>);
            case "error":
                return <LottieError />;
        }
    };
    const renderContent = () => {
        if (isStockCard) {
            return (
                <div
                    className={
                        step.estado === "success" ? styles.hiddenCardContent : undefined
                    }
                >
                    <StockCardContent
                        ref={stockContentRef}
                        onLoaded={stockProps.onLoaded}
                        onError={stockProps.onError}
                    />
                </div>
            );
        }
        if (isOrdersCard) {
            return (
                <div
                    className={
                        step.estado === "success" ? styles.hiddenCardContent : undefined
                    }
                >
                    <OrdersCardContent
                        ref={ordersContentRef}
                        onLoaded={ordersProps.onLoaded}
                        onError={ordersProps.onError}
                    />
                </div>
            );
        }
        if (isProcessCard && (step.estado === "pending" || step.estado === "error")) {
            return (
                <ProcessCardContent
                    {...executionProps}
                />
            );
        }
        if (isPickingCard && step.estado === "running") {
            return (
                <button
                    type="button"
                    className={styles.actionButton}
                    disabled={!pickingProps.enabled}
                    onClick={(event) => { event.stopPropagation(); pickingProps.onPrint();}}
                >
                    🖨️ Imprimir
                </button>
            );
        }
        if (isRemitoCard && step.estado === "running") {
            return (
                <button
                    type="button"
                    className={styles.actionButton}
                    disabled={!remitoProps.enabled}
                    onClick={(event) => {
                        event.stopPropagation();
                        remitoProps.onPrint();
                    }}
                >
                    🖨️ Imprimir
                </button>
            );
        }
        if (isExportCard && step.estado === "running") {
            return (
                <button
                    type="button"
                    className={styles.actionButton}
                    disabled={!exportProps.enabled}
                    onClick={(event) => {
                        event.stopPropagation();
                        exportProps.onExport();
                    }}
                >
                    📥 Exportar
                </button>
            );
        }
        return null;
    };
    const hasExternalDetail = step.id === "pedidos"|| step.id === "picking"  || step.id === "remito";
    const hasDetail = hasExternalDetail || Boolean(step.detail);

        return (
        <div
            className={`
                ${styles.card}
                ${styles[step.estado]}
                ${isClickable ? styles.clickable : ""}
            `}
            onClick={handleCardClick}
            role={isClickable ? "button" : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onKeyDown={(event) => {
                if (
                    isClickable &&
                    (event.key === "Enter" || event.key === " ")
                ) {
                    event.preventDefault();
                    handleCardClick();
                }
            }}
        >
            <div className={styles.icon}>
                {renderIcon()}
            </div>

            <div className={styles.title}>
                {step.titulo}
            </div>

        <div className={styles.summary}>
            {step.resumen?.map((linea, index) => {
                const showSeparator =
                    (step.id === "stock" && index === 2) ||
                    (step.id === "proceso" && index === 3) ||
                    (step.id === "Exportar" && index === 2);

                const isProcessMethodLabel = step.id === "proceso" && index === 3;

                return (
                    <div key={`${linea}-${index}`}>
                        {showSeparator && ( <div className={styles.separator} />)}
                        <div
                            className={
                                isProcessMethodLabel
                                    ? styles.summaryLabel
                                    : styles.resume
                            }
                        >
                            {linea}
                        </div>
                    </div>
                );
            })}
        </div>

            {renderContent()}

            {hasDetail && (
            <>
                <button
                    className={styles.detailButton}
                    onClick={(event) => {
                        event.stopPropagation();
                        onToggle();
                    }}
                >
                    {opened
                        ? "Ocultar detalle ▲"
                        : "Ver detalle ▼"}
                </button>

                {!hasExternalDetail &&
                    opened &&
                    step.detail && (
                        <div className={styles.detail}>
                            {step.detail}
                        </div>
                    )}  
            </>
        )}
        </div>
    );
};

export default ProcessCard;