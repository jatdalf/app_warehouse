import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Loguin from "./components/Loguin/Login03";
import Home from "./components/Home/Home";
import Uom from "./components/Uom/Uom";
import GuiaYwm005 from "./components/GuiaYwm005/GuiaYwm005";
import Traslados from "./components/Traslados/Traslados";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Loguin />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Uom" element={<Uom />} />
        <Route path="/GuiaYwm005" element={<GuiaYwm005 />} />
        <Route path="/Traslados" element={<Traslados />} />
      </Routes>
    </Router>
  );
}
export default App;