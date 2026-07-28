import React, { useMemo } from "react";
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

interface Destino {
  domicilio: string;
  localidad: string;
  cp: string;
}

interface RemitoData {
  st: string;
  sku: string;
  ean: string;
  title: string;
  uxb: string;
  bultos: number;
  unidades: number;
  storeName: string;
}

const destinos: Record<string, Destino> = {
  "AR_15_25deMayo": {
    domicilio: "25 de Mayo 1370",
    localidad: "Córdoba",
    cp: "5004"
  },
  "AR_14_Cordillera": {
    domicilio: "Cordillera 3591",
    localidad: "Córdoba",
    cp: "5009"
  },
  "AR_156_Crisol": {
    domicilio: "L de Gongora 175",
    localidad: "Córdoba",
    cp: "5001"
  },
    "AR_Ocasa": {
    domicilio: "Av la voz del interior 6051",
    localidad: "Córdoba",
    cp: "5009"
  }
};

const COPIAS = [
  "──────── ORIGINAL ────────",
  "─────── DUPLICADO ───────",
  "────── TRIPLICADO ──────"
] as const;

const MAX_ITEMS = 25;

const PeYaRemito: React.FC = () => {
  const location = useLocation();
  const state=location.state as{
    data:any[];
    remitos:{
        st:string;
        remito:string;
    }[];
};

const data=state?.data||[];
const remitos=state?.remitos||[];

const groupedByST = useMemo(() => {
  const groups: Record<string, RemitoData[]> = {};
    data.forEach(row => {
      if (!row.st || !/^ST[A-Z0-9]\d+$/.test(row.st)) return;
      if (!groups[row.st]) {
        groups[row.st] = [];
      }
      groups[row.st].push(row);
    });
    return groups;
  }, [data]);

  const remitosMap=useMemo(()=>{
      return new Map(
          remitos.map(r=>[
              r.st,
              r.remito
          ])
      );
  },[remitos]);

  const stKeys = useMemo(
    () => Object.keys(groupedByST).sort(),
    [groupedByST]
  );

  const fechaEmision = useMemo(
    () => new Intl.DateTimeFormat("es-AR").format(new Date()),
    []
  );

  const completarProductos = (productos: Producto[]) => {
    const lista = [...productos];

    while (lista.length < MAX_ITEMS) {
      lista.push({
        sku: "",
        ean: "",
        producto: "",
        uxb: "",
        bultos: 0,
        unidades: 0
      });
    }

    return lista;
  };

  const imprimir = () => {
    window.print();
  };

  return (
        <>
      <div className={styles.topActions}>
        <button className={styles.printButton} onClick={imprimir}>
          Imprimir
        </button>
      </div>

      {stKeys.map((st) => {
        const numeroRemito=
        remitosMap.get(st)??"";
        const currentRows = groupedByST[st];
        const storeName = currentRows[0]?.storeName ?? "";
        const destino = destinos[storeName] ?? {
          domicilio: "",
          localidad: "",
          cp: ""
        };

        const productos: Producto[] = currentRows.map((r) => ({
          sku: String(r.sku ?? ""),
          ean: String(r.ean ?? ""),
          producto: String(r.title ?? ""),
          uxb: String(r.uxb ?? ""),
          bultos: Number(r.bultos) || 0,
          unidades: Number(r.unidades) || 0
        }));

        const productosConBlancos = completarProductos(productos);

        const totalBultos = productos.reduce(
          (acc, p) => acc + p.bultos,
          0
        );

        const totalUnidades = productos.reduce(
          (acc, p) => acc + p.unidades,
          0
        );

        return COPIAS.map((copia) => (
          <div className={styles.remito}>
            <div
              key={`${st}-${copia}`}
              className={styles.container}
            >

              <div className={styles.verticalMark}>
                <div className={styles.verticalText}>
                  {copia}
                </div>
              </div>

              <div className={styles.header}>
                <div className={styles.leftBox}>
                  <p>Organización Courier Argentina S.A (OCASA)</p>
                  <p>R.N.P.S.P N° 731</p>
                  <p>Echeverría 1262/64 - C1428DQN - Capital Federal</p>
                  <p>I.V.A.: RESPONSABLE INSCRIPTO</p>
                </div>

                <div className={styles.centerBox}>
                  <span className={styles.bigR}>R</span>
                </div>

                <div className={styles.rightBox}>
                  <p>Remito Nº: {numeroRemito}</p>
                  <p className={styles.barcode}>
                    *{numeroRemito}*
                  </p>
                  <p>Fecha de Emisión: {fechaEmision}</p>
                  <p>C.U.I.T. Nº 30-66204961-8</p>
                  <p>Ingresos Brutos Nº 901995900-0</p>
                  <p>Inicio de Actividades: 01/07/1993</p>
                </div>
              </div>

              <div className={styles.body}>
                <div className={styles.leftSection}>
                  <p>Por cuenta y orden de: DELIVERY HERO E-COMMERCE S.A.</p>
                  <p>Solic: 102003550 - AP: 40044001 / 10</p>
                  <p>Domicilio: JUSTO JUAN B AV. 637</p>
                  <p>Código Postal: 1425</p>
                  <p>Localidad: Capital Federal</p>

                  <hr />

                  <p>Detalles de Origen - Warehouse Ocasa Córdoba</p>
                  <p>Domicilio: Avenida La Voz del Interior 6051</p>
                  <p>Código Postal: 5009</p>
                  <p>Localidad: Córdoba</p>

                  <hr />

                  <p>
                    Detalles de entrega - Pedido Nº:
                    <strong> {st}</strong>
                  </p>
                  <p>
                    Destinatario:
                    <strong> {storeName}</strong>
                  </p>
                  <p>
                    Domicilio:
                    <strong> {destino.domicilio}</strong>
                  </p>

                  <p>
                    Localidad:
                    <strong> {destino.localidad}</strong>
                    {"  "}
                    CP:
                    <strong> {destino.cp}</strong>
                  </p>

                  <p>
                    Guía Remito:
                    <strong> {st}</strong>
                  </p>

                  <hr />
                </div>

                <div className={styles.rightSection}>
                  <p className={styles.barcodeLarge}>
                    *{st}*
                  </p>

                  <p className={styles.guiaRemito}>
                    {st}
                  </p>
                </div>
              </div>
              {/* Tercera parte */}
                          <div className={styles.terceraParte}>
                <hr />

                <p className={styles.leyenda}>
                  Remitimos a UD.(es) lo siguiente
                </p>

                <hr />

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
                    {productosConBlancos.map((p, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{p.sku}</strong>
                        </td>

                        <td>{p.ean}</td>

                        <td title={p.producto}>
                          <span className={styles.productoTexto}>
                            {p.producto}
                          </span>
                        </td>

                        <td>{p.uxb}</td>

                        <td>
                          <strong>
                            {p.bultos > 0 ? p.bultos : ""}
                          </strong>
                        </td>

                        <td>
                          {p.unidades > 0 ? p.unidades : ""}
                        </td>
                      </tr>
                    ))}

                    <tr className={styles.totalRow}>
                      <td colSpan={4}>
                        <strong>Total</strong>
                      </td>

                      <td>
                        <strong>{totalBultos}</strong>
                      </td>

                      <td>
                        <strong>{totalUnidades}</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {/* Sección de firmas y recepción */}
                          <div className={styles.footer}>
                <div className={styles.footerTitle}>
                  CONFORME DE RECEPCIÓN
                </div>

                <div className={styles.footerContent}>
                  <div className={styles.firmasBox}>
                    <p className={styles.footerHeading}>
                      <strong>Entrega (Chofer)</strong>
                    </p>

                    <div className={styles.footerSpacer}></div>

                    <p className={styles.footerP}>Firma</p>

                    <div className={styles.footerSpacer}></div>

                    <p>
                      Aclaración
                      <span className={styles.fechaHora}>
                        Fecha y Hora
                      </span>
                    </p>
                  </div>

                  <div className={styles.footerRight}>
                    <p className={styles.footerHeading}>
                      <strong>Recibe</strong>
                    </p>

                    <div className={styles.footerSpacer}></div>

                    <p className={styles.footerP}>
                      Firma / Sello
                    </p>

                    <div className={styles.footerSpacer}></div>

                    <p>
                      Aclaración
                      <span className={styles.fechaHora}>
                        Fecha y Hora
                      </span>
                    </p>
                  </div>
                </div>

                <div className={styles.footerBottom}>
                  <span className={styles.footerLeft}>
                    CAI N° 522128217779710 &nbsp;&nbsp;&nbsp;
                    Fecha de Vto: 21.09.2026
                  </span>

                  <span className={styles.footerRightText}>
                    Hoja 1 de 1
                  </span>
                </div>
              </div>
            </div>
          </div>
        ));
      })}

    </>
  );
};

export default PeYaRemito;