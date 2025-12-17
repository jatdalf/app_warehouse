import { useMemo, useState } from "react";
import styles from "./LectorPosicion.module.css";

interface LectorPosicionProps {
  tipo: "DESDE" | "HACIA";
  lx03Data: any[];
  ywm005Data: any[];
  disabled?: boolean;
  tipoAlmacenDesde?: string; // SOLO PARA HACIA
  onSelect: (data: {
    ubicacion: string;
    material: string;
    lote: string;
    cantidad: number;
    descripcion: string;
    tipoAlmacen?: string;
  }) => void;
}

/* ======================
   HELPERS
====================== */

const norm = (v: any) =>
  String(v ?? "").trim().toUpperCase();

const parseCantidad = (v: any): number =>
  Number(
    String(v ?? "0")
      .replace(/\./g, "")
      .replace(",", ".")
  );

/* ======================
   COMPONENTE
====================== */

const LectorPosicion: React.FC<LectorPosicionProps> = ({
  tipo,
  lx03Data,
  ywm005Data,
  disabled = false,
  tipoAlmacenDesde,
  onSelect,
}) => {
  const [ubicacion, setUbicacion] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [material, setMaterial] = useState("");
  const [lote, setLote] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [cantidadMax, setCantidadMax] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState<number | "">("");

  /* ======================
     RESET
  ====================== */
  const resetDatos = () => {
    setMaterial("");
    setLote("");
    setDescripcion("");
    setCantidadMax(null);
    setCantidad("");
  };

  /* ======================
     SUGERENCIAS HACIA
  ====================== */
  const sugerenciasHacia = useMemo(() => {
    if (tipo !== "HACIA" || !tipoAlmacenDesde) return [];

    return lx03Data
      .filter((row) => {
        const ubic = norm(row[2]);
        const material = String(row[7] ?? "").trim();
        const stock = parseCantidad(row[10]);
        const tipoAlmacen = row[1];

        return (
          ubic &&
          tipoAlmacen === tipoAlmacenDesde &&
          (!material || stock <= 0)
        );
      })
      .sort((a, b) =>
        norm(a[2]).localeCompare(norm(b[2]))
      );
  }, [lx03Data, tipo, tipoAlmacenDesde]);

  /* ======================
     PROCESAR
  ====================== */
  const procesarUbicacion = () => {
    if (disabled) return;

    setError(null);
    resetDatos();

    const filaLX03 = lx03Data.find(
      (row) => norm(row[2]) === norm(ubicacion)
    );

    if (!filaLX03) {
      setError("Ubicación no encontrada");
      return;
    }

    const tipoAlmacen = filaLX03[1];
    const materialLX03 = String(filaLX03[7] ?? "").trim();
    const loteLX03 = String(filaLX03[8] ?? "").trim();
    const stock = parseCantidad(filaLX03[10]);

    /* ======================
       VALIDACIONES HACIA
    ====================== */
    if (tipo === "HACIA") {
      if (
        tipoAlmacenDesde &&
        tipoAlmacen !== tipoAlmacenDesde
      ) {
        const ok = window.confirm(
          "El tipo de almacén de destino no coincide con el de origen. ¿Desea continuar?"
        );
        if (!ok) return;
      }

      if (stock > 0) {
        const ok = window.confirm(
          "La ubicación destino no está vacía. ¿Desea continuar?"
        );
        if (!ok) return;
      }
    }

    /* ======================
       VALIDACIONES DESDE
    ====================== */
    if (tipo === "DESDE") {
      if (
        !materialLX03 ||
        materialLX03.includes("<<") ||
        !loteLX03 ||
        stock <= 0
      ) {
        setError("Ubicación sin stock disponible");
        return;
      }
    }

    const filaYWM = ywm005Data.find(
      (row) => norm(row[1]) === norm(loteLX03)
    );

    const desc = filaYWM
      ? String(filaYWM[2] ?? "").trim()
      : "Sin descripción";

    setMaterial(materialLX03);
    setLote(loteLX03);
    setDescripcion(desc);
    setCantidadMax(stock);
    setCantidad(stock);

    onSelect({
      ubicacion,
      material: materialLX03,
      lote: loteLX03,
      cantidad: stock,
      descripcion: desc,
      tipoAlmacen,
    });
  };

  /* ======================
     CANTIDAD
  ====================== */
  const handleCantidadChange = (value: string) => {
    if (value === "") {
      setCantidad("");
      return;
    }

    const num = Number(value);
    if (isNaN(num)) return;
    if (num < 1) return;
    if (cantidadMax !== null && num > cantidadMax) return;

    setCantidad(num);
  };

  /* ======================
     RENDER
  ====================== */
  return (
    <div className={styles.box}>
      <h4>
        {tipo === "DESDE"
          ? "Trasladar desde"
          : "Trasladar hacia"}
      </h4>

      <input
        list={tipo === "HACIA" ? "ubicaciones-hacia" : undefined}
        className={styles.input}
        disabled={disabled}
        placeholder={
          disabled
            ? "Confirmá ubicación DESDE"
            : "Ingresar ubicación"
        }
        value={ubicacion}
        onChange={(e) => {
          setUbicacion(e.target.value);
          setError(null);
          resetDatos();
        }}
        onKeyDown={(e) =>
          e.key === "Enter" && procesarUbicacion()
        }
      />

      {tipo === "HACIA" && (
        <datalist id="ubicaciones-hacia">
          {sugerenciasHacia.map((row) => (
            <option key={row[2]} value={row[2]} />
          ))}
        </datalist>
      )}

      <button
        className={styles.confirmBtn}
        disabled={disabled}
        onClick={procesarUbicacion}
      >
        Confirmar
      </button>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.detalle}>
        {cantidadMax !== null && (
          <>
            <p><strong>Material:</strong> {material}</p>
            <p><strong>Descripción:</strong> {descripcion}</p>
            <p><strong>Lote:</strong> {lote}</p>

            {tipo === "DESDE" && (
              <div className={styles.cantidadRow}>
                <label>Cantidad a trasladar</label>
                <input
                  type="number"
                  min={1}
                  max={cantidadMax}
                  value={cantidad}
                  onChange={(e) =>
                    handleCantidadChange(e.target.value)
                  }
                  className={styles.qtyInput}
                />
                <small>Máx: {cantidadMax}</small>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LectorPosicion;
