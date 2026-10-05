import type { Customer } from "./Customer";
import type { OcasaOffice } from "./OcasaOffice";

export type PeyaBranch = "COR" | "BUE";

export const CUSTOMER: Customer = {
    name: "DELIVERY HERO E-COMMERCE S.A.",
    adress: "JUSTO JUAN B AV. 637",
    zipCode: "1425",
    state: "Capital Federal",
    sapId: "102003550",
    sapAp: "40044001 / 10"
};

export const SOURCE_OFFICES: Record<PeyaBranch, OcasaOffice> = {
    COR: {
        office: "Warehouse Ocasa Córdoba",
        adress: "Avenida La Voz del Interior 6051",
        zipCode: "5009",
        state: "Córdoba"
    },

    BUE: {
        office: "DELIVERY HERO E-COMMERCE S.A.",
        adress: "AV JUAN B JUSTO 637 piso 5",
        zipCode: "1425",
        state: "CABA"
    }
};

