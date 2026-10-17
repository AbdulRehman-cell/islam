import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function About() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    relatedSurah: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/feedbacks', {
        name: formData.name,
        email: formData.email,
        relatedSurah: formData.relatedSurah ? parseInt(formData.relatedSurah, 10) : undefined,
        message: formData.message
      });
      setSuccess(true);
      setFormData({ name: '', email: '', relatedSurah: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="about-page animate-in">
      {/* Hero Section */}
      <section className="hero hero-compact">
        <img
          className="hero-bg"
          src="https://picsum.photos/seed/mosqueinterior2/1600/900"
          alt="Luminous Islamic architectural arch"
        />
        <div className="container">
          <span className="eyebrow">Our Mission & Foundation</span>
          <h1>
            Why <span className="gradient-text">Noor</span> Exists
          </h1>
          <p className="hero-subtitle">
            We built Noor to remove every distraction between a reader and the Quran — one clean page, one true recitation, one ayah at a time.
          </p>
        </div>
      </section>

      {/* Section 1: Core Mission & Principles */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Reverence & Precision</span>
            <h2>Built for stillness, not scrolling</h2>
            <p>
              In an age of digital noise, Noor is crafted as a sanctuary for quiet contemplation and daily Quranic recitation.
            </p>
          </div>

          <div className="grid grid-3">
            <div className="card feature-card">
              <div className="feature-icon">✨</div>
              <h3>Uthmani Script</h3>
              <p>
                Every verse is rendered strictly using standard Uthmani calligraphic text, honoring centuries of traditional Quranic craftsmanship and typography.
              </p>
            </div>

            <div className="card feature-card">
              <div className="feature-icon">🎙️</div>
              <h3>Faithful Recitation</h3>
              <p>
                Clear, high-fidelity audio recitations synchronized verse-by-verse, enabling students and listeners to follow word for word with precision.
              </p>
            </div>

            <div className="card feature-card">
              <div className="feature-icon">🍃</div>
              <h3>Uncluttered Sanctuary</h3>
              <p>
                Zero banner advertisements, zero social feeds, and no algorithmic distractions. Only the text, its meanings, and the voice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Visual Story / Media Split */}
      <section className="section section-alt">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'center' }}>
            <div className="content-col">
              <span className="eyebrow">Data Verification</span>
              <h2>Every word, checked. Every voice, credited.</h2>
              <p>
                The integrity of sacred text demands uncompromising rigor. Noor sources all verse text, translations, and verse timing metrics from verified open Quranic academic databases.
              </p>
              <div className="stats-row" style={{ marginTop: '24px', marginBottom: '24px' }}>
                <div className="stat-item">
                  <span className="stat-value">114</span>
                  <span className="stat-label">Verified Surahs</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">6,236</span>
                  <span className="stat-label">Precise Ayahs</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">100%</span>
                  <span className="stat-label">Ad-Free Access</span>
                </div>
              </div>
              <p className="text-muted">
                Our audio stream links directly to world-renowned reciters including Mishary Rashid Al-Afasy, Mahmoud Khalil Al-Husary, and AbdulBaset AbdulSamad.
              </p>
            </div>

            <div className="image-col">
              <div className="card card-elevated" style={{ padding: '0', overflow: 'hidden' }}>
                <img
                  src="https://picsum.photos/seed/mushafopen1/800/600"
                  alt="Open Uthmani Mushaf on carved wooden rehal"
                  style={{ width: '100%', height: '360px', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ padding: '20px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>
                    Traditional Uthmani Layout
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--muted)' }}>
                    Faithfully typeset with Amiri Quran typography to preserve legibility and authentic diacritics on modern displays.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: How to Use Noor */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Simplicity First</span>
            <h2>Three steps between you and the ayah</h2>
            <p>Designed for immediate access whether you have thirty seconds or thirty minutes.</p>
          </div>

          <div className="grid grid-3">
            <div className="card step-card">
              <div className="step-num">01</div>
              <h3>Search or Select</h3>
              <p>
                Filter the 114 surahs by revelation origin (Meccan or Medinan) or jump instantly using surah numbers or transliterated names.
              </p>
            </div>

            <div className="card step-card">
              <div className="step-num">02</div>
              <h3>Listen Ayah-by-Ayah</h3>
              <p>
                Tap any verse number badge to highlight the verse and play its audio recitation. Audio seamlessly auto-advances through the chapter.
              </p>
            </div>

            <div className="card step-card">
              <div className="step-num">03</div>
              <h3>Save & Resume</h3>
              <p>
                Bookmark your current reading position with a single click. Returning visitors can pick up reading right where they left off.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Video / Recitation Spotlight */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Audio Experience</span>
            <h2>Immerse yourself in recitation</h2>
            <p>Experience the tranquil beauty of verse-by-verse recitation with clean synchronization.</p>
          </div>

          <div className="video-embed aspect-hero" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <iframe
              src="https://www.youtube.com/embed/281O2R-R9s0?autoplay=0&rel=0"
              title="Quran Recitation Showcase"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>

      {/* Section 5: Feedback / Contact Form */}
      <section className="section">
        <div className="container container-narrow">
          <div className="section-head">
            <span className="eyebrow">Community & Accuracy</span>
            <h2>Found something that needs correcting?</h2>
            <p>
              Tell us. The precision of this mushaf matters more than anything else we build. If you notice a typo in translation or a broken audio link, please let us know.
            </p>
          </div>

          <div className="card card-elevated" style={{ padding: '36px' }}>
            {success ? (
              <div className="alert alert-success" style={{ padding: '24px', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 8px 0', color: 'var(--primary)' }}>✦ JazakAllah Khair!</h3>
                <p style={{ margin: 0 }}>
                  Your feedback has been received. Our team will verify the text and update the database promptly.
                </p>
                <button
                  className="btn-secondary btn-sm"
                  style={{ marginTop: '20px' }}
                  onClick={() => setSuccess(false)}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="feedback-form">
                {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

                <div className="grid grid-2" style={{ gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label htmlFor="name">Your Name (optional)</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="e.g. Abdullah"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="you@example.com"
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label htmlFor="relatedSurah">Related Surah Number (optional)</label>
                  <input
                    type="number"
                    id="relatedSurah"
                    name="relatedSurah"
                    min="1"
                    max="114"
                    placeholder="e.g. 36 for Surah Ya-Sin"
                    value={formData.relatedSurah}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label htmlFor="message">Note or Feedback Details</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    required
                    placeholder="Describe the translation edit, audio issue, or feature suggestion..."
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Submitting Feedback...' : 'Send Feedback'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <div className="cta-section">
        <div className="container">
          <h2>The whole Quran is already here.</h2>
          <p>No sign-up required to begin. Just open a surah and read.</p>
          <div className="cta-actions">
            <Link to="/surahs" className="btn-primary">
              Open the Mushaf
            </Link>
            <Link to="/" className="btn-secondary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}