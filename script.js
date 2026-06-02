/* ---- insurance marquee ---- */
(function () {
  var track = document.querySelector('.insurances__track');
  if (!track) return;

  var origItems = Array.from(track.children);

  function setup() {
    // measure exact pixel width of one full set (item width + its right margin)
    var setWidth = 0;
    origItems.forEach(function (el) {
      var s = getComputedStyle(el);
      setWidth += el.getBoundingClientRect().width + parseFloat(s.marginRight);
    });

    // clone enough times so total track > 3× viewport — no gap ever visible
    var copies = Math.ceil((window.innerWidth * 3) / setWidth) + 1;
    for (var i = 0; i < copies; i++) {
      origItems.forEach(function (item) {
        var clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });
    }

    // inject keyframes using exact pixel distance (one set width)
    var styleEl = document.createElement('style');
    styleEl.textContent =
      '@keyframes marquee-scroll{' +
      'from{transform:translateX(0)}' +
      'to{transform:translateX(-' + setWidth + 'px)}' +
      '}';
    document.head.appendChild(styleEl);

    // start animation — speed: ~80px/s feels natural
    track.style.animation = 'marquee-scroll ' + Math.round(setWidth / 64) + 's linear infinite';
  }

  // wait for all logo images to finish loading so getBoundingClientRect is correct
  var imgs = Array.from(track.querySelectorAll('img'));
  var pending = imgs.filter(function (img) { return !img.complete; });
  if (pending.length === 0) {
    setup();
  } else {
    var remaining = pending.length;
    function onLoad() { if (--remaining === 0) setup(); }
    pending.forEach(function (img) {
      img.addEventListener('load', onLoad);
      img.addEventListener('error', onLoad);
    });
  }
})();

/* ---- interactive map (Leaflet + OpenStreetMap) ---- */
(function () {
  const map = L.map('mapa', { scrollWheelZoom: false, zoomControl: true });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(map);

  const pinIcon = L.divIcon({
    html: '<div class="map-pin-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>',
    className: '',
    iconSize:   [44, 44],
    iconAnchor: [22, 44],
    popupAnchor:[0, -48]
  });

  const popupHtml =
    '<strong style="color:#213858;font-size:15px">Stomatologie Kuchařová</strong>' +
    '<br><span style="color:#6E7783;font-size:13px">Tovární 9, Znojmo</span>';

  /* Geocode address via Nominatim, fall back to Znojmo centre */
  fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' +
        encodeURIComponent('Tovární 9, Znojmo, Česká republika'))
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var lat = data.length ? parseFloat(data[0].lat) : 48.8552;
      var lon = data.length ? parseFloat(data[0].lon) : 16.0490;
      map.setView([lat, lon], 16);
      L.marker([lat, lon], { icon: pinIcon })
        .addTo(map)
        .bindPopup(popupHtml)
        .openPopup();
    })
    .catch(function () { map.setView([48.8552, 16.0490], 14); });

  /* enable scroll-wheel zoom only while mouse is over map */
  document.getElementById('mapa').addEventListener('mouseenter', function () {
    map.scrollWheelZoom.enable();
  });
  document.getElementById('mapa').addEventListener('mouseleave', function () {
    map.scrollWheelZoom.disable();
  });
})();

/* ---- copy-to-clipboard ---- */
(function () {
  const btn       = document.getElementById('copyEmailBtn');
  const copyIcon  = document.getElementById('copyIcon');
  const checkIcon = document.getElementById('checkIcon');
  let timer;

  btn.addEventListener('click', async function () {
    try {
      await navigator.clipboard.writeText('stomatologkucharova@gmail.com');
    } catch {
      /* fallback for older browsers */
      const ta = document.createElement('textarea');
      ta.value = 'stomatologkucharova@gmail.com';
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    copyIcon.style.display  = 'none';
    checkIcon.style.display = '';
    btn.classList.add('copy-btn--copied');
    btn.title = 'Zkopírováno!';
    btn.setAttribute('aria-label', 'Zkopírováno!');

    clearTimeout(timer);
    timer = setTimeout(function () {
      copyIcon.style.display  = '';
      checkIcon.style.display = 'none';
      btn.classList.remove('copy-btn--copied');
      btn.title = 'Kopírovat e-mail';
      btn.setAttribute('aria-label', 'Kopírovat e-mail do schránky');
    }, 1500);
  });
})();
