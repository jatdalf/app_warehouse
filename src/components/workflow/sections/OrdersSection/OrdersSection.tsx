import type { OrderItem } from "../../../../core/orders/OrderItem";
import styles from "./OrdersSection.module.css"
import React, { useState, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

const columns: GridColDef[] = [
  { field: "storeName", headerName: "Store Name Único", width: 150, sortable: false },
  { field: "st", headerName: "ST", width: 90, sortable: false },
  { field: "sku", headerName: "SKU", width: 90, sortable: false },
  { field: "ean", headerName: "EAN", width: 90, sortable: false },
  { field: "title", headerName: "Title", width: 300, sortable: false },
  { field: "uxb", headerName: "UxB", width: 30, sortable: false },
  { field: "bultos", headerName: "Bultos", width: 60, sortable: false },
  { field: "unidades", headerName: "Unidades", width: 80, sortable: false },
];

export interface OrdersInfo {
    pedidos: number;
    lineas: number;
    sku: number;
    bultos: number;
    loaded: boolean;
    fileName: string;
}

interface Props {
    onLoaded: (orders: OrderItem[]) => void;
}

const OrdersSection: React.FC<Props> = ({ onLoaded }) => {
    console.log(onLoaded)
    // const [info, setInfo] = useState<OrdersInfo>({
    //     pedidos: 0,
    //     lineas: 0,
    //     sku: 0,
    //     bultos: 0,
    //     loaded: false,
    //     fileName: ""
    // });

    // const [dragOver, setDragOver] = useState(false);

    // const processFile = async (file: File) => {
    //     setInfo({
    //         fileName: file.name,
    //         pedidos: 18,
    //         lineas: 224,
    //         sku: 147,
    //         bultos: 862,
    //         loaded: true
    //     });
    //     onLoaded([]);
    // };
   
    // paste
      const [rows, setRows] = useState<any[]>([]);   

        const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
            event.preventDefault();
            const text = event.clipboardData.getData("text/plain");
            const lines = text.split("\n").filter((line) => line.trim() !== "");
            const newRows = lines.map((line, index) => {
            const cells = line.split("\t");
            return {
                id: rows.length + index + 1,
                storeName: cells[0] || "",
                st: cells[1] || "",
                sku: cells[2] || "",
                ean: cells[3] || "",
                title: cells[4] || "",
                uxb: cells[5] || "",
                bultos: cells[6] || "",
                unidades: cells[7] || "",
            };
            });
            setRows([...rows, ...newRows]);
        };

      // ✅ Cálculos de métricas
      const metrics = useMemo(() => {
        const stValues = rows.map((r) => r.st).filter((st) => st && /^ST\d+/.test(st));
        const pedidos = new Set(stValues).size;
    
        const lineas = rows.filter(
          (r) => r.storeName.startsWith("AR") && /^ST\d+/.test(r.st)
        ).length;
    
        const skuValues = rows.map((r) => r.sku).filter((sku) => sku && sku !== "SKU");
        const skus = new Set(skuValues).size;
    
        const bultos = rows.reduce((acc, r) => {
          if (
            r.storeName &&
            !r.storeName.toLowerCase().startsWith("total") &&
            r.bultos &&
            !isNaN(Number(r.bultos))
          ) {
            return acc + Number(r.bultos);
          }
          return acc;
        }, 0);
        return { pedidos, lineas, skus, bultos };
      }, [rows]);

    return (
        <fieldset>
            <legend>2. Pedidos</legend>
            
            {/* Fieldset con DataGrid */}
            <div className={styles.fieldsetContainerSmall}>
                <fieldset className={styles.fieldsetPeya}>
                    <legend>Pegue los datos del pedido aquí</legend>

                    {/* Métricas arriba del grid */}
                    <div className={styles.metricsBox}>
                        <div className={styles.metricItem}>
                        Cantidad de pedidos: <strong>{metrics.pedidos}</strong>
                        </div>
                        <div className={styles.metricItem}>
                        Cantidad de líneas: <strong>{metrics.lineas}</strong>
                        </div>
                        <div className={styles.metricItem}>
                        Cantidad de SKU: <strong>{metrics.skus}</strong>
                        </div>
                        <div className={styles.metricItem}>
                        Cantidad de bultos: <strong>{metrics.bultos}</strong>
                        </div>
                    </div>

                    <div className={styles.gridWrapper} tabIndex={0} onPaste={handlePaste} >
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            disableColumnMenu
                            disableRowSelectionOnClick
                            hideFooter           // ✅ quita el footer de paginación
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
                </fieldset>
            </div>
        </fieldset>
    );
};

export default OrdersSection;

