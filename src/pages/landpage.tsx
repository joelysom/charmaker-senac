import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import './assets/css/style.css';
import './assets/css/header.css';
import './assets/css/footer.css';
import '../styles/landpage.css';

const Index: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [modalOpen, setModalOpen] = useState<number | null>(null);
  const [currentUniversidadeImage, setCurrentUniversidadeImage] = useState(0);

  const slides = Array.from({ length: 9 }, (_, i) => i);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const universidadeImages = [
    '/landpage/landpage_(24).jpeg',
    '/landpage/landpage_(28).jpeg',
    '/landpage/landpage_(13).jpeg',
    '/landpage/landpage_(1).jpeg'
  ];

  // Autoplay slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 8500);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Autoplay universidade images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentUniversidadeImage(prev => (prev + 1) % universidadeImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [universidadeImages.length]);

  // Text truncation
  useEffect(() => {
    const slideParagraphs = document.querySelectorAll('.slide-paragraph');
    slideParagraphs.forEach((slideParagraph) => {
      const textLimit = 100;
      const element = slideParagraph as HTMLElement;
      const fullText = element.innerText;
      const aTag = slideParagraph.querySelector('.paragraph-anchor-tag');
      if (element.innerText.length > textLimit) {
        element.innerHTML = fullText.substring(0, textLimit) + '...';
        if (aTag) element.appendChild(aTag);
      }
    });

    const videoParagraphs = document.querySelectorAll('.video-paragraph');
    videoParagraphs.forEach((videoParagraph) => {
      const textLimit = 150;
      const element = videoParagraph as HTMLElement;
      const fullText = element.innerText;
      const aTag = videoParagraph.querySelector('.video-anchor-tag');
      if (element.innerText.length > textLimit) {
        element.innerHTML = fullText.substring(0, textLimit) + '...';
        if (aTag) element.appendChild(aTag);
      }
    });
  }, []);

  const openModal = (index: number) => {
    setModalOpen(index);
    setTimeout(() => {
      const modalContent = document.querySelector(`.slide:nth-child(${index + 1}) .video-modal-content`);
      if (modalContent) modalContent.classList.add('active');
    }, 300);
    videoRefs.current[index]?.play();
  };

  const closeModal = (index: number) => {
    setModalOpen(null);
    const modalContent = document.querySelector(`.slide:nth-child(${index + 1}) .video-modal-content`);
    if (modalContent) modalContent.classList.remove('active');
    videoRefs.current[index]?.pause();
  };

  const slideTitles = [
    'Existência e Resistência',
    'Nossa Luta tem Voz',
    'Denúncie o Racismo',
    'Conheça nossa<br /><span class="left-align">Equipe</span>',
    'Você não está só',
    'Sua Vida Existe',
    'Acesse nossa<br />Comunidade',
    'Nosssa Ancestralidade Vive',
    'Juntos por um Mundo Melhor'
  ];

  const slideCaptions = [
    'O Som da Nossa Voz',
    'Raízes & Consciência:',
    'Raízes & Consciência:',
    'Raízes & Consciência:',
    'Raízes & Consciência:',
    'Raízes & Consciência:',
    'Raízes & Consciência:',
    'Raízes & Consciência:',
    'Raízes & Consciência:'
  ];

  const slideParagraphs = [
    'Uma a cada 100 mortes no mundo ocorrem por suicídio...<span class="paragraph-anchor-tag"><a href="#" class="read-more">Leia Mais</a></span>',
    'O objetivo da campanha é quebrar o tabu e estimular o diálogo...<span class="paragraph-anchor-tag"><a href="#" class="read-more">Read More</a></span>',
    'A cor amarela representa luz, vida e esperança...<span class="paragraph-anchor-tag"><a href="#" class="read-more">Read More</a></span>',
    '90% dos casos de suicídio podem ser prevenidos com apoio adequado...<span class="paragraph-anchor-tag"><a href="#" class="read-more">Read More</a></span>',
    'Raízes & Consciência é uma campanha de conscientização pela vida desde 2015...<span class="paragraph-anchor-tag"><a href="#" class="read-more">Read More</a></span>',
    'Raízes & Consciência promove rodas de conversa, palestras e ações comunitárias...<span class="paragraph-anchor-tag"><a href="#" class="read-more">Read More</a></span>',
    'A prevenção começa com a escuta e o acolhimento...<span class="paragraph-anchor-tag"><a href="#" class="read-more">Read More</a></span>',
    'O laço amarelo simboliza a valorização da vida...<span class="paragraph-anchor-tag"><a href="#" class="read-more">Read More</a></span>',
    'Falar sobre sentimentos é um ato de libertação. Guardar a dor em silêncio aprisiona; compartilhar abre espaço para a cura e para a vida...<span class="paragraph-anchor-tag"><a href="#" class="read-more">Read More</a></span>'
  ];

  const slideClasses = [
    'animal-name',
    'animal-name-pa',
    'animal-name-pa2',
    'animal-name',
    'animal-name-ex',
    'animal-name',
    'animal-name',
    'animal-name-pa',
    'animal-name-pa'
  ];

  return (
    <div className="landpage-wrapper">
      <Navbar />
      <main className="sobre-container">
        <section className="main-section">
          <a href="" className="logo"></a>
          <div className="slider">
            {slides.map((slide, index) => (
              <div key={index} className={`slide ${index === currentSlide ? 'active' : ''}`} ref={el => { slideRefs.current[index] = el; }}>

                <div className="slide-images">
                  <img src={`assets/images/bg-${index + 1}.jpg`} alt="" className="slide-bg-img" />
                  <h1 className={`${slideClasses[index]} ${index === 5 ? 'larger-text-slide6 lower-text-slide6' : ''} ${index === 3 ? 'higher-text-slide4 slide4-text larger-text-slide4' : ''} ${index === 1 ? 'larger-text-slide2 lower-text-slide2' : ''} ${index === 2 ? 'larger-text-slide3 lower-text-slide3' : ''} ${index === 6 ? 'lower-text-slide7' : ''} ${index === 7 ? 'lower-text-slide8' : ''} ${index === 8 ? 'lower-text-slide9' : ''}`} dangerouslySetInnerHTML={{ __html: slideTitles[index] }}></h1>
                  <img src={`assets/images/animal-${index + 1}.png`} alt="" className={`slide-animal-img ${index === 2 ? 'larger-animal larger-animal-slide3' : ''} ${index === 3 ? 'larger-animal-slide4' : ''}`} />
                </div>
                <div className="slide-text-content">
                  <h3 className="slide-caption">{slideCaptions[index]}</h3>
                  <p className="slide-paragraph" dangerouslySetInnerHTML={{ __html: slideParagraphs[index] }}></p>
                </div>
                <div className={`slide-video-modal ${modalOpen === index ? 'active' : ''}`}>
                  <i className="ri-close-line video-close-btn" onClick={() => closeModal(index)}></i>
                  <div className="video-modal-content">
                    <div className="video-card">
                      <video src="video/vod.mp4" className="animal-video" controls loop ref={el => { videoRefs.current[index] = el; }}></video>
                      <p className="video-paragraph">conscientização do raízes & consciência<span className="video-anchor-tag"><a href="#" className="read-more">Read More</a></span></p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="slider-media-icons">
            <a href="#" className="media-links"><i className="ri-facebook-fill"></i></a>
            <a href="#" className="media-links"><i className="ri-instagram-line"></i></a>
            <a href="#" className="media-links"><i className="ri-twitter-x-line"></i></a>
          </div>

          <div className="slide-pagination">
            {slides.map((_, index) => (
              <div key={index} className={`slide-btn ${index === currentSlide ? 'active' : ''} ${index === 0 ? 'first-slide-btn' : ''}`} onClick={() => setCurrentSlide(index)}></div>
            ))}
          </div>

          <div className="slide-indicator-bars">
            {slides.map((_, index) => (
              <div key={index} className={`indicator-bar ${index === currentSlide ? 'active' : ''} ${index === 0 ? 'first-indicator-bar' : ''}`}></div>
            ))}
          </div>
        </section>

        {/* ENTENDA NOSSA CAUSA */}
        <section className="causa-section">
          <div className="causa-rectangle">
            <h2>Entenda Nossa Causa</h2>
          </div>
        </section>

        {/* UNIVERSIDADES → MUNDO */}
        <section id="universidades" className="universidades">
          <div className="universidades-text">
            <h2>Do Senac para o mundo</h2>
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
          <div className="universidades-img">
            {universidadeImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt="Universidades"
                className={`universidade-slide ${index === currentUniversidadeImage ? 'active' : ''}`}
              />
            ))}
          </div>
        </section>

        {/* PROPÓSITO / MISSÃO */}
        <section id="missao" className="proposito-missao">
          <div className="box">
            <h3>Visão</h3>
            <img src="/landpage/landpage_(22).jpeg" alt="Visao" />
            <p>
              Ser referência nacional em iniciativas educacionais digitais voltadas para a valorização da diversidade étnico-racial, contribuindo para a formação de cidadãos críticos, engajados e comprometidos com a equidade e o respeito às diferenças.
            </p>
          </div>

          <div className="box">
            <h3>Missão</h3>
            <img src="/landpage/landpage_(20).jpeg" alt="Missao" />
            <p>
              Promover a educação racial e o reconhecimento da identidade negra por meio de uma plataforma digital interativa, incentivando a valorização da cultura afro-brasileira, a inclusão social e a construção de uma sociedade mais justa e consciente.
            </p>
          </div>
        </section>

        {/* VALORES */}
        <section id="valores" className="valores">
          <div className="valores-img">
            <img src="/landpage/landpage_(14).jpeg" alt="Valores" />
          </div>
          <div className="valores-text">
            <h3>Valores</h3>
            <p>
              Inclusão: Garantir espaço para todas as vozes, respeitando e valorizando a diversidade.<br /><br />
Educação Transformadora: Utilizar conhecimento como ferramenta para combater preconceitos e promover mudanças sociais.<br /><br />
Respeito: Reconhecer e honrar as raízes culturais e históricas da população negra.<br /><br />
Inovação Social: Criar soluções digitais criativas que aproximem pessoas e ideias.<br /><br />
Empoderamento: Fortalecer identidades e estimular protagonismo individual e coletivo.
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

        {/* GAMIFICAÇÃO */}
        <section id="gamificacao" className="gamificacao">
          <h2>Conheça nossa Gamificação</h2>
          <div className="gamificacao-content">
            <p>
              Descubra como nossa plataforma gamificada transforma o aprendizado em uma experiência envolvente e interativa.
            </p>
            <div className="gamificacao-grid">
              <div className="gamificacao-card">
                <div className="gamificacao-icon"></div>
                <h3>Crie seu Avatar</h3>
                <p>Crie seu Avatar na gamificação, do seu jeito da forma como você se enxerga!</p>
                <img src="/landpage/characters/avatar.png" alt="Avatar" className="gamificacao-character" />
              </div>
              <div className="gamificacao-card">
                <div className="gamificacao-icon"></div>
                <h3>Quiz</h3>
                <p>Participe do quiz da comunidade! Aprenda como combater o racismo e lidar com situações.</p>
                <img src="/landpage/characters/Quiz.png" alt="Quiz" className="gamificacao-character" />
              </div>
              <div className="gamificacao-card">
                <div className="gamificacao-icon"></div>
                <h3>Comunidade</h3>
                <p>Acesse nossa comunidade, compartilhe sua historia e o que achou do nosso projeto e evento!</p>
                <img src="/landpage/characters/comunidade.png" alt="Comunidade" className="gamificacao-character" />
              </div>
            </div>
            <div className="gamificacao-cta">
              <p>Pronto para começar?</p>
              <a href="/app" className="gamificacao-btn">COMEÇAR</a>
            </div>
          </div>
        </section>
      </main>

      <div className="gamificacao-background">
        <img src="/landpage/characters/Entrar.png" alt="Entrar" className="gamificacao-entrar-img" />
      </div>

      <footer className="footer">
        <p>&copy; 2025 Raízes & Consciência - SENAC. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Index;