import { galerije, videi } from './portfolio-data.js';

// Portfolio radi neovisno o prijavi i Firestoreu.
class Projekt {
    constructor(podaci) { Object.assign(this, podaci); }
    kartica() {
        const article = document.createElement('article');
        article.className = 'portfolio-kartica rad-kartica';
        article.dataset.kategorija = this.category;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'rad-otvori';
        button.setAttribute('aria-haspopup', 'dialog');
        button.setAttribute('aria-label', `${this.type === 'video' ? 'Pogledaj' : 'Otvori galeriju'}: ${this.title}`);
        const media = document.createElement('div');
        media.className = 'rad-medij';
        const image = document.createElement('img');
        image.src = this.cover;
        image.alt = this.alt;
        image.loading = 'lazy';
        image.decoding = 'async';
        image.width = 800;
        image.height = 500;
        if (this.coverPosition) image.style.objectPosition = this.coverPosition;
        media.append(image);
        const badge = document.createElement('span');
        badge.className = 'rad-oznaka';
        badge.textContent = this.badge;
        media.append(badge);
        const action = document.createElement('span');
        action.className = 'rad-ikona';
        action.textContent = this.type === 'video' ? '▶' : '+';
        action.setAttribute('aria-hidden', 'true');
        media.append(action);
        const info = document.createElement('div');
        info.className = 'portfolio-kartica-sadrzaj';
        const label = document.createElement('span');
        label.textContent = this.label;
        const title = document.createElement('h3');
        title.textContent = this.title;
        const description = document.createElement('p');
        description.textContent = this.description;
        info.append(label, title, description);
        button.append(media, info);
        button.addEventListener('click', () => otvori(this, button));
        article.append(button);
        return article;
    }
}

class VideoProjekt extends Projekt {
    constructor(video) {
        super({ ...video, category: video.category || 'fpv', type: 'video', label: video.label || 'FPV video', cover: video.poster,
            alt: `Kadar iz videa ${video.title.toLowerCase()}`, badge: trajanje(video.duration),
            description: video.description || (video.id === 'video-01' ? 'FPV pogled na autokuću i njezin prostor.' : video.id === 'video-07' ? 'Vikendica iz perspektive FPV kamere.' : 'Pogledajte prostor iz nove perspektive.') });
    }
}

function trajanje(seconds) {
    const total = Math.round(seconds);
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

const grid = document.querySelector('#portfolio-grid');
const dialog = document.querySelector('#portfolio-dialog');
const stage = document.querySelector('#galerija-medij');
const title = document.querySelector('#galerija-naslov');
const caption = document.querySelector('#galerija-opis');
const counter = document.querySelector('#galerija-broj');
const previous = document.querySelector('#galerija-prethodna');
const next = document.querySelector('#galerija-sljedeca');
const close = document.querySelector('#galerija-zatvori');
const thumbs = document.querySelector('#galerija-slicice');
const error = document.querySelector('#galerija-greska');
const direct = document.querySelector('#galerija-izravno');
const videoProjects = videi.map(video => new VideoProjekt(video));
const projects = [ ...galerije.map(gallery => new Projekt({ ...gallery, type: 'gallery' })), ...videoProjects ];
const selectedPhotos = [galerije[0].photos.find(p => p.id === 'nekretnine-07'), galerije[0].photos.find(p => p.id === 'nekretnine-01'), galerije[1].photos.find(p => p.id === 'koncerti-05'), galerije[1].photos.find(p => p.id === 'koncerti-17')];
const featured = [videoProjects[0], videoProjects[6], ...selectedPhotos.map((photo, i) => new Projekt({
    type: 'gallery', category: i < 2 ? 'nekretnine' : 'koncerti', label: i < 2 ? 'Nekretnine' : 'Koncerti',
    title: ['Kuća u večernjem svjetlu', 'Toplina drvenog interijera', 'Glazba u prvom planu', 'Pod svjetlima pozornice'][i],
    cover: photo.thumbnail, alt: photo.alt, badge: 'Fotografija', description: 'Pogledajte fotografiju.', photos: selectedPhotos, startIndex: i,
    coverPosition: i === 3 ? '50% 30%' : '50% 50%'
}))];
const toggle = document.querySelector('#portfolio-svi');
const filters = document.querySelector('.portfolio-filtri');
const service = grid.dataset.service;
let expanded = false;
function renderPortfolio() {
    if (service) {
        const selection = ['fpv', 'audio'].includes(service) ? videoProjects.filter(p => p.category === service) : projects.filter(p => p.type === 'gallery');
        grid.replaceChildren(...selection.map(project => project.kartica()));
        return;
    }
    grid.replaceChildren(...(expanded ? projects : featured).map(project => project.kartica()));
    filters.hidden = !expanded;
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.textContent = expanded ? 'Prikaži izdvojene radove' : 'Pogledaj sve radove';
    document.querySelectorAll('[data-portfolio-filter]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.portfolioFilter === 'sve')));
    document.querySelector('#portfolio-rezultat').textContent = expanded ? '8 videa i 26 fotografija' : 'Izdvojeno · 2 videa i 4 fotografije';
}
toggle?.addEventListener('click', () => {
    expanded = !expanded;
    renderPortfolio();
    document.querySelector('#portfolio-rezultat').scrollIntoView({block: 'center'});
    grid.querySelector('button')?.focus({preventScroll: true});
});
let activeItems = [];
let activeIndex = 0;
let activeProject = null;
let trigger = null;
let touchStart = null;

function zaustaviVideo() {
    const video = stage.querySelector('video');
    if (!video) return;
    video.pause();
    video.removeAttribute('src');
    video.load();
}

function prikazi() {
    zaustaviVideo();
    stage.replaceChildren();
    error.hidden = true;
    const item = activeItems[activeIndex];
    counter.textContent = `${activeIndex + 1} / ${activeItems.length}`;
    previous.disabled = activeItems.length < 2;
    next.disabled = activeItems.length < 2;
    title.textContent = activeProject.type === 'video' ? item.title : activeProject.title;
    caption.textContent = activeProject.type === 'video' ? `${item.label} · ${trajanje(item.duration)}${item.category === "audio" ? " · " + item.description : ""}` : item.alt;
    direct.href = item.src;
    direct.textContent = activeProject.type === 'video' ? 'Otvori video zasebno' : 'Otvori fotografiju zasebno';
    const media = document.createElement(activeProject.type === 'video' ? 'video' : 'img');
    const showError = () => { if (stage.contains(media)) error.hidden = false; };
    media.addEventListener('error', showError);
    if (activeProject.type === 'video') {
        media.controls = true;
        media.playsInline = true;
        media.preload = 'metadata';
        media.poster = item.poster;
        media.setAttribute('aria-label', item.title);
        media.src = item.src;
        stage.append(media);
        media.play().catch(() => { /* Ručna reprodukcija ostaje dostupna. */ });
    } else {
        media.alt = item.alt;
        media.width = item.width;
        media.height = item.height;
        media.src = item.src;
        stage.append(media);
    }
    thumbs.querySelectorAll('button').forEach((button, index) => {
        button.setAttribute('aria-current', String(index === activeIndex));
        if (index === activeIndex) button.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
    });
}

function pomak(delta) {
    activeIndex = (activeIndex + delta + activeItems.length) % activeItems.length;
    prikazi();
}

function otvori(project, button) {
    activeProject = project;
    activeItems = project.type === 'video' ? videoProjects.filter(p => p.category === project.category) : project.photos;
    activeIndex = project.type === 'video' ? activeItems.indexOf(project) : (project.startIndex || 0);
    trigger = button;
    thumbs.replaceChildren();
    thumbs.hidden = project.type === 'video';
    if (project.type !== 'video') {
        project.photos.forEach((photo, index) => {
            const thumb = document.createElement('button');
            thumb.type = 'button';
            thumb.setAttribute('aria-label', `Fotografija ${index + 1}: ${photo.alt}`);
            const image = document.createElement('img');
            image.src = photo.thumbnail;
            image.alt = '';
            image.width = 72;
            image.height = 54;
            image.loading = 'lazy';
            thumb.append(image);
            thumb.addEventListener('click', () => { activeIndex = index; prikazi(); });
            thumbs.append(thumb);
        });
    }
    document.querySelectorAll('audio, video').forEach(media => media.pause());
    document.body.classList.add('portfolio-open');
    dialog.showModal();
    prikazi();
    close.focus({ preventScroll: true });
}

renderPortfolio();
document.querySelectorAll('[data-portfolio-filter]').forEach(button => {
    button.addEventListener('click', () => {
        const category = button.dataset.portfolioFilter;
        document.querySelectorAll('[data-portfolio-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
        grid.querySelectorAll('article').forEach(card => { card.hidden = category !== 'sve' && card.dataset.kategorija !== category; });
        const summaries = { sve: '8 videa i 26 fotografija', fpv: '7 FPV videa', audio: '1 reklama · snimanje i produkcija zvuka', nekretnine: 'Galerija sa 7 fotografija', koncerti: 'Galerija s 19 fotografija' };
        document.querySelector('#portfolio-rezultat').textContent = summaries[category];
    });
});

close.addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => {
    zaustaviVideo();
    stage.replaceChildren();
    thumbs.replaceChildren();
    document.body.classList.remove('portfolio-open');
    trigger?.focus({ preventScroll: true });
});
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
previous.addEventListener('click', () => pomak(-1));
next.addEventListener('click', () => pomak(1));
dialog.addEventListener('keydown', event => {
    if (event.target.closest('video, input, select, textarea')) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        pomak(event.key === 'ArrowLeft' ? -1 : 1);
    }
});
stage.addEventListener('touchstart', event => {
    touchStart = activeProject?.type === 'gallery' && event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
}, { passive: true });
stage.addEventListener('touchend', event => {
    if (!touchStart) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) pomak(dx < 0 ? 1 : -1);
    touchStart = null;
}, { passive: true });
