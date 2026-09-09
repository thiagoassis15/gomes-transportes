/* ==========================================================================
   GOMES TRANSPORTES — Página de Regiões
   ========================================================================== */

(function () {
  'use strict';

  /* -------------------- Carregar regiões do JSON -------------------- */
  function carregarRegioes() {
    fetch('data/regioes.json')
      .then(response => {
        if (!response.ok) throw new Error('Erro ao carregar regiões');
        return response.json();
      })
      .then(data => {
        renderizarRegioes(data.regioes);
      })
      .catch(error => {
        console.error('Erro ao carregar regiões:', error);
        document.querySelector('.regions-loading').textContent = 'Erro ao carregar regiões. Tente novamente.';
      });
  }

  /* -------------------- Renderizar regiões -------------------- */
  function renderizarRegioes(regioes) {
    const grid = document.getElementById('regionsGrid');
    if (!grid) return;

    grid.innerHTML = '';

    // Cores para cada região (alternadas)
    const cores = ['navy', 'gold', 'navy', 'gold'];

    Object.keys(regioes).forEach((key, index) => {
      const regiao = regioes[key];
      const cor = cores[index % cores.length];

      const card = document.createElement('div');
      card.className = `region-card region-card--${cor}`;

      // MOSTRA TODOS OS BAIRROS SEM LIMITE
      const todosBairros = regiao.bairros.map(bairro => 
        `<span class="region-tag">${bairro}</span>`
      ).join('');

      card.innerHTML = `
        <div class="region-card__header">
          <h3>${regiao.nome}</h3>
          <span class="region-card__badge">${regiao.bairros.length} bairros</span>
        </div>
        <p class="region-card__desc">${regiao.descricao}</p>
        <div class="region-card__tags">
          ${todosBairros}
        </div>
      `;

      grid.appendChild(card);

      // Animação de entrada com delay
      setTimeout(() => {
        card.classList.add('reveal');
      }, index * 100);
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

  /* -------------------- Inicialização -------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    carregarRegioes();
  });

})();