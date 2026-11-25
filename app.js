const list = document.querySelector('#course-list');
const count = document.querySelector('#result-count');
const empty = document.querySelector('#empty');
const mapView = document.querySelector('#map-view');
const mapList = document.querySelector('#map-list');
const mapStatus = document.querySelector('#map-status');
const controls = {
  search: document.querySelector('#search'),
  region: document.querySelector('#region'),
  holes: document.querySelector('#holes'),
  day: document.querySelector('#day'),
  sort: document.querySelector('#sort'),
  savedOnly: document.querySelector('#saved-only')
};
const storageKey = 'bay-area-golf-register:saved:v1';
const moreFilters = document.querySelector('#more-filters');
let saved = new Set();
try {
  saved = new Set(JSON.parse(localStorage.getItem(storageKey) || '[]'));
} catch {
  // Browsers can disable storage. Filtering and booking still work.
}
let activity = 'all';
let view = 'list';
let onlySaved = false;
let map = null;
let markerLayer = null;
const openCourses = new Set();

const star = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.7 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9z"/></svg>';
const arrow = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h13m-5-5 5 5-5 5"/></svg>';
const chevron = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 7 6 6 6-6"/></svg>';
const safe = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));
const money = value => value === null ? null : '$' + value;
const mapUrl = address => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(address);

// These tips supplement shared booking steps when a tee sheet serves multiple courses.
const bookingTips = {
  'lincoln': 'A separate resident tee sheet is available if you qualify for that rate.',
  'harding': 'Choose TPC Harding Park in the shared Harding and Fleming tee sheet.',
  'fleming': 'Choose Fleming in the shared Harding and Fleming tee sheet.',
  'sunnyvale': 'Choose Sunnyvale Golf Course on the operator site.',
  'sunken': 'Choose Sunken Gardens on the operator site.',
  'corica-south': 'Choose the South course in Corica Park’s tee sheet.',
  'corica-north': 'Choose the North course in Corica Park’s tee sheet.',
  'corica-mif': 'Choose The Mif in Corica Park’s tee sheet.',
  'lake-chabot': 'Choose the Championship 18 at Lake Chabot.',
  'lake-chabot-par3': 'Choose the Par 3 Executive nine at Lake Chabot.',
  'monarch-lema': 'Choose the Tony Lema course in the shared Monarch Bay tee sheet.',
  'monarch-marina': 'Choose Marina 9 in the shared Monarch Bay tee sheet.'
};

function detailPanel(course) {
  const mainLink = course.book || course.rangeUrl || course.rates;
  const bookingText = course.book
    ? 'Open the official booking page, choose a date and group size, then confirm the available time and final price before paying.'
    : 'Check the range page for today’s hours, current bucket prices, and any visit rules before going.';
  const tip = bookingTips[course.id]
    ? '<p class="detail-tip">' + safe(bookingTips[course.id]) + '</p>' : '';
  const fees = course.holes
    ? '<div class="rate-pair"><div><span>Weekday</span><strong>' +
        safe(money(course.weekday) || 'Check live rate') +
        '</strong></div><div><span>Weekend</span><strong>' +
        safe(money(course.weekend) || 'Check live rate') +
        '</strong></div></div><p>' + safe(course.basis) + ' · ' +
        safe(course.style) + '</p>'
    : '<p>Range only; there is no course green fee.</p>';
  const rangeText = course.rangeKind
    ? safe(course.rangeKind) + ': ' +
      (course.range === null ? 'ask the venue for the current bucket price' : safe(money(course.range))) +
      (course.balls ? ' for ' + safe(course.balls) : '') + '.'
    : 'No driving range is listed for this place.';
  return [
    '<div class="detail-panel" id="details-', safe(course.id), '"',
    openCourses.has(course.id) ? '' : ' hidden', '>',
    '<section class="detail-block"><h4>Instructions for booking</h4><p>', bookingText, '</p>', tip,
    '<a href="', safe(mainLink), '" target="_blank" rel="noopener noreferrer">',
    course.book ? 'Open booking page' : 'Check range information', ' →</a>',
    course.altBook ? '<a href="' + safe(course.altBook) +
      '" target="_blank" rel="noopener noreferrer">Resident tee times →</a>' : '',
    '</section>',
    '<section class="detail-block"><h4>Rate details</h4>', fees,
    '<p>Published adult-rate snapshot, checked 25 Nov 2026. Confirm the final fee, residency terms, and cart cost on the venue’s page.</p>',
    '<a href="', safe(course.rates), '" target="_blank" rel="noopener noreferrer">Official rates →</a></section>',
    '<section class="detail-block"><h4>Special notes</h4><p>', safe(course.note), '</p></section>',
    '<section class="detail-block"><h4>Practice &amp; getting there</h4><p>', rangeText,
    '</p><address>', safe(course.address), '</address>',
    '<a href="', safe(mapUrl(course.address)), '" target="_blank" rel="noopener noreferrer">Open directions →</a>',
    course.rangeUrl ? '<a href="' + safe(course.rangeUrl) +
      '" target="_blank" rel="noopener noreferrer">Range details →</a>' : '',
    '</section></div>'
  ].join('');
}

function card(course) {
  const fee = controls.day.value === 'weekend' ? course.weekend : course.weekday;
  const hasRange = Boolean(course.rangeKind);
  const savedHere = saved.has(course.id);
  const isOpen = openCourses.has(course.id);
  const playText = course.holes ? course.holes + ' holes' : '—';
  const price = course.holes ? (fee === null ? 'See live rates' : money(fee)) : 'No course';
  const rangePrice = hasRange ? (course.range === null ? 'Ask venue' : money(course.range)) : '—';
  const mainLink = course.book || course.rangeUrl || course.rates;
  return [
    '<article class="course-row', isOpen ? ' is-open' : '', '" id="', safe(course.id),
    '" data-course="', safe(course.id), '">',
    '<div class="place-cell"><div class="place-top"><button class="save-button',
    savedHere ? ' is-saved' : '', '" type="button" data-save="', safe(course.id),
    '" aria-pressed="', savedHere, '" aria-label="',
    savedHere ? 'Remove ' : 'Save ', safe(course.name),
    savedHere ? ' from' : ' to', ' saved places">', star,
    '</button><div><h3>', safe(course.name), '</h3><p class="location">',
    safe(course.city), ' <span>·</span> ', safe(course.region),
    '</p></div></div><p class="note">', safe(course.note), '</p></div>',
    '<div class="fact-cell play-cell"><span class="mobile-label">Play</span><strong>',
    safe(price), '</strong><span>', safe(course.basis), '</span><small>',
    safe(playText), course.holes ? ' · ' + safe(course.style) : '', '</small></div>',
    '<div class="fact-cell range-cell"><span class="mobile-label">Range</span><strong>',
    safe(rangePrice), '</strong><span>',
    hasRange ? safe(course.balls || 'Price not posted') : 'No range listed',
    '</span><small>', hasRange ? safe(course.rangeKind) : '', '</small></div>',
    '<div class="action-cell"><a class="book-link" href="', safe(mainLink),
    '" target="_blank" rel="noopener noreferrer">',
    course.book ? 'Check times' : 'Range info', arrow, '</a>',
    '<button class="detail-toggle" type="button" data-toggle="', safe(course.id),
    '" aria-expanded="', isOpen, '" aria-controls="details-', safe(course.id), '">',
    isOpen ? 'Hide details' : 'View details', chevron, '</button>',
    '</div>', detailPanel(course), '</article>'
  ].join('');
}

function matchingCourses() {
  const query = controls.search.value.trim().toLocaleLowerCase();
  const matches = COURSES.filter(course => {
    if (activity === 'play' && !course.holes) return false;
    if (activity === 'range' && !course.rangeKind) return false;
    if (controls.region.value !== 'all' && course.region !== controls.region.value) return false;
    if (controls.holes.value === 'range' && course.holes) return false;
    if (['9', '18'].includes(controls.holes.value) &&
        course.holes !== Number(controls.holes.value)) return false;
    if (onlySaved && !saved.has(course.id)) return false;
    if (query && ![course.name, course.city, course.region, course.style,
      course.note, course.address].join(' ').toLocaleLowerCase().includes(query)) return false;
    return true;
  });
  const feeKey = controls.day.value === 'weekend' ? 'weekend' : 'weekday';
  // In range mode, price sorting compares buckets. Else it compares rounds.
  const comparablePrice = course => activity === 'range' || controls.holes.value === 'range'
    ? (course.range ?? Infinity)
    : (course.holes ? (course[feeKey] ?? Infinity) : Infinity);
  matches.sort((a, b) => controls.sort.value === 'price'
    ? comparablePrice(a) - comparablePrice(b) || a.name.localeCompare(b.name)
    : controls.sort.value === 'city'
      ? a.city.localeCompare(b.city) || a.name.localeCompare(b.name)
      : a.name.localeCompare(b.name));
  return matches;
}

function renderMap(matches) {
  if (!window.L) {
    document.querySelector('#course-map').hidden = true;
    mapStatus.hidden = false;
    mapStatus.textContent = 'The interactive map could not load. Use the place list below to open a record and its directions link.';
    return;
  }
  if (!map) {
    map = L.map('course-map', {scrollWheelZoom: false}).setView([37.77, -122.28], 9);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    markerLayer = L.layerGroup().addTo(map);
  }
  markerLayer.clearLayers();
  const groups = new Map();
  matches.forEach(course => {
    const point = COURSE_LOCATIONS[course.id];
    if (!point) return;
    const key = point.join(',');
    if (!groups.has(key)) groups.set(key, {point, courses: []});
    groups.get(key).courses.push(course);
  });
  groups.forEach(group => {
    const names = group.courses.map(course =>
      '<li><button type="button" data-map-open="' + safe(course.id) + '">' +
      safe(course.name) + '</button></li>').join('');
    const popup = '<div class="map-popup"><strong>' +
      safe(group.courses[0].city) + '</strong><ul>' + names + '</ul></div>';
    const marker = L.marker(group.point, {
      icon: L.divIcon({
        className: 'course-pin',
        html: '<span>' + (group.courses.length > 1 ? group.courses.length : '•') + '</span>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      })
    });
    marker.bindPopup(popup).addTo(markerLayer);
  });
  mapStatus.hidden = matches.length !== 0;
  mapStatus.textContent = matches.length ? '' : 'No places match these filters. Try another area or clear the filters.';
  requestAnimationFrame(() => {
    map.invalidateSize();
    const points = [...groups.values()].map(group => group.point);
    if (points.length) map.fitBounds(L.latLngBounds(points), {padding: [28, 28], maxZoom: 12});
  });
}

function render() {
  const matches = matchingCourses();
  list.innerHTML = matches.map(card).join('');
  count.textContent = matches.length + (matches.length === 1 ? ' place shown' : ' places shown');
  empty.hidden = matches.length !== 0;
  document.querySelector('#saved-count').textContent = saved.size;
  document.querySelector('#total-count').textContent = COURSES.length + ' places to start';
  document.querySelector('#map-count').textContent = matches.length +
    (matches.length === 1 ? ' place' : ' places') + ' in this view';
  mapList.innerHTML = matches.map(course =>
    '<button type="button" data-map-open="' + safe(course.id) + '">' +
    '<strong>' + safe(course.name) + '</strong><span>' + safe(course.city) +
    ' · ' + (course.holes ? course.holes + ' holes' : 'Range only') +
    '</span></button>').join('');
  if (view === 'map') renderMap(matches);
}

function setView(nextView) {
  view = nextView;
  document.querySelector('#results').hidden = view !== 'list';
  mapView.hidden = view !== 'map';
  document.querySelectorAll('.view-tab').forEach(button => {
    const active = button.dataset.view === view;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  render();
}

function toggleCourse(id) {
  if (openCourses.has(id)) openCourses.delete(id);
  else openCourses.add(id);
  const row = document.getElementById(id);
  if (!row) return;
  const isOpen = openCourses.has(id);
  row.classList.toggle('is-open', isOpen);
  row.querySelector('.detail-panel').hidden = !isOpen;
  const toggle = row.querySelector('.detail-toggle');
  toggle.setAttribute('aria-expanded', String(isOpen));
  toggle.childNodes[0].textContent = isOpen ? 'Hide details' : 'View details';
}

function showCourse(id) {
  openCourses.add(id);
  setView('list');
  const row = document.getElementById(id);
  if (!row) return;
  row.scrollIntoView({behavior: 'smooth', block: 'center'});
  row.querySelector('.detail-toggle').focus({preventScroll: true});
}

function clearFilters() {
  activity = 'all';
  onlySaved = false;
  controls.search.value = '';
  controls.region.value = 'all';
  controls.holes.value = 'all';
  controls.day.value = 'weekend';
  controls.sort.value = 'name';
  document.querySelector('.controls').classList.remove('filters-open');
  moreFilters.setAttribute('aria-expanded', 'false');
  moreFilters.textContent = 'More filters';
  document.querySelectorAll('.activity-tab').forEach(button => {
    const active = button.dataset.activity === activity;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  controls.savedOnly.setAttribute('aria-pressed', 'false');
  render();
}

for (const field of [controls.search, controls.region, controls.holes, controls.day, controls.sort]) {
  field.addEventListener(field === controls.search ? 'input' : 'change', render);
}
document.querySelectorAll('.activity-tab').forEach(button => button.addEventListener('click', () => {
  activity = button.dataset.activity;
  document.querySelectorAll('.activity-tab').forEach(tab => {
    const active = tab === button;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-pressed', String(active));
  });
  render();
}));
document.querySelectorAll('.view-tab').forEach(button =>
  button.addEventListener('click', () => setView(button.dataset.view)));
controls.savedOnly.addEventListener('click', () => {
  onlySaved = !onlySaved;
  controls.savedOnly.setAttribute('aria-pressed', String(onlySaved));
  render();
});
moreFilters.addEventListener('click', () => {
  const open = document.querySelector('.controls').classList.toggle('filters-open');
  moreFilters.setAttribute('aria-expanded', String(open));
  moreFilters.textContent = open ? 'Fewer filters' : 'More filters';
});
document.querySelector('#reset').addEventListener('click', clearFilters);
document.querySelector('#empty-reset').addEventListener('click', clearFilters);
list.addEventListener('click', event => {
  const saveButton = event.target.closest('[data-save]');
  if (saveButton) {
    const id = saveButton.dataset.save;
    saved.has(id) ? saved.delete(id) : saved.add(id);
    try { localStorage.setItem(storageKey, JSON.stringify([...saved])); } catch { /* Optional. */ }
    render();
    return;
  }
  const toggle = event.target.closest('[data-toggle]');
  if (toggle) {
    toggleCourse(toggle.dataset.toggle);
    return;
  }
  if (event.target.closest('a, button, .detail-panel')) return;
  const row = event.target.closest('.course-row');
  if (row) toggleCourse(row.dataset.course);
});
for (const container of [mapList, document.querySelector('#course-map')]) {
  container.addEventListener('click', event => {
    const button = event.target.closest('[data-map-open]');
    if (button) showCourse(button.dataset.mapOpen);
  });
}
render();
