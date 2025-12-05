import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// Components
import Navbar from "./Componant/Subcomponant/Navbar";
import Footer from "./Componant/Subcomponant/Footer";

// Pages
import Home from "./Componant/pages/1.Home";
import About from "./Componant/pages/2.About";
import AcademicSection from "./Componant/pages/3.AcademicSection";
import Admission from "./Componant/pages/4.Admission";
import Contact from "./Componant/pages/6.Contact";
import Gallery from "./Componant/pages/Gallary";
import Sports from "./Componant/pages/Sports";
import ArtCraft from "./Componant/pages/ArtCraft";
import AdminDashboard from "./Componant/pages/AdminDashboard";

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />

        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/academic" element={<AcademicSection />} />
            <Route path="/admission" element={<Admission />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/sports" element={<Sports />} />
            <Route path="/artcraft" element={<ArtCraft />} />
            <Route path="/admindashboard/*" element={<AdminDashboard />} />
          </Routes>
        </div>

        {/* Footer placed correctly outside Routes */}
        <Footer />
      </BrowserRouter>
    </>
  );
}

export default App;
