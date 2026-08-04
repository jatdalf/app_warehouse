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

const regexST = /^ST[A-Z0-9]\d+$/;

const OrdersSection: React.FC<Props> = ({ onLoaded }) => {
    const [info, setInfo] = useState<OrdersInfo>({
        pedidos: 0,
        lineas: 0,
        sku: 0,
        bultos: 0,
        loaded: false,
        fileName: ""
    });
    console.log(info)

    const processFile = async (file: File) => {
        setInfo({
            fileName: file.name,
            pedidos: 18,
            lineas: 224,
            sku: 147,
            bultos: 862,
            loaded: true
        });
        onLoaded([]);
    };
    console.log(processFile)
   
    // paste
    const [rows, setRows] = useState<OrderItem[]>([]);

    const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
        event.preventDefault();
        const text = event.clipboardData.getData("text/plain");
        const lines = text .split("\n") .filter(line => line.trim() !== "");
        const parsedRows = lines.map((line) => {
            const cells = line.split("\t");
            const storeName = cells[0]?.trim() ?? "";
            const st = cells[1]?.trim() ?? "";
            // Ignorar filas que no son pedidos
            if (
                !storeName.startsWith("AR") ||
                !regexST.test(st)
            ) {
                return null;
            }

            return {
                storeName,
                st,
                sku: cells[2]?.trim() ?? "",
                ean: cells[3]?.trim() ?? "",
                title: cells[4]?.trim() ?? "",
                uxb: cells[5]?.trim() ?? "",
                bultos: parseInt(cells[6] ?? "0", 10) || 0,
                unidades: parseInt(cells[7] ?? "0", 10) || 0
            };
        });

        const newRows: OrderItem[] =
            parsedRows.filter(
                (row): row is OrderItem => row !== null
            );
        const updatedRows = [
            ...rows,
            ...newRows
        ];
        setRows(updatedRows);
        onLoaded(updatedRows);
    };

    // ✅ Cálculos de métricas
    const metrics = useMemo(() => {
        const pedidos =new Set(rows.map(r => r.st)).size;
        const lineas = rows.length; 
        const skus = new Set(rows.map(r => r.sku)).size;
        const bultos = rows.reduce((acc, row) => acc + row.bultos,0);
        return {
            pedidos,
            lineas,
            skus,
            bultos
        };
    }, [rows]);

    const gridRows = rows.map((row, index) => ({
        id: index + 1,
        ...row
    }));

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
                            rows={gridRows}
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

