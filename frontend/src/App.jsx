import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home"; // Create a simple Home component

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<div>Not Found</div>} /> {/* Simple 404 */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
