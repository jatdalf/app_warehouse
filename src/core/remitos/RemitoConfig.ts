import type { Customer } from "./Customer";
import type { OcasaOffice } from "./OcasaOffice";
import type { Destino } from "./Destino";

export const CUSTOMER: Customer = {
    name: "DELIVERY HERO E-COMMERCE S.A.",
    adress: "JUSTO JUAN B AV. 637",
    zipCode: "1425",
    state: "Capital Federal",
    sapId: "102003550",
    sapAp: "40044001 / 10"
};

export const SOURCE_OFFICE: OcasaOffice = {
    office: "Warehouse Ocasa Córdoba",
    adress: "Avenida La Voz del Interior 6051",
    zipCode: "5009",
    state: "Córdoba"
};

export const DESTINOS: Record<string, Destino> = {
    AR_15_25deMayo: {
        domicilio: "25 de Mayo 1370",
        localidad: "Córdoba",
        cp: "5004"
    },

    AR_14_Cordillera: {
        domicilio: "Cordillera 3591",
        localidad: "Córdoba",
        cp: "5009"
    },

    AR_156_Crisol: {
        domicilio: "L. de Góngora 175",
        localidad: "Córdoba",
        cp: "5001"
    },

    AR_Ocasa: {
        domicilio: "Av. La Voz del Interior 6051",
        localidad: "Córdoba",
        cp: "5009"
    }
};