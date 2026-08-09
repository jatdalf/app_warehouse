import type { WarehouseProcess } from "../../../core/warehouse/WarehouseProcess";
import { generarSalidaInfor } from "../../../services/inforExcel";
import { buildInforFileName, buildStockFileName } from "../../../utils/dateUtils";
import type { ProcessDashboardApi } from "../../WhGeneral/Process/useProcessDashboard";
import { StockExportService } from "../../../services/stock/StockExportService";


interface Props {process: WarehouseProcess; dashboard: ProcessDashboardApi; stockSourceFile: File | null;}

export const usePeYaExportActions = ({ process, dashboard,  stockSourceFile}: Props) => {
    const handleExportInfor = async () => {
        const movimientosInfor = process.session.movimientos;
        if (movimientosInfor.length === 0) {
            dashboard.informeError(["No hay movimientos para exportar"]);
            return;
        }
        if (!stockSourceFile) {
            dashboard.informeError(["No está disponible el archivo de stock original"]);
            return;
        }
        const inforFileName = buildInforFileName();
        const stockFileName = buildStockFileName();
        try {
            await generarSalidaInfor(movimientosInfor, inforFileName);
            await StockExportService.export(stockSourceFile, process.session.stock, stockFileName);
            dashboard.informeOk([`${movimientosInfor.length} filas Infor`, inforFileName,
            "Stock actualizado", stockFileName]);
        } catch (error) {
            console.error(error);
            dashboard.informeError(["No fue posible completar la exportación"]);
        }
    };
    return {
        handleExportInfor
    };
};