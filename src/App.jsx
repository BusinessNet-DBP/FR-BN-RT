import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Welcome from "./pages/Welcome";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/welcome" element={<Welcome />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;