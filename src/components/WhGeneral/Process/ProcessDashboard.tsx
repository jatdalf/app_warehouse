import { useState } from "react";
import ProcessCard from "./ProcessCard";
import type { ProcessStep } from "./ProcessStep";
import styles from "./ProcessDashboard.module.css";
import type { StockItem } from "../../../core/stock/StockItem";
import type { OrderItem } from "../../../core/orders/OrderItem";
import type { PickingMethod } from "../../../core/picking/strategies/PickingMethod";

interface Props {
    steps: ProcessStep[];
    stockProps: {onLoaded(items: StockItem[]): void;};
    ordersProps: {onLoaded(items: OrderItem[]): void;};
    executionProps: {
        method: PickingMethod;
        onMethodChange(method: PickingMethod): void;
        enabled: boolean;
        onExecute(): void;
    };
}

const ProcessDashboard: React.FC<Props> = ({steps, stockProps, ordersProps, executionProps}) => {
    const [opened, setOpened] = useState<string | null>(null);
    return (
        <div className={styles.dashboard}>
            {steps.map(step => (
                <ProcessCard
                    key={step.id}
                    step={step}
                    opened={opened === step.id}
                    onToggle={() =>
                        setOpened(
                            opened === step.id
                                ? null
                                : step.id
                        )
                    }
                    stockProps={stockProps}
                    ordersProps={ordersProps}
                    executionProps={executionProps}
                />
            ))}
        </div>
    );
};

export default ProcessDashboard;