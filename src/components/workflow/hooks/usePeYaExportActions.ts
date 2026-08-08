import type { WarehouseProcess } from "../../../core/warehouse/WarehouseProcess";
import { generarSalidaInfor } from "../../../services/inforExcel";
import { buildInforFileName } from "../../../utils/dateUtils";
import type { ProcessDashboardApi } from "../../WhGeneral/Process/useProcessDashboard";

interface Props {process: WarehouseProcess; dashboard: ProcessDashboardApi;}

export const usePeYaExportActions = ({ process, dashboard}: Props) => {
    const handleExportInfor = async () => {
        const movimientosInfor = process.session.movimientos;
        if (movimientosInfor.length === 0) {
            dashboard.informeError([
                "No hay movimientos para exportar"
            ]);
            return;
        }
        const fileName = buildInforFileName();
        try {
            await generarSalidaInfor(movimientosInfor, fileName);
            dashboard.informeOk([`${movimientosInfor.length} filas`, fileName]);
        } catch (error) {
            console.error(error);
            dashboard.informeError(["No fue posible generar el archivo"]);
        }
    };

    return {
        handleExportInfor
    };
};