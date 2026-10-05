import * as XLSX from "xlsx";
import type { Destino } from "../../core/remitos/Destino";

const PEYA_DESTINOS_FILE_ID =
  "1NwnwqTM4XiN0xpXv-b0Of84IUHk7Tnm3";

const SHEET_NAME = "Codificación";

interface DestinoRow {
  Destinatario?: string;
  DIRECCION?: string;
  Localidad?: string;
  CP?: string | number;
}

let destinosCache: Record<string, Destino> | null = null;

export const loadPeyaDestinos = async (): Promise<
  Record<string, Destino>
> => {
  if (destinosCache) {
    return destinosCache;
  }

  const response = await fetch("/api/drive-file", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileId: PEYA_DESTINOS_FILE_ID,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Error al descargar destinos PeYa: ${response.status}`
    );
  }

  const result = await response.json();

  if (!result.success || !result.base64) {
    throw new Error(
      "No se pudo obtener la base de destinos PeYa."
    );
  }

  const binaryString = atob(result.base64);

  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const workbook = XLSX.read(bytes, {
    type: "array",
  });

  const worksheet = workbook.Sheets[SHEET_NAME];

  if (!worksheet) {
    throw new Error(
      `No existe la hoja "${SHEET_NAME}" en la base PeYa.`
    );
  }

  const rows = XLSX.utils.sheet_to_json<DestinoRow>(
    worksheet,
    {
      defval: "",
    }
  );

  const destinos: Record<string, Destino> = {};

  for (const row of rows) {
    const destinatario = String(
      row.Destinatario ?? ""
    ).trim();

    if (!destinatario) {
      continue;
    }

    destinos[destinatario] = {
      domicilio: String(
        row.DIRECCION ?? ""
      ).trim(),

      localidad: String(
        row.Localidad ?? ""
      ).trim(),

      cp: String(
        row.CP ?? ""
      ).trim(),
    };
  }
  destinos.AR_OCASA_COR = {
  domicilio: "Avenida La Voz del Interior 6051",
  localidad: "Córdoba",
  cp: "5009",
};

destinos.AR_OCASA_BUE = {
  domicilio: "AV JUAN B JUSTO 637 piso 5",
  localidad: "CABA",
  cp: "1425",
};

  destinosCache = destinos;

  return destinos;
};