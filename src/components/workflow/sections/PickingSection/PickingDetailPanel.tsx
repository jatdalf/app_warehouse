import { useMemo, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import type { PickingItem } from "../../../../core/picking/PickingItem";
import styles from "./PickingDetailPanel.module.css";

interface Props {
    picking: PickingItem[];
    onPrintPicking?: (st: string, items: PickingItem[]) => void;
}

const columns: GridColDef[] = [
    {
        field: "sku",
        headerName: "SKU",
        width: 110,
        sortable: false
    },
    {
        field: "descripcion",
        headerName: "Descripción",
        width: 300,
        sortable: false
    },
    {
        field: "ubicacion",
        headerName: "Ubicación",
        width: 130,
        sortable: false
    },
    {
        field: "bultos",
        headerName: "Bultos",
        width: 90,
        sortable: false
    }
];

const PickingDetailPanel: React.FC<Props> = ({picking, onPrintPicking}) => {
    const groupedByST = useMemo(() => {
        const groups: Record<string, PickingItem[]> = {};
        picking.forEach(item => {
            if (!groups[item.st]) {
                groups[item.st] = [];
            }
            groups[item.st].push(item);
        });

        return groups;
    }, [picking]);
    const stKeys = Object.keys(groupedByST);
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentST = stKeys[currentIndex];
    const currentRows = currentST ? groupedByST[currentST] ?? [] : [];
    const destino = currentRows[0]?.destino ?? "";
    const rows = currentRows.map(
        (item, index) => ({
            id: index + 1,
            ...item
        })
    );
    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };
    const handleNext = () => {
        if (currentIndex < stKeys.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };
    return (
        <div className={styles.container}>
        <div className={styles.topSection}>
            <h2 className={styles.title}>
                Picking
            </h2>
            {currentST && (
            <div className={styles.orderInfo}>
                <div className={styles.order}>
                    Pedido:{" "}
                    <strong>{currentST}</strong>
                </div>
                <div className={styles.counter}>
                    <em>
                        ({currentIndex + 1} de {stKeys.length})
                    </em>
                </div>
                <div className={styles.destination}>
                    Destino:{" "}
                    <strong>{destino}</strong>
                </div>
            </div>
            )}
            <div className={styles.navigation}>
                <button
                    className={styles.actionButton}
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                >
                    ⇐ Anterior
                </button>
              
                <button
                    className={styles.actionButton}
                    onClick={handleNext}
                    disabled={currentIndex >= stKeys.length - 1}
                >
                    Siguiente ⇒
                </button>

                  <button
                    type="button"
                    className={styles.actionButton}
                    disabled={!currentST || currentRows.length === 0}
                    onClick={() => {if (currentST) {onPrintPicking?.(currentST, currentRows);}}}
                    >
                    🖨️ Imprimir Picking
                </button>
            </div> 
        </div>
            <div className={styles.grid}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    disableColumnMenu
                    disableRowSelectionOnClick
                    hideFooter
                    autoHeight
                    columnHeaderHeight={40}
                    sx={{
                        "& .MuiDataGrid-row:nth-of-type(odd)": {
                            backgroundColor: "#ffffff"
                        },
                        "& .MuiDataGrid-row:nth-of-type(even)": {
                            backgroundColor: "#e6f7ff"
                        },
                        "& .MuiDataGrid-columnHeaders": {
                            backgroundColor: "#2b8179",
                            fontWeight: "bold"
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default PickingDetailPanel;