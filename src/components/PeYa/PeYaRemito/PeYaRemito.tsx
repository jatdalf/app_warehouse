import React, { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import styles from "../PeYaRemito/PeYaRemito2.module.css";

interface Producto {
  sku: string;
  ean: string;
  producto: string;
  uxb: string;
  bultos: number;
  unidades: number;
}

const destinos: Record<string, { domicilio: string; localidad: string; cp: string }> = {
  "AR_15_25deMayo": { domicilio: "25 de Mayo 1370", localidad: "Córdoba", cp: "5004" },
  "AR_14_Cordillera": { domicilio: "Cordillera 3591", localidad: "Córdoba", cp: "5009" },
  "AR_156_Crisol": { domicilio: "L de Gongora 175", localidad: "Córdoba", cp: "5001" },
};

interface RemitoProps {
  copia?: "ORIGINAL" | "DUPLICADO" | "TRIPLICADO";
}

const PeYaRemito: React.FC<RemitoProps> = () => {
  const location = useLocation();
  const data = (location.state as { data: any[] })?.data || [];

  // Agrupamos por ST
  const groupedByST = useMemo(() => {
    const groups: Record<string, any[]> = {};
    data.forEach((row) => {
      if (row.st && /^ST\d+/.test(row.st)) {
        if (!groups[row.st]) groups[row.st] = [];
        groups[row.st].push(row);
      }
    });
    return groups;
  }, [data]);

  const stKeys = Object.keys(groupedByST);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentST = stKeys[currentIndex];
  const currentRows = groupedByST[currentST] || [];

  const storeName = currentRows.length > 0 ? currentRows[0].storeName : "";
  const destino = destinos[storeName] || { domicilio: "", localidad: "", cp: "" };

  const productos: Producto[] = currentRows.map((r) => ({
    sku: r.sku,
    ean: r.ean,
    producto: r.title,
    uxb: r.uxb,
    bultos: Number(r.bultos) || 0,
    unidades: Number(r.unidades) || 0,
  }));

  const totalBultos = productos.reduce((acc, p) => acc + p.bultos, 0);
  const totalUnidades = productos.reduce((acc, p) => acc + p.unidades, 0);

  const today = new Date();
  const fechaEmision = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

  const handleNext = () => {
    if (currentIndex < stKeys.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      alert("No hay más ST disponibles.");
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      alert("Ya estás en el primer ST.");
    }
  };

  // Limitar a 25 productos por página
const maxItems = 25;
const productosConBlancos = [...productos];

// Si hay menos de 25, rellenar con filas vacías
while (productosConBlancos.length < maxItems) {
  productosConBlancos.push({
    sku: "",
    ean: "",
    producto: "",
    uxb: "",
    bultos: 0,
    unidades: 0,
  });
}

  return (
    <div className={styles.container}>
      {/* Botón imprimir arriba a la derecha */}
      <div className={styles.topActions}>
        <button className={styles.printButton} onClick={() => window.print()}>
          Imprimir
        </button>
      </div>

      {/* Encabezado */}
      <div className={styles.header}>
        <div className={styles.leftBox}>
          <p>Organización Courier Argentina S.A (OCASA)</p>
          <p>R.N.P.S.P N 731</p>
          <p>Echeverria 1262/64 - C1428DQN - Capital Federal</p>
          <p>I.V.A : RESPONSABLE INSCRIPTO</p>
        </div>
        <div className={styles.centerBox}>
          <span className={styles.bigR}>R</span>
        </div>
        <div className={styles.rightBox}>
          <p>Remito Nº: R0003-00000043</p>
          <p className={styles.barcode}>*R0003-00000043*</p>
          <p>Fecha de Emisión: {fechaEmision}</p>
          <p>C.U.I.T Nº 30-66204961-8</p>
          <p>INGRESOS BRUTOS Nº 901995900-0</p>
          <p>INICIO DE ACTIVIDADES: 01/07/1993</p>
        </div>
      </div>

      {/* Datos Cliente / Origen / Destino */}
      <div className={styles.body}>
        <div className={styles.leftSection}>
          <p>Por cuenta y orden de: DELIVERY HERO E-COMMERCE S.A.</p>
          <p>Solic: 102003550 - AP: 40044001 / 10</p>
          <p>Domicilio: JUSTO JUAN B AV. 637</p>
          <p>Código Postal: 1425</p>
          <p>Localidad: Capital Federal</p>
          <hr />

          <p>Detalles de Origen - Warehouse Ocasa Córdoba</p>
          <p>Domicilio: Avenida la voz del Interior 6051</p>
          <p>Código Postal: 5009</p>
          <p>Localidad: Córdoba</p>
          <hr />

          <p>Detalles de entrega - Pedido Nº: <strong>{currentST}</strong></p>
          <p>Destinatario: <strong>{storeName}</strong></p>
          <p>Domicilio: <strong>{destino.domicilio}</strong></p>
          <p>Localidad: <strong>{destino.localidad} &nbsp;&nbsp;</strong> CP: <strong>{destino.cp}</strong></p>
          <p>Guía Remito: <strong>{currentST}</strong></p>
          <hr />
        </div>

        <div className={styles.rightSection}>
          <p className={styles.barcodeLarge}>*{currentST}*</p>
          <p className={styles.guiaRemito}>{currentST}</p>
        </div>
      </div>

      {/* Tercera parte */}
      <div className={styles.terceraParte}>
        <hr />
        <p className={styles.leyenda}>Remitimos a UD.(es) lo siguiente</p>
        <hr />

 {/* Tabla de productos */}
<table className={styles.productosTable}>
  <thead>
    <tr>
      <th>SKU</th>
      <th>EAN</th>
      <th>Producto</th>
      <th>UxB</th>
      <th>Bultos</th>
      <th>Unidades</th>
    </tr>
  </thead>
  <tbody>
    {productosConBlancos.map((p, idx) => (
      <tr key={idx}>
        <td><strong>{p.sku}</strong></td>
        <td>{p.ean}</td>
        <td title={p.producto}>
            <span className={styles.productoTexto}>
        {p.producto}
    </span>
</td>
        <td>{p.uxb}</td>
        <td><strong>{p.bultos || ""}</strong></td>
        <td>{p.unidades || ""}</td>
      </tr>
    ))}
    <tr className={styles.totalRow}>
      <td colSpan={4}>Total</td>
      <td>{totalBultos}</td>
      <td>{totalUnidades}</td>
    </tr>
  </tbody>
</table>
      </div>

{/* Sección de firmas y recepción */}
<div className={styles.footer}>
  <div className={styles.footerTitle}>CONFORME DE RECEPCION</div>
  <div className={styles.footerContent}>
    {/* Cuadro Entrega */}
    <div className={styles.firmasBox}>
    <p className={styles.footerHeading}><strong>Entrega (Chofer)</strong></p>
    <div className={styles.footerSpacer}></div>
    <p className={styles.footerP}>Firma</p>
    <div className={styles.footerSpacer}></div>
    <p>Aclaración <span className={styles.fechaHora}>Fecha y Hora</span></p>
    </div>

    {/* Cuadro Recibe */}
    <div className={styles.footerRight}>
    <p className={styles.footerHeading}><strong>Recibe</strong></p>
    <div className={styles.footerSpacer}></div>
    <p className={styles.footerP}>Firma / Sello</p>
    <div className={styles.footerSpacer}></div>
    <p>Aclaración <span className={styles.fechaHora}>Fecha y Hora</span></p>
    </div>
  </div>

  {/* Footer final */}
  <div className={styles.footerBottom}>
    <span className={styles.footerLeft}>CAI N° 522128217779710 &nbsp;&nbsp;&nbsp; Fecha de Vto: 21.09.2026</span>
    <span className={styles.footerRightText}>Hoja N° 1 de 1</span>
  </div>
</div>



      {/* Botones de navegación */}
      <div className={styles.actionsBox}>
        <button className={styles.actionButton} onClick={handlePrev}>
          ⇐ Anterior
        </button>
        <button className={styles.actionButton} onClick={handleNext}>
          Siguiente ⇒
        </button>
      </div>
    </div>
  );
};

export default PeYaRemito;
