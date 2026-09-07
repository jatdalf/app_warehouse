export type WarehouseInventario = | "W1" | "W2";

export type InventarioMesConfig = {
    lx22FileId: string;
    zsappr110FileId: string;
};

export interface WarehouseInventarioConfig {
    label: string;
    targetDiario: number;
    vaciasFileId: string;
    lx03FileId: string;

    zsappr110FileId?: string;
    lx22FileId?: string;
    zsappr110ArchivoFileId?: string;
    lx22ArchivoFileId?: string;

    meses: Record<string, InventarioMesConfig>;
}

export const INVENTARIO_WAREHOUSES:
    Record<WarehouseInventario, WarehouseInventarioConfig> = {
    W1: {
        label: "W1 (Rep)",
        targetDiario: 135,
        vaciasFileId: "1yOm2ivDf7rIsiM0i5-DhBJFk934Bkybr",    
        lx03FileId: "1CwoTkpCyQRsvk9QaxHciHXnRkn5U_oJY", 

    meses: {
            "2026-03": {lx22FileId: "1_RU8yWxZlen41FYXe9S4hVfVDAK22dR7", 
                        zsappr110FileId: "1SK8ozFsd9A-V5ID28LnsSnH3e5KxiDxJ"},
            "2026-04": {lx22FileId: "1gSEfmeeIMnUd03-kANtVieYJRjdRUqRw", 
                        zsappr110FileId: "1up7EaDWtjodGze9d3LsVxsbVIyAsKpCN"},
            "2026-05": {lx22FileId: "18-mA5PNamAxJcZA_q6O0_a4A6RatcTJA", 
                        zsappr110FileId: "1IDUkCR_J-wmKkpdvZ28AyULePOZGnkCg"},
            "2026-06": {lx22FileId: "1wnhRwZBc2i5chN4uBCgzG8q2LwO9GX4T", 
                        zsappr110FileId: "1dnAOPph8N2wTxIvO-WmEEa7a-R8SPrHs"},
            "2026-07": {lx22FileId: "13ZPGO4uU5HjakgGJqQJrutbtHzen3n6W", 
                        zsappr110FileId: "1JGCjoV7mSXx7Bif6XS5R-qq79i3DdjiH"},
            "2026-08": {lx22FileId: "1oMj1dJIaXlfR14W2JHvw603JQZFAxdOW", 
                        zsappr110FileId: "1Qx1gnxesoupKrLfBruZzAjZQK9E81OQg"},
            "2026-09": {lx22FileId: "1VyIYWfIcK5eJ4WRK_eQrDz-H8Ine3Hbp", 
                        zsappr110FileId: "1K_YcmQmaz1PDG6-AM5d1_PWrKdv5rTx6"}
        }
    },
    W2: {
        label: "W2 (BsAs)",
        targetDiario: 90,
        vaciasFileId: "1JCHc6aBmurA2-L0vZ0xJhkuWx-8o6R6R",
        lx03FileId: "1P-w1s_c9oBCJwWR4CRV9pt_1tJFqmsLW",

            meses: {
            "2026-03": {lx22FileId: "1Hh8h8HERFdrxuQ5PJgDm-vsxRkqiI2Ng", 
                        zsappr110FileId: "1nTJKiMA6BOJW-XrTEvz_knyvAx_JVchG"},
            "2026-04": {lx22FileId: "1uVHXsa74URN11CvLQXyom4uJq5i2-D1o", 
                        zsappr110FileId: "1M2CO3Xp-hQsX6d-BfHYtDvDPLvRS-8iC"},
            "2026-05": {lx22FileId: "1iYwkNfXIArHROYqEDccVrojlPv_8M_z1", 
                        zsappr110FileId: "1Liu0daomFym8EFEktC588ByrYsIokYfT"},
            "2026-06": {lx22FileId: "1ulDQRW_pk5oc_B6TMcbCkrkO3apOfXc0", 
                        zsappr110FileId: "1dXquAHIiGn6ocheyTNL-FD9jJQ9qlHon"},
            "2026-07": {lx22FileId: "1k7lgkNUfp64jJvJVI9vxN5f-H1uF-aMQ", 
                        zsappr110FileId: "1ccVt76-DM_h__qzW_Jh2Ks69T701r9OX"},
            "2026-08": {lx22FileId: "1X81pZh1xXVkcnqTtw4rCNSVDZKQATQgH", 
                        zsappr110FileId: "14hWWpxsssj1yp7_2p6EcWh2oaatEFdeg"},
            "2026-09": {lx22FileId: "1qPJbDF_r7c4hMihlKMoaUHbr8eaP8SEW", 
                        zsappr110FileId: "1HTVCA3mmQ1x-sEz6SRJIv4zb1-0fMui1"}
        }
    }
};
