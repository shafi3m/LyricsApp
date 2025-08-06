import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { ThemeProvider } from "./contexts/ThemeContext";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import PoemDetail from "./pages/PoemDetail";
import About from "./pages/About";
import FeedbackForm from "./pages/FeedbackForm";
import Admin from "./pages/Admin";
import { initGA, logPageView } from "./analytics"; // ⬅️ Import GA functions

// Component to handle scroll & GA tracking on route change
const ScrollAndTrack = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    logPageView(location.pathname + location.search); // 📊 Track page view
  }, [location]);

  return null;
};

function App() {
  useEffect(() => {
    initGA(); // ✅ Initialize GA once on mount
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <ScrollAndTrack /> {/* 📌 Added for GA + scroll */}
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
            <Header />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/poem/:id" element={<PoemDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/feedback" element={<FeedbackForm />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
