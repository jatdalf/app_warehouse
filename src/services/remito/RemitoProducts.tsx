import "./RemitoStyles.css";
import type { Remito } from "../../core/remitos/Remito";
import type { Producto } from "../../core/remitos/Producto";

interface Props {
    remito: Remito;
}

const MAX_ITEMS = 25;

function completarProductos(productos: Producto[]): Producto[] {
    const lista = [...productos];
    while (lista.length < MAX_ITEMS) {
        lista.push({
            sku: "",
            ean: "",
            descripcion: "",
            uxb: 0,
            bultos: 0,
            unidades: 0
        });
    }
    return lista;
}

const RemitoProducts: React.FC<Props> = ({ remito }) => {
    const productos = completarProductos(remito.productos);
    const totalBultos = remito.productos.reduce(
        (acc, p) => acc + p.bultos,
        0
    );
    const totalUnidades = remito.productos.reduce(
        (acc, p) => acc + p.unidades,
        0
    );
    return (
        <div className="terceraParte">
            <hr />
            <p className="leyenda">
                Remitimos a UD.(es) lo siguiente
            </p>
            <hr />
            <table className="productosTable">
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
                    {productos.map((p, index) => (
                        <tr key={index}>
                            <td>
                                <strong>{p.sku}</strong>
                            </td>
                            <td>{p.ean}</td>
                            <td title={p.descripcion}>
                                <span className="productoTexto">
                                    {p.descripcion}
                                </span>
                            </td>
                            <td>{p.uxb || ""}</td>
                            <td>
                                <strong>
                                    {p.bultos || ""}
                                </strong>
                            </td>
                            <td>
                                {p.unidades || ""}
                            </td>
                        </tr>
                    ))}

                    <tr className="totalRow">
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
    );
};

export default RemitoProducts;