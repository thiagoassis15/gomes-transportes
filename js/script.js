/* ==========================================================================
   GOMES TRANSPORTES — Interações (versão final)
   ========================================================================== */

(function () {
  'use strict';

  let caminhoneirosData = [];

  /* -------------------- Carregar dados -------------------- */
  function carregarCaminhoneiros() {
    fetch('data/caminhoneiros.json')
      .then(response => {
        if (!response.ok) throw new Error('Erro ao carregar dados');
        return response.json();
      })
      .then(data => {
        caminhoneirosData = data.caminhoneiros || [];
        renderizarCaminhoneiros(caminhoneirosData);
        const filterAtivo = document.querySelector('.filter-btn.is-active');
        if (filterAtivo) applyFilter(filterAtivo.getAttribute('data-filter'));
        observeElements();
      })
      .catch(error => {
        console.error('Erro ao carregar caminhoneiros:', error);
      });
  }

  /* -------------------- Embaralhar array (Fisher-Yates) -------------------- */
  function shuffleArray(array) {
    const arr = [...array]; // Cria uma cópia para não modificar o original
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /* -------------------- Renderizar cards -------------------- */
  function renderizarCaminhoneiros(caminhoneiros) {
    const grid = document.getElementById('fleetGrid');
    if (!grid) return;
    const emptyMsg = document.getElementById('fleetEmpty');
    grid.innerHTML = '';
    if (emptyMsg) grid.appendChild(emptyMsg);

    // EMBARALHA OS CAMINHONEIROS ANTES DE RENDERIZAR
    const shuffled = shuffleArray(caminhoneiros);

    shuffled.forEach((caminhoneiro) => {
      const card = criarCardCaminhoneiro(caminhoneiro);
      grid.insertBefore(card, emptyMsg);
    });
  }

  /* -------------------- Criar card com mosaico -------------------- */
  function criarCardCaminhoneiro(data) {
    const article = document.createElement('article');
    article.className = 'truck-card';
    article.setAttribute('data-type', data.tipo);
    article.setAttribute('data-id', data.id);

    const totalFotos = data.fotos.length;

    // Mosaic - CONTAINER PRINCIPAL
    const mosaic = document.createElement('div');
    mosaic.className = 'mosaic';
    mosaic.setAttribute('data-gallery', data.id);

    // ==================== LINHA 1 ====================
    const rowTop = document.createElement('div');
    rowTop.className = 'mosaic__row-top';

    // FOTO 1 - 80% da largura
    const cell1 = document.createElement('div');
    cell1.className = 'mosaic__cell';
    cell1.setAttribute('data-index', '0');

    const img1 = document.createElement('img');
    const src1 = data.fotos[0];
    img1.src = (src1.startsWith('http://') || src1.startsWith('https://')) ? src1 : `images/caminhoes/${src1}`;
    img1.alt = `Caminhão ${data.nome} - principal`;
    img1.onerror = function () {
      this.style.display = 'none';
      const fallback = document.createElement('span');
      fallback.className = 'media-placeholder__label';
      fallback.textContent = '[Foto]';
      cell1.appendChild(fallback);
    };
    cell1.appendChild(img1);
    cell1.addEventListener('click', function() {
      openLightbox(data.id, 0, totalFotos);
    });
    rowTop.appendChild(cell1);

    // FOTO 2 - 20% da largura (com "ver mais +X")
    const cell2 = document.createElement('div');
    cell2.className = 'mosaic__cell';
    cell2.setAttribute('data-index', '1');

    if (totalFotos > 1) {
      const img2 = document.createElement('img');
      const src2 = data.fotos[1];
      img2.src = (src2.startsWith('http://') || src2.startsWith('https://')) ? src2 : `images/caminhoes/${src2}`;
      img2.alt = `Caminhão ${data.nome} - foto 2`;
      img2.onerror = function () { this.style.display = 'none'; };
      cell2.appendChild(img2);
    }

    // Se tiver mais de 3 fotos, coloca overlay "ver mais +X"
    if (totalFotos > 3) {
      const overlay = document.createElement('div');
      overlay.className = 'mosaic__more';
      const restantes = totalFotos - 3;
      overlay.innerHTML = `<span>+${restantes}</span>ver mais`;
      cell2.appendChild(overlay);
      cell2.addEventListener('click', function(e) {
        e.stopPropagation();
        openLightbox(data.id, 3, totalFotos);
      });
    } else {
      cell2.addEventListener('click', function() {
        const idx = parseInt(this.getAttribute('data-index'), 10);
        if (!isNaN(idx)) openLightbox(data.id, idx, totalFotos);
      });
    }
    rowTop.appendChild(cell2);

    mosaic.appendChild(rowTop);

    // ==================== LINHA 2 ====================
    const rowBottom = document.createElement('div');
    rowBottom.className = 'mosaic__row-bottom';

    // FOTO 3 - 50% da largura
    const cell3 = document.createElement('div');
    cell3.className = 'mosaic__cell';
    cell3.setAttribute('data-index', '2');

    if (totalFotos > 2) {
      const img3 = document.createElement('img');
      const src3 = data.fotos[2];
      img3.src = (src3.startsWith('http://') || src3.startsWith('https://')) ? src3 : `images/caminhoes/${src3}`;
      img3.alt = `Caminhão ${data.nome} - foto 3`;
      img3.onerror = function () { this.style.display = 'none'; };
      cell3.appendChild(img3);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'media-placeholder';
      placeholder.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="6" width="18" height="12" rx="1"/><circle cx="8" cy="10.5" r="1.6"/></svg><span class="media-placeholder__label">[Foto]</span>`;
      cell3.appendChild(placeholder);
    }
    cell3.addEventListener('click', function() {
      const idx = parseInt(this.getAttribute('data-index'), 10);
      if (!isNaN(idx)) openLightbox(data.id, idx, totalFotos);
    });
    rowBottom.appendChild(cell3);

    // FOTO 4 - 50% da largura
    const cell4 = document.createElement('div');
    cell4.className = 'mosaic__cell';
    cell4.setAttribute('data-index', '3');

    if (totalFotos > 3) {
      const img4 = document.createElement('img');
      const src4 = data.fotos[3];
      img4.src = (src4.startsWith('http://') || src4.startsWith('https://')) ? src4 : `images/caminhoes/${src4}`;
      img4.alt = `Caminhão ${data.nome} - foto 4`;
      img4.onerror = function () { this.style.display = 'none'; };
      cell4.appendChild(img4);
    } else if (totalFotos === 3) {
      const img3b = document.createElement('img');
      const src3b = data.fotos[2];
      img3b.src = (src3b.startsWith('http://') || src3b.startsWith('https://')) ? src3b : `images/caminhoes/${src3b}`;
      img3b.alt = `Caminhão ${data.nome} - foto 3`;
      img3b.onerror = function () { this.style.display = 'none'; };
      cell4.appendChild(img3b);
      cell4.setAttribute('data-index', '2');
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'media-placeholder';
      placeholder.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="6" width="18" height="12" rx="1"/><circle cx="8" cy="10.5" r="1.6"/></svg><span class="media-placeholder__label">[Foto]</span>`;
      cell4.appendChild(placeholder);
    }
    cell4.addEventListener('click', function() {
      const idx = parseInt(this.getAttribute('data-index'), 10);
      if (!isNaN(idx)) openLightbox(data.id, idx, totalFotos);
    });
    rowBottom.appendChild(cell4);

    mosaic.appendChild(rowBottom);

    // --- BODY ---
    const body = document.createElement('div');
    body.className = 'truck-card__body';

    const head = document.createElement('div');
    head.className = 'truck-card__head';
    head.innerHTML = `
      <div>
        <h3>${data.nome}</h3>
        <p>${data.cargo}</p>
      </div>
      <span class="truck-card__type">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
          <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/>
          <circle cx="7" cy="18" r="1.6"/>
          <circle cx="17.5" cy="18" r="1.6"/>
        </svg>
        ${data.tipoLabel}
      </span>
    `;

    const specs = document.createElement('div');
    specs.className = 'truck-card__specs';
    specs.textContent = data.especificacoes || '';

    // Botão WhatsApp - ABRE O MODAL
    const waBtn = document.createElement('a');
    waBtn.href = '#';
    waBtn.className = 'btn btn--whatsapp btn--block';
    waBtn.setAttribute('data-event', 'truck_whatsapp_click');
    waBtn.setAttribute('data-driver', data.id);
    waBtn.innerHTML = `
      <svg class="btn-wa-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.2-.4.1-.2 0-.3 0-.5s-.6-1.5-.9-2c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3 4.8 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.5-.3z"/>
        <path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.7 1.5 5.3L2 22l4.9-1.3c1.5.8 3.3 1.3 5.1 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.7 0-3.3-.5-4.7-1.3l-.3-.2-3.1.8.8-3-.2-.3C3.6 14.4 3.1 12.7 3.1 12c0-4.9 4-8.9 8.9-8.9s8.9 4 8.9 8.9-4 8.9-8.9 8.9z"/>
      </svg>
      Falar com ${data.nome.split(' ')[0]}
    `;

    // Ao invés de link direto, abre o modal
    waBtn.addEventListener('click', function(e) {
      e.preventDefault();
      // Pega o número e o nome do caminhoneiro
      const phone = data.whatsapp;
      const nome = data.nome;
      // Abre o modal (função global)
      if (typeof openModalWa === 'function') {
        openModalWa(nome, phone, nome);
      } else {
        // Fallback: vai direto pro WhatsApp se o modal não carregar
        const msg = `Olá, vi o caminhão do ${nome} no site Gomes Transportes e gostaria de solicitar um orçamento.`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
      }
    });

    const tagbar = document.createElement('div');
    tagbar.className = 'truck-card__tagbar';
    tagbar.innerHTML = `
      <span class="truck-card__id-group">
        <img src="images/logo-icon.png" alt="" class="truck-card__seal">
        <span>Caminhão <strong>${data.modelo || ''}</strong></span>
      </span>
      <span class="truck-card__status">${data.status}</span>
    `;

    body.appendChild(head);
    body.appendChild(specs);
    body.appendChild(waBtn);

    article.appendChild(tagbar);
    article.appendChild(mosaic);
    article.appendChild(body);

    return article;
  }

  /* -------------------- Filtros (com embaralhamento) -------------------- */
  function applyFilter(type) {
    const grid = document.getElementById('fleetGrid');
    const emptyMsg = document.getElementById('fleetEmpty');
    const cards = document.querySelectorAll('.truck-card');
    
    // 1. SEPARA OS CARDS POR CATEGORIA
    const visibleCards = [];
    const hiddenCards = [];
    
    cards.forEach(card => {
      const matches = type === 'todos' || card.getAttribute('data-type') === type;
      if (matches) {
        visibleCards.push(card);
      } else {
        hiddenCards.push(card);
      }
    });

    // 2. EMBARALHA APENAS OS CARDS VISÍVEIS
    const shuffledVisible = shuffleArray(visibleCards);

    // 3. REMOVE TODOS OS CARDS DO GRID
    cards.forEach(card => card.remove());

    // 4. ADICIONA OS CARDS NA ORDEM: PRIMEIRO OS VISÍVEIS (EMBARALHADOS), DEPOIS OS OCULTOS
    const allCards = [...shuffledVisible, ...hiddenCards];
    
    allCards.forEach(card => {
      grid.insertBefore(card, emptyMsg);
    });

    // 5. APLICA O FILTRO (ESCONDE OS QUE NÃO CORRESPONDEM)
    let visibleCount = 0;
    document.querySelectorAll('.truck-card').forEach(card => {
      const matches = type === 'todos' || card.getAttribute('data-type') === type;
      card.hidden = !matches;
      if (matches) visibleCount++;
    });

    if (emptyMsg) emptyMsg.hidden = visibleCount !== 0;
  }

  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      filterButtons.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      this.classList.add('is-active');
      this.setAttribute('aria-selected', 'true');
      applyFilter(this.getAttribute('data-filter'));
    });
  });

  /* -------------------- Lightbox -------------------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxDriver = document.getElementById('lightboxDriver');

  let currentGallery = { driver: '', total: 0, index: 0 };

  function openLightbox(driverKey, index, total) {
    currentGallery = { driver: driverKey, total: total || 12, index: index || 0 };
    updateLightbox();
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (lightboxClose) lightboxClose.focus();
  }
  window.openLightbox = openLightbox;

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function updateLightbox() {
    if (lightboxCounter) {
      lightboxCounter.textContent = (currentGallery.index + 1) + ' / ' + currentGallery.total;
    }
    if (lightboxDriver) {
      const driver = caminhoneirosData.find(d => d.id === currentGallery.driver);
      lightboxDriver.textContent = driver ? `${driver.nome} — Caminhão ${driver.tipoLabel}` : 'Galeria de fotos';
    }
    const frame = document.querySelector('.lightbox__frame');
    if (frame && currentGallery.driver) {
      const driver = caminhoneirosData.find(d => d.id === currentGallery.driver);
      if (driver && driver.fotos[currentGallery.index]) {
        frame.innerHTML = '';
        const img = document.createElement('img');
        const src = driver.fotos[currentGallery.index];
        img.src = (src.startsWith('http://') || src.startsWith('https://')) ? src : `images/caminhoes/${src}`;
        img.alt = `Caminhão ${driver.nome} - Foto ${currentGallery.index+1}`;
        img.style.cssText = 'width:100%;height:100%;object-fit:contain;';
        img.onerror = function () {
          this.style.display = 'none';
          frame.innerHTML = `
            <div class="media-placeholder" style="height:100%;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:34px;height:34px;opacity:.8;">
                <rect x="3" y="6" width="18" height="12" rx="1"/>
                <circle cx="8" cy="10.5" r="1.6"/>
              </svg>
              <span class="media-placeholder__label">[Foto ${currentGallery.index+1}]</span>
            </div>
          `;
        };
        frame.appendChild(img);
      }
    }
  }

  function navigate(delta) {
    const total = currentGallery.total;
    currentGallery.index = (currentGallery.index + delta + total) % total;
    updateLightbox();
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => navigate(-1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => navigate(1));
  if (lightbox) {
    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', e => {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });

  (function () {
    if (!lightbox) return;
    let startX = null;
    lightbox.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', e => {
      if (startX === null) return;
      const diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 40) navigate(diff > 0 ? -1 : 1);
      startX = null;
    }, { passive: true });
  })();

  /* -------------------- Animações -------------------- */
  function observeElements() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -20px 0px' });

    document.querySelectorAll('.service-card, .work-card').forEach(el => observer.observe(el));
  }

  /* -------------------- Vídeo do hero -------------------- */
  function initHeroVideo() {
    const heroVideo = document.querySelector('.hero__media video');
    if (!heroVideo) return;

    heroVideo.muted = true;
    heroVideo.play().catch(function(e) {
      console.log('Vídeo não reproduziu automaticamente');
      document.addEventListener('click', function playOnce() {
        heroVideo.play().catch(function() {});
        document.removeEventListener('click', playOnce);
      }, { once: true });
    });
  }

  /* -------------------- Menu mobile -------------------- */
  function initMobileMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileNav = document.getElementById('mobileNav');
    if (!hamburgerBtn || !mobileNav) return;
    hamburgerBtn.addEventListener('click', function () {
      const isOpen = mobileNav.classList.toggle('is-open');
      this.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      this.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('is-open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* -------------------- FAQ -------------------- */
  function initFaq() {
    document.querySelectorAll('.faq-item__q').forEach(btn => {
      btn.addEventListener('click', function () {
        const item = this.closest('.faq-item');
        const isOpen = item.classList.contains('is-open');
        document.querySelectorAll('.faq-item.is-open').forEach(openItem => {
          if (openItem !== item) {
            openItem.classList.remove('is-open');
            openItem.querySelector('.faq-item__q').setAttribute('aria-expanded', 'false');
          }
        });
        item.classList.toggle('is-open', !isOpen);
        this.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
      });
    });
  }

  /* -------------------- Analytics -------------------- */
  function initAnalytics() {
    function trackEvent(eventName, params) {
      if (window.gtag) window.gtag('event', eventName, params || {});
      if (window.dataLayer) window.dataLayer.push(Object.assign({ event: eventName }, params || {}));
    }
    document.querySelectorAll('[data-event]').forEach(el => {
      el.addEventListener('click', function () {
        trackEvent(this.getAttribute('data-event'), {
          source: this.getAttribute('data-source') || undefined,
          driver: this.getAttribute('data-driver') || undefined
        });
      });
    });
    document.querySelectorAll('a[href^="tel:"]').forEach(el => {
      el.addEventListener('click', () => trackEvent('phone_click', {}));
    });
  }

  /* -------------------- Inicialização -------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeroVideo();
    initFaq();
    initAnalytics();
    carregarCaminhoneiros();
    observeMap();
    initScrollEffects();
    initActiveMenu();
    initModalWa();
  });

})();
/* -------------------- Animações do mapa -------------------- */
function observeMap() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const map = entry.target;
        
        // Passo 1: Adiciona 'reveal' para dar zoom
        map.classList.add('reveal');
        
        // Passo 2: Depois de 2.5 segundos, remove 'reveal' e adiciona 'zoom-back'
        setTimeout(() => {
          map.classList.remove('reveal');  // Remove a classe que mantém o zoom
          map.classList.add('zoom-back');  // Volta ao normal
        }, 1500);  // 0.5s delay + 2s zoom = 2.5s
        
        observer.unobserve(map);
      }
    });
  }, {
    threshold: 0.2
  });

  const map = document.querySelector('.regions__map');
  if (map) {
    observer.observe(map);
  }
}

function initScrollEffects() {
  const cards = document.querySelectorAll('.service-card');
  
  function updateCards() {
    const windowHeight = window.innerHeight;
    const scrollY = window.scrollY;

    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.top + (rect.height / 2);
      const viewportCenter = windowHeight / 2;

      let distance = (cardCenter - viewportCenter) / (windowHeight / 2);
      distance = Math.min(Math.max(distance, -1), 1);

      // Múltiplos efeitos
      const opacity = 1 - Math.abs(distance) * 0.7;
      const translateY = distance * 30;
      const scale = 1 - Math.abs(distance) * 0.08;
      const rotate = distance * 3;

      const delay = index * 0.05;
      
      requestAnimationFrame(() => {
        card.style.opacity = Math.max(opacity, 0.15);
        card.style.transform = `translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`;
        card.style.transition = `all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
      });
    });
  }

  window.addEventListener('scroll', updateCards, { passive: true });
  window.addEventListener('resize', updateCards);
  updateCards();
}
/* -------------------- Menu ativo (scroll + clique) -------------------- */
function initActiveMenu() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__list a, .mobile-nav__list a');

  // Atualiza pelo scroll
  function updateActiveLink() {
    const scrollY = window.scrollY + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('is-active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('is-active');
          }
        });
      }
    });
  }

  // Atualiza pelo clique
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      navLinks.forEach(l => l.classList.remove('is-active'));
      this.classList.add('is-active');

      // Fecha o menu mobile se estiver aberto
      const mobileNav = document.getElementById('mobileNav');
      if (mobileNav && mobileNav.classList.contains('is-open')) {
        mobileNav.classList.remove('is-open');
        document.getElementById('hamburgerBtn').setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  });

  window.addEventListener('scroll', updateActiveLink);
  window.addEventListener('load', updateActiveLink);
}

/* -------------------- Modal WhatsApp -------------------- */
function initModalWa() {
  const modal = document.getElementById('modalWa');
  const overlay = document.getElementById('modalWaOverlay');
  const closeBtn = document.getElementById('modalWaClose');
  const driverName = document.getElementById('modalDriverName');
  const options = document.querySelectorAll('.modal-wa__option');
  
  let currentDriver = null;
  let currentPhone = null;

  // Função para abrir o modal
  window.openModalWa = function(driver, phone, nomeCompleto) {
    currentDriver = driver;
    currentPhone = phone;
    driverName.textContent = nomeCompleto.split(' ')[0]; // Só o primeiro nome
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  // Função para fechar o modal
  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    currentDriver = null;
    currentPhone = null;
  }

  // Evento de clique nas opções (Mudança / Frete)
  options.forEach(option => {
    option.addEventListener('click', function() {
      const servico = this.getAttribute('data-servico');
      const nome = currentDriver;
      const telefone = currentPhone;
      
      if (!telefone || !nome) return;

      // Monta a mensagem
      let mensagem = '';
      if (servico === 'mudanca') {
        mensagem = `Olá, vi o caminhão do ${nome} no site Gomes Transportes e gostaria de solicitar um orçamento para uma MUDANÇA.`;
      } else {
        mensagem = `Olá, vi o caminhão do ${nome} no site Gomes Transportes e gostaria de solicitar um orçamento para um FRETE.`;
      }

      // Abre o WhatsApp
      const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
      window.open(url, '_blank');
      
      // Fecha o modal
      closeModal();
    });
  });

  // Fechar ao clicar no X
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  // Fechar ao clicar no overlay
  if (overlay) {
    overlay.addEventListener('click', closeModal);
  }

  // Fechar com ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
}