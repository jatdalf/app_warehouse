import { useState } from "react";
import type { ProcessStep } from "./ProcessStep";
import { ProcessDashboardController } from "./ProcessDashboardController";
import type { ReactNode } from "react";

const INITIAL_STEPS: ProcessStep[] = [
    {
        id: "stock",
        titulo: "Stock",
        estado: "pending"
    },
    {
        id: "pedidos",
        titulo: "Pedidos",
        estado: "pending"
    },
    {
        id: "proceso",
        titulo: "Proceso",
        estado: "pending"
    },
    {
        id: "picking",
        titulo: "Picking",
        estado: "pending"
    },
    {
        id: "remito",
        titulo: "Remito",
        estado: "pending"
    },
    {
        id: "informe",
        titulo: "Informe",
        estado: "pending"
    }
];

export const useProcessDashboard = () => {
    const [steps, setSteps] =
        useState(INITIAL_STEPS);
    return {
        steps,
        stockOk(resumen?: string[]) {
            setSteps(prev =>
                prev.map(step => step.id === "stock" ? {
                        ...step,
                        estado: "success",
                        resumen,
                        animationKey:
                            (step.animationKey ?? 0) + 1
                    }
                    : step
                )
            );
        },
        stockError(resumen?: string[]) {
            setSteps(prev =>
                prev.map(step =>
                    step.id === "stock"
                        ? {
                            ...step,
                            estado: "error",
                            resumen
                        }
                        : step
                )
            );
        },
        pedidosOk(
            resumen?: string[],
            detail?: ReactNode
        ) {
            setSteps(prev =>
                prev.map(step =>
                    step.id === "pedidos"
                        ? {
                            ...step,
                            estado: "success",
                            resumen,
                            detail,
                            animationKey:
                                (step.animationKey ?? 0) + 1
                        }
                        : step
                )
            );
        },
        pedidosError(resumen?: string[]) {
            setSteps(prev =>
                prev.map(step =>
                    step.id === "pedidos"
                        ? {
                            ...step,
                            estado: "error",
                            resumen
                        }
                        : step
                )
            );
        },
        procesoRunning() {
            setSteps(prev => ProcessDashboardController.running(
                    prev,
                    "proceso"
                )
            );
        },

        procesoOk(resumen?: string[]) {
            setSteps(prev => ProcessDashboardController.success(
                    prev,
                    "proceso",
                    resumen
                )
            );
        },

        pickingOk(resumen?: string[],detail?: ReactNode) {
            setSteps(prev => prev.map(step => step.id === "picking" ? {
                            ...step,
                            estado: "success",
                            resumen,
                            detail
                        }
                        : step
                )
            );
        },
        remitoOk(resumen?: string[], detail?: ReactNode) {
            setSteps(prev => prev.map(step => step.id === "remito" ? {
                            ...step,
                            estado: "success",
                            resumen,
                            detail
                        }
                        : step
                )
            );
        },
        stockContent(content: ReactNode) {
            setSteps(prev => prev.map(step => step.id === "stock" ? {
                        ...step,
                        content
                    }
                    : step
                )
            );
        }
    };
};