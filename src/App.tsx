import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Loguin from "./components/Loguin/Login03";
import Home from "./components/Home/Home";
import Uom from "./components/Uom/Uom";
import GuiaYwm005 from "./components/GuiaYwm005/GuiaYwm005";
import Traslados from "./components/Traslados/Traslados";
import Inventarios from "./components/Inventarios/Inventarios";
import InventoryDetail from "./components/InventoryDetail/InventoryDetail";
import UbicacionesDetail from "./components/Inventarios/UbicacionesDetail";
import WhGral from "./components/WhGeneral/WhGral";
import PeYa from "./components/PeYa/PeYa";
import PeYaIngresos from "./components/PeYa/PeYaIngresos";
import PeYaEgresos from "./components/PeYa/PeYaEgresos/PeYaEgresos";
import PeYaInformes from "./components/PeYa/PeYaInformes/PeYaInformes";
import PeYaPicking from "./components/PeYa/PeYaPicking/PeYaPicking";
import PeYaRemito from "./components/PeYa/PeYaRemito/PeYaRemito";
import PeYaSalida from "./components/PeYa/PeYaSalida/PeYaSalida";
import PeYaWorkflow from "./components/workflow/PeYaWorkflow";
import PeYaIngresosInforme from "./components/PeYa/PeYaInformes/ingresos/PeYaIngresosInforme"
import PeYaOcupacionInforme from "./components/PeYa/PeYaInformes/ocupacion/PeYaOcupacionInforme"
import PeYaInventariosInforme from "./components/PeYa/PeYaInformes/inventarios/PeYaInventariosInforme"
import PeYaEgresosInforme from "./components/PeYa/PeYaInformes/egresos/PeYaEgresosInforme"
import PeYaClaveControl from "./components/PeYa/PeYaInformes/claveControl/PeYaClaveControl";
import Renault from "./components/Renault/Renault"
import RenaultInformes from "./components/Renault/RenaultInformes/RenaultInformes"
import RenaultIngresos from "./components/Renault/RenaultInformes/ingresos/RenaultIngresos"
import RenaultOcupacion from "./components/Renault/RenaultInformes/ocupacion/RenaultOcupacion"
import RenaultInventarios from "./components/Renault/RenaultInformes/inventarios/RenaultInventarios"
import RenaultEgresos from "./components/Renault/RenaultInformes/egresos/RenaultEgresos"
import RenaultResumen from "./components/Renault/RenaultInformes/resumenOperativo/resumenOperativo"
import RenaultCompactacionDetalle from "./components/Renault/RenaultInformes/ocupacion/Compactacion/RenaultCompactacionDetalle"

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
        <Route path="/PeYaSalida" element={<PeYaSalida  />} />
        <Route path="/PeYaWorkflow" element={<PeYaWorkflow  />} />
        <Route path="/PeYaInformes/ingresos" element={<PeYaIngresosInforme  />} />
        <Route path="/PeYaInformes/ocupacion" element={<PeYaOcupacionInforme />} />    
        <Route path="/PeYaInformes/inventarios" element={<PeYaInventariosInforme />} />    
        <Route path="/PeYaInformes/egresos" element={<PeYaEgresosInforme />} />  
        <Route path="/PeYaInformes/clave-control" element={<PeYaClaveControl />} />  
        <Route path="/Renault" element={<Renault />} />  
        <Route path="/RenaultInformes" element={<RenaultInformes />} />  
        <Route path="/RenaultInformes/ingresos" element={<RenaultIngresos  />} />
        <Route path="/RenaultInformes/ocupacion" element={<RenaultOcupacion />} />    
        <Route path="/RenaultInformes/inventarios" element={<RenaultInventarios />} />    
        <Route path="/RenaultInformes/egresos" element={<RenaultEgresos />} />  
        <Route path="/RenaultInformes/resumenOperativo" element={<RenaultResumen />} />  
        <Route path="/renault/ocupacion/compactacion/:warehouse/:storage" element={<RenaultCompactacionDetalle />}/>

      </Routes>
    </Router>
  );
}
export default App;