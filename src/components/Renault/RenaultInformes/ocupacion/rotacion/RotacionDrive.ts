export interface MesDrive {
    mes: string;
    ltak: string;
    ltap: string;
}

export const historialDrive: Record<"W1" | "W2", MesDrive[]> = {
    W1: [
        { mes: "2026-03", ltak: "1XFEGML_aeY4Q0KN4DHzvptx3QEDdovc-", ltap: "1dU4QXe5DSQCdQ1T9uDtnsQ55mA4_LHf2" },
        { mes: "2026-04", ltak: "1xj7hKjD88ER9S_OolJRpD5jA4GcV1ZHm", ltap: "1mKLTy0QWPcFts7PyzuaX_wyW9nJsD7GZ" },
        { mes: "2026-05", ltak: "1xw5KG0u0mZPuH0Jwb5wypz4ctOEbwhny", ltap: "1vYb2MgFLB7g2Pgdq_Um9jeuicoSt6Otw" },
        { mes: "2026-06", ltak: "1ToIKFOeZfaUbNsMKscvbNpXeRdw1ADWD", ltap: "1ymCBWwIjR3WHhtPeotnR9SHam14ccSkH" },
        { mes: "2026-07", ltak: "1lsmMBN40KxF4X-JKfpKZRghnbD7gBIZL", ltap: "1V4BlG1Er7fvpqS-rzqzr7q04SoIfBtSg" },
        { mes: "2026-08", ltak: "16VLUC9jSvYa_1upRp0QYMjPPBIWPnsiA", ltap: "13J5MERBj6dudo8ySuLMMcmYPqIPmWBQ0" },
        { mes: "2026-09", ltak: "1wB9oZF1XAW3wCYDr1b__rGHXuSbYaX7E", ltap: "1L2p0-NSXzzFMQa7YoOvuyASLO5b8rtgJ" },
        { mes: "2026-10", ltak: "17HwSsVTp8wGYlN46vDIFyL3pUfb0O-Tn", ltap: "1Dxaz6JkCp2QOBp5H1qE45V3Iv40z2Pbr" },
    ],
    W2: [
        { mes: "2026-03", ltak: "1CKxQkvTcfClL18upH1BZWIbTcT-TqY-e", ltap: "14qxHxUHgQrOkxf2JLet_xx7PYOePWdqR" },
        { mes: "2026-04", ltak: "1E_WYqSnqeN4-_JAMGmBp0CKN5EXxjnaX", ltap: "1I2KKZlKcuLoi780G_BseppA9UaDljP4l" },
        { mes: "2026-05", ltak: "1T-RLQAHqmonpeMr0haV0Rgn7n4WJx4FO", ltap: "1GQzf1rJFEAvScl-HCQ2iAhgJ8VL6JAEm" },
        { mes: "2026-06", ltak: "1S6nxTy194Xb8Xr281ZCc7Lq6nQG6tTcs", ltap: "1RGGvrEE6EksM_EKSWNuH5CTF992OmP5O" },
        { mes: "2026-07", ltak: "1K61AydK1Zo0QtQTXBt1gHAMJiLuf0tg1", ltap: "1BYA8GYOKxSWPsOrAAlT2sLura39U0sHU" },
        { mes: "2026-08", ltak: "11J1xJlCYxxx1l1KGJTMoEEzcMaYCA0WE", ltap: "10nEOHZtR9A7_Ec7h1GBy5tf_E7c_t1Gb" },
        { mes: "2026-09", ltak: "1bEmQQzrcEkuVjz7d7KZycZCJfrb_1Gc_", ltap: "19ODrlXPaXnVZ-7wXUjqz3hlcdgwuhMqD" },
        { mes: "2026-10", ltak: "1B0zI1DtcKnFbcxov9P80SblIXiL0EQuY", ltap: "1stud14HqEYV-SvFMnI9zIZ6Gu--yiYOZ" },
    ],
};

export async function descargarExtracto(fileId: string, nombre: string): Promise<File> {
    try {
        const response = await fetch("/api/drive-file", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileId }),
        });
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (!data.success || typeof data.base64 !== "string" || !data.base64) throw new Error();
        return new File([Uint8Array.from(atob(data.base64), c => c.charCodeAt(0))], nombre);
    } catch {
        throw new Error("No se pudo descargar " + nombre + ". Revisá el acceso de la app al archivo en Drive.");
    }
}
