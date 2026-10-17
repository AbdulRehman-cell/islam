import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, Badge, EmptyState, Spinner, Alert } from '../components/ui';

export default function Bookmarks() {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playingAudio, setPlayingAudio] = useState(null);
  const [activeAudioObj, setActiveAudioObj] = useState(null);
  const [noteInput, setNoteInput] = useState({});
  const [editingNoteId, setEditingNoteId] = useState(null);

  useEffect(() => {
    loadBookmarks();
    return () => {
      if (activeAudioObj) {
        activeAudioObj.pause();
      }
    };
  }, []);

  const loadBookmarks = async () => {
    setLoading(true);
    setError('');
    try {
      // Load saved bookmarks from localStorage
      const saved = JSON.parse(localStorage.getItem('noor_bookmarks') || '[]');
      
      if (saved.length === 0) {
        setBookmarks([]);
        setLoading(false);
        return;
      }

      // Fetch surah data for context if needed
      const surahsRes = await axios.get('/api/surahs');
      const surahsMap = {};
      (surahsRes.data || []).forEach(s => {
        surahsMap[s.number] = s;
      });

      // Augment local bookmark items with full details
      const enriched = saved.map(bm => ({
        ...bm,
        surahInfo: surahsMap[bm.surahNumber] || {
          nameArabic: `سورة ${bm.surahNumber}`,
          nameTransliteration: `Surah ${bm.surahNumber}`
        }
      }));

      setBookmarks(enriched);
    } catch (e) {
      console.error('Error loading bookmarks', e);
      // Fallback to local storage values without network error blocking render
      const saved = JSON.parse(localStorage.getItem('noor_bookmarks') || '[]');
      setBookmarks(saved);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = (surahNum, ayahNum) => {
    const saved = JSON.parse(localStorage.getItem('noor_bookmarks') || '[]');
    const filtered = saved.filter(b => !(b.surahNumber === surahNum && b.ayahNumber === ayahNum));
    localStorage.setItem('noor_bookmarks', JSON.stringify(filtered));
    setBookmarks(prev => prev.filter(b => !(b.surahNumber === surahNum && b.ayahNumber === ayahNum)));
  };

  const handlePlayAudio = (bmKey, audioUrl) => {
    if (playingAudio === bmKey) {
      if (activeAudioObj) {
        activeAudioObj.pause();
      }
      setPlayingAudio(null);
      setActiveAudioObj(null);
      return;
    }

    if (activeAudioObj) {
      activeAudioObj.pause();
    }

    // Default audio URL fallback if not present
    const url = audioUrl || `https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3`;
    const audio = new Audio(url);
    setActiveAudioObj(audio);
    setPlayingAudio(bmKey);

    audio.play().catch(err => {
      console.error('Audio playback error', err);
      setPlayingAudio(null);
    });

    audio.onended = () => {
      setPlayingAudio(null);
      setActiveAudioObj(null);
    };
  };

  const handleSaveNote = (surahNum, ayahNum) => {
    const key = `${surahNum}:${ayahNum}`;
    const newNote = noteInput[key] || '';
    
    const saved = JSON.parse(localStorage.getItem('noor_bookmarks') || '[]');
    const updated = saved.map(b => {
      if (b.surahNumber === surahNum && b.ayahNumber === ayahNum) {
        return { ...b, note: newNote };
      }
      return b;
    });

    localStorage.setItem('noor_bookmarks', JSON.stringify(updated));
    setBookmarks(prev => prev.map(b => {
      if (b.surahNumber === surahNum && b.ayahNumber === ayahNum) {
        return { ...b, note: newNote };
      }
      return b;
    }));
    setEditingNoteId(null);
  };

  const clearAllBookmarks = () => {
    if (window.confirm('Are you sure you want to clear all your saved bookmarks?')) {
      localStorage.removeItem('noor_bookmarks');
      setBookmarks([]);
    }
  };

  return (
    <div className="bookmarks-page">
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Personal Sanctuary</span>
          <h1>Saved Ayahs & Reflection Notes</h1>
          <p className="page-hero-sub">
            Your collection of cherished verses, kept safe for quiet reflection, study, and daily return.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container">
        {error && (
          <div className="section-spacing-sm">
            <Alert variant="error" title="Notice">{error}</Alert>
          </div>
        )}

        {loading ? (
          <div className="loading-state-container">
            <Spinner size="lg" color="primary" />
            <p className="loading-text">Gathering your saved verses...</p>
          </div>
        ) : bookmarks.length === 0 ? (
          <section className="section">
            <Card padding="lg" className="empty-bookmarks-card">
              <EmptyState
                icon="🔖"
                title="No saved ayahs yet"
                description="When you read a surah, tap the bookmark icon next to any ayah to save it here for quick access and personal reflection."
                action={
                  <Link to="/surahs" className="btn-primary">
                    Explore Surahs
                  </Link>
                }
              />
            </Card>
          </section>
        ) : (
          <>
            {/* Action Bar */}
            <div className="bookmarks-action-bar">
              <div className="bookmarks-count-badge">
                <Badge variant="primary" size="lg">
                  {bookmarks.length} {bookmarks.length === 1 ? 'Ayah' : 'Ayahs'} Saved
                </Badge>
              </div>
              <button 
                onClick={clearAllBookmarks} 
                className="btn-ghost btn-sm text-danger"
                style={{ color: '#b91c1c' }}
              >
                Clear All Bookmarks
              </button>
            </div>

            {/* Bookmarks Grid */}
            <section className="section-sm">
              <div className="bookmarks-grid">
                {bookmarks.map((bm, index) => {
                  const bmKey = `${bm.surahNumber}:${bm.ayahNumber}`;
                  const isPlaying = playingAudio === bmKey;
                  const isEditing = editingNoteId === bmKey;

                  return (
                    <Card key={bmKey} variant="bordered" className="bookmark-card animate-in">
                      <div className="bookmark-header">
                        <div className="bookmark-surah-meta">
                          <span className="ayah-oct-badge">
                            {bm.ayahNumber}
                          </span>
                          <div className="bookmark-titles">
                            <h3 className="bookmark-surah-name">
                              {bm.surahInfo?.nameTransliteration || `Surah ${bm.surahNumber}`}
                            </h3>
                            <span className="bookmark-surah-arabic">
                              {bm.surahInfo?.nameArabic || ''}
                            </span>
                          </div>
                        </div>

                        <div className="bookmark-actions-top">
                          <button
                            onClick={() => handlePlayAudio(bmKey, bm.audioUrl)}
                            className={`btn-recite-mini ${isPlaying ? 'playing' : ''}`}
                            title={isPlaying ? 'Pause recitation' : 'Recite ayah'}
                          >
                            {isPlaying ? '⏸' : '▶'}
                          </button>
                          <button
                            onClick={() => handleRemoveBookmark(bm.surahNumber, bm.ayahNumber)}
                            className="btn-icon-danger"
                            title="Remove bookmark"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Verse Text Area */}
                      <div className="bookmark-content-body">
                        <div className="bookmark-arabic-text" dir="rtl">
                          {bm.textArabic || 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'}
                        </div>
                        {bm.textTransliteration && (
                          <div className="bookmark-transliteration">
                            {bm.textTransliteration}
                          </div>
                        )}
                        <div className="bookmark-translation">
                          "{bm.textTranslation || 'In the name of Allah, the Entirely Merciful, the Especially Merciful.'}"
                        </div>
                      </div>

                      {/* Reflection Note Section */}
                      <div className="bookmark-note-section">
                        {isEditing ? (
                          <div className="bookmark-note-edit">
                            <textarea
                              rows={3}
                              className="note-textarea"
                              placeholder="Write a reflection or personal note about this verse..."
                              value={noteInput[bmKey] ?? (bm.note || '')}
                              onChange={(e) => setNoteInput({ ...noteInput, [bmKey]: e.target.value })}
                            />
                            <div className="note-actions">
                              <Button 
                                size="sm" 
                                variant="primary" 
                                onClick={() => handleSaveNote(bm.surahNumber, bm.ayahNumber)}
                              >
                                Save Note
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => setEditingNoteId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="bookmark-note-view">
                            {bm.note ? (
                              <div className="saved-note-box">
                                <span className="note-label">Personal Reflection:</span>
                                <p className="note-text">{bm.note}</p>
                                <button 
                                  onClick={() => {
                                    setNoteInput({ ...noteInput, [bmKey]: bm.note });
                                    setEditingNoteId(bmKey);
                                  }}
                                  className="btn-link-sm"
                                >
                                  Edit Note
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => setEditingNoteId(bmKey)}
                                className="btn-add-note"
                              >
                                + Add reflection note
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card Footer Link */}
                      <div className="bookmark-card-footer">
                        <Link 
                          to={`/surah/${bm.surahNumber}?ayah=${bm.ayahNumber}`} 
                          className="btn-secondary btn-sm full-width-center"
                        >
                          Read in Surah Context →
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* Section 2: How Bookmarking Works */}
        <section className="section">
          <div className="section-head">
            <span className="eyebrow">Daily Habit</span>
            <h2>How to Cultivate Daily Reflection</h2>
            <p>Simple tools designed to keep Quranic contemplation integral to your daily life.</p>
          </div>

          <div className="grid grid-3">
            <Card padding="md" variant="flat" className="feature-card">
              <div className="feature-icon">📌</div>
              <h3>Save Mid-Reading</h3>
              <p>
                When reading any surah, click the bookmark icon next to any ayah to instantly pin your place or highlight a verse that moves you.
              </p>
            </Card>

            <Card padding="md" variant="flat" className="feature-card">
              <div className="feature-icon">✍️</div>
              <h3>Attach Notes & Thoughts</h3>
              <p>
                Write private reflection notes under saved ayahs. Document how a specific verse answers a prayer or guides a current life decision.
              </p>
            </Card>

            <Card padding="md" variant="flat" className="feature-card">
              <div className="feature-icon">🔊</div>
              <h3>Listen on the Go</h3>
              <p>
                Replay audio recitations for individual bookmarked verses directly from this page for quick memorization and review.
              </p>
            </Card>
          </div>
        </section>

        {/* Section 3: Recommended Verses to Start With */}
        <section className="section bg-surface-2-card">
          <div className="section-head">
            <span className="eyebrow">Curated Verses</span>
            <h2>Timeless Ayahs for Reflection</h2>
            <p>Looking for a verse to start your collection? Here are beloved passages worth holding close.</p>
          </div>

          <div className="grid grid-2">
            <Card variant="bordered" className="curated-verse-card">
              <span className="badge badge-primary">Surah Ash-Sharh (94:5-6)</span>
              <div className="curated-arabic" dir="rtl">
                فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا
              </div>
              <p className="curated-translation">
                "For indeed, with hardship comes ease. Indeed, with hardship comes ease."
              </p>
              <div className="curated-card-action">
                <Link to="/surah/94" className="btn-ghost btn-sm">
                  Open Surah Ash-Sharh →
                </Link>
              </div>
            </Card>

            <Card variant="bordered" className="curated-verse-card">
              <span className="badge badge-primary">Surah Ar-Ra'd (13:28)</span>
              <div className="curated-arabic" dir="rtl">
                أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
              </div>
              <p className="curated-translation">
                "Unquestionably, by the remembrance of Allah do hearts find rest."
              </p>
              <div className="curated-card-action">
                <Link to="/surah/13" className="btn-ghost btn-sm">
                  Open Surah Ar-Ra'd →
                </Link>
              </div>
            </Card>
          </div>
        </section>

        {/* Section 4: Inspirational Banner */}
        <div className="cta-section margin-top-lg">
          <span className="eyebrow eyebrow-light">Carry the Light</span>
          <h2>"The most beloved of deeds to Allah are those that are most consistent."</h2>
          <p className="cta-sub">
            Return to your bookmarked verses daily. Even one ayah read with contemplation illuminates your path.
          </p>
          <div className="hero-actions">
            <Link to="/surahs" className="btn-primary">
              Browse All 114 Surahs
            </Link>
            <Link to="/about" className="btn-secondary">
              Learn About Noor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}