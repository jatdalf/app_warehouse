import type { PickingItem } from "../../../../core/picking/PickingItem";
import type { StockShortage } from "../../../../core/stock/StockShortage";
import type { PickingStats } from "../../../../core/picking/PickingStats";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import styles from "./PickingSection.module.css"

interface Props {
    picking: PickingItem[];
    shortages: StockShortage[];
    stats?: PickingStats;
}

const columns: GridColDef[] = [
    {
        field: "st",
        headerName: "ST",
        width: 110
    },
    {
        field: "sku",
        headerName: "SKU",
        width: 120
    },
    {
        field: "descripcion",
        headerName: "Descripción",
        flex: 1
    },
    {
        field: "cantidad",
        headerName: "Cant.",
        width: 90
    },
    {
        field: "ubicacion",
        headerName: "Ubicación",
        width: 120
    }
];


const PickingSection: React.FC<Props> = ({
    picking,
    shortages,
    stats
}) => {    
    const gridRows = picking.map((item,index)=>({
        id:index+1,
        ...item
    }));
    return (
        <fieldset>
            <legend>4. Picking</legend>
            <p>Pedidos: {stats?.pedidos ?? 0}</p>
            <p>Líneas: {stats?.lineas ?? 0}</p>
            <p>Bultos: {stats?.bultosAsignados ?? 0}</p>
            <p>Faltantes: {shortages.length}</p>
            <div className={styles.gridWrapper}>
                <DataGrid
                    rows={gridRows}
                    columns={columns}
                    hideFooter
                    disableColumnMenu
                    disableRowSelectionOnClick
                    sx={{
                        "& .MuiDataGrid-row:nth-of-type(odd)": {
                        backgroundColor: "#ffffff",
                        },
                        "& .MuiDataGrid-row:nth-of-type(even)": {
                        backgroundColor: "#e6f7ff",
                        },
                    }}
                />
            </div>
            {shortages.length>0 && (
                <fieldset>
                    <legend>Faltantes</legend>
                    <DataGrid
                        rows={gridRows}
                        columns={columns}
                        hideFooter
                        disableColumnMenu
                        disableRowSelectionOnClick
                        sx={{
                            "& .MuiDataGrid-row:nth-of-type(odd)": {
                            backgroundColor: "#ffffff",
                            },
                            "& .MuiDataGrid-row:nth-of-type(even)": {
                            backgroundColor: "#e6f7ff",
                        },
                    }}
                    />
                </fieldset>
            )}            
        </fieldset>
    );
};

export default PickingSection;