export interface PeYaInventarioMesConfig {
    inventariosFileId: string | null;
    inforFileId: string | null;
}

export const PEYA_INVENTARIOS_MESES: Record<string, PeYaInventarioMesConfig> = {
    "2026-06": {
        inventariosFileId: null,
        inforFileId: null
    },
    "2026-07": {
        inventariosFileId: "1ehZ88CW4CNX5jrIVjIdXiZBsEmvGYgYu",
        inforFileId: "1klI0zuRh_GtHhOJ-QYRrfQRoZLfc55WB"
    },
    "2026-08": {
        inventariosFileId: "1PCl7eRCWj6LATTYO1LjfsN96pjnvevI-",
        inforFileId: "14udo22UPB1T3ZXp42ES5UDkNOkjDVPOR"
    },
    "2026-09": {
        inventariosFileId: "1gMrQumZ78iHFULlbagGmOgpRPktRHFm9",        
        inforFileId: "1OAAUmwDzpAyao5ZU-YAJF7jMHxnMk0tL"
    }
};

export const PEYA_LOCATIONS_FILE_ID = "1rm1Yq2qx3A7TrY6eXBI2LV-4F9NJVIGr";