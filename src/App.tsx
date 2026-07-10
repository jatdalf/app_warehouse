import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Loguin from "./components/Loguin/Login03";
import Home from "./components/Home/Home";
import Uom from "./components/Uom/Uom";
import GuiaYwm005 from "./components/GuiaYwm005/GuiaYwm005";
import Traslados from "./components/Traslados/Traslados";
import Inventarios from "./components/Inventarios/Inventarios";
import InventoryDetail from "./components/InventoryDetail/InventoryDetail";
import UbicacionesDetail from "./components/Inventarios/UbicacionesDetail";
import WhGral from "./components/whGral/WhGral";
import PeYa from "./components/PeYa/PeYa";
import PeYaIngresos from "./components/PeYa/PeYaIngresos";
import PeYaEgresos from "./components/PeYa/PeYaEgresos/PeYaEgresos";
import PeYaInformes from "./components/PeYa/PeYaInformes";
import PeYaPicking from "./components/PeYa/PeYaPicking/PeYaPicking";
import PeYaRemito from "./components/PeYa/PeYaRemito/PeYaRemito";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Loguin />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Uom" element={<Uom />} />
        <Route path="/GuiaYwm005" element={<GuiaYwm005 />} />
        <Route path="/Traslados" element={<Traslados />} />
        <Route path="/Inventarios" element={<Inventarios />} />
        <Route path="/InventoryDetail" element={<InventoryDetail />} />
        <Route path="/UbicacionesDetail" element={<UbicacionesDetail />} />
        <Route path="/WhGral" element={<WhGral />} />
        <Route path="/PeYa" element={<PeYa />} />
        <Route path="/PeYaIngresos" element={<PeYaIngresos />} />
        <Route path="/PeYaEgresos" element={<PeYaEgresos />} />
        <Route path="/PeYaInformes" element={<PeYaInformes />} />
        <Route path="/PeYaPicking" element={<PeYaPicking  />} />
        <Route path="/PeYaRemito" element={<PeYaRemito  />} />
      </Routes>
    </Router>
  );
}
export default App;