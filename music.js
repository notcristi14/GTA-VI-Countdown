(function () {
  // Official Spotify embeds only. Seeds + auto-discovered playable tracks from
  // Grand Theft Auto VI: The Album via /api/music (refreshes every 30 minutes).
  const FALLBACK_SONGS = [
    { id: 'album', title: 'Full Album (preview)', artist: '34 tracks · Atlantic / Rockstar · unlocks Nov 19', spotify: 'album/5BYKG4MHfySZthe2W6r7n4', album: true },
    { id: 'thats-it', title: "That's It", artist: 'Yung Lean feat. Future & Metro Boomin', spotify: 'track/6dUXpM7mnGr7cSpCUQewCs' },
    { id: 'rhyno', title: 'RHYNO', artist: 'Travis Scott (prod. Guy-Manuel de Homem-Christo)', spotify: 'track/2NliF6CtlWolNA0Jzkw4ba' },
    { id: 'sexy-magic', title: 'Sexy Magic', artist: 'CA7RIEL & Paco Amoroso, PinkPantheress, Fred again.. & Étienne de Crécy', spotify: 'track/5AIwo9vC79ce0A7u3DgB1N' },
    { id: 'flower', title: 'Flower in a Hurricane', artist: 'Justice feat. Tame Impala, SZA & King Gizzard', spotify: 'track/1bRWSJwUGWCsOih08iFFTV' },
    { id: 'last-thing', title: 'Last Thing You Need', artist: 'Morgan Wallen', spotify: 'track/1KVvsmAWUhd3Xyex4IS3DD' },
    { id: 'suzuki', title: 'Suzuki', artist: 'Fuerza Regida', spotify: 'track/4DuL1odbViQNnk9o1nol5J' },
    { id: 'macacoa', title: 'Macacoa 2000', artist: 'Rauw Alejandro', spotify: 'track/2oOtzWzQrHPmvtMAzoms7Q' },
    { id: 'dont-chart', title: "Don't Chart", artist: 'Cardi B', spotify: 'track/5ES7lNls3ZjYuSfTIdKOvr' },
    { id: 'bright-lights', title: 'Bright Lights, Big City', artist: 'Keith Richards', spotify: 'track/2X67K1KTLBg9EU2dMUQC42' },
    { id: 'pusher', title: 'Pusher', artist: 'Justice feat. Gesaffelstein · Original Score', spotify: 'track/6pxjskMHpE4QBmxoOX6O5H' }
  ];

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    const overlay = document.getElementById('musicOverlay');
    const frame = document.getElementById('musicFrame');
    const wrap = document.getElementById('musicFrameWrap');
    const tabs = document.getElementById('musicTabs');
    const meta = document.getElementById('musicMeta');
    const openBtn = document.getElementById('musicBtn');
    const closeBtn = document.getElementById('musicCloseBtn');
    const spLink = document.getElementById('musicSpotifyLink');
    if (!overlay || !frame || !tabs || !openBtn) return;

    let songs = FALLBACK_SONGS.slice();
    let activeId = songs[0].id;
    let switchTimer = null;
    let pollTimer = null;

    function embedSrc(song) {
      if (wrap) wrap.classList.toggle('album', !!song.album);
      return 'https://open.spotify.com/embed/' + song.spotify + '?utm_source=generator&theme=0';
    }

    function setActive(song, animate) {
      if (!song) return;
      activeId = song.id;
      tabs.querySelectorAll('.music-tab').forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.id === song.id);
      });
      if (meta) meta.textContent = song.artist || '';
      if (spLink) {
        spLink.href = 'https://open.spotify.com/' + song.spotify;
        spLink.textContent = song.album ? 'Open album on Spotify' : 'Open track on Spotify';
      }
      if (animate && frame) {
        if (wrap) wrap.classList.add('is-switching');
        clearTimeout(switchTimer);
        switchTimer = setTimeout(function () {
          frame.src = embedSrc(song);
          if (wrap) wrap.classList.remove('is-switching');
        }, 180);
      } else if (frame) {
        frame.src = embedSrc(song);
      }
    }

    function buildTabs() {
      tabs.innerHTML = '';
      songs.forEach(function (s) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'music-tab' + (s.id === activeId ? ' active' : '');
        btn.dataset.id = s.id;
        btn.textContent = s.title;
        btn.addEventListener('click', function () {
          if (s.id === activeId) return;
          tabs.querySelectorAll('.music-tab').forEach(function (b) {
            b.classList.add('switching');
          });
          setTimeout(function () {
            setActive(s, true);
            tabs.querySelectorAll('.music-tab').forEach(function (b) {
              b.classList.remove('switching');
            });
          }, 120);
        });
        tabs.appendChild(btn);
      });
    }

    function applySongs(list) {
      if (!Array.isArray(list) || !list.length) return;
      const prev = activeId;
      songs = list.map(function (x) {
        return {
          id: x.id || x.spotify,
          title: x.title || 'Track',
          artist: x.artist || '',
          spotify: x.spotify,
          album: !!x.album
        };
      }).filter(function (x) { return x.spotify; });
      if (!songs.length) return;
      const still = songs.some(function (s) { return s.id === prev; });
      if (!still) activeId = songs[0].id;
      buildTabs();
      setActive(songs.find(function (x) { return x.id === activeId; }) || songs[0], false);
    }

    function loadMusic() {
      fetch('/api/music', { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          if (data && Array.isArray(data.items) && data.items.length) {
            applySongs(data.items);
          }
        })
        .catch(function () {});
    }

    function openMusic() {
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      setActive(songs.find(function (x) { return x.id === activeId; }) || songs[0], false);
      loadMusic();
    }

    function closeMusic() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (frame) frame.src = '';
    }

    // Live countdown to album / game release (UTC midnight 19 Nov 2026)
    const RELEASE_MS = Date.UTC(2026, 10, 19, 0, 0, 0); // month 10 = November
    let elCd = document.getElementById('musicCountdown');
    if (!elCd) {
      const sub = overlay.querySelector('.music-sub');
      elCd = document.createElement('div');
      elCd.className = 'music-countdown';
      elCd.id = 'musicCountdown';
      elCd.setAttribute('aria-live', 'polite');
      elCd.innerHTML =
        '<span class="mc-seg"><b id="mcDays">--</b><small>Days</small></span>' +
        '<span class="mc-sep">:</span>' +
        '<span class="mc-seg"><b id="mcHours">--</b><small>Hrs</small></span>' +
        '<span class="mc-sep">:</span>' +
        '<span class="mc-seg"><b id="mcMins">--</b><small>Mins</small></span>' +
        '<span class="mc-sep">:</span>' +
        '<span class="mc-seg"><b id="mcSecs">--</b><small>Secs</small></span>';
      if (sub && sub.parentNode) sub.parentNode.insertBefore(elCd, sub.nextSibling);
    }
    const elDays = document.getElementById('mcDays');
    const elHours = document.getElementById('mcHours');
    const elMins = document.getElementById('mcMins');
    const elSecs = document.getElementById('mcSecs');
    let cdTimer = null;

    function pad2(n) { return n < 10 ? '0' + n : String(n); }

    function tickMusicCountdown() {
      if (!elDays || !elHours || !elMins || !elSecs) return;
      const now = Date.now();
      let left = RELEASE_MS - now;
      if (left <= 0) {
        elDays.textContent = '00';
        elHours.textContent = '00';
        elMins.textContent = '00';
        elSecs.textContent = '00';
        if (elCd) {
          elCd.classList.add('is-done');
          elCd.classList.remove('is-live');
        }
        if (cdTimer) { clearInterval(cdTimer); cdTimer = null; }
        return;
      }
      const days = Math.floor(left / 86400000);
      left -= days * 86400000;
      const hours = Math.floor(left / 3600000);
      left -= hours * 3600000;
      const mins = Math.floor(left / 60000);
      left -= mins * 60000;
      const secs = Math.floor(left / 1000);
      elDays.textContent = days < 100 ? pad2(days) : String(days);
      elHours.textContent = pad2(hours);
      elMins.textContent = pad2(mins);
      elSecs.textContent = pad2(secs);
      if (elCd) elCd.classList.add('is-live');
    }

    function startMusicCountdown() {
      tickMusicCountdown();
      if (cdTimer) clearInterval(cdTimer);
      cdTimer = setInterval(tickMusicCountdown, 1000);
    }


    openBtn.addEventListener('click', openMusic);
    if (closeBtn) closeBtn.addEventListener('click', closeMusic);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeMusic();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeMusic();
    });

    buildTabs();
    setActive(songs[0], false);
    loadMusic();
    startMusicCountdown();
    // Client poll every 30 minutes (server also refreshes in the background)
    pollTimer = setInterval(loadMusic, 30 * 60 * 1000);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') loadMusic();
    });
  });
})();
