// Limita os caracteres do parágrafo do slider e adiciona "..." + botão "ler mais" com link.
document.addEventListener("DOMContentLoaded", function() {
    // Limita o texto do parágrafo do slider.
    const slideParagraphs = document.querySelectorAll(".slide-paragraph");

    slideParagraphs.forEach((slideParagraph) => {
        const textLimit = 100;
        const fullText = slideParagraph.innerText;
        const aTag = slideParagraph.querySelector(".paragraph-anchor-tag");
        
        if(slideParagraph.innerText.length > textLimit){
            slideParagraph.innerHTML = fullText.substring(0, textLimit) + "... " + aTag.innerHTML;
        }
    });

    // Limita o texto do parágrafo dos cards de vídeo.
    const videoParagraphs = document.querySelectorAll(".video-paragraph");

    videoParagraphs.forEach((videoParagraph) => {
        const textLimit = 150;
        const fullText = videoParagraph.innerText;
        const aTag = videoParagraph.querySelector(".video-anchor-tag");
        
        if(videoParagraph.innerText.length > textLimit){
            videoParagraph.innerHTML = fullText.substring(0, textLimit) + "... " + aTag.innerHTML;
        }
    });
});

// Carrega o primeiro slide
window.addEventListener("DOMContentLoaded", () => {
    const firstSlide = document.querySelector(".first-slide");
    const firstSlideBtn = document.querySelector(".first-slide-btn");
    const firstIndicatorBar = document.querySelector(".first-indicator-bar");

    setTimeout(() => {
        firstSlide.classList.add("active");
    }, 300);

    firstSlideBtn.classList.add("active");
    firstIndicatorBar.classList.add("active");
});

// JavaScript para o slider
const slider = document.querySelector(".slider");
const slides = slider.querySelectorAll(".slide");
const numberOfSlides = slides.length;
const slideBtns = document.querySelectorAll(".slide-btn");
const slideIndicatorBars = document.querySelectorAll(".indicator-bar");
var slideNumber = 0;

// Reprodução automática do slider
var playSlider;

var repeater = () => {
    playSlider = setInterval(function() {
        slides.forEach((slide) => {
            slide.classList.remove("active");
        });
    
        slideBtns.forEach((slideBtn) => {
            slideBtn.classList.remove("active");
        });
    
        slideIndicatorBars.forEach((slideIndicatorBar) => {
            slideIndicatorBar.classList.remove("active");
        });
    
        slideNumber++;
    
        if(slideNumber > (numberOfSlides - 1)){
            slideNumber = 0;
        }
    
        slides[slideNumber].classList.add("active");
        slideBtns[slideNumber].classList.add("active");
        slideIndicatorBars[slideNumber].classList.add("active");
    }, 8500);
}
repeater();

// Navegação pelos botões próximo/anterior do slider.
const nextBtn = document.querySelector(".next-btn");
const prevBtn = document.querySelector(".prev-btn");

// Ação do botão "próximo" do slider.
nextBtn.addEventListener("click", () => {
    slides.forEach((slide) => {
        slide.classList.remove("active");
    });

    slideBtns.forEach((slideBtn) => {
        slideBtn.classList.remove("active");
    });

    slideIndicatorBars.forEach((slideIndicatorBar) => {
        slideIndicatorBar.classList.remove("active");
    });

    slideNumber++;

    if(slideNumber > (numberOfSlides - 1)){
        slideNumber = 0;
    }

    slides[slideNumber].classList.add("active");
    slideBtns[slideNumber].classList.add("active");
    slideIndicatorBars[slideNumber].classList.add("active");

    clearInterval(playSlider);
    repeater();
});

// Ação do botão "anterior" do slider.
prevBtn.addEventListener("click", () => {
    slides.forEach((slide) => {
        slide.classList.remove("active");
    });

    slideBtns.forEach((slideBtn) => {
        slideBtn.classList.remove("active");
    });

    slideIndicatorBars.forEach((slideIndicatorBar) => {
        slideIndicatorBar.classList.remove("active");
    });

    slideNumber--;

    if(slideNumber < 0){
        slideNumber = numberOfSlides - 1;
    }

    slides[slideNumber].classList.add("active");
    slideBtns[slideNumber].classList.add("active");
    slideIndicatorBars[slideNumber].classList.add("active");

    clearInterval(playSlider);
    repeater();
});

// Paginação do slider.
var slideBtnNav = function(slideBtnClick){
    slides.forEach((slide) => {
        slide.classList.remove("active");
    });

    slideBtns.forEach((slideBtn) => {
        slideBtn.classList.remove("active");
    });

    slideIndicatorBars.forEach((slideIndicatorBar) => {
        slideIndicatorBar.classList.remove("active");
    });

    slides[slideBtnClick].classList.add("active");
    slideBtns[slideBtnClick].classList.add("active");
    slideIndicatorBars[slideBtnClick].classList.add("active");
}

slideBtns.forEach((slideBtn, i) => {
    slideBtn.addEventListener("click", () => {
        slideBtnNav(i);
        clearInterval(playSlider);
        repeater();
        slideNumber = i;
    });
});

// JavaScript para modais de vídeo.
slides.forEach((slide, i) => {
    let watchVideoBtn = slide.querySelector(".watch-video-btn");
    let slideVideoModal = slide.querySelector(".slide-video-modal");
    let videoModalContent = slide.querySelector(".video-modal-content");
    let videoCloseBtn = slide.querySelector(".video-close-btn");
    let animalVideo = slide.querySelector(".animal-video");

    // Abre o modal de vídeo ao clicar no botão de assistir.
    watchVideoBtn.addEventListener("click", () => {
        slideVideoModal.classList.add("active");

        setTimeout(() => {
            videoModalContent.classList.add("active");
        }, 300);

        // Reproduz o vídeo do animal ao clicar no botão de assistir.
        animalVideo.play();

        // Para a reprodução automática do slider ao clicar no botão de assistir.
        if(slideVideoModal.classList.contains("active")){
            clearInterval(playSlider);
        }
    });

    // Reinicia o tempo de autoplay do slide ao passar o mouse sobre o modal de vídeo do slide.
    // slideVideoModal.addEventListener("mouseover", () => {
    //     clearInterval(playSlider);
    // });

    // Fecha os modais de vídeo ao clicar no botão de fechar.
    const videoClose = function(closeBtnClick){
        // Reinicia a barra indicadora do slide atual ao clicar no botão de fechar o vídeo.
        slideIndicatorBars.forEach((slideIndicatorBar) => {
            slideIndicatorBar.classList.remove("active");
        });
        
        setTimeout(() => {
            slideIndicatorBars[closeBtnClick].classList.add("active");
        }, 0);
    }

    videoCloseBtn.addEventListener("click", () => {
        slideVideoModal.classList.remove("active");
        videoModalContent.classList.remove("active");

        slideIndicatorBars.forEach((slideIndicatorBar) => {
            slideIndicatorBar.classList.remove("active");
        });

        // Pause animal video on click video close button.
        animalVideo.pause();

        clearInterval(playSlider);
        repeater();
        videoClose(i);
    });
});

// Cabeçalho fixo (sticky), rolagem suave e destaque do link ativo
document.addEventListener('DOMContentLoaded', function() {
    const header = document.getElementById('site-header');
    const nav = document.getElementById('site-nav');
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = nav.querySelectorAll('a[data-target]');

    // Alterna o menu móvel
    navToggle.addEventListener('click', () => {
        header.classList.toggle('open');
    });

    // Comportamento de rolagem suave para os links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-target');
            const targetEl = document.getElementById(targetId);
            if(!targetEl) return;

            // Fecha o menu móvel se estiver aberto
            if(header.classList.contains('open')) header.classList.remove('open');

            const headerOffset = header.offsetHeight + 8; // pequeno deslocamento
            const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - headerOffset;

            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        });
    });

    // Destaca o link ativo da navegação enquanto a página é rolada
    const sections = Array.from(navLinks).map(l => document.getElementById(l.getAttribute('data-target'))).filter(Boolean);

    const observerOptions = { root: null, rootMargin: '0px 0px -60% 0px', threshold: 0 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.id;
            const navLink = nav.querySelector(`a[data-target="${id}"]`);
            if(entry.isIntersecting){
                navLinks.forEach(n => n.classList.remove('active'));
                if(navLink) navLink.classList.add('active');
            }
        });
    }, observerOptions);

    sections.forEach(s => observer.observe(s));

    // Adiciona a classe 'sticky' ao rolar para efeito de sombra
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const current = window.pageYOffset;
        if(current > 10) header.classList.add('sticky'); else header.classList.remove('sticky');
        lastScroll = current;
    }, { passive: true });
});