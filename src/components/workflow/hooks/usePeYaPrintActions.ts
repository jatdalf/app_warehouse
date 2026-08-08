import type { OrderItem } from "../../../core/orders/OrderItem";
import type { PickingItem } from "../../../core/picking/PickingItem";
import type { Remito } from "../../../core/remitos/Remito";
import type { WarehouseProcess } from "../../../core/warehouse/WarehouseProcess";
import { WarehouseSession } from "../../../core/warehouse/WarehouseSession";
import { PickingPrintEngine } from "../../../core/engines/PickingPrintEngine";
import { PickingSummaryBuilder } from "../../../core/picking/PickingSummaryBuilder";
import { RemitoSummaryBuilder } from "../../../core/remitos/RemitoSummaryBuilder";

interface Props {
    process: WarehouseProcess;
    orders: OrderItem[];
    dashboard: ReturnType<typeof import("../../WhGeneral/Process/useProcessDashboard").useProcessDashboard>;
}

export const usePeYaPrintActions = ({process, orders, dashboard}: Props) => {
    const buildRemitoPrintData = () => {
        const agrupado = new Map<string, {
            st: string;
            sku: string;
            ean: string;
            title: string;
            uxb: string;
            bultos: number;
            unidades: number;
            storeName: string;
        }>();

        for (const item of process.session.picking) {
            const key = `${item.st}|${item.sku}`;

            const pedidoOriginal = orders.find(pedido =>
                    pedido.st === item.st &&
                    pedido.sku === item.sku
            );

            const uxb = Number(pedidoOriginal?.uxb) || 0;

            const existente = agrupado.get(key);

            if (existente) {
                existente.bultos += item.bultos;
                existente.unidades += item.bultos * uxb;
                continue;
            }

            agrupado.set(key, {
                st: item.st,
                sku: item.sku,
                ean: pedidoOriginal?.ean ?? "",
                title: pedidoOriginal?.title ?? item.descripcion ?? "",
                uxb: String(pedidoOriginal?.uxb ?? ""),
                bultos: item.bultos,
                unidades: item.bultos * uxb,
                storeName: item.destino
            });
        }

        return [...agrupado.values()];
    };

    const handlePrintPicking = async () => {
        const engine = new PickingPrintEngine();
        const result = await engine.execute(process.session);
        if (!result.success) {
            return;
        }

        const resumen = PickingSummaryBuilder.build( process.session.picking);

        dashboard.pickingOk([
            `${resumen.sku} SKU`,
            `${resumen.lineas} líneas`,
            `${resumen.bultos} bultos`
        ]);
    };

    const handlePrintPickingST = async (st: string, items: PickingItem[]) => {
        const tempSession = new WarehouseSession();
        tempSession.picking = [...items];
        const engine = new PickingPrintEngine();
        const result = await engine.execute(tempSession);
        if (!result.success) {
            console.error(
                `No fue posible imprimir el picking ${st}`
            );
        }
    };

    const handlePrintRemitos = () => {
        const remitosParaVista = process.session.remitos.map(remito => ({
                st: remito.pedido,
                remito: remito.numero
            }));

        const printData = {
            data: buildRemitoPrintData(),
            remitos: remitosParaVista
        };

        sessionStorage.setItem(
            "peya-remito-print-data",
            JSON.stringify(printData)
        );

        window.open(
            "/PeYaRemito",
            "_blank"
        );

        const resumen =
            RemitoSummaryBuilder.build(process.session.remitos);

        dashboard.remitoOk([
            `${resumen.documentos} documentos`,
            `${resumen.destinos} destinos`,
            `${resumen.bultos} bultos`
        ]);
    };

    const handlePrintSingleRemito = (remito: Remito) => {
        const dataRemito = buildRemitoPrintData().filter(item => item.st === remito.pedido);
        sessionStorage.setItem(
            "peya-remito-print-data",
            JSON.stringify({
                data: dataRemito,
                remitos: [{
                    st: remito.pedido,
                    remito: remito.numero
                }]
            })
        );
        window.open("/PeYaRemito", "_blank");
    };

    return {
        handlePrintPicking,
        handlePrintPickingST,
        handlePrintRemitos,
        handlePrintSingleRemito
    };
};