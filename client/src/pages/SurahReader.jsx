import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Card, Badge, Spinner, Alert, Select, toast } from '../components/ui';

export default function SurahReader() {
  const { number } = useParams();
  const navigate = useNavigate();

  const [surah, setSurah] = useState(null);
  const [ayat, setAyat] = useState([]);
  const [reciters, setReciters] = useState([]);
  const [selectedReciter, setSelectedReciter] = useState('ar.alafasy');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reader UI Preferences
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [fontSize, setFontSize] = useState('md'); // 'sm', 'md', 'lg'
  
  // Bookmarks state (from localStorage)
  const [bookmarks, setBookmarks] = useState([]);

  // Audio Playback state
  const [currentlyPlayingAyah, setCurrentlyPlayingAyah] = useState(null); // ayahNumber
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    // Load saved bookmarks from localStorage
    const savedBookmarks = JSON.parse(localStorage.getItem('noor_bookmarks') || '[]');
    setBookmarks(savedBookmarks);

    fetchSurahAndAyat();

    return () => {
      // Clean up audio playback on unmount
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [number]);

  // Audio event listeners setup
  useEffect(() => {
    const audio = audioRef.current;

    const handleEnded = () => {
      // Auto-advance to next ayah if available
      if (currentlyPlayingAyah !== null) {
        const nextAyahNum = currentlyPlayingAyah + 1;
        const nextAyah = ayat.find((a) => a.ayahNumber === nextAyahNum);
        if (nextAyah) {
          playAyahAudio(nextAyah);
        } else {
          setCurrentlyPlayingAyah(null);
          setIsPlaying(false);
          toast.info('Completed recitation of Surah.');
        }
      }
    };

    const handleError = () => {
      toast.error('Failed to load audio stream for this ayah.');
      setIsPlaying(false);
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentlyPlayingAyah, ayat]);

  const fetchSurahAndAyat = async () => {
    setLoading(true);
    setError('');
    setIsPlaying(false);
    setCurrentlyPlayingAyah(null);

    try {
      const [surahRes, ayatRes, recitersRes] = await Promise.all([
        axios.get(`/api/surahs/${number}`),
        axios.get(`/api/ayahs/surah/${number}`),
        axios.get('/api/reciters')
      ]);

      setSurah(surahRes.data);
      setAyat(ayatRes.data);
      if (recitersRes.data && recitersRes.data.length > 0) {
        setReciters(recitersRes.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to load surah content. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  const playAyahAudio = (ayah) => {
    const audio = audioRef.current;

    if (currentlyPlayingAyah === ayah.ayahNumber && isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    // Construct audio URL based on selected reciter or ayah property
    // Fallback URL structure for Mishary Rashid Alafasy if backend URL isn't present
    const audioSrc = ayah.audioUrl || `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.ayahNumber}.mp3`;
    
    audio.src = audioSrc;
    audio.play()
      .then(() => {
        setCurrentlyPlayingAyah(ayah.ayahNumber);
        setIsPlaying(true);
        // Smooth scroll ayah into view if not in view
        const elem = document.getElementById(`ayah-${ayah.ayahNumber}`);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      })
      .catch((e) => {
        console.error("Audio play error:", e);
        toast.error('Unable to play audio recitation right now.');
      });
  };

  const toggleBookmark = (ayah) => {
    let updated;
    const isBookmarked = bookmarks.some(
      (b) => b.surahNumber === surah.number && b.ayahNumber === ayah.ayahNumber
    );

    if (isBookmarked) {
      updated = bookmarks.filter(
        (b) => !(b.surahNumber === surah.number && b.ayahNumber === ayah.ayahNumber)
      );
      toast.info(`Removed Ayah ${ayah.ayahNumber} from bookmarks`);
    } else {
      const newBookmark = {
        surahNumber: surah.number,
        surahName: surah.nameTransliteration,
        ayahNumber: ayah.ayahNumber,
        textArabic: ayah.textArabic,
        textTranslation: ayah.textTranslation,
        savedAt: new Date().toISOString()
      };
      updated = [newBookmark, ...bookmarks];
      toast.success(`Bookmarked Ayah ${ayah.ayahNumber}`);
    }

    setBookmarks(updated);
    localStorage.setItem('noor_bookmarks', JSON.stringify(updated));
  };

  const isAyahBookmarked = (ayahNum) => {
    if (!surah) return false;
    return bookmarks.some(
      (b) => b.surahNumber === surah.number && b.ayahNumber === ayahNum
    );
  };

  const fontClass = fontSize === 'sm' ? 'arabic-sm' : fontSize === 'lg' ? 'arabic-lg' : 'arabic-md';

  if (loading) {
    return (
      <div className="container reading-container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <Spinner size="lg" color="primary" />
        <p style={{ marginTop: '20px', color: 'var(--muted)' }}>Opening the mushaf...</p>
      </div>
    );
  }

  if (error || !surah) {
    return (
      <div className="container reading-container" style={{ padding: '60px 20px' }}>
        <Alert variant="error" title="Surah Load Error">
          {error || 'Surah not found.'}
        </Alert>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Button variant="secondary" onClick={() => navigate('/surahs')}>
            Return to Surah Index
          </Button>
        </div>
      </div>
    );
  }

  const prevSurahNum = surah.number > 1 ? surah.number - 1 : null;
  const nextSurahNum = surah.number < 114 ? surah.number + 1 : null;

  return (
    <div className="surah-reader-page">
      {/* 1. COMPACT PAGE HERO HEADER */}
      <section className="reader-hero">
        <div className="container container-narrow text-center">
          <div className="surah-header-meta">
            <span className="badge badge-primary">{surah.revelationPlace} Revelation</span>
            <span className="bullet-sep">•</span>
            <span>Surah #{surah.number}</span>
            <span className="bullet-sep">•</span>
            <span>{surah.ayahCount} Ayahs</span>
          </div>

          <h1 className="surah-arabic-title">{surah.nameArabic}</h1>
          <h2 className="surah-translit-title">{surah.nameTransliteration}</h2>
          <p className="surah-meaning">"{surah.nameMeaning}"</p>

          <div className="hero-actions" style={{ marginTop: '24px' }}>
            <Button
              variant="primary"
              size="lg"
              iconLeft={<span className="icon">▶</span>}
              onClick={() => {
                if (ayat.length > 0) {
                  playAyahAudio(ayat[0]);
                }
              }}
            >
              {isPlaying && currentlyPlayingAyah !== null ? 'Recitation Playing' : 'Play Full Surah'}
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION DIVIDER WITH STAR */}
      <div className="section-divider">
        <span className="star-glyph">✦</span>
      </div>

      {/* 2. STICKY READING CONTROLS BAR */}
      <section className="reading-controls-section">
        <div className="container container-narrow">
          <Card padding="sm" className="controls-card">
            <div className="controls-wrapper">
              <div className="control-group">
                <span className="control-label">View Toggles:</span>
                <button
                  type="button"
                  className={`chip-btn ${showTranslation ? 'active' : ''}`}
                  onClick={() => setShowTranslation(!showTranslation)}
                >
                  Translation
                </button>
                <button
                  type="button"
                  className={`chip-btn ${showTransliteration ? 'active' : ''}`}
                  onClick={() => setShowTransliteration(!showTransliteration)}
                >
                  Transliteration
                </button>
              </div>

              <div className="control-group">
                <span className="control-label">Font Size:</span>
                <div className="font-size-picker">
                  <button
                    type="button"
                    className={`size-btn ${fontSize === 'sm' ? 'active' : ''}`}
                    onClick={() => setFontSize('sm')}
                  >
                    A-
                  </button>
                  <button
                    type="button"
                    className={`size-btn ${fontSize === 'md' ? 'active' : ''}`}
                    onClick={() => setFontSize('md')}
                  >
                    A
                  </button>
                  <button
                    type="button"
                    className={`size-btn ${fontSize === 'lg' ? 'active' : ''}`}
                    onClick={() => setFontSize('lg')}
                  >
                    A+
                  </button>
                </div>
              </div>

              {reciters.length > 0 && (
                <div className="control-group reciter-select-group">
                  <span className="control-label">Reciter:</span>
                  <select
                    className="reciter-dropdown"
                    value={selectedReciter}
                    onChange={(e) => setSelectedReciter(e.target.value)}
                  >
                    <option value="ar.alafasy">Mishary Rashid Alafasy</option>
                    <option value="ar.abdulbasitmurattal">AbdulBaset AbdulSamad</option>
                    <option value="ar.minshawi">Mohamed Siddiq al-Minshawi</option>
                  </select>
                </div>
              )}
            </div>
          </Card>
        </div>
      </section>

      {/* 3. BISMILLAH BANNER (For all surahs except Surah At-Tawbah #9) */}
      {surah.number !== 9 && (
        <section className="bismillah-section">
          <div className="container container-narrow text-center">
            <div className="bismillah-text">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </div>
            <p className="bismillah-sub">In the name of Allah, the Most Gracious, the Most Merciful</p>
          </div>
        </section>
      )}

      {/* 4. MAIN AYAT LIST SECTION */}
      <section className="section ayat-list-section">
        <div className="container container-narrow">
          {ayat.length === 0 ? (
            <Card padding="lg" className="text-center">
              <p>No verses loaded for this surah.</p>
            </Card>
          ) : (
            <div className="ayat-stack">
              {ayat.map((ayah) => {
                const isCurrentlyActive = currentlyPlayingAyah === ayah.ayahNumber;
                const bookmarked = isAyahBookmarked(ayah.ayahNumber);

                return (
                  <div
                    key={ayah.ayahNumber}
                    id={`ayah-${ayah.ayahNumber}`}
                    className={`ayah-card ${isCurrentlyActive ? 'ayah-active' : ''}`}
                  >
                    <div className="ayah-meta-header">
                      <div className="ayah-number-badge">
                        <span className="octagon-badge">{ayah.ayahNumber}</span>
                      </div>

                      <div className="ayah-actions-top">
                        <button
                          type="button"
                          className={`icon-btn ${isCurrentlyActive && isPlaying ? 'playing' : ''}`}
                          title="Listen to ayah"
                          onClick={() => playAyahAudio(ayah)}
                        >
                          {isCurrentlyActive && isPlaying ? '⏸ Pause' : '▶ Listen'}
                        </button>

                        <button
                          type="button"
                          className={`icon-btn ${bookmarked ? 'bookmarked' : ''}`}
                          title={bookmarked ? 'Remove bookmark' : 'Bookmark ayah'}
                          onClick={() => toggleBookmark(ayah)}
                        >
                          {bookmarked ? '★ Saved' : '☆ Bookmark'}
                        </button>
                      </div>
                    </div>

                    {/* Arabic Text Block */}
                    <div className={`ayah-arabic-body ${fontClass}`}>
                      {ayah.textArabic}
                      <span className="ayah-end-marker"> ۝{ayah.ayahNumber}</span>
                    </div>

                    {/* Optional Transliteration */}
                    {showTransliteration && ayah.textTransliteration && (
                      <div className="ayah-transliteration">
                        {ayah.textTransliteration}
                      </div>
                    )}

                    {/* Optional Translation */}
                    {showTranslation && (
                      <div className="ayah-translation">
                        {ayah.textTranslation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 5. SURAH NAVIGATION FOOTER */}
      <section className="section surah-nav-footer">
        <div className="container container-narrow">
          <div className="surah-nav-grid">
            {prevSurahNum ? (
              <Link to={`/surah/${prevSurahNum}`} className="nav-surah-card prev">
                <span className="nav-dir">← Previous Surah</span>
                <span className="nav-title">Surah #{prevSurahNum}</span>
              </Link>
            ) : <div />}

            <Link to="/surahs" className="nav-surah-card index-link">
              <span>View All 114 Surahs</span>
            </Link>

            {nextSurahNum ? (
              <Link to={`/surah/${nextSurahNum}`} className="nav-surah-card next">
                <span className="nav-dir">Next Surah →</span>
                <span className="nav-title">Surah #{nextSurahNum}</span>
              </Link>
            ) : <div />}
          </div>
        </div>
      </section>

      {/* 6. FLOATING MINI AUDIO PLAYER */}
      {currentlyPlayingAyah !== null && (
        <div className="mini-player-bar animate-in">
          <div className="container container-narrow mini-player-content">
            <div className="player-info">
              <span className="player-pulse-dot" />
              <div>
                <strong>Now Reciting:</strong> {surah.nameTransliteration} — Ayah {currentlyPlayingAyah}
              </div>
            </div>

            <div className="player-controls">
              <button
                type="button"
                className="btn-ghost btn-sm"
                onClick={() => {
                  const prev = ayat.find((a) => a.ayahNumber === currentlyPlayingAyah - 1);
                  if (prev) playAyahAudio(prev);
                }}
                disabled={currentlyPlayingAyah <= 1}
              >
                ⏮ Prev
              </button>

              <button
                type="button"
                className="btn-primary btn-sm"
                onClick={() => {
                  const current = ayat.find((a) => a.ayahNumber === currentlyPlayingAyah);
                  if (current) playAyahAudio(current);
                }}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>

              <button
                type="button"
                className="btn-ghost btn-sm"
                onClick={() => {
                  const next = ayat.find((a) => a.ayahNumber === currentlyPlayingAyah + 1);
                  if (next) playAyahAudio(next);
                }}
                disabled={currentlyPlayingAyah >= surah.ayahCount}
              >
                Next ⏭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}