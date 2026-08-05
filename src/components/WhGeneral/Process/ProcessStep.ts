import type { ReactNode } from "react";

export type ProcessStatus =
    | "pending"
    | "running"
    | "success"
    | "error";

export interface ProcessStep {
    id: string;
    titulo: string;
    estado: ProcessStatus;
    resumen?: string[];
    content?: ReactNode;
    detail?: ReactNode;
    animationKey?: number;
}