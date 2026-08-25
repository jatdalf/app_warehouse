export interface InventarioDia {
    fecha: Date;
    label: string;
    realizados: number;
    target: number;
    porReferencia: Record<string, number>;
}