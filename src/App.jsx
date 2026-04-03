import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, X, ChevronDown, Sparkles, Music, Play, ArrowLeft } from 'lucide-react';

// Simulated mock data for results
const MOCK_RESULTS = [
    {
        id: 1,
        title: "Golden Hour Vibes",
        artist: "JVKE (Acoustic Cover)",
        cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&h=150&fit=crop",
    },
    {
        id: 2,
        title: "Sunset Chaser",
        artist: "The Midnight",
        cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&h=150&fit=crop",
    },
    {
        id: 3,
        title: "Ocean Drive",
        artist: "Duke Dumont",
        cover: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f924?w=150&h=150&fit=crop",
    }
];

export default function App() {
    const [step, setStep] = useState(1); // 1: upload, 2: analyzing, 3: results
    const [image, setImage] = useState(null);
    const [language, setLanguage] = useState('english');
    const fileInputRef = useRef(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setImage(imageUrl);
        }
    };

    const removeImage = () => {
        setImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleGenerate = () => {
        if (!image) return;
        setStep(2);

        // Simulate AI processing time
        setTimeout(() => {
            setStep(3);
        }, 3000);
    };

    const reset = () => {
        setStep(1);
        setImage(null);
    };

    return (
        <div className="app-container">
            <header>
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    StorySound
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    Find the perfect track for your moment
                </motion.p>
            </header>

            <main>
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step-1"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="card"
                        >
                            {!image ? (
                                <div
                                    className="upload-area"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="upload-icon">
                                        <ImageIcon size={32} />
                                    </div>
                                    <div className="upload-text">Upload your photo</div>
                                    <div className="upload-subtext">JPEG, PNG or WebP (Max 5MB)</div>
                                </div>
                            ) : (
                                <div className="image-wrapper">
                                    <img src={image} alt="Preview" className="preview-image" />
                                    <button className="remove-btn" onClick={removeImage}>
                                        <X size={18} />
                                    </button>
                                </div>
                            )}

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />

                            <div className="form-group">
                                <label>Music Language</label>
                                <div className="select-wrapper">
                                    <select
                                        className="language-select"
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                    >
                                        <option value="english">English (Global)</option>
                                        <option value="spanish">Spanish</option>
                                        <option value="hindi">Hindi</option>
                                        <option value="korean">Korean (K-Pop)</option>
                                        <option value="japanese">Japanese</option>
                                        <option value="french">French</option>
                                        <option value="instrumental">Instrumental Only</option>
                                    </select>
                                    <ChevronDown className="select-icon" size={20} />
                                </div>
                            </div>

                            <button
                                className="primary-btn"
                                onClick={handleGenerate}
                                disabled={!image}
                            >
                                <Sparkles size={20} />
                                Find AI Recommendations
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="card analyzing-container"
                        >
                            <div className="pulse-ring">
                                <Music size={32} color="white" />
                            </div>
                            <div className="status-text">
                                <motion.span
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    Analyzing mood & scene...
                                </motion.span>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Curating tracks that match this vibe
                            </p>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step-3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="card"
                        >
                            <div className="results-header">
                                <h2>Perfect Matches</h2>
                                <button className="back-btn" onClick={reset}>
                                    <ArrowLeft size={16} /> Try another
                                </button>
                            </div>

                            <div className="image-wrapper" style={{ marginBottom: '1.5rem' }}>
                                <img src={image} alt="Original" className="preview-image" style={{ maxHeight: '150px' }} />
                            </div>

                            <div className="tags-container">
                                <span className="tag">Sunset</span>
                                <span className="tag">Chill</span>
                                <span className="tag">Aesthetic</span>
                                <span className="tag">Nostalgic</span>
                            </div>

                            <div className="song-list">
                                {MOCK_RESULTS.map((song, i) => (
                                    <motion.div
                                        key={song.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="song-card"
                                    >
                                        <img src={song.cover} alt={song.title} className="song-cover" />
                                        <div className="song-info">
                                            <div className="song-title">{song.title}</div>
                                            <div className="song-artist">{song.artist}</div>
                                        </div>
                                        <button className="play-btn">
                                            <Play size={18} fill="currentColor" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
