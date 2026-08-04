import type { ProcessStep } from "./ProcessStep";
import type {StockCardProps, OrdersCardProps, ExecutionCardProps} from "./ProcessDashboardProps";
import styles from "./ProcessCard.module.css";
import StockCardContent from "../../workflow/sections/StockImportSection/StockCardContent";
import LottieOk from "./LottieOk";

interface Props {
    step: ProcessStep;
    opened: boolean;
    onToggle: () => void;
    stockProps: StockCardProps;
    ordersProps: OrdersCardProps;
    executionProps: ExecutionCardProps;
}

const ProcessCard: React.FC<Props> = ({
        step,
        opened,
        onToggle,
        stockProps,
        // ordersProps,
        // executionProps
    }) => {
    const renderIcon = () => {
        switch (step.estado) {
            case "pending":
                return "⚙️";
            case "running":
                return "⟳";
            case "success":
                return <LottieOk />;
            case "error":
                return "✖";
        }
    };
    const renderContent = () => {
        switch (step.id) {
            case "stock":
                return (
                    <div>
                        <StockCardContent onLoaded={stockProps.onLoaded}/>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`${styles.card} ${styles[step.estado]}`}>
            <div className={styles.icon}>
                {renderIcon()}
            </div>

            <div className={styles.title}>
                {step.titulo}
            </div>

            <div className={styles.summary}>
                {step.resumen?.map(linea => (
                    <div key={linea} className={styles.resume} >
                        {linea}
                    </div>
                ))}
            </div>
            {renderContent()}
            {step.detail && (
                <>
                    <button
                        className={styles.detailButton}
                        onClick={onToggle}
                    >
                        {opened
                            ? "Ocultar detalle ▲"
                            : "Ver detalle ▼"}
                    </button>
                    {opened && (
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