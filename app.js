const list = document.querySelector('#course-list');
const count = document.querySelector('#result-count');
const empty = document.querySelector('#empty');
const controls = {
  search: document.querySelector('#search'), region: document.querySelector('#region'),
  holes: document.querySelector('#holes'), day: document.querySelector('#day'),
  sort: document.querySelector('#sort'), savedOnly: document.querySelector('#saved-only')
};
const storageKey = 'bay-area-golf-register:saved:v1';
const moreFilters = document.querySelector('#more-filters');
let saved = new Set();
try { saved = new Set(JSON.parse(localStorage.getItem(storageKey) || '[]')); } catch { /* Browsers can disable storage. The page still works. */ }
let activity = 'all';
let onlySaved = false;

const star = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.7 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9z"/></svg>';
const arrow = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h13m-5-5 5 5-5 5"/></svg>';
const safe = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const money = value => value === null ? null : `$${value}`;
const mapUrl = address => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

function card(course) {
  const fee = controls.day.value === 'weekend' ? course.weekend : course.weekday;
  const hasRange = Boolean(course.rangeKind);
  const savedHere = saved.has(course.id);
  const playText = course.holes ? `${course.holes} holes` : '—';
  const price = course.holes ? (fee === null ? 'See live rates' : money(fee)) : 'No course';
  const rangePrice = hasRange ? (course.range === null ? 'Ask venue' : money(course.range)) : '—';
  const mainLink = course.book || course.rangeUrl || course.rates;
  const mainLabel = course.book ? 'Check times' : 'Range info';
  return `<article class="course-row" id="${safe(course.id)}">
    <div class="place-cell"><div class="place-top"><button class="save-button ${savedHere ? 'is-saved' : ''}" type="button" data-save="${safe(course.id)}" aria-pressed="${savedHere}" aria-label="${savedHere ? 'Remove' : 'Save'} ${safe(course.name)} ${savedHere ? 'from' : 'to'} saved places">${star}</button><div><h3>${safe(course.name)}</h3><p class="location">${safe(course.city)} <span>·</span> ${safe(course.region)}</p></div></div><p class="note">${safe(course.note)}</p></div>
    <div class="fact-cell play-cell"><span class="mobile-label">Play</span><strong>${safe(price)}</strong><span>${safe(course.basis)}</span><small>${safe(playText)}${course.holes ? ` · ${safe(course.style)}` : ''}</small></div>
    <div class="fact-cell range-cell"><span class="mobile-label">Range</span><strong>${safe(rangePrice)}</strong><span>${hasRange ? safe(course.balls || 'Price not posted') : 'No range listed'}</span><small>${hasRange ? safe(course.rangeKind) : ''}</small></div>
    <div class="action-cell"><a class="book-link" href="${safe(mainLink)}" target="_blank" rel="noopener noreferrer">${mainLabel}${arrow}</a><div class="secondary-links"><a href="${safe(course.rates)}" target="_blank" rel="noopener noreferrer">Rates</a><a href="${safe(mapUrl(course.address))}" target="_blank" rel="noopener noreferrer">Map</a>${course.rangeUrl && course.rangeUrl !== course.rates ? `<a href="${safe(course.rangeUrl)}" target="_blank" rel="noopener noreferrer">Range</a>` : ''}${course.altBook ? `<a href="${safe(course.altBook)}" target="_blank" rel="noopener noreferrer">Resident times</a>` : ''}</div></div>
  </article>`;
}

function render() {
  const query = controls.search.value.trim().toLocaleLowerCase();
  let matches = COURSES.filter(course => {
    if (activity === 'play' && !course.holes) return false;
    if (activity === 'range' && !course.rangeKind) return false;
    if (controls.region.value !== 'all' && course.region !== controls.region.value) return false;
    if (controls.holes.value === 'range' && course.holes) return false;
    if (['9','18'].includes(controls.holes.value) && course.holes !== Number(controls.holes.value)) return false;
    if (onlySaved && !saved.has(course.id)) return false;
    if (query && !`${course.name} ${course.city} ${course.region} ${course.style} ${course.note}`.toLocaleLowerCase().includes(query)) return false;
    return true;
  });
  const feeKey = controls.day.value === 'weekend' ? 'weekend' : 'weekday';
  // A range search compares bucket prices. In the full register, round fees
  // sort first so a bucket is not treated as cheaper than an entire round.
  const comparablePrice = course => activity === 'range' || controls.holes.value === 'range'
    ? (course.range ?? Infinity)
    : (course.holes ? (course[feeKey] ?? Infinity) : Infinity);
  matches.sort((a,b) => controls.sort.value === 'price'
    ? comparablePrice(a) - comparablePrice(b) || a.name.localeCompare(b.name)
    : controls.sort.value === 'city'
      ? a.city.localeCompare(b.city) || a.name.localeCompare(b.name)
      : a.name.localeCompare(b.name));
  list.innerHTML = matches.map(card).join('');
  count.textContent = `${matches.length} ${matches.length === 1 ? 'place' : 'places'} shown`;
  empty.hidden = matches.length !== 0;
  document.querySelector('#saved-count').textContent = saved.size;
  document.querySelector('#total-count').textContent = `${COURSES.length} places to start`;
}
function clearFilters() {
  activity = 'all'; onlySaved = false;
  controls.search.value = ''; controls.region.value = 'all'; controls.holes.value = 'all';
  controls.day.value = 'weekend'; controls.sort.value = 'name';
  document.querySelector('.controls').classList.remove('filters-open');
  moreFilters.setAttribute('aria-expanded', 'false');
  moreFilters.textContent = 'More filters';
  document.querySelectorAll('.activity-tab').forEach(button => {
    const active = button.dataset.activity === activity;
    button.classList.toggle('active', active); button.setAttribute('aria-pressed', active);
  });
  controls.savedOnly.setAttribute('aria-pressed', 'false');
  render();
}
for (const field of [controls.search, controls.region, controls.holes, controls.day, controls.sort]) field.addEventListener(field === controls.search ? 'input' : 'change', render);
document.querySelectorAll('.activity-tab').forEach(button => button.addEventListener('click', () => {
  activity = button.dataset.activity;
  document.querySelectorAll('.activity-tab').forEach(tab => { const active = tab === button; tab.classList.toggle('active', active); tab.setAttribute('aria-pressed', active); });
  render();
}));
controls.savedOnly.addEventListener('click', () => { onlySaved = !onlySaved; controls.savedOnly.setAttribute('aria-pressed', String(onlySaved)); render(); });
moreFilters.addEventListener('click', () => {
  const open = document.querySelector('.controls').classList.toggle('filters-open');
  moreFilters.setAttribute('aria-expanded', String(open));
  moreFilters.textContent = open ? 'Fewer filters' : 'More filters';
});
document.querySelector('#reset').addEventListener('click', clearFilters);
document.querySelector('#empty-reset').addEventListener('click', clearFilters);
list.addEventListener('click', event => {
  const button = event.target.closest('[data-save]');
  if (!button) return;
  saved.has(button.dataset.save) ? saved.delete(button.dataset.save) : saved.add(button.dataset.save);
  try { localStorage.setItem(storageKey, JSON.stringify([...saved])); } catch { /* Saving is optional. */ }
  render();
});
render();
