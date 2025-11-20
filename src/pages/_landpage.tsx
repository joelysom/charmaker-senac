import React from 'react';
import Navbar from '../components/Navbar';
import '../styles/landpage.css';

export default function SobreNos(): React.ReactElement {
  return (
    <div className="landpage-wrapper">
      <Navbar />
      <main className="sobre-container">
      {/* HERO */}
      <section id="hero" className="hero">
        <img
          src="/landpage/HERO.svg"
          alt="Hero"
          className="hero-img"
        />
        <div className="hero-text">
          <h1>Sobre Nós</h1>
          <p>Educação inovadora</p>
        </div>
      </section>

      {/* UNIVERSIDADES → MUNDO */}
      <section id="universidades" className="universidades">
        <div className="universidades-img">
          <img src="https://via.placeholder.com/500x500" alt="Universidades" />
        </div>
        <div className="universidades-text">
          <h2>Das Universidades para mundo</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
            imperdiet metus sed lorem mollis, a hendrerit justo posuere.
            Pellentesque accumsan, nulla quis maximus pulvinar, dolor nunc
            facilisis ipsum, eget feugiat turpis lacus non odio. Donec tempor
            massa eget tincidunt luctus. Vivamus id convallis sapien. Sed sed
            sollicitudin massa.
          </p>
          <p>
            Aliquam erat volutpat. Aenean fermentum turpis nec vestibulum
            rhoncus. Proin ultrices velit ut tincidunt elementum. In vel enim
            eget lacus pharetra accumsan eget vel libero.
          </p>
        </div>
      </section>

      {/* PROPÓSITO / MISSÃO */}
      <section id="missao" className="proposito-missao">
        <div className="box">
          <h3>Propósito</h3>
          <img src="https://via.placeholder.com/400x300" alt="Proposito" />
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non
            arcu vitae odio malesuada.
          </p>
        </div>

        <div className="box">
          <h3>Missão</h3>
          <img src="https://via.placeholder.com/400x300" alt="Missao" />
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce vitae
            justo sodales, fermentum.
          </p>
        </div>
      </section>

      {/* VALORES */}
      <section id="valores" className="valores">
        <div className="valores-img">
          <img src="https://via.placeholder.com/500x350" alt="Valores" />
        </div>
        <div className="valores-text">
          <h3>Valores</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum
            ut fermentum risus. Mauris bibendum erat vitae leo malesuada, id
            varius orci rhoncus.
          </p>
        </div>
      </section>

      {/* EQUIPE */}
      <section id="equipe" className="equipe">
        <h2>Conheça a equipe</h2>
        <div className="equipe-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="equipe-card">
              <div className="equipe-foto"></div>
              <div className="equipe-cor"></div>
            </div>
          ))}
        </div>
      </section>
      </main>
    </div>
  );
}
