import type { OrderItem } from "../../../../core/orders/OrderItem";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import styles from "./OrdersSection.module.css";

interface Props {
    orders: OrderItem[];
}

const columns: GridColDef[] = [
    {
        field: "storeName",
        headerName: "Store Name Único",
        width: 160,
        sortable: false
    },
    {
        field: "st",
        headerName: "ST",
        width: 100,
        sortable: false
    },
    {
        field: "sku",
        headerName: "SKU",
        width: 100,
        sortable: false
    },
    {
        field: "ean",
        headerName: "EAN",
        width: 120,
        sortable: false
    },
    {
        field: "title",
        headerName: "Producto",
        width: 320,
        sortable: false
    },
    {
        field: "uxb",
        headerName: "UxB",
        width: 70,
        sortable: false
    },
    {
        field: "bultos",
        headerName: "Bultos",
        width: 80,
        sortable: false
    },
    {
        field: "unidades",
        headerName: "Unidades",
        width: 90,
        sortable: false
    }
];

const OrdersDetail: React.FC<Props> = ({
    orders
}) => {

    const rows = orders.map((order, index) => ({
        id: index + 1,
        ...order
    }));

    return (
        <div className={styles.gridWrapper}>
            <DataGrid
                rows={rows}
                columns={columns}
                disableColumnMenu
                disableRowSelectionOnClick
                hideFooter
                sx={{
                    "& .MuiDataGrid-row:nth-of-type(odd)": {
                        backgroundColor: "#ffffff"
                    },
                    "& .MuiDataGrid-row:nth-of-type(even)": {
                        backgroundColor: "#e6f7ff"
                    }
                }}
            />
        </div>
    );
};

export default OrdersDetail;