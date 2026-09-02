export type WarehouseInventario = | "W1" | "W2";

export interface WarehouseInventarioConfig {
    label: string;
    zsappr110FileId: string;
    lx22FileId: string;
    targetDiario: number;
    vaciasFileId: string;
    zsappr110ArchivoFileId?: string;
    lx22ArchivoFileId?: string;
}

export const INVENTARIO_WAREHOUSES:
    Record<WarehouseInventario, WarehouseInventarioConfig> = {
    W1: {
        label: "W1 (Rep)",
        zsappr110ArchivoFileId: "1T--ri22E_ffOtTcYs-7_LGOvi3uHffnm",
        lx22ArchivoFileId: "1g8Fyn6tVA_04NsvPQcHAE0z57tlyERRd",
        zsappr110FileId: "1K_YcmQmaz1PDG6-AM5d1_PWrKdv5rTx6",
        lx22FileId: "1VyIYWfIcK5eJ4WRK_eQrDz-H8Ine3Hbp",
        targetDiario: 135,
        vaciasFileId: "1yOm2ivDf7rIsiM0i5-DhBJFk934Bkybr"     
    },
    W2: {
        label: "W2 (BsAs)",
        zsappr110FileId: "1HTVCA3mmQ1x-sEz6SRJIv4zb1-0fMui1",
        lx22FileId: "1qPJbDF_r7c4hMihlKMoaUHbr8eaP8SEW",
        targetDiario: 90,
        vaciasFileId: "1JCHc6aBmurA2-L0vZ0xJhkuWx-8o6R6R",
        zsappr110ArchivoFileId: "1eqBO3KEIbRQRvYn314oHh7ixHAzvYJer",
        lx22ArchivoFileId: "1v8qFga7KwElgZfgE3FzRKFpS6x0wl9Jt",
    }
};
