import { useState } from "react";
import ProcessCard from "./ProcessCard";
import type { ProcessStep } from "./ProcessStep";
import styles from "./ProcessDashboard.module.css";
import type {StockCardProps, OrdersCardProps, ExecutionCardProps, RemitoCardProps, 
    PickingCardProps,  ExportCardProps
} from "./ProcessDashboardProps";

interface Props {
    steps: ProcessStep[];
    stockProps: StockCardProps;
    ordersProps: OrdersCardProps;
    executionProps: ExecutionCardProps;
    pickingProps: PickingCardProps;
    remitoProps: RemitoCardProps;
    exportProps: ExportCardProps;
    onOpenedChange?(stepId: string | null): void;
}

const ProcessDashboard: React.FC<Props> = ({
    steps, stockProps, ordersProps, executionProps, pickingProps, remitoProps, exportProps, onOpenedChange}) => {
    const [opened, setOpened] = useState<string | null>(null);
    const handleToggle = (stepId: string) => {
        setOpened(prev => {
            const next = prev === stepId ? null : stepId;
            onOpenedChange?.(next);
            return next;
        });
    };
    return (
        <div className={styles.dashboard}>
            {steps.map(step => (
                <ProcessCard
                    key={step.id}
                    step={step}
                    opened={opened === step.id}
                    onToggle={() => handleToggle(step.id)}
                    stockProps={stockProps}
                    ordersProps={ordersProps}
                    executionProps={executionProps}
                    pickingProps={pickingProps}
                    remitoProps={remitoProps}
                    exportProps={exportProps}
                />
            ))}
        </div>
    );
};

export default ProcessDashboard;