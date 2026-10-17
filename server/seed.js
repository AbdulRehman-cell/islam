const mongoose = require('mongoose');
const Surah = require('./models/Surah');
const Ayah = require('./models/Ayah');
const Reciter = require('./models/Reciter');
const Bookmark = require('./models/Bookmark');
const Feedback = require('./models/Feedbacks');

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

    // 2. Seed Surahs
    const surahCount = await Surah.countDocuments();
    if (surahCount === 0) {
      console.log('Seeding Surahs...');
      const surahsData = [
        {
          number: 1,
          nameArabic: 'الفاتحة',
          nameTransliteration: 'Al-Fatihah',
          nameMeaning: 'The Opening',
          revelationPlace: 'Meccan',
          revelationOrder: 5,
          ayahCount: 7
        },
        {
          number: 2,
          nameArabic: 'البقرة',
          nameTransliteration: 'Al-Baqarah',
          nameMeaning: 'The Cow',
          revelationPlace: 'Medinan',
          revelationOrder: 87,
          ayahCount: 286
        },
        {
          number: 36,
          nameArabic: 'يس',
          nameTransliteration: 'Ya-Sin',
          nameMeaning: 'Ya-Sin',
          revelationPlace: 'Meccan',
          revelationOrder: 41,
          ayahCount: 83
        },
        {
          number: 55,
          nameArabic: 'الرحمن',
          nameTransliteration: 'Ar-Rahman',
          nameMeaning: 'The Beneficent',
          revelationPlace: 'Medinan',
          revelationOrder: 97,
          ayahCount: 78
        },
        {
          number: 67,
          nameArabic: 'الملك',
          nameTransliteration: 'Al-Mulk',
          nameMeaning: 'The Sovereignty',
          revelationPlace: 'Meccan',
          revelationOrder: 77,
          ayahCount: 30
        },
        {
          number: 112,
          nameArabic: 'الإخلاص',
          nameTransliteration: 'Al-Ikhlas',
          nameMeaning: 'The Sincerity',
          revelationPlace: 'Meccan',
          revelationOrder: 22,
          ayahCount: 4
        }
      ];

      await Surah.insertMany(surahsData);
      console.log(`Inserted ${surahsData.length} surahs.`);
    }

    // 3. Seed Ayahs
    const ayahCount = await Ayah.countDocuments();
    if (ayahCount === 0) {
      console.log('Seeding Ayahs...');
      const ayahsData = [
        // Surah 1 (Al-Fatihah)
        {
          surahNumber: 1,
          ayahNumber: 1,
          textArabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
          textTranslation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
          textTransliteration: 'Bismillaahir Rahmaanir Raheem',
          audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3',
          juz: 1,
          page: 1
        },
        {
          surahNumber: 1,
          ayahNumber: 2,
          textArabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
          textTranslation: '[All] praise is [due] to Allah, Lord of the worlds -',
          textTransliteration: 'Alhamdu lillaahi Rabbil \'aalameen',
          audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/2.mp3',
          juz: 1,
          page: 1
        },
        {
          surahNumber: 1,
          ayahNumber: 3,
          textArabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
          textTranslation: 'The Entirely Merciful, the Especially Merciful,',
          textTransliteration: 'Ar-Rahmaanir-Raheem',
          audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/3.mp3',
          juz: 1,
          page: 1
        },
        {
          surahNumber: 1,
          ayahNumber: 4,
          textArabic: 'مَالِكِ يَوْمِ الدِّينِ',
          textTranslation: 'Sovereign of the Day of Recompense.',
          textTransliteration: 'Maaliki Yawmid-Deen',
          audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/4.mp3',
          juz: 1,
          page: 1
        },
        {
          surahNumber: 1,
          ayahNumber: 5,
          textArabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
          textTranslation: 'It is You we worship and You we ask for help.',
          textTransliteration: 'Iyyaaka na\'budu wa lyyaaka nasta\'een',
          audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/5.mp3',
          juz: 1,
          page: 1
        },
        {
          surahNumber: 1,
          ayahNumber: 6,
          textArabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
          textTranslation: 'Guide us to the straight path -',
          textTransliteration: 'Ihdinas-Siraatal-Mustaqeem',
          audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6.mp3',
          juz: 1,
          page: 1
        },
        {
          surahNumber: 1,
          ayahNumber: 7,
          textArabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
          textTranslation: 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.',
          textTransliteration: 'Siraatal-lazeena an\'amta \'alaihim ghayril-maghdoobi \'alaihim wa lad-daalleen',
          audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/7.mp3',
          juz: 1,
          page: 1
        },

        // Surah 2 (Al-Baqarah) - First 5 Ayahs + Ayat Al-Kursi
        {
          surahNumber: 2,
          ayahNumber: 1,
          textArabic: 'الم',
          textTranslation: 'Alif, Lam, Meem.',
          textTransliteration: 'Alif-Laaam-Meeem',
          audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/8.mp3',
          juz: 1,
          page: 2
        },
        {
          surahNumber: 2,
          ayahNumber: 2,
          textArabic: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ',
          textTranslation: 'This is the Book about which there is no doubt, a guidance for those conscious of Allah -',
          textTransliteration: 'Zaalikal Kitaabu laa raiba feeh; hudal lilmuttaqeen',
          audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/9.mp3',
          juz: 1,
          page: 2
        },
        {
          surahNumber: 2,
          ayahNumber: 255,
          textArabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ',
          textTranslation: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth.',
          textTransliteration: 'Allaahu laaa ilaaha illaa Huwal Haiyul Qaiyuum; laa ta\'khuzuhuu sinatunw wa laa nawm; lahuu maa fissamaawaati wa maa fil ard',
          audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/262.mp3',
          juz: 3,
          page: 42
        },

        // Surah 36 (Ya-Sin) - Ayah 1 & 2
        {
          surahNumber: 36,
          ayahNumber: 1,
          textArabic: 'يس',
          textTranslation: 'Ya, Seen.',
          textTransliteration: 'Yaa-Seeen',
          audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/3706.mp3',
          juz: 22,
          page: 440
        },
        {
          surahNumber: 36,
          ayahNumber: 2,
          textArabic: 'وَالْقُرْآنِ الْحَكِيمِ',
          textTranslation: 'By the wise Qur\'an.',
          textTransliteration: 'Wal-Qur\'aanil-Hakeem',
          audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/3707.mp3',
          juz: 22,
          page: 440
        },

        // Surah 67 (Al-Mulk) - Ayah 1
        {
          surahNumber: 67,
          ayahNumber: 1,
          textArabic: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
          textTranslation: 'Blessed is He in whose hand is dominion, and He is over all things competent -',
          textTransliteration: 'Tabaraakal-lazee biyadihil-mulku wa Huwa \'alaa kulli shai\'in Qadeer',
          audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/5242.mp3',
          juz: 29,
          page: 562
        },

        // Surah 112 (Al-Ikhlas)
        {
          surahNumber: 112,
          ayahNumber: 1,
          textArabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
          textTranslation: 'Say, "He is Allah, [who is] One,',
          textTransliteration: 'Qul Huwallaahu Ahad',
          audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6222.mp3',
          juz: 30,
          page: 604
        },
        {
          surahNumber: 112,
          ayahNumber: 2,
          textArabic: 'اللَّهُ الصَّمَدُ',
          textTranslation: 'Allah, the Eternal Refuge.',
          textTransliteration: 'Allahus-Samad',
          audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6223.mp3',
          juz: 30,
          page: 604
        },
        {
          surahNumber: 112,
          ayahNumber: 3,
          textArabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
          textTranslation: 'He neither begets nor is born,',
          textTransliteration: 'Lam yalid wa lam yoolad',
          audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6224.mp3',
          juz: 30,
          page: 604
        },
        {
          surahNumber: 112,
          ayahNumber: 4,
          textArabic: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
          textTranslation: 'Nor is there to Him any equivalent."',
          textTransliteration: 'Wa lam yakul-lahuu kufuwan ahad',
          audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6225.mp3',
          juz: 30,
          page: 604
        }
      ];

      await Ayah.insertMany(ayahsData);
      console.log(`Inserted ${ayahsData.length} ayahs.`);
    }

    // 4. Seed Initial Bookmarks (Optional Sample)
    const bookmarkCount = await Bookmark.countDocuments();
    if (bookmarkCount === 0) {
      console.log('Seeding initial sample bookmark...');
      await Bookmark.create({
        surahNumber: 1,
        ayahNumber: 1,
        note: 'Daily reflection starting point'
      });
      console.log('Sample bookmark seeded.');
    }

    // 5. Seed Initial Feedback Sample
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