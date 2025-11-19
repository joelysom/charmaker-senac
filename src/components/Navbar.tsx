import React, { useState } from 'react';
import './Navbar.css';

interface NavbarProps {
  onNavigate?: (section: string) => void;
}

export default function Navbar({ onNavigate }: NavbarProps): React.ReactElement {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (section: string) => {
    onNavigate?.(section);
    setIsMenuOpen(false);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <a href="/">
            <span className="logo-text">RAÍZES</span>
          </a>
        </div>

        {/* Hamburger Menu */}
        <div
          className={`hamburger ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Menu Links */}
        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li>
            <a onClick={() => scrollToSection('hero')} className="nav-link">
              Início
            </a>
          </li>
          <li>
            <a onClick={() => scrollToSection('universidades')} className="nav-link">
              Sobre Nós
            </a>
          </li>
          <li>
            <a onClick={() => scrollToSection('missao')} className="nav-link">
              Missão
            </a>
          </li>
          <li>
            <a onClick={() => scrollToSection('valores')} className="nav-link">
              Valores
            </a>
          </li>
          <li>
            <a onClick={() => scrollToSection('equipe')} className="nav-link">
              Equipe
            </a>
          </li>
          <li>
            <a href="/app" className="nav-link nav-cta">
              Entrar
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
