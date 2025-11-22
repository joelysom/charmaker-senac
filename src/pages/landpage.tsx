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
  const [currentAvatarImage, setCurrentAvatarImage] = useState(0);
  const [currentQuizImage, setCurrentQuizImage] = useState(0);
  const [currentComunidadeImage, setCurrentComunidadeImage] = useState(0);

  const [currentTeamImage, setCurrentTeamImage] = useState(0);

  const [currentLogisticsImage, setCurrentLogisticsImage] = useState(0);

  const [currentVolunteersImage, setCurrentVolunteersImage] = useState(0);

  const [currentInstructorsImage, setCurrentInstructorsImage] = useState(0);

  const [currentCoordinationImage, setCurrentCoordinationImage] = useState(0);

  const slides = Array.from({ length: 9 }, (_, i) => i);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const universidadeImages = [
    '/landpage/landpage_(24).jpeg',
    '/landpage/landpage_(28).jpeg',
    '/landpage/landpage_(13).jpeg',
    '/landpage/landpage_(1).jpeg'
  ];

  const teamMembers = [
    { src: '/landpage/grupos/4.jpg', name: 'Marcos Alexandre', role: 'Desenvolvedor FrontEnd' },
    { src: '/landpage/grupos/5.jpg', name: 'Thiago Nicolas', role: 'Desenvolvedor FrontEnd e BackEnd' },
    { src: '/landpage/grupos/6.jpg', name: 'Joelyson Alcantara', role: 'Desenvolvedor Design, FrontEnd e BackEnd' },
    { src: '/landpage/grupos/10.jpg', name: 'Gustavo Alves', role: 'Designer' },
    { src: '/landpage/grupos/13.jpg', name: 'Harrison Souza', role: 'Designer' },
    { src: '/landpage/grupos/14.jpg', name: 'João Marcos', role: 'Desenvolvedor FrontEnd e BackEnd' }
  ];

  const logisticsMembers = [
    { src: '/landpage/grupos/16.jpg', name: 'Rayssa Nepomuceno', role: '' },
    { src: '/landpage/grupos/15.jpg', name: 'Julia Beatriz', role: '' },
    { src: '/landpage/grupos/17.jpg', name: 'Estefany Valentim', role: '' }
  ];

  const volunteersMembers = [
    { src: '/landpage/grupos/8.jpg', name: 'Emerson Castiel', role: '' },
    { src: '/landpage/grupos/9.jpg', name: 'Alanna Beatriz', role: '' },
    { src: '/landpage/grupos/22.jpg', name: 'Itala Samara', role: '' },
    { src: '/landpage/grupos/23.jpg', name: 'Elaine Barbosa', role: '' },
    { src: '/landpage/grupos/12.jpg', name: 'Céu Nascimento', role: '' }
  ];

  const instructorsMembers = [
    { src: '/landpage/grupos/18.jpg', name: 'Elvio Luiz', role: '' },
    { src: '/landpage/grupos/25.jpeg', name: 'Matheus Eloim', role: '' },
    { src: '/landpage/grupos/26.jpeg', name: 'Renata Santiago', role: '' }
  ];

  const coordinationMembers = [
    { src: '/landpage/grupos/19.jpg', name: 'Mere Coutinho', role: '' },
    { src: '/landpage/grupos/27.jpeg', name: 'Carol Lima', role: '' }
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

  // Autoplay avatar images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAvatarImage(prev => (prev + 1) % 5); // 0 to 4
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Autoplay quiz images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuizImage(prev => (prev + 1) % 3); // 0 to 2
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Autoplay comunidade images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentComunidadeImage(prev => (prev + 1) % 4); // 0 to 3
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Autoplay team images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTeamImage(prev => (prev + 1) % teamMembers.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [teamMembers.length]);

  // Autoplay logistics images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogisticsImage(prev => (prev + 1) % logisticsMembers.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [logisticsMembers.length]);

  // Autoplay volunteers images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVolunteersImage(prev => (prev + 1) % volunteersMembers.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [volunteersMembers.length]);

  // Autoplay instructors images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentInstructorsImage(prev => (prev + 1) % instructorsMembers.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [instructorsMembers.length]);

  // Autoplay coordination images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCoordinationImage(prev => (prev + 1) % coordinationMembers.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [coordinationMembers.length]);

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
    'Denuncie o Racismo',
    'Conheça nossa<br /><span class="left-align">Equipe</span>',
    'Você não está só',
    'Sua Vida Existe',
    'Acesse nossa<br />Comunidade',
    'Nossa Ancestralidade Vive',
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
              Somos a Plataforma e Vivências Raízes, um projeto criado por alunos e educadores do SENAC Pernambuco com a missão de promover reconhecimento, reflexão e pertencimento racial por meio da tecnologia, cultura e educação. Nossa iniciativa nasce como um convite à escuta, à expressão e ao diálogo, valorizando as diversas identidades que compõem a sociedade brasileira.
            </p>
            <p>
              Acreditamos que o reconhecimento racial vai além da informação e vivência, é conexão, é olhar para si e para o outro com consciência e respeito. Por isso, unimos experiências digitais e presenciais para criar uma jornada transformadora durante a Semana da Consciência Racial.
            </p>
            <p>
              Na Plataforma Raízes, utilizamos gamificação e conteúdos acessíveis para incentivar a reflexão sobre identidade, diversidade, miscigenação e racismo estrutural. Já nas Vivências Raízes, ampliamos o diálogo para o ambiente físico, celebrando histórias, expressões culturais, arte, ancestralidade e protagonismo racial por meio de oficinas, rodas de conversa, apresentações e espaços de fala.
            </p>
            <p>
              Nosso propósito é fortalecer o senso de pertencimento, estimular o protagonismo estudantil e integrar práticas educativas e culturais de forma dinâmica e inclusiva. Mais do que isso, buscamos inspirar outras unidades do SENAC a replicarem esse movimento, contribuindo para uma educação que reconhece e valoriza a diversidade racial.
            </p>
            <p>
              Somos um projeto colaborativo, construído por pessoas que acreditam em uma sociedade mais justa, consciente e plural. Nosso trabalho reforça os compromissos da instituição com os Objetivos de Desenvolvimento Sustentável, especialmente Educação de Qualidade, Redução das Desigualdades e Paz e Instituições Eficazes.
            </p>
            <p>
              Plataforma e Vivências Raízes não é apenas um evento é um movimento.
              Um espaço de transformação, escuta e celebração das raízes que fortalecem nossa identidade coletiva.
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
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="equipe-card">
                {i === 1 ? (
                  <>
                    {logisticsMembers.map((member, index) => (
                      <img
                        key={index}
                        src={member.src}
                        alt={member.name}
                        className={`equipe-slide ${index === currentLogisticsImage ? 'active' : ''}`}
                        onError={(e) => {
                          console.log(`Imagem não encontrada: ${member.src}`);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ))}
                    <div className="equipe-cor">
                      <div className="equipe-legenda">
                        <div className="equipe-categoria">LOGÍSTICA</div>
                        <strong>{logisticsMembers[currentLogisticsImage].name}</strong><br />
                        {logisticsMembers[currentLogisticsImage].role}
                      </div>
                    </div>
                  </>
                ) : i === 2 ? (
                  <>
                    {teamMembers.map((member, index) => (
                      <img
                        key={index}
                        src={member.src}
                        alt={member.name}
                        className={`equipe-slide ${index === currentTeamImage ? 'active' : ''}`}
                        onError={(e) => {
                          console.log(`Imagem não encontrada: ${member.src}`);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ))}
                    <div className="equipe-cor">
                      <div className="equipe-legenda">
                        <div className="equipe-categoria">Desenvolvedores</div>
                        <strong>{teamMembers[currentTeamImage].name}</strong><br />
                        {teamMembers[currentTeamImage].role}
                      </div>
                    </div>
                  </>
                ) : i === 3 ? (
                  <>
                    {volunteersMembers.map((member, index) => (
                      <img
                        key={index}
                        src={member.src}
                        alt={member.name}
                        className={`equipe-slide ${index === currentVolunteersImage ? 'active' : ''}`}
                        onError={(e) => {
                          console.log(`Imagem não encontrada: ${member.src}`);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ))}
                    <div className="equipe-cor">
                      <div className="equipe-legenda">
                        <div className="equipe-categoria">Voluntários</div>
                        <strong>{volunteersMembers[currentVolunteersImage].name}</strong><br />
                        {volunteersMembers[currentVolunteersImage].role}
                      </div>
                    </div>
                  </>
                ) : i === 4 ? (
                  <>
                    {instructorsMembers.map((member, index) => (
                      <img
                        key={index}
                        src={member.src}
                        alt={member.name}
                        className={`equipe-slide ${index === currentInstructorsImage ? 'active' : ''}`}
                        onError={(e) => {
                          console.log(`Imagem não encontrada: ${member.src}`);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ))}
                    <div className="equipe-cor">
                      <div className="equipe-legenda">
                        <div className="equipe-categoria">Instrutores</div>
                        <strong>{instructorsMembers[currentInstructorsImage].name}</strong><br />
                        {instructorsMembers[currentInstructorsImage].role}
                      </div>
                    </div>
                  </>
                ) : i === 5 ? (
                  <>
                    {coordinationMembers.map((member, index) => (
                      <img
                        key={index}
                        src={member.src}
                        alt={member.name}
                        className={`equipe-slide ${index === currentCoordinationImage ? 'active' : ''}`}
                        onError={(e) => {
                          console.log(`Imagem não encontrada: ${member.src}`);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ))}
                    <div className="equipe-cor">
                      <div className="equipe-legenda">
                        <div className="equipe-categoria">coordenação pedagógica</div>
                        <strong>{coordinationMembers[currentCoordinationImage].name}</strong><br />
                        {coordinationMembers[currentCoordinationImage].role}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="equipe-foto"></div>
                    <div className="equipe-cor"></div>
                  </>
                )}
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
                <div className="gamificacao-avatar-slideshow">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <img
                      key={index}
                      src={`/landpage/gami/avatar_${index}.PNG`}
                      alt={`Avatar ${index}`}
                      className={`gamificacao-avatar-slide ${index === currentAvatarImage ? 'active' : ''}`}
                      onError={(e) => {
                        console.log(`Imagem não encontrada: /landpage/gami/avatar_${index}.PNG`);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ))}
                </div>
                <h3>Crie seu Avatar</h3>
                <p>Crie seu Avatar na gamificação, do seu jeito da forma como você se enxerga!</p>
                <img src="/landpage/characters/avatar.png" alt="Avatar" className="gamificacao-character" />
              </div>
              <div className="gamificacao-card">
                <div className="gamificacao-quiz-slideshow">
                  {[0, 1, 2].map((index) => (
                    <img
                      key={index}
                      src={`/landpage/gami/Quiz_${index}.PNG`}
                      alt={`Quiz ${index}`}
                      className={`gamificacao-quiz-slide ${index === currentQuizImage ? 'active' : ''}`}
                      onError={(e) => {
                        console.log(`Imagem não encontrada: /landpage/gami/Quiz_${index}.PNG`);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ))}
                </div>
                <h3>Quiz</h3>
                <p>Participe do quiz da comunidade! Aprenda como combater o racismo e lidar com situações.</p>
                <img src="/landpage/characters/Quiz.png" alt="Quiz" className="gamificacao-character" />
              </div>
              <div className="gamificacao-card">
                <div className="gamificacao-comunidade-slideshow">
                  {[0, 1, 2, 3].map((index) => (
                    <img
                      key={index}
                      src={`/landpage/gami/comunidade_${index}.PNG`}
                      alt={`Comunidade ${index}`}
                      className={`gamificacao-comunidade-slide ${index === currentComunidadeImage ? 'active' : ''}`}
                      onError={(e) => {
                        console.log(`Imagem não encontrada: /landpage/gami/comunidade_${index}.PNG`);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ))}
                </div>
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