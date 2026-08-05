import { useState } from "react";
import ProcessCard from "./ProcessCard";
import type { ProcessStep } from "./ProcessStep";
import styles from "./ProcessDashboard.module.css";
import type {StockCardProps, OrdersCardProps, ExecutionCardProps} from "./ProcessDashboardProps";

interface Props {
    steps: ProcessStep[];
    stockProps: StockCardProps;
    ordersProps: OrdersCardProps;
    executionProps: ExecutionCardProps;
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