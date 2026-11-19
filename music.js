(function () {
  // Official Spotify embeds only. Seeds + auto-discovered playable tracks from
  // Grand Theft Auto VI: The Album via /api/music (refreshes every 30 minutes).
  const FALLBACK_SONGS = [
    { id: 'album', title: 'Full Album', artist: '34 tracks · Atlantic / Rockstar · Spotify unlock Nov 20', spotify: 'album/5BYKG4MHfySZthe2W6r7n4', album: true },
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

    // @feature id="set-active" title="Set Active" group="Website · automatically discovered" scopes="all"
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

    // @feature id="build-tabs" title="Build Tabs" group="Website · automatically discovered" scopes="all"
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

    // @feature id="apply-songs" title="Apply Songs" group="Website · automatically discovered" scopes="all"
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

    // @feature id="load-music" title="Load Music" group="Website · automatically discovered" scopes="all"
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

    // @feature id="open-music" title="Open Music" group="Website · automatically discovered" scopes="all"
    function openMusic() {
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      setActive(songs.find(function (x) { return x.id === activeId; }) || songs[0], false);
      loadMusic();
    }

    // @feature id="close-music" title="Close Music" group="Website · automatically discovered" scopes="all"
    function closeMusic() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (frame) frame.src = '';
    }

    // Live countdown to album unlock on Spotify (UTC midnight 20 Nov 2026)
    const RELEASE_MS = Date.UTC(2026, 10, 20, 0, 0, 0);
    let elCd = document.getElementById('musicCountdown');
    if (!elCd) {
      const sub = overlay.querySelector('.music-sub');
      elCd = document.createElement('div');
      elCd.className = 'music-countdown';
      elCd.id = 'musicCountdown';
      elCd.setAttribute('aria-live', 'polite');
      elCd.innerHTML =
        '<span class="mc-seg"><span class="mc-num" id="mcDays" data-val=""></span><small>Days</small></span>' +
        '<span class="mc-sep">:</span>' +
        '<span class="mc-seg"><span class="mc-num" id="mcHours" data-val=""></span><small>Hrs</small></span>' +
        '<span class="mc-sep">:</span>' +
        '<span class="mc-seg"><span class="mc-num" id="mcMins" data-val=""></span><small>Mins</small></span>' +
        '<span class="mc-sep">:</span>' +
        '<span class="mc-seg"><span class="mc-num" id="mcSecs" data-val=""></span><small>Secs</small></span>' +
        '<span class="mc-sec-fill" id="mcSecFill"></span>';
      if (sub && sub.parentNode) sub.parentNode.insertBefore(elCd, sub.nextSibling);
    }
    const elDays = document.getElementById('mcDays');
    const elHours = document.getElementById('mcHours');
    const elMins = document.getElementById('mcMins');
    const elSecs = document.getElementById('mcSecs');
    let cdTimer = null;

    function pad2(n) { return n < 10 ? '0' + n : String(n); }

    // @feature id="build-reel" title="Build Reel" group="Website · automatically discovered" scopes="all"
    function buildReel(digits) {
      const frag = document.createDocumentFragment();
      String(digits).split('').forEach(function (ch) {
        const slot = document.createElement('span');
        slot.className = 'mc-digit';
        const reel = document.createElement('span');
        reel.className = 'mc-reel';
        for (let i = 0; i < 10; i++) {
          const s = document.createElement('span');
          s.textContent = String(i);
          reel.appendChild(s);
        }
        if (ch < '0' || ch > '9') {
          reel.innerHTML = '';
          const s = document.createElement('span');
          s.textContent = ch;
          reel.appendChild(s);
          reel.style.transform = 'translateY(0)';
        } else {
          reel.style.transform = 'translateY(-' + (parseInt(ch, 10) * 1.15) + 'em)';
        }
        slot.appendChild(reel);
        frag.appendChild(slot);
      });
      return frag;
    }

    // @feature id="set-animated-value" title="Set Animated Value" group="Website · automatically discovered" scopes="all"
    function setAnimatedValue(el, next) {
      if (!el) return;
      const prev = el.getAttribute('data-val');
      if (prev === next) return;
      el.setAttribute('data-val', next);
      if (!el.querySelector('.mc-reel') || String(prev || '').length !== String(next).length) {
        el.innerHTML = '';
        el.appendChild(buildReel(next));
        return;
      }
      const reels = el.querySelectorAll('.mc-reel');
      String(next).split('').forEach(function (ch, i) {
        const reel = reels[i];
        if (!reel) return;
        if (ch >= '0' && ch <= '9') {
          reel.style.transform = 'translateY(-' + (parseInt(ch, 10) * 1.15) + 'em)';
        }
      });
    }

    const elSecFill = document.getElementById('mcSecFill');

    function tickMusicCountdown() {
      if (!elDays || !elHours || !elMins || !elSecs) return;
      const now = Date.now();
      let left = RELEASE_MS - now;
      if (left <= 0) {
        setAnimatedValue(elDays, '00');
        setAnimatedValue(elHours, '00');
        setAnimatedValue(elMins, '00');
        setAnimatedValue(elSecs, '00');
        if (elSecFill) elSecFill.style.width = '0%';
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
      const msInSec = left - secs * 1000;
      setAnimatedValue(elDays, days < 100 ? pad2(days) : String(days));
      setAnimatedValue(elHours, pad2(hours));
      setAnimatedValue(elMins, pad2(mins));
      setAnimatedValue(elSecs, pad2(secs));
      if (elSecFill) {
        const pct = Math.max(0, Math.min(100, ((1000 - msInSec) / 1000) * 100));
        elSecFill.style.transition = 'none';
        elSecFill.style.width = pct + '%';
        void elSecFill.offsetWidth;
        elSecFill.style.transition = 'width ' + Math.max(50, 1000 - msInSec) + 'ms linear';
        elSecFill.style.width = '100%';
      }
      if (elCd) elCd.classList.add('is-live');
    }

    // @feature id="start-music-countdown" title="Start Music Countdown" group="Website · automatically discovered" scopes="all"
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
    pollTimer = setInterval(loadMusic, 30 * 60 * 1000);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') loadMusic();
    });
  });
})();
