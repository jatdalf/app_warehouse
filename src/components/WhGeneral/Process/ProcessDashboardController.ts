import type { ProcessStep, ProcessStatus } from "./ProcessStep";

export class ProcessDashboardController {
    static update(
        steps: ProcessStep[],
        id: string,
        estado: ProcessStatus,
        resumen?: string[]
    ): ProcessStep[] {
        return steps.map(step => step.id === id ? {
                ...step,
                estado,
                resumen
            }
            : step
        );
    }
    static pending(steps: ProcessStep[], id: string) {
        return this.update(steps, id, "pending");
    }

    static running(steps: ProcessStep[], id: string) {
        return this.update(steps, id, "running");
    }

    static success(steps: ProcessStep[], id: string, resumen?: string[]) {
        return this.update(steps, id, "success", resumen);
    }

    static error(steps: ProcessStep[], id: string, resumen?: string[]) {
        return this.update(
            steps,
            id,
            "error",
            resumen
        );
    }
}