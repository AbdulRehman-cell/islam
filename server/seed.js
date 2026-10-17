const mongoose = require('mongoose');
const https = require('https');
const Surah = require('./models/Surah');
const Ayah = require('./models/Ayah');
const Reciter = require('./models/Reciter');
const Feedback = require('./models/Feedbacks');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { Accept: 'application/json' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse failed for ${url}: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

async function seedDatabase() {
  try {
    console.log('Checking database seeding status...');

    // 1. Seed Reciters
    const reciterCount = await Reciter.countDocuments();
    let defaultReciterId = null;

    if (reciterCount === 0) {
      console.log('Seeding Reciters...');
      const recitersData = [
        {
          name: 'Mishary Rashid Alafasy',
          style: 'Murattal',
          audioBaseUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/',
          isDefault: true
        },
        {
          name: 'Abu Bakr Al-Shatri',
          style: 'Murattal',
          audioBaseUrl: 'https://cdn.islamic.network/quran/audio/128/ar.shaatree/',
          isDefault: false
        },
        {
          name: 'Abdur-Rahman As-Sudais',
          style: 'Murattal',
          audioBaseUrl: 'https://cdn.islamic.network/quran/audio/128/ar.abdurrahmaansudais/',
          isDefault: false
        },
        {
          name: 'Saad Al-Ghamdi',
          style: 'Murattal',
          audioBaseUrl: 'https://cdn.islamic.network/quran/audio/128/ar.ghamadi/',
          isDefault: false
        },
        {
          name: 'Maher Al-Muaiqly',
          style: 'Murattal',
          audioBaseUrl: 'https://cdn.islamic.network/quran/audio/128/ar.mahermuaiqly/',
          isDefault: false
        }
      ];

      const createdReciters = await Reciter.insertMany(recitersData);
      defaultReciterId = createdReciters[0]._id;
      console.log(`Inserted ${createdReciters.length} reciters.`);
    } else {
      const def = await Reciter.findOne({ isDefault: true }) || await Reciter.findOne();
      if (def) defaultReciterId = def._id;
    }

    // 2. Seed Surahs — all 114
    const surahCount = await Surah.countDocuments();
    if (surahCount === 0) {
      console.log('Seeding all 114 Surahs...');
      const surahsData = [
        { number: 1,   nameArabic: 'الفاتحة',     nameTransliteration: 'Al-Fatihah',       nameMeaning: 'The Opening',              revelationPlace: 'Meccan',  revelationOrder: 5,   ayahCount: 7   },
        { number: 2,   nameArabic: 'البقرة',       nameTransliteration: 'Al-Baqarah',       nameMeaning: 'The Cow',                  revelationPlace: 'Medinan', revelationOrder: 87,  ayahCount: 286 },
        { number: 3,   nameArabic: 'آل عمران',     nameTransliteration: 'Ali \'Imran',      nameMeaning: 'Family of Imran',          revelationPlace: 'Medinan', revelationOrder: 89,  ayahCount: 200 },
        { number: 4,   nameArabic: 'النساء',       nameTransliteration: 'An-Nisa',          nameMeaning: 'The Women',                revelationPlace: 'Medinan', revelationOrder: 92,  ayahCount: 176 },
        { number: 5,   nameArabic: 'المائدة',      nameTransliteration: 'Al-Ma\'idah',      nameMeaning: 'The Table Spread',         revelationPlace: 'Medinan', revelationOrder: 112, ayahCount: 120 },
        { number: 6,   nameArabic: 'الأنعام',      nameTransliteration: 'Al-An\'am',        nameMeaning: 'The Cattle',               revelationPlace: 'Meccan',  revelationOrder: 55,  ayahCount: 165 },
        { number: 7,   nameArabic: 'الأعراف',      nameTransliteration: 'Al-A\'raf',        nameMeaning: 'The Heights',              revelationPlace: 'Meccan',  revelationOrder: 39,  ayahCount: 206 },
        { number: 8,   nameArabic: 'الأنفال',      nameTransliteration: 'Al-Anfal',         nameMeaning: 'The Spoils of War',        revelationPlace: 'Medinan', revelationOrder: 88,  ayahCount: 75  },
        { number: 9,   nameArabic: 'التوبة',       nameTransliteration: 'At-Tawbah',        nameMeaning: 'The Repentance',           revelationPlace: 'Medinan', revelationOrder: 113, ayahCount: 129 },
        { number: 10,  nameArabic: 'يونس',         nameTransliteration: 'Yunus',            nameMeaning: 'Jonah',                    revelationPlace: 'Meccan',  revelationOrder: 51,  ayahCount: 109 },
        { number: 11,  nameArabic: 'هود',          nameTransliteration: 'Hud',              nameMeaning: 'Hud',                      revelationPlace: 'Meccan',  revelationOrder: 52,  ayahCount: 123 },
        { number: 12,  nameArabic: 'يوسف',         nameTransliteration: 'Yusuf',            nameMeaning: 'Joseph',                   revelationPlace: 'Meccan',  revelationOrder: 53,  ayahCount: 111 },
        { number: 13,  nameArabic: 'الرعد',        nameTransliteration: 'Ar-Ra\'d',         nameMeaning: 'The Thunder',              revelationPlace: 'Medinan', revelationOrder: 96,  ayahCount: 43  },
        { number: 14,  nameArabic: 'إبراهيم',      nameTransliteration: 'Ibrahim',          nameMeaning: 'Abraham',                  revelationPlace: 'Meccan',  revelationOrder: 72,  ayahCount: 52  },
        { number: 15,  nameArabic: 'الحجر',        nameTransliteration: 'Al-Hijr',          nameMeaning: 'The Rocky Tract',          revelationPlace: 'Meccan',  revelationOrder: 54,  ayahCount: 99  },
        { number: 16,  nameArabic: 'النحل',        nameTransliteration: 'An-Nahl',          nameMeaning: 'The Bee',                  revelationPlace: 'Meccan',  revelationOrder: 70,  ayahCount: 128 },
        { number: 17,  nameArabic: 'الإسراء',      nameTransliteration: 'Al-Isra',          nameMeaning: 'The Night Journey',        revelationPlace: 'Meccan',  revelationOrder: 50,  ayahCount: 111 },
        { number: 18,  nameArabic: 'الكهف',        nameTransliteration: 'Al-Kahf',          nameMeaning: 'The Cave',                 revelationPlace: 'Meccan',  revelationOrder: 69,  ayahCount: 110 },
        { number: 19,  nameArabic: 'مريم',         nameTransliteration: 'Maryam',           nameMeaning: 'Mary',                     revelationPlace: 'Meccan',  revelationOrder: 44,  ayahCount: 98  },
        { number: 20,  nameArabic: 'طه',           nameTransliteration: 'Ta-Ha',            nameMeaning: 'Ta-Ha',                    revelationPlace: 'Meccan',  revelationOrder: 45,  ayahCount: 135 },
        { number: 21,  nameArabic: 'الأنبياء',     nameTransliteration: 'Al-Anbiya',        nameMeaning: 'The Prophets',             revelationPlace: 'Meccan',  revelationOrder: 73,  ayahCount: 112 },
        { number: 22,  nameArabic: 'الحج',         nameTransliteration: 'Al-Hajj',          nameMeaning: 'The Pilgrimage',           revelationPlace: 'Medinan', revelationOrder: 103, ayahCount: 78  },
        { number: 23,  nameArabic: 'المؤمنون',     nameTransliteration: 'Al-Mu\'minun',     nameMeaning: 'The Believers',            revelationPlace: 'Meccan',  revelationOrder: 74,  ayahCount: 118 },
        { number: 24,  nameArabic: 'النور',        nameTransliteration: 'An-Nur',           nameMeaning: 'The Light',                revelationPlace: 'Medinan', revelationOrder: 102, ayahCount: 64  },
        { number: 25,  nameArabic: 'الفرقان',      nameTransliteration: 'Al-Furqan',        nameMeaning: 'The Criterion',            revelationPlace: 'Meccan',  revelationOrder: 42,  ayahCount: 77  },
        { number: 26,  nameArabic: 'الشعراء',      nameTransliteration: 'Ash-Shu\'ara',     nameMeaning: 'The Poets',                revelationPlace: 'Meccan',  revelationOrder: 47,  ayahCount: 227 },
        { number: 27,  nameArabic: 'النمل',        nameTransliteration: 'An-Naml',          nameMeaning: 'The Ant',                  revelationPlace: 'Meccan',  revelationOrder: 48,  ayahCount: 93  },
        { number: 28,  nameArabic: 'القصص',        nameTransliteration: 'Al-Qasas',         nameMeaning: 'The Stories',              revelationPlace: 'Meccan',  revelationOrder: 49,  ayahCount: 88  },
        { number: 29,  nameArabic: 'العنكبوت',     nameTransliteration: 'Al-\'Ankabut',     nameMeaning: 'The Spider',               revelationPlace: 'Meccan',  revelationOrder: 85,  ayahCount: 69  },
        { number: 30,  nameArabic: 'الروم',        nameTransliteration: 'Ar-Rum',           nameMeaning: 'The Romans',               revelationPlace: 'Meccan',  revelationOrder: 84,  ayahCount: 60  },
        { number: 31,  nameArabic: 'لقمان',        nameTransliteration: 'Luqman',           nameMeaning: 'Luqman',                   revelationPlace: 'Meccan',  revelationOrder: 57,  ayahCount: 34  },
        { number: 32,  nameArabic: 'السجدة',       nameTransliteration: 'As-Sajdah',        nameMeaning: 'The Prostration',          revelationPlace: 'Meccan',  revelationOrder: 75,  ayahCount: 30  },
        { number: 33,  nameArabic: 'الأحزاب',      nameTransliteration: 'Al-Ahzab',         nameMeaning: 'The Combined Forces',      revelationPlace: 'Medinan', revelationOrder: 90,  ayahCount: 73  },
        { number: 34,  nameArabic: 'سبإ',          nameTransliteration: 'Saba',             nameMeaning: 'Sheba',                    revelationPlace: 'Meccan',  revelationOrder: 58,  ayahCount: 54  },
        { number: 35,  nameArabic: 'فاطر',         nameTransliteration: 'Fatir',            nameMeaning: 'Originator',               revelationPlace: 'Meccan',  revelationOrder: 43,  ayahCount: 45  },
        { number: 36,  nameArabic: 'يس',           nameTransliteration: 'Ya-Sin',           nameMeaning: 'Ya-Sin',                   revelationPlace: 'Meccan',  revelationOrder: 41,  ayahCount: 83  },
        { number: 37,  nameArabic: 'الصافات',      nameTransliteration: 'As-Saffat',        nameMeaning: 'Those Who Set the Ranks',  revelationPlace: 'Meccan',  revelationOrder: 56,  ayahCount: 182 },
        { number: 38,  nameArabic: 'ص',            nameTransliteration: 'Sad',              nameMeaning: 'Sad',                      revelationPlace: 'Meccan',  revelationOrder: 38,  ayahCount: 88  },
        { number: 39,  nameArabic: 'الزمر',        nameTransliteration: 'Az-Zumar',         nameMeaning: 'The Troops',               revelationPlace: 'Meccan',  revelationOrder: 59,  ayahCount: 75  },
        { number: 40,  nameArabic: 'غافر',         nameTransliteration: 'Ghafir',           nameMeaning: 'The Forgiver',             revelationPlace: 'Meccan',  revelationOrder: 60,  ayahCount: 85  },
        { number: 41,  nameArabic: 'فصلت',         nameTransliteration: 'Fussilat',         nameMeaning: 'Explained in Detail',      revelationPlace: 'Meccan',  revelationOrder: 61,  ayahCount: 54  },
        { number: 42,  nameArabic: 'الشورى',       nameTransliteration: 'Ash-Shura',        nameMeaning: 'The Consultation',         revelationPlace: 'Meccan',  revelationOrder: 62,  ayahCount: 53  },
        { number: 43,  nameArabic: 'الزخرف',       nameTransliteration: 'Az-Zukhruf',       nameMeaning: 'The Ornaments of Gold',    revelationPlace: 'Meccan',  revelationOrder: 63,  ayahCount: 89  },
        { number: 44,  nameArabic: 'الدخان',       nameTransliteration: 'Ad-Dukhan',        nameMeaning: 'The Smoke',                revelationPlace: 'Meccan',  revelationOrder: 64,  ayahCount: 59  },
        { number: 45,  nameArabic: 'الجاثية',      nameTransliteration: 'Al-Jathiyah',      nameMeaning: 'The Crouching',            revelationPlace: 'Meccan',  revelationOrder: 65,  ayahCount: 37  },
        { number: 46,  nameArabic: 'الأحقاف',      nameTransliteration: 'Al-Ahqaf',         nameMeaning: 'The Wind-Curved Sandhills', revelationPlace: 'Meccan', revelationOrder: 66,  ayahCount: 35  },
        { number: 47,  nameArabic: 'محمد',         nameTransliteration: 'Muhammad',         nameMeaning: 'Muhammad',                 revelationPlace: 'Medinan', revelationOrder: 95,  ayahCount: 38  },
        { number: 48,  nameArabic: 'الفتح',        nameTransliteration: 'Al-Fath',          nameMeaning: 'The Victory',              revelationPlace: 'Medinan', revelationOrder: 111, ayahCount: 29  },
        { number: 49,  nameArabic: 'الحجرات',      nameTransliteration: 'Al-Hujurat',       nameMeaning: 'The Rooms',                revelationPlace: 'Medinan', revelationOrder: 106, ayahCount: 18  },
        { number: 50,  nameArabic: 'ق',            nameTransliteration: 'Qaf',              nameMeaning: 'Qaf',                      revelationPlace: 'Meccan',  revelationOrder: 34,  ayahCount: 45  },
        { number: 51,  nameArabic: 'الذاريات',     nameTransliteration: 'Adh-Dhariyat',     nameMeaning: 'The Winnowing Winds',      revelationPlace: 'Meccan',  revelationOrder: 67,  ayahCount: 60  },
        { number: 52,  nameArabic: 'الطور',        nameTransliteration: 'At-Tur',           nameMeaning: 'The Mount',                revelationPlace: 'Meccan',  revelationOrder: 76,  ayahCount: 49  },
        { number: 53,  nameArabic: 'النجم',        nameTransliteration: 'An-Najm',          nameMeaning: 'The Star',                 revelationPlace: 'Meccan',  revelationOrder: 23,  ayahCount: 62  },
        { number: 54,  nameArabic: 'القمر',        nameTransliteration: 'Al-Qamar',         nameMeaning: 'The Moon',                 revelationPlace: 'Meccan',  revelationOrder: 37,  ayahCount: 55  },
        { number: 55,  nameArabic: 'الرحمن',       nameTransliteration: 'Ar-Rahman',        nameMeaning: 'The Beneficent',           revelationPlace: 'Medinan', revelationOrder: 97,  ayahCount: 78  },
        { number: 56,  nameArabic: 'الواقعة',      nameTransliteration: 'Al-Waqi\'ah',      nameMeaning: 'The Inevitable',           revelationPlace: 'Meccan',  revelationOrder: 46,  ayahCount: 96  },
        { number: 57,  nameArabic: 'الحديد',       nameTransliteration: 'Al-Hadid',         nameMeaning: 'The Iron',                 revelationPlace: 'Medinan', revelationOrder: 94,  ayahCount: 29  },
        { number: 58,  nameArabic: 'المجادلة',     nameTransliteration: 'Al-Mujadila',      nameMeaning: 'The Pleading Woman',       revelationPlace: 'Medinan', revelationOrder: 105, ayahCount: 22  },
        { number: 59,  nameArabic: 'الحشر',        nameTransliteration: 'Al-Hashr',         nameMeaning: 'The Exile',                revelationPlace: 'Medinan', revelationOrder: 101, ayahCount: 24  },
        { number: 60,  nameArabic: 'الممتحنة',     nameTransliteration: 'Al-Mumtahanah',    nameMeaning: 'She That is to be Examined', revelationPlace: 'Medinan', revelationOrder: 91, ayahCount: 13 },
        { number: 61,  nameArabic: 'الصف',         nameTransliteration: 'As-Saf',           nameMeaning: 'The Ranks',                revelationPlace: 'Medinan', revelationOrder: 109, ayahCount: 14  },
        { number: 62,  nameArabic: 'الجمعة',       nameTransliteration: 'Al-Jumu\'ah',      nameMeaning: 'Friday',                   revelationPlace: 'Medinan', revelationOrder: 110, ayahCount: 11  },
        { number: 63,  nameArabic: 'المنافقون',    nameTransliteration: 'Al-Munafiqun',     nameMeaning: 'The Hypocrites',           revelationPlace: 'Medinan', revelationOrder: 104, ayahCount: 11  },
        { number: 64,  nameArabic: 'التغابن',      nameTransliteration: 'At-Taghabun',      nameMeaning: 'The Mutual Disillusion',   revelationPlace: 'Medinan', revelationOrder: 108, ayahCount: 18  },
        { number: 65,  nameArabic: 'الطلاق',       nameTransliteration: 'At-Talaq',         nameMeaning: 'Divorce',                  revelationPlace: 'Medinan', revelationOrder: 99,  ayahCount: 12  },
        { number: 66,  nameArabic: 'التحريم',      nameTransliteration: 'At-Tahrim',        nameMeaning: 'The Prohibition',          revelationPlace: 'Medinan', revelationOrder: 107, ayahCount: 12  },
        { number: 67,  nameArabic: 'الملك',        nameTransliteration: 'Al-Mulk',          nameMeaning: 'The Sovereignty',          revelationPlace: 'Meccan',  revelationOrder: 77,  ayahCount: 30  },
        { number: 68,  nameArabic: 'القلم',        nameTransliteration: 'Al-Qalam',         nameMeaning: 'The Pen',                  revelationPlace: 'Meccan',  revelationOrder: 2,   ayahCount: 52  },
        { number: 69,  nameArabic: 'الحاقة',       nameTransliteration: 'Al-Haqqah',        nameMeaning: 'The Reality',              revelationPlace: 'Meccan',  revelationOrder: 78,  ayahCount: 52  },
        { number: 70,  nameArabic: 'المعارج',      nameTransliteration: 'Al-Ma\'arij',      nameMeaning: 'The Ascending Stairways',  revelationPlace: 'Meccan',  revelationOrder: 79,  ayahCount: 44  },
        { number: 71,  nameArabic: 'نوح',          nameTransliteration: 'Nuh',              nameMeaning: 'Noah',                     revelationPlace: 'Meccan',  revelationOrder: 71,  ayahCount: 28  },
        { number: 72,  nameArabic: 'الجن',         nameTransliteration: 'Al-Jinn',          nameMeaning: 'The Jinn',                 revelationPlace: 'Meccan',  revelationOrder: 40,  ayahCount: 28  },
        { number: 73,  nameArabic: 'المزمل',       nameTransliteration: 'Al-Muzzammil',     nameMeaning: 'The Enshrouded One',       revelationPlace: 'Meccan',  revelationOrder: 3,   ayahCount: 20  },
        { number: 74,  nameArabic: 'المدثر',       nameTransliteration: 'Al-Muddaththir',   nameMeaning: 'The Cloaked One',          revelationPlace: 'Meccan',  revelationOrder: 4,   ayahCount: 56  },
        { number: 75,  nameArabic: 'القيامة',      nameTransliteration: 'Al-Qiyamah',       nameMeaning: 'The Resurrection',         revelationPlace: 'Meccan',  revelationOrder: 31,  ayahCount: 40  },
        { number: 76,  nameArabic: 'الإنسان',      nameTransliteration: 'Al-Insan',         nameMeaning: 'The Human',                revelationPlace: 'Medinan', revelationOrder: 98,  ayahCount: 31  },
        { number: 77,  nameArabic: 'المرسلات',     nameTransliteration: 'Al-Mursalat',      nameMeaning: 'The Emissaries',           revelationPlace: 'Meccan',  revelationOrder: 33,  ayahCount: 50  },
        { number: 78,  nameArabic: 'النبإ',        nameTransliteration: 'An-Naba',          nameMeaning: 'The Tidings',              revelationPlace: 'Meccan',  revelationOrder: 80,  ayahCount: 40  },
        { number: 79,  nameArabic: 'النازعات',     nameTransliteration: 'An-Nazi\'at',      nameMeaning: 'Those Who Drag Forth',     revelationPlace: 'Meccan',  revelationOrder: 81,  ayahCount: 46  },
        { number: 80,  nameArabic: 'عبس',          nameTransliteration: '\'Abasa',          nameMeaning: 'He Frowned',               revelationPlace: 'Meccan',  revelationOrder: 24,  ayahCount: 42  },
        { number: 81,  nameArabic: 'التكوير',      nameTransliteration: 'At-Takwir',        nameMeaning: 'The Overthrowing',         revelationPlace: 'Meccan',  revelationOrder: 7,   ayahCount: 29  },
        { number: 82,  nameArabic: 'الانفطار',     nameTransliteration: 'Al-Infitar',       nameMeaning: 'The Cleaving',             revelationPlace: 'Meccan',  revelationOrder: 82,  ayahCount: 19  },
        { number: 83,  nameArabic: 'المطففين',     nameTransliteration: 'Al-Mutaffifin',    nameMeaning: 'The Defrauding',           revelationPlace: 'Meccan',  revelationOrder: 86,  ayahCount: 36  },
        { number: 84,  nameArabic: 'الانشقاق',     nameTransliteration: 'Al-Inshiqaq',      nameMeaning: 'The Sundering',            revelationPlace: 'Meccan',  revelationOrder: 83,  ayahCount: 25  },
        { number: 85,  nameArabic: 'البروج',       nameTransliteration: 'Al-Buruj',         nameMeaning: 'The Mansions of the Stars', revelationPlace: 'Meccan', revelationOrder: 27,  ayahCount: 22  },
        { number: 86,  nameArabic: 'الطارق',       nameTransliteration: 'At-Tariq',         nameMeaning: 'The Morning Star',         revelationPlace: 'Meccan',  revelationOrder: 36,  ayahCount: 17  },
        { number: 87,  nameArabic: 'الأعلى',       nameTransliteration: 'Al-A\'la',         nameMeaning: 'The Most High',            revelationPlace: 'Meccan',  revelationOrder: 8,   ayahCount: 19  },
        { number: 88,  nameArabic: 'الغاشية',      nameTransliteration: 'Al-Ghashiyah',     nameMeaning: 'The Overwhelming',         revelationPlace: 'Meccan',  revelationOrder: 68,  ayahCount: 26  },
        { number: 89,  nameArabic: 'الفجر',        nameTransliteration: 'Al-Fajr',          nameMeaning: 'The Dawn',                 revelationPlace: 'Meccan',  revelationOrder: 10,  ayahCount: 30  },
        { number: 90,  nameArabic: 'البلد',        nameTransliteration: 'Al-Balad',         nameMeaning: 'The City',                 revelationPlace: 'Meccan',  revelationOrder: 35,  ayahCount: 20  },
        { number: 91,  nameArabic: 'الشمس',        nameTransliteration: 'Ash-Shams',        nameMeaning: 'The Sun',                  revelationPlace: 'Meccan',  revelationOrder: 26,  ayahCount: 15  },
        { number: 92,  nameArabic: 'الليل',        nameTransliteration: 'Al-Layl',          nameMeaning: 'The Night',                revelationPlace: 'Meccan',  revelationOrder: 9,   ayahCount: 21  },
        { number: 93,  nameArabic: 'الضحى',        nameTransliteration: 'Ad-Duhaa',         nameMeaning: 'The Morning Hours',        revelationPlace: 'Meccan',  revelationOrder: 11,  ayahCount: 11  },
        { number: 94,  nameArabic: 'الشرح',        nameTransliteration: 'Ash-Sharh',        nameMeaning: 'The Relief',               revelationPlace: 'Meccan',  revelationOrder: 12,  ayahCount: 8   },
        { number: 95,  nameArabic: 'التين',        nameTransliteration: 'At-Tin',           nameMeaning: 'The Fig',                  revelationPlace: 'Meccan',  revelationOrder: 28,  ayahCount: 8   },
        { number: 96,  nameArabic: 'العلق',        nameTransliteration: 'Al-\'Alaq',        nameMeaning: 'The Clot',                 revelationPlace: 'Meccan',  revelationOrder: 1,   ayahCount: 19  },
        { number: 97,  nameArabic: 'القدر',        nameTransliteration: 'Al-Qadr',          nameMeaning: 'The Power',                revelationPlace: 'Meccan',  revelationOrder: 25,  ayahCount: 5   },
        { number: 98,  nameArabic: 'البينة',       nameTransliteration: 'Al-Bayyinah',      nameMeaning: 'The Clear Proof',          revelationPlace: 'Medinan', revelationOrder: 100, ayahCount: 8   },
        { number: 99,  nameArabic: 'الزلزلة',      nameTransliteration: 'Az-Zalzalah',      nameMeaning: 'The Earthquake',           revelationPlace: 'Medinan', revelationOrder: 93,  ayahCount: 8   },
        { number: 100, nameArabic: 'العاديات',     nameTransliteration: 'Al-\'Adiyat',      nameMeaning: 'The Courser',              revelationPlace: 'Meccan',  revelationOrder: 14,  ayahCount: 11  },
        { number: 101, nameArabic: 'القارعة',      nameTransliteration: 'Al-Qari\'ah',      nameMeaning: 'The Calamity',             revelationPlace: 'Meccan',  revelationOrder: 30,  ayahCount: 11  },
        { number: 102, nameArabic: 'التكاثر',      nameTransliteration: 'At-Takathur',      nameMeaning: 'The Rivalry in World Increase', revelationPlace: 'Meccan', revelationOrder: 16, ayahCount: 8 },
        { number: 103, nameArabic: 'العصر',        nameTransliteration: 'Al-\'Asr',         nameMeaning: 'The Declining Day',        revelationPlace: 'Meccan',  revelationOrder: 13,  ayahCount: 3   },
        { number: 104, nameArabic: 'الهمزة',       nameTransliteration: 'Al-Humazah',       nameMeaning: 'The Traducer',             revelationPlace: 'Meccan',  revelationOrder: 32,  ayahCount: 9   },
        { number: 105, nameArabic: 'الفيل',        nameTransliteration: 'Al-Fil',           nameMeaning: 'The Elephant',             revelationPlace: 'Meccan',  revelationOrder: 19,  ayahCount: 5   },
        { number: 106, nameArabic: 'قريش',         nameTransliteration: 'Quraysh',          nameMeaning: 'Quraysh',                  revelationPlace: 'Meccan',  revelationOrder: 29,  ayahCount: 4   },
        { number: 107, nameArabic: 'الماعون',      nameTransliteration: 'Al-Ma\'un',        nameMeaning: 'The Small Kindnesses',     revelationPlace: 'Meccan',  revelationOrder: 17,  ayahCount: 7   },
        { number: 108, nameArabic: 'الكوثر',       nameTransliteration: 'Al-Kawthar',       nameMeaning: 'The Abundance',            revelationPlace: 'Meccan',  revelationOrder: 15,  ayahCount: 3   },
        { number: 109, nameArabic: 'الكافرون',     nameTransliteration: 'Al-Kafirun',       nameMeaning: 'The Disbelievers',         revelationPlace: 'Meccan',  revelationOrder: 18,  ayahCount: 6   },
        { number: 110, nameArabic: 'النصر',        nameTransliteration: 'An-Nasr',          nameMeaning: 'The Divine Support',       revelationPlace: 'Medinan', revelationOrder: 114, ayahCount: 3   },
        { number: 111, nameArabic: 'المسد',        nameTransliteration: 'Al-Masad',         nameMeaning: 'The Palm Fiber',           revelationPlace: 'Meccan',  revelationOrder: 6,   ayahCount: 5   },
        { number: 112, nameArabic: 'الإخلاص',      nameTransliteration: 'Al-Ikhlas',        nameMeaning: 'The Sincerity',            revelationPlace: 'Meccan',  revelationOrder: 22,  ayahCount: 4   },
        { number: 113, nameArabic: 'الفلق',        nameTransliteration: 'Al-Falaq',         nameMeaning: 'The Daybreak',             revelationPlace: 'Meccan',  revelationOrder: 20,  ayahCount: 5   },
        { number: 114, nameArabic: 'الناس',        nameTransliteration: 'An-Nas',           nameMeaning: 'Mankind',                  revelationPlace: 'Meccan',  revelationOrder: 21,  ayahCount: 6   },
      ];

      await Surah.insertMany(surahsData);
      console.log(`Inserted ${surahsData.length} surahs.`);
    }

    // 3. Seed Ayahs — fetch all 6236 from alquran.cloud API
    const ayahCount = await Ayah.countDocuments();
    if (ayahCount === 0) {
      console.log('Fetching all 6236 Quran ayahs from alquran.cloud (this runs once)...');
      const [arabicRes, englishRes] = await Promise.all([
        fetchJson('https://api.alquran.cloud/v1/quran/quran-simple'),
        fetchJson('https://api.alquran.cloud/v1/quran/en.sahih'),
      ]);
      const ayahDocs = [];
      arabicRes.data.surahs.forEach((surah, si) => {
        const enSurah = englishRes.data.surahs[si];
        surah.ayahs.forEach((ayah, ai) => {
          ayahDocs.push({
            surahNumber: surah.number,
            ayahNumber: ayah.numberInSurah,
            textArabic: ayah.text,
            textTranslation: enSurah.ayahs[ai].text,
            textTransliteration: '',
            audioUrl: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`,
            juz: ayah.juz,
            page: ayah.page,
          });
        });
      });
      const BATCH = 500;
      for (let i = 0; i < ayahDocs.length; i += BATCH) {
        await Ayah.insertMany(ayahDocs.slice(i, i + BATCH));
      }
      console.log(`Inserted ${ayahDocs.length} ayahs.`);
    }

    // 4. Seed Initial Feedback Sample
    const feedbackCount = await Feedback.countDocuments();
    if (feedbackCount === 0) {
      console.log('Seeding initial feedback record...');
      await Feedback.create({
        name: 'Tariq Al-Mansoor',
        email: 'tariq@example.com',
        message: 'May Allah reward you for this beautiful, tranquil application.',
        relatedSurah: 1
      });
      console.log('Sample feedback seeded.');
    }

    console.log('Database seeding process completed successfully.');
  } catch (err) {
    console.error('Error during database seeding:', err);
  }
}

// Run immediately as an async IIFE
(async () => {
  await seedDatabase();
})();