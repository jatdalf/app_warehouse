import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Loguin from "./components/Loguin/Login03";
import Home from "./components/Home/Home";
import Uom from "./components/Uom/Uom";
import GuiaYwm005 from "./components/GuiaYwm005/GuiaYwm005";
// import Noticias from "./components/Noticias/Noticias";
// import Riesgo from "./components/Riesgo/Riesgo";
// import Ambientales from "./components/Ambientales/Ambientales";
// import Consulta from "./components/Consulta/Consulta";
// import Visitas from "./components/Visitas/Visitas";
// import Admin from "./components/Admin/Admin";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Loguin />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Uom" element={<Uom />} />
        <Route path="/GuiaYwm005" element={<GuiaYwm005 />} />
        {/* <Route path="/capacitaciones" element={<Capacitaciones />} />
        
        <Route path="/riesgo" element={<Riesgo />} />
        <Route path="/ambientales" element={<Ambientales />} />
        <Route path="/consulta" element={<Consulta />} />
        <Route path="/visitas" element={<Visitas />} />
        <Route path="/Admin" element={<Admin />} /> */}
      </Routes>
    </Router>
  );
}
export default App;