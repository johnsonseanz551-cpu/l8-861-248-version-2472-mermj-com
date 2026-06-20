
import { movieCatalog } from './catalog.js';

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function card(movie) {
  const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
    return '<span>' + escapeHtml(tag) + '</span>';
  }).join('');

  return '' +
    '<article class="movie-card">' +
      '<a class="movie-card__cover" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">' +
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="movie-card__score">' + escapeHtml(movie.rating) + '</span>' +
        '<span class="movie-card__play">播放</span>' +
      '</a>' +
      '<div class="movie-card__body">' +
        '<div class="movie-card__meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</div>' +
        '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
        '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
    '</article>';
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function searchMovies(query) {
  const keyword = normalize(query);

  if (!keyword) {
    return [];
  }

  return movieCatalog.filter(function (movie) {
    const text = normalize([
      movie.title,
      movie.year,
      movie.region,
      movie.type,
      movie.genre,
      (movie.tags || []).join(' '),
      movie.oneLine
    ].join(' '));

    return text.indexOf(keyword) !== -1;
  }).slice(0, 80);
}

export function initSearchPage() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q') || '';
  const input = document.getElementById('search-input');
  const box = document.getElementById('search-results');
  const block = document.querySelector('.search-results-block');

  if (input) {
    input.value = query;
  }

  if (!box) {
    return;
  }

  const results = searchMovies(query);

  if (!query || !results.length) {
    box.innerHTML = '';
    if (block) {
      block.classList.add('is-empty');
    }
    return;
  }

  if (block) {
    block.classList.remove('is-empty');
  }

  box.innerHTML = results.map(card).join('');
}
