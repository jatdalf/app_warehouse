import React from "react";
import { useLocation } from "react-router-dom";
import styles from "../PeYaRemito/PeYaRemito.module.css";

interface Producto {
  sku: string;
  ean: string;
  producto: string;
  uxb: string;
  bultos: number;
  unidades: number;
}

const destinos: Record<string, { domicilio: string; localidad: string; cp: string }> = {
  "AR_15_25deMayo": {
    domicilio: "25 de Mayo 1370",
    localidad: "Córdoba",
    cp: "5004",
  },
  "AR_14_Cordillera": {
    domicilio: "Cordillera 3591",
    localidad: "Córdoba",
    cp: "5009",
  },
  "AR_156_Crisol": {
    domicilio: "L de Gongora 175",
    localidad: "Córdoba",
    cp: "5001",
  },
};

const PeYaRemito: React.FC = () => {
  const location = useLocation();
  const data = (location.state as { data: any[] })?.data || [];

  // Tomamos el primer ST y storeName como referencia
  const st = data.length > 0 ? data[0].st : "";
  const storeName = data.length > 0 ? data[0].storeName : "";

  // Obtenemos destino según storeName
  const destino = destinos[storeName] || { domicilio: "", localidad: "", cp: "" };

  // Transformamos filas en productos
  const productos: Producto[] = data.map((r) => ({
    sku: r.sku,
    ean: r.ean,
    producto: r.title,
    uxb: r.uxb,
    bultos: Number(r.bultos) || 0,
    unidades: Number(r.unidades) || 0,
  }));

  // Totales
  const totalBultos = productos.reduce((acc, p) => acc + p.bultos, 0);
  const totalUnidades = productos.reduce((acc, p) => acc + p.unidades, 0);

  return (
    <div className={styles.container}>
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
          <p>Remito Nº: R0003-00000001</p>
          <p className={styles.barcode}>*R0003-00000001*</p>
          <p>Fecha de Emisión: 10/7/2027</p>
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

          <p>Detalles de entrega - Pedido Nº: {st}</p>
          <p>Destinatario: {storeName}</p>
          <p>Domicilio: {destino.domicilio}</p>
          <p>Localidad: {destino.localidad} &nbsp;&nbsp; CP: {destino.cp}</p>
          <p>Guía Remito: {st}</p>
          <hr />
        </div>

        <div className={styles.rightSection}>
          <p className={styles.barcodeLarge}>*{st}*</p>
          <p className={styles.guiaRemito}>{st}</p>
        </div>
      </div>

      {/* Tercera parte */}
      <div className={styles.terceraParte}>
        <hr />
        <p className={styles.leyenda}>Remitimos a UD.(es) lo siguiente</p>
        <hr />

        <table className={styles.productosTable}>
          <thead>
            <tr>
              <th>SKUEAN</th>
              <th>Producto</th>
              <th>UxB</th>
              <th>Bultos</th>
              <th>Unidades</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p, idx) => (
              <tr key={idx}>
                <td>{p.sku} {p.ean}</td>
                <td>{p.producto}</td>
                <td>{p.uxb}</td>
                <td>{p.bultos}</td>
                <td>{p.unidades}</td>
              </tr>
            ))}
            <tr className={styles.totalRow}>
              <td colSpan={3}>Total</td>
              <td>{totalBultos}</td>
              <td>{totalUnidades}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PeYaRemito;
