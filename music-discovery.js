/**
 * GTA VI soundtrack auto-discovery (Spotify album embed)
 * Loaded by app.js: require('./music-discovery')(app, { fetchText, trailersCache, TRAILERS_CACHE_MS, fetchRockstarGtaViVideos, mergeTrailers });
 */
module.exports = function registerMusicAndTrailerJobs(app, deps) {
  const fetchText = deps.fetchText;
  const trailersCache = deps.trailersCache;
  const TRAILERS_CACHE_MS = deps.TRAILERS_CACHE_MS;
  const fetchRockstarGtaViVideos = deps.fetchRockstarGtaViVideos;
  const mergeTrailers = deps.mergeTrailers;

  const MUSIC_CACHE_MS = 30 * 60 * 1000;
  const SPOTIFY_ALBUM_ID = '5BYKG4MHfySZthe2W6r7n4';
  const SPOTIFY_ALBUM_EMBED = 'https://open.spotify.com/embed/album/' + SPOTIFY_ALBUM_ID;
  let musicCache = { at: 0, data: null };

  const SEED_MUSIC = [
    { id: 'album', title: 'Full Album (preview)', artist: '34 tracks \u00b7 Atlantic / Rockstar \u00b7 unlocks Nov 19', spotify: 'album/' + SPOTIFY_ALBUM_ID, album: true },
    { id: 'thats-it', title: "That's It", artist: 'Yung Lean feat. Future & Metro Boomin', spotify: 'track/6dUXpM7mnGr7cSpCUQewCs' },
    { id: 'rhyno', title: 'RHYNO', artist: 'Travis Scott (prod. Guy-Manuel de Homem-Christo)', spotify: 'track/2NliF6CtlWolNA0Jzkw4ba' },
    { id: 'sexy-magic', title: 'Sexy Magic', artist: 'CA7RIEL & Paco Amoroso, PinkPantheress, Fred again.. & \u00c9tienne de Cr\u00e9cy', spotify: 'track/5AIwo9vC79ce0A7u3DgB1N' },
    { id: 'flower', title: 'Flower in a Hurricane', artist: 'Justice feat. Tame Impala, SZA & King Gizzard', spotify: 'track/1bRWSJwUGWCsOih08iFFTV' },
    { id: 'last-thing', title: 'Last Thing You Need', artist: 'Morgan Wallen', spotify: 'track/1KVvsmAWUhd3Xyex4IS3DD' },
    { id: 'suzuki', title: 'Suzuki', artist: 'Fuerza Regida', spotify: 'track/4DuL1odbViQNnk9o1nol5J' },
    { id: 'macacoa', title: 'Macacoa 2000', artist: 'Rauw Alejandro', spotify: 'track/2oOtzWzQrHPmvtMAzoms7Q' },
    { id: 'dont-chart', title: "Don't Chart", artist: 'Cardi B', spotify: 'track/5ES7lNls3ZjYuSfTIdKOvr' },
    { id: 'bright-lights', title: 'Bright Lights, Big City', artist: 'Keith Richards', spotify: 'track/2X67K1KTLBg9EU2dMUQC42' },
    { id: 'pusher', title: 'Pusher', artist: 'Justice feat. Gesaffelstein \u00b7 Original Score', spotify: 'track/6pxjskMHpE4QBmxoOX6O5H' }
  ];

  function musicSlug(title, trackId) {
    const base = String(title || trackId || 'track')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);
    return base || trackId || 'track';
  }

  function isPlaceholderTrackTitle(title) {
    return /^track\s*\d+$/i.test(String(title || '').trim());
  }

  async function fetchSpotifyAlbumTracks() {
    const html = await fetchText(SPOTIFY_ALBUM_EMBED, {
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (!m) throw new Error('spotify embed: no __NEXT_DATA__');
    const data = JSON.parse(m[1]);
    const entity = data && data.props && data.props.pageProps && data.props.pageProps.state
      && data.props.pageProps.state.data && data.props.pageProps.state.data.entity;
    if (!entity || !Array.isArray(entity.trackList)) throw new Error('spotify embed: no trackList');
    const out = [];
    entity.trackList.forEach(function (t, idx) {
      const uri = t.uri || '';
      const trackId = uri.indexOf('spotify:track:') === 0 ? uri.slice('spotify:track:'.length) : null;
      const title = (t.title || t.name || '').trim();
      const artist = (t.subtitle || '').replace(/\u00a0/g, ' ').trim();
      const duration = typeof t.duration === 'number' ? t.duration : 0;
      const playable = !!t.isPlayable && duration > 0 && !isPlaceholderTrackTitle(title);
      if (!trackId || !playable) return;
      out.push({
        id: musicSlug(title, trackId),
        title: title,
        artist: artist || 'Grand Theft Auto VI',
        spotify: 'track/' + trackId,
        album: false,
        durationMs: duration,
        trackNumber: idx + 1,
        source: 'spotify-album'
      });
    });
    return {
      tracks: out,
      isPreRelease: !!entity.isPreRelease,
      releaseDate: entity.releaseDate && entity.releaseDate.isoString ? entity.releaseDate.isoString : null,
      albumName: entity.name || 'Grand Theft Auto VI: The Album'
    };
  }

  function mergeMusicTracks(discovered) {
    const bySpotify = new Map();
    const album = SEED_MUSIC.find(function (s) { return s.album; }) || {
      id: 'album', title: 'Full Album (preview)', artist: '34 tracks \u00b7 Atlantic / Rockstar \u00b7 unlocks Nov 19',
      spotify: 'album/' + SPOTIFY_ALBUM_ID, album: true
    };
    bySpotify.set(album.spotify, Object.assign({}, album));
    SEED_MUSIC.forEach(function (s) {
      if (s.album) return;
      bySpotify.set(s.spotify, Object.assign({}, s, { source: 'seed' }));
    });
    (discovered || []).forEach(function (d) {
      if (!d.spotify) return;
      const tid = d.spotify.indexOf('track/') === 0 ? d.spotify.slice(6) : null;
      if (bySpotify.has(d.spotify)) return;
      if (tid) {
        let dup = false;
        bySpotify.forEach(function (existing) {
          if (dup) return;
          if (existing.spotify && existing.spotify.indexOf('track/') === 0 && existing.spotify.slice(6) === tid) dup = true;
          const et = String(existing.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
          const dt = String(d.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
          if (et && dt && et === dt) dup = true;
        });
        if (dup) return;
      }
      bySpotify.set(d.spotify, Object.assign({}, d, { source: d.source || 'spotify-album' }));
    });
    const ordered = [];
    ordered.push(bySpotify.get(album.spotify));
    SEED_MUSIC.forEach(function (s) {
      if (s.album) return;
      if (bySpotify.has(s.spotify)) ordered.push(bySpotify.get(s.spotify));
    });
    const extras = [];
    bySpotify.forEach(function (v, k) {
      if (k === album.spotify) return;
      if (SEED_MUSIC.some(function (s) { return s.spotify === k; })) return;
      extras.push(v);
    });
    extras.sort(function (a, b) {
      return (a.trackNumber || 999) - (b.trackNumber || 999);
    });
    return ordered.concat(extras);
  }

  async function refreshMusicCache() {
    try {
      const disc = await fetchSpotifyAlbumTracks();
      const items = mergeMusicTracks(disc.tracks);
      const data = {
        items: items,
        source: 'spotify-album',
        albumId: SPOTIFY_ALBUM_ID,
        albumUrl: 'https://open.spotify.com/album/' + SPOTIFY_ALBUM_ID,
        isPreRelease: disc.isPreRelease,
        releaseDate: disc.releaseDate,
        checkedAt: new Date().toISOString()
      };
      musicCache = { at: Date.now(), data: data };
      console.log('  \ud83c\udfb5  Music cache refreshed: ' + items.length + ' playable entries (' + disc.tracks.length + ' from Spotify)');
      return data;
    } catch (err) {
      console.log('  \ud83c\udfb5  Music discovery failed:', err && err.message ? err.message : err);
      if (musicCache.data) return musicCache.data;
      const items = mergeMusicTracks([]);
      const fallback = {
        items: items,
        source: 'seed',
        albumId: SPOTIFY_ALBUM_ID,
        albumUrl: 'https://open.spotify.com/album/' + SPOTIFY_ALBUM_ID,
        checkedAt: new Date().toISOString(),
        error: 'discovery_failed'
      };
      musicCache = { at: Date.now(), data: fallback };
      return fallback;
    }
  }

  app.get('/api/music', async (_req, res) => {
    res.set('Cache-Control', 'no-store');
    if (musicCache.data && Date.now() - musicCache.at < MUSIC_CACHE_MS) {
      return res.json(musicCache.data);
    }
    try {
      const data = await refreshMusicCache();
      return res.json(data);
    } catch (err) {
      if (musicCache.data) return res.json(musicCache.data);
      return res.json({
        items: mergeMusicTracks([]),
        source: 'seed',
        checkedAt: new Date().toISOString(),
        error: 'discovery_failed'
      });
    }
  });

  async function refreshTrailersCache() {
    try {
      const discovered = await fetchRockstarGtaViVideos();
      const items = await mergeTrailers(discovered);
      const data = {
        items: items,
        source: 'rockstar-youtube',
        sort: 'publishedAt-desc',
        checkedAt: new Date().toISOString(),
        channel: 'https://www.youtube.com/@RockstarGames'
      };
      trailersCache.at = Date.now();
      trailersCache.data = data;
      console.log('  \ud83c\udfac  Trailer cache refreshed: ' + items.length + ' videos');
    } catch (err) {
      console.log('  \ud83c\udfac  Background trailer refresh failed:', err && err.message ? err.message : err);
    }
  }

  setInterval(function () {
    refreshTrailersCache().catch(function () {});
  }, TRAILERS_CACHE_MS);
  refreshTrailersCache().catch(function () {});

  setInterval(function () {
    refreshMusicCache().catch(function () {});
  }, MUSIC_CACHE_MS);
  refreshMusicCache().catch(function () {});
};
