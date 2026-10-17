import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Input, Badge, Button, Spinner, Alert, EmptyState } from '../components/ui';

// Extended client-side fallback list of all 114 Surahs for instant fast load
const ALL_SURAHS_DATA = [
  { number: 1, nameArabic: 'الفاتحة', nameTransliteration: 'Al-Fatihah', nameMeaning: 'The Opening', revelationPlace: 'Meccan', ayahCount: 7 },
  { number: 2, nameArabic: 'البقرة', nameTransliteration: 'Al-Baqarah', nameMeaning: 'The Cow', revelationPlace: 'Medinan', ayahCount: 286 },
  { number: 3, nameArabic: 'آل عمران', nameTransliteration: 'Ali \'Imran', nameMeaning: 'Family of Imran', revelationPlace: 'Medinan', ayahCount: 200 },
  { number: 4, nameArabic: 'النساء', nameTransliteration: 'An-Nisa', nameMeaning: 'The Women', revelationPlace: 'Medinan', ayahCount: 176 },
  { number: 5, nameArabic: 'المائدة', nameTransliteration: 'Al-Ma\'idah', nameMeaning: 'The Table Spread', revelationPlace: 'Medinan', ayahCount: 120 },
  { number: 6, nameArabic: 'الأنعام', nameTransliteration: 'Al-An\'am', nameMeaning: 'The Cattle', revelationPlace: 'Meccan', ayahCount: 165 },
  { number: 7, nameArabic: 'الأعراف', nameTransliteration: 'Al-A\'raf', nameMeaning: 'The Heights', revelationPlace: 'Meccan', ayahCount: 206 },
  { number: 8, nameArabic: 'الأنفال', nameTransliteration: 'Al-Anfal', nameMeaning: 'The Spoils of War', revelationPlace: 'Medinan', ayahCount: 75 },
  { number: 9, nameArabic: 'التوبة', nameTransliteration: 'At-Tawbah', nameMeaning: 'The Repentance', revelationPlace: 'Medinan', ayahCount: 129 },
  { number: 10, nameArabic: 'يونس', nameTransliteration: 'Yunus', nameMeaning: 'Jonah', revelationPlace: 'Meccan', ayahCount: 109 },
  { number: 11, nameArabic: 'هود', nameTransliteration: 'Hud', nameMeaning: 'Hud', revelationPlace: 'Meccan', ayahCount: 123 },
  { number: 12, nameArabic: 'يوسف', nameTransliteration: 'Yusuf', nameMeaning: 'Joseph', revelationPlace: 'Meccan', ayahCount: 111 },
  { number: 13, nameArabic: 'الرعد', nameTransliteration: 'Ar-Ra\'d', nameMeaning: 'The Thunder', revelationPlace: 'Medinan', ayahCount: 43 },
  { number: 14, nameArabic: 'إبراهيم', nameTransliteration: 'Ibrahim', nameMeaning: 'Abraham', revelationPlace: 'Meccan', ayahCount: 52 },
  { number: 15, nameArabic: 'الحجر', nameTransliteration: 'Al-Hijr', nameMeaning: 'The Rocky Tract', revelationPlace: 'Meccan', ayahCount: 99 },
  { number: 16, nameArabic: 'النحل', nameTransliteration: 'An-Nahl', nameMeaning: 'The Bee', revelationPlace: 'Meccan', ayahCount: 128 },
  { number: 17, nameArabic: 'الإسراء', nameTransliteration: 'Al-Isra', nameMeaning: 'The Night Journey', revelationPlace: 'Meccan', ayahCount: 111 },
  { number: 18, nameArabic: 'الكهف', nameTransliteration: 'Al-Kahf', nameMeaning: 'The Cave', revelationPlace: 'Meccan', ayahCount: 110 },
  { number: 19, nameArabic: 'مريم', nameTransliteration: 'Maryam', nameMeaning: 'Mary', revelationPlace: 'Meccan', ayahCount: 98 },
  { number: 20, nameArabic: 'طه', nameTransliteration: 'Taha', nameMeaning: 'Ta-Ha', revelationPlace: 'Meccan', ayahCount: 135 },
  { number: 21, nameArabic: 'الأنبياء', nameTransliteration: 'Al-Anbiya', nameMeaning: 'The Prophets', revelationPlace: 'Meccan', ayahCount: 112 },
  { number: 22, nameArabic: 'الحج', nameTransliteration: 'Al-Hajj', nameMeaning: 'The Pilgrimage', revelationPlace: 'Medinan', ayahCount: 78 },
  { number: 23, nameArabic: 'المؤمنون', nameTransliteration: 'Al-Mu\'minun', nameMeaning: 'The Believers', revelationPlace: 'Meccan', ayahCount: 118 },
  { number: 24, nameArabic: 'النور', nameTransliteration: 'An-Nur', nameMeaning: 'The Light', revelationPlace: 'Medinan', ayahCount: 64 },
  { number: 25, nameArabic: 'الفرقان', nameTransliteration: 'Al-Furqan', nameMeaning: 'The Criterion', revelationPlace: 'Meccan', ayahCount: 77 },
  { number: 26, nameArabic: 'الشعراء', nameTransliteration: 'Ash-Shu\'ara', nameMeaning: 'The Poets', revelationPlace: 'Meccan', ayahCount: 227 },
  { number: 27, nameArabic: 'النمل', nameTransliteration: 'An-Naml', nameMeaning: 'The Ant', revelationPlace: 'Meccan', ayahCount: 93 },
  { number: 28, nameArabic: 'القصص', nameTransliteration: 'Al-Qasas', nameMeaning: 'The Stories', revelationPlace: 'Meccan', ayahCount: 88 },
  { number: 29, nameArabic: 'العنكبوت', nameTransliteration: 'Al-\'Ankabut', nameMeaning: 'The Spider', revelationPlace: 'Meccan', ayahCount: 69 },
  { number: 30, nameArabic: 'الروم', nameTransliteration: 'Ar-Rum', nameMeaning: 'The Romans', revelationPlace: 'Meccan', ayahCount: 60 },
  { number: 31, nameArabic: 'لقمان', nameTransliteration: 'Luqman', nameMeaning: 'Luqman', revelationPlace: 'Meccan', ayahCount: 34 },
  { number: 32, nameArabic: 'السجدة', nameTransliteration: 'As-Sajdah', nameMeaning: 'The Prostration', revelationPlace: 'Meccan', ayahCount: 30 },
  { number: 33, nameArabic: 'الأحزاب', nameTransliteration: 'Al-Ahzab', nameMeaning: 'The Combined Forces', revelationPlace: 'Medinan', ayahCount: 73 },
  { number: 34, nameArabic: 'سبأ', nameTransliteration: 'Saba', nameMeaning: 'Sheba', revelationPlace: 'Meccan', ayahCount: 54 },
  { number: 35, nameArabic: 'فاطر', nameTransliteration: 'Fatir', nameMeaning: 'Originator', revelationPlace: 'Meccan', ayahCount: 45 },
  { number: 36, nameArabic: 'يس', nameTransliteration: 'Ya-Sin', nameMeaning: 'Ya-Sin', revelationPlace: 'Meccan', ayahCount: 83 },
  { number: 37, nameArabic: 'الصافات', nameTransliteration: 'As-Saffat', nameMeaning: 'Those who set the Ranks', revelationPlace: 'Meccan', ayahCount: 182 },
  { number: 38, nameArabic: 'ص', nameTransliteration: 'Sad', nameMeaning: 'The Letter Sad', revelationPlace: 'Meccan', ayahCount: 88 },
  { number: 39, nameArabic: 'الزمر', nameTransliteration: 'Az-Zumar', nameMeaning: 'The Troops', revelationPlace: 'Meccan', ayahCount: 75 },
  { number: 40, nameArabic: 'غافر', nameTransliteration: 'Ghafir', nameMeaning: 'The Forgiver', revelationPlace: 'Meccan', ayahCount: 85 },
  { number: 41, nameArabic: 'فصلت', nameTransliteration: 'Fussilat', nameMeaning: 'Explained in Detail', revelationPlace: 'Meccan', ayahCount: 54 },
  { number: 42, nameArabic: 'الشورى', nameTransliteration: 'Ash-Shura', nameMeaning: 'Consultation', revelationPlace: 'Meccan', ayahCount: 53 },
  { number: 43, nameArabic: 'الزخرف', nameTransliteration: 'Az-Zukhruf', nameMeaning: 'Gold Adornments', revelationPlace: 'Meccan', ayahCount: 89 },
  { number: 44, nameArabic: 'الدخان', nameTransliteration: 'Ad-Dukhan', nameMeaning: 'The Smoke', revelationPlace: 'Meccan', ayahCount: 59 },
  { number: 45, nameArabic: 'الجاثية', nameTransliteration: 'Al-Jathiyah', nameMeaning: 'Crouching', revelationPlace: 'Meccan', ayahCount: 37 },
  { number: 46, nameArabic: 'الأحقاف', nameTransliteration: 'Al-Ahqaf', nameMeaning: 'The Dunes', revelationPlace: 'Meccan', ayahCount: 35 },
  { number: 47, nameArabic: 'محمد', nameTransliteration: 'Muhammad', nameMeaning: 'Muhammad', revelationPlace: 'Medinan', ayahCount: 38 },
  { number: 48, nameArabic: 'الفتح', nameTransliteration: 'Al-Fath', nameMeaning: 'The Victory', revelationPlace: 'Medinan', ayahCount: 29 },
  { number: 49, nameArabic: 'الحجرات', nameTransliteration: 'Al-Hujurat', nameMeaning: 'The Dwellings', revelationPlace: 'Medinan', ayahCount: 18 },
  { number: 50, nameArabic: 'ق', nameTransliteration: 'Qaf', nameMeaning: 'The Letter Qaf', revelationPlace: 'Meccan', ayahCount: 45 },
  { number: 51, nameArabic: 'الذاريات', nameTransliteration: 'Adh-Dhariyat', nameMeaning: 'The Winnowing Winds', revelationPlace: 'Meccan', ayahCount: 60 },
  { number: 52, nameArabic: 'الطور', nameTransliteration: 'At-Tur', nameMeaning: 'The Mount', revelationPlace: 'Meccan', ayahCount: 49 },
  { number: 53, nameArabic: 'النجم', nameTransliteration: 'An-Najm', nameMeaning: 'The Star', revelationPlace: 'Meccan', ayahCount: 62 },
  { number: 54, nameArabic: 'القمر', nameTransliteration: 'Al-Qamar', nameMeaning: 'The Moon', revelationPlace: 'Meccan', ayahCount: 55 },
  { number: 55, nameArabic: 'الرحمن', nameTransliteration: 'Ar-Rahman', nameMeaning: 'The Beneficent', revelationPlace: 'Medinan', ayahCount: 78 },
  { number: 56, nameArabic: 'الواقعة', nameTransliteration: 'Al-Waqi\'ah', nameMeaning: 'The Inevitable', revelationPlace: 'Meccan', ayahCount: 96 },
  { number: 57, nameArabic: 'الحديد', nameTransliteration: 'Al-Hadid', nameMeaning: 'The Iron', revelationPlace: 'Medinan', ayahCount: 29 },
  { number: 58, nameArabic: 'المجادلة', nameTransliteration: 'Al-Mujadila', nameMeaning: 'The Pleading Woman', revelationPlace: 'Medinan', ayahCount: 22 },
  { number: 59, nameArabic: 'الحشر', nameTransliteration: 'Al-Hashr', nameMeaning: 'The Exile', revelationPlace: 'Medinan', ayahCount: 24 },
  { number: 60, nameArabic: 'الممتحنة', nameTransliteration: 'Al-Mumtahanah', nameMeaning: 'She that is to be examined', revelationPlace: 'Medinan', ayahCount: 13 },
  { number: 61, nameArabic: 'الصف', nameTransliteration: 'As-Saff', nameMeaning: 'The Ranks', revelationPlace: 'Medinan', ayahCount: 14 },
  { number: 62, nameArabic: 'الجمعة', nameTransliteration: 'Al-Jumu\'ah', nameMeaning: 'Friday', revelationPlace: 'Medinan', ayahCount: 11 },
  { number: 63, nameArabic: 'المنافقون', nameTransliteration: 'Al-Munafiqun', nameMeaning: 'The Hypocrites', revelationPlace: 'Medinan', ayahCount: 11 },
  { number: 64, nameArabic: 'التغابن', nameTransliteration: 'At-Taghabun', nameMeaning: 'Mutual Disillusion', revelationPlace: 'Medinan', ayahCount: 18 },
  { number: 65, nameArabic: 'الطلاق', nameTransliteration: 'At-Talaq', nameMeaning: 'Divorce', revelationPlace: 'Medinan', ayahCount: 12 },
  { number: 66, nameArabic: 'التحريم', nameTransliteration: 'At-Tahrim', nameMeaning: 'Prohibition', revelationPlace: 'Medinan', ayahCount: 12 },
  { number: 67, nameArabic: 'الملك', nameTransliteration: 'Al-Mulk', nameMeaning: 'The Sovereignty', revelationPlace: 'Meccan', ayahCount: 30 },
  { number: 68, nameArabic: 'القلم', nameTransliteration: 'Al-Qalam', nameMeaning: 'The Pen', revelationPlace: 'Meccan', ayahCount: 52 },
  { number: 69, nameArabic: 'الحاقة', nameTransliteration: 'Al-Haqqah', nameMeaning: 'The Inevitable Reality', revelationPlace: 'Meccan', ayahCount: 52 },
  { number: 70, nameArabic: 'المعارج', nameTransliteration: 'Al-Ma\'arij', nameMeaning: 'The Ascending Stairways', revelationPlace: 'Meccan', ayahCount: 44 },
  { number: 71, nameArabic: 'نوح', nameTransliteration: 'Nuh', nameMeaning: 'Noah', revelationPlace: 'Meccan', ayahCount: 28 },
  { number: 72, nameArabic: 'الجن', nameTransliteration: 'Al-Jinn', nameMeaning: 'The Jinn', revelationPlace: 'Meccan', ayahCount: 28 },
  { number: 73, nameArabic: 'المزمل', nameTransliteration: 'Al-Muzzammil', nameMeaning: 'The Enshrouded One', revelationPlace: 'Meccan', ayahCount: 20 },
  { number: 74, nameArabic: 'المدثر', nameTransliteration: 'Al-Muddaththir', nameMeaning: 'The Cloaked One', revelationPlace: 'Meccan', ayahCount: 56 },
  { number: 75, nameArabic: 'القيامة', nameTransliteration: 'Al-Qiyamah', nameMeaning: 'The Resurrection', revelationPlace: 'Meccan', ayahCount: 40 },
  { number: 76, nameArabic: 'الإنسان', nameTransliteration: 'Al-Insan', nameMeaning: 'Man', revelationPlace: 'Medinan', ayahCount: 31 },
  { number: 77, nameArabic: 'المرسلات', nameTransliteration: 'Al-Mursalat', nameMeaning: 'The Emissaries', revelationPlace: 'Meccan', ayahCount: 50 },
  { number: 78, nameArabic: 'النبأ', nameTransliteration: 'An-Naba', nameMeaning: 'The Tidings', revelationPlace: 'Meccan', ayahCount: 40 },
  { number: 79, nameArabic: 'النازعات', nameTransliteration: 'An-Nazi\'at', nameMeaning: 'Those who drag forth', revelationPlace: 'Meccan', ayahCount: 46 },
  { number: 80, nameArabic: 'عبس', nameTransliteration: '\'Abasa', nameMeaning: 'He Frowned', revelationPlace: 'Meccan', ayahCount: 42 },
  { number: 81, nameArabic: 'التكوير', nameTransliteration: 'At-Takwir', nameMeaning: 'The Overthrowing', revelationPlace: 'Meccan', ayahCount: 29 },
  { number: 82, nameArabic: 'الانفطار', nameTransliteration: 'Al-Infitar', nameMeaning: 'The Cleaving', revelationPlace: 'Meccan', ayahCount: 19 },
  { number: 83, nameArabic: 'المطففين', nameTransliteration: 'Al-Mutaffifin', nameMeaning: 'Defrauding', revelationPlace: 'Meccan', ayahCount: 36 },
  { number: 84, nameArabic: 'الانشقاق', nameTransliteration: 'Al-Inshiqaq', nameMeaning: 'The Splitting Open', revelationPlace: 'Meccan', ayahCount: 25 },
  { number: 85, nameArabic: 'البروج', nameTransliteration: 'Al-Buruj', nameMeaning: 'The Mansions of the Stars', revelationPlace: 'Meccan', ayahCount: 22 },
  { number: 86, nameArabic: 'الطارق', nameTransliteration: 'At-Tariq', nameMeaning: 'The Morning Star', revelationPlace: 'Meccan', ayahCount: 17 },
  { number: 87, nameArabic: 'الأعلى', nameTransliteration: 'Al-A\'la', nameMeaning: 'The Most High', revelationPlace: 'Meccan', ayahCount: 19 },
  { number: 88, nameArabic: 'الغاشية', nameTransliteration: 'Al-Ghashiyah', nameMeaning: 'The Overwhelming', revelationPlace: 'Meccan', ayahCount: 26 },
  { number: 89, nameArabic: 'الفجر', nameTransliteration: 'Al-Fajr', nameMeaning: 'The Dawn', revelationPlace: 'Meccan', ayahCount: 30 },
  { number: 90, nameArabic: 'البلد', nameTransliteration: 'Al-Balad', nameMeaning: 'The City', revelationPlace: 'Meccan', ayahCount: 20 },
  { number: 91, nameArabic: 'الشمس', nameTransliteration: 'Ash-Shams', nameMeaning: 'The Sun', revelationPlace: 'Meccan', ayahCount: 15 },
  { number: 92, nameArabic: 'الليل', nameTransliteration: 'Al-Layl', nameMeaning: 'The Night', revelationPlace: 'Meccan', ayahCount: 21 },
  { number: 93, nameArabic: 'الضحى', nameTransliteration: 'Ad-Duha', nameMeaning: 'The Morning Hours', revelationPlace: 'Meccan', ayahCount: 11 },
  { number: 94, nameArabic: 'الشرح', nameTransliteration: 'Ash-Sharh', nameMeaning: 'The Relief', revelationPlace: 'Meccan', ayahCount: 8 },
  { number: 95, nameArabic: 'التين', nameTransliteration: 'At-Tin', nameMeaning: 'The Fig', revelationPlace: 'Meccan', ayahCount: 8 },
  { number: 96, nameArabic: 'العلق', nameTransliteration: 'Al-\'Alaq', nameMeaning: 'The Clot', revelationPlace: 'Meccan', ayahCount: 19 },
  { number: 97, nameArabic: 'القدر', nameTransliteration: 'Al-Qadr', nameMeaning: 'The Power', revelationPlace: 'Meccan', ayahCount: 5 },
  { number: 98, nameArabic: 'البينة', nameTransliteration: 'Al-Bayyinah', nameMeaning: 'The Clear Proof', revelationPlace: 'Medinan', ayahCount: 8 },
  { number: 99, nameArabic: 'الزلزلة', nameTransliteration: 'Az-Zalzalah', nameMeaning: 'The Earthquake', revelationPlace: 'Medinan', ayahCount: 8 },
  { number: 100, nameArabic: 'العاديات', nameTransliteration: 'Al-\'Adiyat', nameMeaning: 'The Courser', revelationPlace: 'Meccan', ayahCount: 11 },
  { number: 101, nameArabic: 'القارعة', nameTransliteration: 'Al-Qari\'ah', nameMeaning: 'The Calamity', revelationPlace: 'Meccan', ayahCount: 11 },
  { number: 102, nameArabic: 'التكاثر', nameTransliteration: 'At-Takathur', nameMeaning: 'Rivalry in worldly increase', revelationPlace: 'Meccan', ayahCount: 8 },
  { number: 103, nameArabic: 'العصر', nameTransliteration: 'Al-\'Asr', nameMeaning: 'The Declining Day', revelationPlace: 'Meccan', ayahCount: 3 },
  { number: 104, nameArabic: 'الهمزة', nameTransliteration: 'Al-Humazah', nameMeaning: 'The Traducer', revelationPlace: 'Meccan', ayahCount: 9 },
  { number: 105, nameArabic: 'الفيل', nameTransliteration: 'Al-Fil', nameMeaning: 'The Elephant', revelationPlace: 'Meccan', ayahCount: 5 },
  { number: 106, nameArabic: 'قريش', nameTransliteration: 'Quraysh', nameMeaning: 'Quraysh', revelationPlace: 'Meccan', ayahCount: 4 },
  { number: 107, nameArabic: 'الماعون', nameTransliteration: 'Al-Ma\'un', nameMeaning: 'Small Kindnesses', revelationPlace: 'Meccan', ayahCount: 7 },
  { number: 108, nameArabic: 'الكوثر', nameTransliteration: 'Al-Kawthar', nameMeaning: 'Abundance', revelationPlace: 'Meccan', ayahCount: 3 },
  { number: 109, nameArabic: 'الكافرون', nameTransliteration: 'Al-Kafirun', nameMeaning: 'The Disbelievers', revelationPlace: 'Meccan', ayahCount: 6 },
  { number: 110, nameArabic: 'النصر', nameTransliteration: 'An-Nasr', nameMeaning: 'The Divine Support', revelationPlace: 'Medinan', ayahCount: 3 },
  { number: 111, nameArabic: 'المسد', nameTransliteration: 'Al-Masad', nameMeaning: 'The Palm Fiber', revelationPlace: 'Meccan', ayahCount: 5 },
  { number: 112, nameArabic: 'الإخلاص', nameTransliteration: 'Al-Ikhlas', nameMeaning: 'Sincerity', revelationPlace: 'Meccan', ayahCount: 4 },
  { number: 113, nameArabic: 'الفلق', nameTransliteration: 'Al-Falaq', nameMeaning: 'The Daybreak', revelationPlace: 'Meccan', ayahCount: 5 },
  { number: 114, nameArabic: 'الناس', nameTransliteration: 'An-Nas', nameMeaning: 'Mankind', revelationPlace: 'Meccan', ayahCount: 6 }
];

export default function SurahIndex() {
  const navigate = useNavigate();
  const [surahs, setSurahs] = useState(ALL_SURAHS_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [placeFilter, setPlaceFilter] = useState('ALL'); // 'ALL' | 'Meccan' | 'Medinan'
  const [sortBy, setSortBy] = useState('mushaf'); // 'mushaf' | 'revelation' | 'length'

  useEffect(() => {
    async function fetchSurahs() {
      try {
        setLoading(true);
        const res = await axios.get('/api/surahs');
        if (res.data && res.data.length > 0) {
          setSurahs(res.data);
        }
      } catch (e) {
        // Fallback already pre-populated in state for seamless experience
        console.log('Using local Surah index fallback dataset');
      } finally {
        setLoading(false);
      }
    }
    fetchSurahs();
  }, []);

  // Filtered and Sorted Surahs list
  const filteredSurahs = useMemo(() => {
    let list = [...surahs];

    // Search query filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((s) => {
        const numMatch = s.number.toString() === q;
        const translitMatch = s.nameTransliteration?.toLowerCase().includes(q);
        const meaningMatch = s.nameMeaning?.toLowerCase().includes(q);
        const arabicMatch = s.nameArabic?.includes(q);
        return numMatch || translitMatch || meaningMatch || arabicMatch;
      });
    }

    // Place filter
    if (placeFilter !== 'ALL') {
      list = list.filter((s) => s.revelationPlace?.toLowerCase() === placeFilter.toLowerCase());
    }

    // Sorting
    if (sortBy === 'revelation') {
      list.sort((a, b) => (a.revelationOrder || a.number) - (b.revelationOrder || b.number));
    } else if (sortBy === 'length') {
      list.sort((a, b) => b.ayahCount - a.ayahCount);
    } else {
      // Default: Mushaf order
      list.sort((a, b) => a.number - b.number);
    }

    return list;
  }, [surahs, searchQuery, placeFilter, sortBy]);

  // Statistics
  const meccanCount = useMemo(() => surahs.filter((s) => s.revelationPlace === 'Meccan').length, [surahs]);
  const medinanCount = useMemo(() => surahs.filter((s) => s.revelationPlace === 'Medinan').length, [surahs]);

  return (
    <div className="surah-index-page animate-in">
      {/* Compact Header Section */}
      <section className="section page-header-section">
        <div className="container">
          <div className="section-head text-center">
            <span className="eyebrow">القرآن الكريم • Complete Index</span>
            <h1>The 114 Surahs</h1>
            <p className="hero-subtitle">
              Every chapter of the Quran, arranged as revealed, ready to open in pure, uninterrupted stillness.
            </p>
          </div>

          {/* Quick Stats Pill Row */}
          <div className="surah-stats-strip">
            <div className="stat-item">
              <span className="stat-label">Total Chapters</span>
              <span className="stat-value">114</span>
            </div>
            <div className="divider-dot">•</div>
            <div className="stat-item">
              <span className="stat-label">Meccan Surahs</span>
              <span className="stat-value">{meccanCount}</span>
            </div>
            <div className="divider-dot">•</div>
            <div className="stat-item">
              <span className="stat-label">Medinan Surahs</span>
              <span className="stat-value">{medinanCount}</span>
            </div>
            <div className="divider-dot">•</div>
            <div className="stat-item">
              <span className="stat-label">Total Ayahs</span>
              <span className="stat-value">6,236</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Filter & Grid Section */}
      <section className="section index-content-section">
        <div className="container">
          {/* Controls Bar */}
          <div className="surah-controls-card">
            <div className="search-box-wrapper">
              <Input
                placeholder="Search surah by name, number, or translation (e.g. Ya-Sin, 36, Cave)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                iconLeft={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                }
              />
            </div>

            <div className="filter-and-sort-group">
              <div className="filter-chips">
                <button
                  className={`btn-chip ${placeFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setPlaceFilter('ALL')}
                >
                  All (114)
                </button>
                <button
                  className={`btn-chip ${placeFilter === 'Meccan' ? 'active' : ''}`}
                  onClick={() => setPlaceFilter('Meccan')}
                >
                  Meccan ({meccanCount})
                </button>
                <button
                  className={`btn-chip ${placeFilter === 'Medinan' ? 'active' : ''}`}
                  onClick={() => setPlaceFilter('Medinan')}
                >
                  Medinan ({medinanCount})
                </button>
              </div>

              <div className="sort-dropdown-wrapper">
                <span className="sort-label">Sort by:</span>
                <select
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="mushaf">Mushaf Order (1 → 114)</option>
                  <option value="revelation">Revelation Order</option>
                  <option value="length">Length (Most Ayahs)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ornamental Divider */}
          <div className="ornamental-divider">
            <span className="star-glyph">✦</span>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="loading-container">
              <Spinner size="lg" color="primary" />
              <p>Arranging surahs into light...</p>
            </div>
          )}

          {/* Alert Message on Server Failure */}
          {error && (
            <Alert variant="error" dismissible>
              {error}
            </Alert>
          )}

          {/* Empty State */}
          {!loading && filteredSurahs.length === 0 && (
            <EmptyState
              icon="📖"
              title="No surah found"
              description={`We couldn't find any chapter matching "${searchQuery}". Try searching by chapter number, Arabic transliteration, or English translation.`}
              action={
                <Button variant="secondary" onClick={() => { setSearchQuery(''); setPlaceFilter('ALL'); }}>
                  Clear Filters
                </Button>
              }
            />
          )}

          {/* Surah Cards Grid */}
          {!loading && filteredSurahs.length > 0 && (
            <div className="grid grid-3 surah-grid-container">
              {filteredSurahs.map((s) => (
                <div
                  key={s.number}
                  className="surah-card card animate-in"
                  onClick={() => navigate(`/surah/${s.number}`)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/surah/${s.number}`)}
                >
                  <div className="surah-card-header">
                    <div className="octagon-badge">
                      <span>{s.number}</span>
                    </div>
                    <div className="surah-names">
                      <h3 className="surah-title">{s.nameTransliteration}</h3>
                      <span className="surah-meaning">{s.nameMeaning}</span>
                    </div>
                    <div className="surah-arabic-name" lang="ar">
                      {s.nameArabic}
                    </div>
                  </div>

                  <div className="surah-card-footer">
                    <div className="surah-meta">
                      <Badge variant={s.revelationPlace === 'Meccan' ? 'primary' : 'neutral'} size="sm">
                        {s.revelationPlace}
                      </Badge>
                      <span className="ayah-count-tag">{s.ayahCount} Verses</span>
                    </div>

                    <span className="read-arrow-link">
                      Open <span className="arrow">→</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contextual Feature Section — Surah Navigation Guidance */}
      <section className="section surface-section">
        <div className="container">
          <div className="grid grid-3 features-grid">
            <div className="feature-card card">
              <div className="feature-icon">🔍</div>
              <h3>Swift Search</h3>
              <p>
                Find any surah by its number (e.g., 36), English translation ("The Cave"), or Arabic transliteration.
              </p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">🕌</div>
              <h3>Revelation Context</h3>
              <p>
                Filter between Meccan (revealed before Hijrah) and Medinan chapters to deepen your historical context.
              </p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">🔊</div>
              <h3>Ayah Audio Recitation</h3>
              <p>
                Every opened surah features crystal-clear, verse-by-verse recitation with active text highlighting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reverent Bottom Footer Strip */}
      <section className="section cta-section">
        <div className="container text-center">
          <span className="eyebrow light">Direct Journey</span>
          <h2>"The best among you are those who learn the Quran and teach it."</h2>
          <p className="cta-subtitle">
            Begin with Surah Al-Fatihah, the opening chapter that illuminates every prayer.
          </p>
          <div className="cta-actions">
            <Link to="/surah/1" className="btn-primary btn-lg">
              Read Surah Al-Fatihah (1)
            </Link>
            <Link to="/bookmarks" className="btn-secondary btn-lg">
              View Saved Bookmarks
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}