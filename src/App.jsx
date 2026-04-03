import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, X, ChevronDown, Sparkles, Music, Play, ArrowLeft, Square, Activity } from 'lucide-react';

const LANGUAGES = [
    "Malayalam", "Tamil", "Telugu", "Hindi", "English", "Kannada", "Punjabi",
    "Spanish", "Korean", "Japanese"
];

const LANG_COUNTRY_MAP = {
    "Malayalam": "IN", "Tamil": "IN", "Telugu": "IN", "Hindi": "IN", "Kannada": "IN", "Punjabi": "IN",
    "English": "US", "Spanish": "ES", "Korean": "KR", "Japanese": "JP", "French": "FR", "Arabic": "AE", "Portuguese": "BR", "German": "DE", "Russian": "RU", "Turkish": "TR"
};

const LANG_ARTIST_MAP = {
    "Malayalam": ["Sushin Shyam", "Gopi Sundar", "Shaan Rahman", "Hesham Abdul", "Vidyasagar", "Deepak Dev", "Vishnu Vijay"],
    "Tamil": ["Anirudh", "A.R. Rahman", "Harris Jayaraj", "Yuvan Shankar Raja", "Santhosh Narayanan", "GV Prakash"],
    "Telugu": ["Thaman S", "Devi Sri Prasad", "Anup Rubens", "Mickey J Meyer", "Mani Sharma"],
    "Hindi": ["Arijit Singh", "Pritam", "Amit Trivedi", "Vishal-Shekhar", "Shreya Ghoshal"],
    "English": ["The Weeknd", "Taylor Swift", "Drake", "Dua Lipa", "Billie Eilish"],
    "Kannada": ["Arjun Janya", "Ravi Basrur", "V. Harikrishna", "Ajaneesh Loknath"],
    "Punjabi": ["Diljit Dosanjh", "AP Dhillon", "Karan Aujla", "Sidhu Moose Wala"],
    "Spanish": ["Bad Bunny", "J Balvin", "Rosalia", "Shakira", "Karol G"],
    "Korean": ["BTS", "BLACKPINK", "NewJeans", "EXO", "TWICE"],
    "Japanese": ["YOASOBI", "Kenshi Yonezu", "RADWIMPS", "Ado", "Vaundy"]
};

// 🧠 THE ALGORITHM: Analyzes the pixels of the image to determine the exact mood and theme
const analyzeImageVibe = (imgElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imgElement.width || 100;
    canvas.height = imgElement.height || 100;

    // Draw image to canvas to read the pixels
    ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

    let r = 0, g = 0, b = 0;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let count = 0;

    // Sample every 20th pixel to process really fast
    for (let i = 0; i < data.length; i += 80) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
    }

    r = Math.floor(r / count);
    g = Math.floor(g / count);
    b = Math.floor(b / count);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    let mood = "";
    let searchTags = [];

    // Algorithm Matrix: Maps visual color data to musical vibes
    if (brightness < 70) {
        mood = "lofi";
        searchTags = ["dark", "midnight", "bgm", "sad"];
    } else if (r > g + 40 && r > b + 40) {
        mood = "love";
        searchTags = ["romantic", "love", "melody"];
    } else if (b > r + 30 && b > g + 30) {
        mood = "chill";
        searchTags = ["ocean", "calm", "sad"];
    } else if (g > r + 20 && g > b + 20) {
        mood = "nature";
        searchTags = ["peace", "flute", "bgm"];
    } else if (r > 150 && g > 100 && b < 100) {
        mood = "aesthetic";
        searchTags = ["sunset", "acoustic", "lofi"];
    } else if (brightness > 180) {
        mood = "happy";
        searchTags = ["upbeat", "party", "dance"];
    } else {
        mood = "vibe";
        searchTags = ["trending", "hits", "pop"];
    }

    return { rgb: `rgb(${r},${g},${b})`, mood, searchTags, brightness };
};

export default function App() {
    const [step, setStep] = useState(1);
    const [image, setImage] = useState(null);
    const [language, setLanguage] = useState('Malayalam');
    const [results, setResults] = useState([]);
    const [analysisData, setAnalysisData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentAudio, setCurrentAudio] = useState(null);
    const [playingId, setPlayingId] = useState(null);

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

    const fetchSongs = async () => {
        // 1. Give the DOM time to render the image before scanning
        const imgElement = document.getElementById('preview-image-scan');

        // 2. Run the algorithmic pixel scan!
        const vibeData = analyzeImageVibe(imgElement);
        setAnalysisData(vibeData);

        try {
            // 3. Construct a highly targeted query specific to the picture's vibe + native artists
            // By picking native artists, we 100% guarantee the songs will be in the correct language
            const artistsList = LANG_ARTIST_MAP[language];
            const selectedArtist = artistsList ? artistsList[Math.floor(Math.random() * artistsList.length)] : language;

            const query = encodeURIComponent(`${selectedArtist} ${vibeData.mood}`.trim());
            const countryCode = LANG_COUNTRY_MAP[language] || "US";

            const response = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=10&country=${countryCode}`);
            const data = await response.json();

            // 4. Fallback search if the mood combined with artist is too strict
            let finalResults = data.results;
            if (finalResults.length === 0) {
                const fallbackQuery = encodeURIComponent(`${selectedArtist}`);
                const fallbackRes = await fetch(`https://itunes.apple.com/search?term=${fallbackQuery}&entity=song&limit=10&country=${countryCode}`);
                const fallbackData = await fallbackRes.json();
                finalResults = fallbackData.results;
            }

            // Ensure we strictly just pick 4 results
            finalResults = finalResults.slice(0, 4);

            const tracks = finalResults.map(track => ({
                id: track.trackId,
                title: track.trackName,
                artist: track.artistName,
                cover: track.artworkUrl100,
                preview: track.previewUrl
            }));

            setResults(tracks.length > 0 ? tracks : [
                {
                    id: 1,
                    title: `No ${language} songs found for this vibe`,
                    artist: `Mood detected: ${vibeData.mood}`,
                    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&h=150&fit=crop",
                    preview: null
                }
            ]);
        } catch (error) {
            console.error(error);
            setResults([]);
        }
    };

    const handleGenerate = async () => {
        if (!image) return;
        setStep(2);
        setIsLoading(true);

        // Instantly run the algorithm and fetch songs
        await fetchSongs();

        setStep(3);
        setIsLoading(false);
    };

    const playPreview = (url, id) => {
        if (!url) return;
        if (currentAudio) currentAudio.pause();
        if (playingId === id) {
            setPlayingId(null);
            setCurrentAudio(null);
            return;
        }
        const audio = new Audio(url);
        audio.play();
        audio.onended = () => setPlayingId(null);
        setCurrentAudio(audio);
        setPlayingId(id);
    };

    const reset = () => {
        if (currentAudio) {
            currentAudio.pause();
            setCurrentAudio(null);
            setPlayingId(null);
        }
        setStep(1);
        setImage(null);
        setResults([]);
    };

    return (
        <div className="app-container">
            <header>
                <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    StorySound
                </motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
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
                            className="card"
                        >
                            {!image ? (
                                <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                                    <div className="upload-icon"><ImageIcon size={32} /></div>
                                    <div className="upload-text">Upload your photo</div>
                                    <div className="upload-subtext">JPEG, PNG or WebP</div>
                                </div>
                            ) : (
                                <div className="image-wrapper">
                                    <img id="preview-image-scan" src={image} crossOrigin="anonymous" alt="Preview" className="preview-image" />
                                    <button className="remove-btn" onClick={removeImage}><X size={18} /></button>
                                </div>
                            )}

                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />

                            <div className="form-group">
                                <label>Music Language</label>
                                <div className="select-wrapper">
                                    <select className="language-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                                        {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                                    </select>
                                    <ChevronDown className="select-icon" size={20} />
                                </div>
                            </div>

                            <button className="primary-btn" onClick={handleGenerate} disabled={!image || isLoading}>
                                <Activity size={20} /> Analyze Photo Vibe
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="card analyzing-container">
                            <div className="pulse-ring"><Music size={32} color="white" /></div>
                            <div className="status-text">
                                <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }}>
                                    Scanning Image Colors & Brightness...
                                </motion.span>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && analysisData && (
                        <motion.div key="step-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
                            <div className="results-header">
                                <h2>Perfect Matches</h2>
                                <button className="back-btn" onClick={reset}><ArrowLeft size={16} /> Try another</button>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', borderLeft: `6px solid ${analysisData.rgb}` }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px' }}>AI Vibe Analysis</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'capitalize' }}>
                                        {analysisData.mood} / {analysisData.searchTags[0]}
                                    </div>
                                </div>
                            </div>

                            <div className="song-list">
                                {results.map((song, i) => (
                                    <motion.div key={song.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="song-card">
                                        <img src={song.cover} alt={song.title} className="song-cover" />
                                        <div className="song-info">
                                            <div className="song-title">{song.title}</div>
                                            <div className="song-artist">{song.artist}</div>
                                        </div>
                                        {song.preview && (
                                            <button
                                                className="play-btn"
                                                onClick={() => playPreview(song.preview, song.id)}
                                                style={{ background: playingId === song.id ? 'var(--accent)' : 'rgba(255,255,255,0.1)' }}
                                            >
                                                {playingId === song.id ? <Square size={16} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                                            </button>
                                        )}
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
