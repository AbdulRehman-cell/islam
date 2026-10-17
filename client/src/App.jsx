import React from 'react';
import { Routes, Route, NavLink, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import SurahIndex from './pages/SurahIndex';
import SurahReader from './pages/SurahReader';
import Bookmarks from './pages/Bookmarks';
import About from './pages/About';
import Admin from './pages/Admin';

function Header() {
  return (
    <header className="header nav-pill">
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-symbol">✨</span>
          <span className="logo-text">
            Noor <span className="logo-arabic">نور</span>
          </span>
        </Link>
        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Home
          </NavLink>
          <NavLink to="/surahs" className={({ isActive }) => (isActive ? 'active' : '')}>
            Surahs
          </NavLink>
          <NavLink to="/bookmarks" className={({ isActive }) => (isActive ? 'active' : '')}>
            Bookmarks
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')}>
            About
          </NavLink>
        </nav>
        <div className="nav-actions">
          <Link to="/surahs" className="btn-primary btn-sm">
            Open Mushaf
          </Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="nav-logo">
              <span className="logo-symbol">✨</span>
              <span className="logo-text">Noor <span className="logo-arabic">نور</span></span>
            </div>
            <p className="footer-motto">
              "Every ayah, in its own light." <br />
              A calm, respectful digital mushaf built for daily reading, listening, and quiet reflection.
            </p>
          </div>
          <div className="footer-col">
            <h4>Navigation</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/surahs">All Surahs</Link></li>
              <li><Link to="/bookmarks">Saved Ayahs</Link></li>
              <li><Link to="/about">About & Mission</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Quick Chapters</h4>
            <ul>
              <li><Link to="/surah/1">Al-Fatihah (1)</Link></li>
              <li><Link to="/surah/36">Ya-Sin (36)</Link></li>
              <li><Link to="/surah/55">Ar-Rahman (55)</Link></li>
              <li><Link to="/surah/67">Al-Mulk (67)</Link></li>
              <li><Link to="/surah/18">Al-Kahf (18)</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Reverence & Faith</h4>
            <p className="footer-text">
              Every word is verified against standard Uthmani script sources. Audio recitations are sourced faithfully with credit to the reciters.
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Noor App. Built for peace, stillness, and light.</p>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/surahs" element={<SurahIndex />} />
          <Route path="/surah/:number" element={<SurahReader />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}