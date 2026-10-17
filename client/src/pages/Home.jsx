import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Card, Input, Badge, Spinner, Alert } from '../components/ui';

export default function Home() {
  const navigate = useNavigate();

  // State
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dailyAyah, setDailyAyah] = useState(null);
  const [dailyAyahLoading, setDailyAyahLoading] = useState(true);
  const [dailyAudioPlaying, setDailyAudioPlaying] = useState(false);
  const [audioObj, setAudioObj] = useState(null);
  const [lastRead, setLastRead] = useState(null);

  // Featured Surah Numbers (Curated selection)
  const featuredNumbers = [1, 36, 55, 67, 18, 112, 2, 56];

  useEffect(() => {
    // Fetch initial Surahs
    const fetchSurahs = async () => {
      try {
        const res = await axios.get('/api/surahs');
        if (res.data && res.data.length > 0) {
          setSurahs(res.data);
        } else {
          // Fallback static curated data if DB is seeding/empty
          setSurahs(getFallbackSurahs());
        }
      } catch (err) {
        console.warn('API unavailable, loading local fallback surahs');
        setSurahs(getFallbackSurahs());
      } finally {
        setLoading(false);
      }
    };

    // Fetch Daily Ayah
    const fetchDailyAyah = async () => {
      try {
        const res = await axios.get('/api/ayahs/daily');
        if (res.data) {
          setDailyAyah(res.data);
        } else {
          setDailyAyah(getFallbackDailyAyah());
        }
      } catch (err) {
        setDailyAyah(getFallbackDailyAyah());
      } finally {
        setDailyAyahLoading(false);
      }
    };

    // Load Last Read from LocalStorage
    try {
      const savedLast = localStorage.getItem('noor_last_read');
      if (savedLast) {
        setLastRead(JSON.parse(savedLast));
      }
    } catch (e) {
      console.error(e);
    }

    fetchSurahs();
    fetchDailyAyah();

    return () => {
      if (audioObj) {
        audioObj.pause();
      }
    };
  }, []);

  // Filter surahs based on quick search
  const filteredSurahs = surahs.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return featuredNumbers.includes(s.number);
    return (
      s.number.toString() === q ||
      (s.nameTransliteration || '').toLowerCase().includes(q) ||
      (s.nameMeaning || '').toLowerCase().includes(q) ||
      (s.nameArabic || '').includes(q)
    );
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/surahs?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const toggleDailyAudio = () => {
    if (!dailyAyah || !dailyAyah.audioUrl) return;

    if (dailyAudioPlaying && audioObj) {
      audioObj.pause();
      setDailyAudioPlaying(false);
    } else {
      if (audioObj) {
        audioObj.play();
        setDailyAudioPlaying(true);
      } else {
        const newAudio = new Audio(dailyAyah.audioUrl);
        newAudio.onended = () => setDailyAudioPlaying(false);
        newAudio.play().catch((err) => console.log('Audio playback prevented:', err));
        setAudioObj(newAudio);
        setDailyAudioPlaying(true);
      }
    }
  };

  return (
    <div className="home-page">
      {/* 1. HERO SECTION */}
      <section className="hero">
        <img
          className="hero-bg"
          src="https://picsum.photos/seed/mushaf1/1600/900"
          alt="Quran Open Mushaf Background"
        />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-basmala-box animate-in">
            <p className="arabic-basmala">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
            <span className="eyebrow">In the name of Allah, the Most Gracious, the Most Merciful</span>
          </div>

          <h1 className="hero-title animate-in">
            Every ayah, in its own <span className="gradient-text">light.</span>
          </h1>

          <p className="hero-subtitle animate-in">
            A serene digital mushaf built for quiet daily reading, faithful audio recitation, and deep personal reflection — without noise or distraction.
          </p>

          <div className="hero-actions animate-in">
            <Link to="/surahs" className="btn-primary">
              Begin Reading
            </Link>
            <Link to="/surah/1" className="btn-secondary">
              Open Al-Fatihah
            </Link>
          </div>

          {/* Search Bar in Hero */}
          <form onSubmit={handleSearchSubmit} className="hero-search-form animate-in">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search surah by name or number (e.g., 'Ya-Sin', '55', 'Al-Kahf')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="hero-search-input"
              />
              <button type="submit" className="btn-primary search-btn">
                Find Chapter
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 2. CONTINUE READING / QUICK RESUME */}
      {lastRead && (
        <section className="section bg-surface-2 continue-section">
          <div className="container">
            <div className="continue-card animate-in">
              <div className="continue-info">
                <span className="badge badge-primary">Resume Reading</span>
                <h3>
                  Surah {lastRead.surahName} ({lastRead.surahNumber}) — Ayah {lastRead.ayahNumber}
                </h3>
                <p className="text-muted">Pick up exactly where you left the light during your last visit.</p>
              </div>
              <Link to={`/surah/${lastRead.surahNumber}?ayah=${lastRead.ayahNumber}`} className="btn-primary">
                Continue Reading →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 3. DAILY AYAH FEATURE */}
      <section className="section daily-ayah-section">
        <div className="container">
          <div className="section-head text-center">
            <span className="eyebrow">A Verse For Today</span>
            <h2>Sit with an ayah, let it settle</h2>
            <p className="section-desc">
              Every visit highlights a timeless verse for slow reading and active reflection.
            </p>
          </div>

          {dailyAyahLoading ? (
            <div className="text-center py-5">
              <Spinner size="lg" />
            </div>
          ) : dailyAyah ? (
            <div className="daily-ayah-card card animate-in">
              <div className="daily-ayah-header">
                <div className="ayah-badge-hexagon">
                  <span>{dailyAyah.ayahNumber}</span>
                </div>
                <div className="daily-ayah-meta">
                  <h4 className="surah-title-meta">
                    Surah {dailyAyah.surahName || 'Al-Baqarah'} ({dailyAyah.surahNumber || 2}:{dailyAyah.ayahNumber})
                  </h4>
                  <span className="revelation-tag">
                    {dailyAyah.juz ? `Juz ${dailyAyah.juz}` : 'Medinan'}
                  </span>
                </div>
                <button
                  onClick={toggleDailyAudio}
                  className={`recite-play-btn ${dailyAudioPlaying ? 'playing' : ''}`}
                  title={dailyAudioPlaying ? 'Pause Audio' : 'Listen to Ayah'}
                >
                  <span className="play-icon">{dailyAudioPlaying ? '⏸' : '▶'}</span>
                </button>
              </div>

              <div className="daily-ayah-body">
                <p className="arabic-ayat-text" dir="rtl">
                  {dailyAyah.textArabic}
                </p>
                {dailyAyah.textTransliteration && (
                  <p className="transliteration-text">{dailyAyah.textTransliteration}</p>
                )}
                <p className="translation-text">"{dailyAyah.textTranslation}"</p>
              </div>

              <div className="daily-ayah-footer">
                <Link to={`/surah/${dailyAyah.surahNumber || 2}`} className="btn-ghost btn-sm">
                  Read Full Surah →
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* 4. CURATED SURAH GRID */}
      <section className="section bg-surface">
        <div className="container">
          <div className="section-head flex-between">
            <div>
              <span className="eyebrow">The Noble Chapters</span>
              <h2>Begin with a surah close to the heart</h2>
            </div>
            <Link to="/surahs" className="btn-secondary">
              View All 114 Surahs →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-4 surah-grid animate-in">
              {filteredSurahs.slice(0, 8).map((surah) => (
                <Link
                  to={`/surah/${surah.number}`}
                  key={surah.number}
                  className="card surah-card hover-lift"
                >
                  <div className="surah-card-top">
                    <div className="oct-badge">{surah.number}</div>
                    <span className="surah-arabic-title">{surah.nameArabic}</span>
                  </div>
                  <div className="surah-card-main">
                    <h3 className="surah-english">{surah.nameTransliteration}</h3>
                    <p className="surah-meaning">{surah.nameMeaning}</p>
                  </div>
                  <div className="surah-card-bottom">
                    <span className="badge badge-neutral">{surah.revelationPlace}</span>
                    <span className="ayat-count">{surah.ayahCount} Ayahs</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. FEATURE HIGHLIGHTS */}
      <section className="section">
        <div className="container">
          <div className="section-head text-center">
            <span className="eyebrow">Built For Stillness</span>
            <h2>Designed to remove every barrier between you and the Quran</h2>
          </div>

          <div className="grid grid-3 features-grid animate-in">
            <div className="feature-card card">
              <div className="feature-icon">📖</div>
              <h3>Uthmani Typography</h3>
              <p>
                Rendered using clean, high-contrast Amiri Uthmani fonts that emulate a physical mushaf page with spacious line gaps for effortless reading.
              </p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">🎧</div>
              <h3>Ayah-by-Ayah Audio</h3>
              <p>
                Listen to world-renowned Qaris reciting verse by verse. Pause, replay, or let it auto-advance seamlessly as you follow along.
              </p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">🔖</div>
              <h3>Saved Reflections</h3>
              <p>
                Bookmark your position instantly with lightweight offline browser storage so you can pick up exactly where you left off.
              </p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">🌐</div>
              <h3>Clear Translations</h3>
              <p>
                Toggle side-by-side English translations and transliterations to ponder the meanings and refine your pronunciation.
              </p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">🕌</div>
              <h3>Pure & Distraction-Free</h3>
              <p>
                Zero advertisements, zero tracking, and zero clutter. A quiet, luminous space crafted strictly for devotion and study.
              </p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Search</h3>
              <p>
                Locate any chapter or verse instantly by number, Arabic title, or English translation name in milliseconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. VOICE FEATURE SHOWCASE */}
      <section className="section bg-surface-2 voice-showcase">
        <div className="container">
          <div className="grid grid-2 showcase-split animate-in">
            <div className="showcase-content">
              <span className="eyebrow">Audio Recitation Voice Feature</span>
              <h2>Hear the Word in its original cadence</h2>
              <p>
                Listening to the Quran brings quietude to the heart. Noor features crisp, high-definition audio recitations synced directly with each ayah text block.
              </p>
              <ul className="showcase-list">
                <li>✨ Synchronized audio highlighting while reading</li>
                <li>✨ Multiple respected Qaris (Mishary Rashid Alafasy, AbdulBaset, Minshawi)</li>
                <li>✨ Single-tap play per ayah for easy memorization repetition</li>
              </ul>
              <div className="mt-4">
                <Link to="/surahs" className="btn-primary">
                  Explore Recitations
                </Link>
              </div>
            </div>

            <div className="showcase-media card card-white flex-center p-4">
              <img
                src="https://picsum.photos/seed/mosque-interior/800/600"
                alt="Grand Mosque Column Architecture"
                className="img-rounded aspect-hero object-cover"
              />
              <div className="waveform-overlay">
                <div className="waveform-bar bar-1"></div>
                <div className="waveform-bar bar-2"></div>
                <div className="waveform-bar bar-3"></div>
                <div className="waveform-bar bar-4"></div>
                <div className="waveform-bar bar-2"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. STATS BAND */}
      <section className="section bg-primary text-white stats-section">
        <div className="container">
          <div className="grid grid-4 text-center">
            <div className="stat-item">
              <div className="stat-value">114</div>
              <div className="stat-label">Complete Surahs</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">6,236</div>
              <div className="stat-label">Faithful Ayahs</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">100%</div>
              <div className="stat-label">Ad-Free Experience</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">24/7</div>
              <div className="stat-label">Instant Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. COMMUNITY TESTIMONIALS */}
      <section className="section">
        <div className="container">
          <div className="section-head text-center">
            <span className="eyebrow">Reflections</span>
            <h2>Loved by readers seeking quietness</h2>
          </div>

          <div className="grid grid-3 testimonials-grid animate-in">
            <div className="testimonial card">
              <p className="testimonial-text">
                "The typography is the most comfortable I have seen online. Reading Ayah by Ayah without pop-ups allows me to actually reflect on what I'm reading during my commute."
              </p>
              <div className="testimonial-author">
                <img src="https://i.pravatar.cc/150?img=11" alt="Zaid H." className="avatar" />
                <div>
                  <h4>Zaid H.</h4>
                  <span className="testimonial-role">Daily Reader</span>
                </div>
              </div>
            </div>

            <div className="testimonial card">
              <p className="testimonial-text">
                "The audio sync makes revision and memorization so easy. Tapping an ayah to hear the correct Tajweed pronunciation has helped me tremendously."
              </p>
              <div className="testimonial-author">
                <img src="https://i.pravatar.cc/150?img=32" alt="Amina M." className="avatar" />
                <div>
                  <h4>Amina M.</h4>
                  <span className="testimonial-role">Memorization Student</span>
                </div>
              </div>
            </div>

            <div className="testimonial card">
              <p className="testimonial-text">
                "Clean, fast, and reverent. It feels like opening a physical, warm mushaf. Noor has become a primary part of my morning worship routine."
              </p>
              <div className="testimonial-author">
                <img src="https://i.pravatar.cc/150?img=53" alt="Tariq K." className="avatar" />
                <div>
                  <h4>Tariq K.</h4>
                  <span className="testimonial-role">Teacher</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CLOSING CTA BANNER */}
      <section className="cta-section">
        <div className="container text-center">
          <h2>The whole Quran is already here.</h2>
          <p className="cta-subtitle">
            No sign-up or registration required to begin. Just open a surah and let the light settle in your heart.
          </p>
          <div className="cta-actions">
            <Link to="/surahs" className="btn-primary btn-lg">
              Open The Mushaf
            </Link>
            <Link to="/about" className="btn-secondary btn-lg">
              Read Our Mission
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Fallback curated surahs if API isn't populated yet
function getFallbackSurahs() {
  return [
    { number: 1, nameArabic: 'الفاتحة', nameTransliteration: 'Al-Fatihah', nameMeaning: 'The Opening', revelationPlace: 'Meccan', ayahCount: 7 },
    { number: 36, nameArabic: 'يس', nameTransliteration: 'Ya-Sin', nameMeaning: 'Ya Sin', revelationPlace: 'Meccan', ayahCount: 83 },
    { number: 55, nameArabic: 'الرحمن', nameTransliteration: 'Ar-Rahman', nameMeaning: 'The Beneficent', revelationPlace: 'Medinan', ayahCount: 78 },
    { number: 67, nameArabic: 'الملك', nameTransliteration: 'Al-Mulk', nameMeaning: 'The Sovereignty', revelationPlace: 'Meccan', ayahCount: 30 },
    { number: 18, nameArabic: 'الكهف', nameTransliteration: 'Al-Kahf', nameMeaning: 'The Cave', revelationPlace: 'Meccan', ayahCount: 110 },
    { number: 112, nameArabic: 'الإخلاص', nameTransliteration: 'Al-Ikhlas', nameMeaning: 'The Sincerity', revelationPlace: 'Meccan', ayahCount: 4 },
    { number: 2, nameArabic: 'البقرة', nameTransliteration: 'Al-Baqarah', nameMeaning: 'The Cow', revelationPlace: 'Medinan', ayahCount: 286 },
    { number: 56, nameArabic: 'الواقعة', nameTransliteration: 'Al-Waqi\'ah', nameMeaning: 'The Inevitable', revelationPlace: 'Meccan', ayahCount: 96 },
  ];
}

// Fallback daily ayah
function getFallbackDailyAyah() {
  return {
    surahNumber: 2,
    surahName: 'Al-Baqarah',
    ayahNumber: 255,
    textArabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ',
    textTransliteration: 'Allahu la ilaha illa huwal-hayyul-qayyum...',
    textTranslation: 'Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep.',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/255.mp3',
    juz: 3
  };
}