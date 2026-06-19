import React from "react";
import { useLocation } from "react-router-dom";


interface RegistroInventario {
  fecha: string | number;
  almacen: string;
  ubicacion: string;
  material: string;
  nombre: string;
  totalTeorico: number;
  contado: number;
  resultado: number;
}

const InventoryDetail: React.FC = () => {
  const location = useLocation();
  const registros = (location.state?.registros as RegistroInventario[]) || [];

  return (
    <div>
      <h2>Detalle de Inventario</h2>
      <p>Total registros: {registros.length}</p>
      <ul>
        {registros.map((r: RegistroInventario, idx: number) => (
          <li key={idx}>
            {r.fecha} - {r.almacen} - {r.material} - {r.resultado}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InventoryDetail;