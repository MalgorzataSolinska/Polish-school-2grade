import { Announcement, DailyTask, ClassSummary, Worksheet, StudentProfile, FeedbackMessage, ClassEvent } from './types';

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    date: '2026-10-28',
    title: '🎉 Uroczystość Pasowania na Drugoklasistę!',
    titleEn: '🎉 Grade 2 Student Initiation Ceremony!',
    content: 'W najbliższą sobotę obchodzimy pasowanie na ucznia klasy 2! Pani Małgosia prosi o strój galowy. Każde dziecko otrzyma pamiątkowy dyplom i polską książeczkę.',
    contentEn: 'This Saturday we are celebrating Grade 2 Initiation! Formal wear requested.',
    type: 'important'
  },
  {
    id: 'ann-2',
    date: '2026-10-20',
    title: '📚 Lektura Października: "Drzewo do nieba"',
    titleEn: '📚 October Reading: "Drzewo do nieba"',
    content: 'Zachęcamy do wspólnego czytania z rodzicami rozdziałów 1-3. W zakładce "Materiały do druku" znajdziecie kartę pracy do lektury!',
    contentEn: 'We encourage reading chapters 1-3 together with parents.',
    type: 'info'
  },
  {
    id: 'ann-3',
    date: '2026-10-15',
    title: '🎨 Konkurs Plastyczny "Moja Polska"',
    titleEn: '🎨 Art Competition "My Poland"',
    content: 'Narysuj swoje ulubione miejsce w Polsce lub polskiego smoka! Prace przynosimy do klasy do 15 listopada.',
    contentEn: 'Draw your favorite place in Poland or a Polish dragon!',
    type: 'event'
  }
];

export const INITIAL_DAILY_TASKS: DailyTask[] = [
  {
    id: 'dt-1',
    date: 'Gra 1',
    title: '🔤 Układanie Słów z Liter',
    description: 'Dotknij kafelków z literami na ekranie telefonu i ułóż polskie słowa z lekcji!',
    type: 'spelling',
    starsReward: 15,
    spelling: [
      { id: 'sp-1', word: 'SYRENKA', hint: 'Symbol Warszawy z mieczem i tarczą', emoji: '🧜‍♀️' },
      { id: 'sp-2', word: 'WARSZAWA', hint: 'Stolica Polski nad rzeką Wisłą', emoji: '🏰' },
      { id: 'sp-3', word: 'WISŁA', hint: 'Najdłuższa rzeka w Polsce', emoji: '🌊' },
      { id: 'sp-4', word: 'ORZEŁ', hint: 'Biały ptak w godle Polski', emoji: '🦅' },
      { id: 'sp-5', word: 'FLAGA', hint: 'Biało-czerwona flaga Polski', emoji: '🇵🇱' },
    ],
  },
  {
    id: 'dt-2',
    date: 'Gra 2',
    title: '🎯 Tajne Słowo (Zgadywanka)',
    description: 'Odgadnij zakryte litery polskiego słowa, klikając w wesoły alfabet!',
    type: 'secret_word',
    starsReward: 15,
    spelling: [
      { id: 'sw-1', word: 'KRAKÓW', hint: 'Miasto ze Smoczą Jamą i Zamkiem Wawelskim', emoji: '🐉' },
      { id: 'sw-2', word: 'GDAŃSK', hint: 'Piękne polskie miasto nad Morzem Bałtyckim', emoji: '⚓' },
      { id: 'sw-3', word: 'PODRĘCZNIK', hint: 'Książka, z której uczymy się w sobotę', emoji: '📚' },
      { id: 'sw-4', word: 'SOBOTA', hint: 'Dzień, w którym spotykamy się w szkole w Walnut Creek', emoji: '🏫' },
    ],
  },
  {
    id: 'dt-3',
    date: 'Gra 3',
    title: '🧩 Układanka Sylabowa',
    description: 'Połącz kolorowe klocki z sylabami (np. WAR-SZA-WA), żeby ułożyć pełne słowa!',
    type: 'syllables',
    starsReward: 15,
    spelling: [
      { id: 'syl-1', word: 'WARSZAWA', hint: 'Stolica Polski над rzeką Wisłą', emoji: '🏰' },
      { id: 'syl-2', word: 'SYRENKA', hint: 'Warszawska Syrenka z mieczem i tarczą', emoji: '🧜‍♀️' },
      { id: 'syl-3', word: 'KRAKÓW', hint: 'Miasto ze Smoczą Jamą', emoji: '🐉' },
      { id: 'syl-4', word: 'ORZEŁ', hint: 'Biały ptak w godle Polski', emoji: '🦅' },
      { id: 'syl-5', word: 'SOBOTA', hint: 'Dzień, w którym idziemy do szkoły', emoji: '🏫' },
      { id: 'syl-6', word: 'PODRĘCZNIK', hint: 'Książka do nauki czytania', emoji: '📚' },
      { id: 'syl-7', word: 'FLAGA', hint: 'Biało-czerwona flaga Polski', emoji: '🇵🇱' },
    ],
  },
  {
    id: 'dt-4',
    date: 'Gra 4',
    title: '🔍 Wykreślanka Słów',
    description: 'Znajdź w siatce liter ukryte nazwy polskich miast i symboli!',
    type: 'wordsearch',
    starsReward: 15,
    wordSearch: {
      words: [
        { pl: 'WARSZAWA', en: 'Warsaw' },
        { pl: 'KRAKÓW', en: 'Krakow' },
        { pl: 'GDAŃSK', en: 'Gdansk' },
        { pl: 'ORZEŁ', en: 'Eagle' },
        { pl: 'FLAGA', en: 'Flag' },
        { pl: 'WISŁA', en: 'Vistula' },
      ],
      gridSize: 8,
    },
  },
];

export const INITIAL_CLASS_SUMMARIES: ClassSummary[] = [
  {
    id: 'sum-1',
    date: 'Sobota, 26 Września 2026',
    topic: 'Syrenka Warszawska, Legenda o Powstaniu Stolicy & Pisownia RZ i Ż',
    topicEn: 'Warsaw Mermaid Legend & Spelling RZ / Ż',
    description: 'Na dzisiejszej lekcji omówiliśmy legendę o Syrence Warszawskiej i Warsie i Sawie. Dzieci pracowały ze słownictwem ortograficznym.',
    skills: [
      'Czytanie ze zrozumieniem legend polskich',
      'Rozróżnianie dwuznaków RZ i litery Ż'
    ],
    activities: [
      'Głośne czytanie tekstu o Syrence Warszawskiej',
      'Wypisywanie do zeszytu słów z RZ i Ż',
      'Wycinanka i rysowanie godła Warszawy'
    ],
    vocabulary: [
      { pl: 'Syrenka', en: 'Mermaid' },
      { pl: 'Warszawa', en: 'Warsaw' },
      { pl: 'Tarcza', en: 'Shield' },
      { pl: 'Miecz', en: 'Sword' },
      { pl: 'Rzeka', en: 'River' },
      { pl: 'Orzeł', en: 'Eagle' }
    ],
    homework: [
      { id: 'hw-1', text: 'Nauczyć się pisowni 6 słówek z lekcji (Syrenka, Warszawa, Tarcza, Miecz, Rzeka, Orzeł)', completed: false },
      { id: 'hw-2', text: 'Zeszyt ćwiczeń str. 14 ćw. 1 i 2', completed: false }
    ]
  },
  {
    id: 'sum-2',
    date: 'Sobota, 19 Września 2026',
    topic: 'Symbole Narodowe Polski: Flaga, Godło i Hymn Państwowy',
    topicEn: 'Polish National Symbols',
    description: 'Uczyliśmy się o barwach państwowych Polski, orle białym w koronie oraz recytowaliśmy wiersz Bełzy.',
    skills: [
      'Znajomość symboli narodowych Polski',
      'Recytacja wiersza Bełzy'
    ],
    activities: [
      'Praca z podręcznikiem i ilustracjami flagi',
      'Recytacja wiersza "Kto ty jesteś? Polak mały"',
      'Ćwiczenia pisemne w zeszycie'
    ],
    vocabulary: [
      { pl: 'Flaga', en: 'Flag' },
      { pl: 'Godło', en: 'Emblem' },
      { pl: 'Orzeł', en: 'Eagle' },
      { pl: 'Hymn', en: 'Anthem' },
      { pl: 'Ojczyzna', en: 'Homeland' }
    ],
    homework: [
      { id: 'hw-3', text: 'Wyrecytuj wiersz "Kto ty jesteś?" wybranej osobie w domu', completed: true }
    ]
  }
];

export const INITIAL_WORKSHEETS: Worksheet[] = [
  {
    id: 'ws-1',
    title: '✏️ Ortografia Klasy 2: Ż czy RZ, Ó czy U',
    category: 'polski',
    description: 'Karta pracy z lukami do uzupełnienia. Zasady pisowni, rymowanki i wesołe rysunki do pokolorowania.',
    estimatedTime: '15 min',
    previewLines: [
      '1. M_j brat kupił r_żowe jabłko. (ó/u)',
      '2. Nad r_eką pływa mała kaczka. (rz/ż)',
      '3. K_ól krakowski nosi złotą koronę. (ó/u)'
    ],
    downloadName: 'Ortografia_Klasa2_ZABAWA.pdf',
    fileName: 'Ortografia_Klasa2_ZABAWA.pdf',
    fileSize: '450 KB'
  },
  {
    id: 'ws-2',
    title: '📖 Czytanie ze Zrozumieniem: "Księżycowy Piesek"',
    category: 'czytanie',
    description: 'Ciekawa historyjka z dużą czcionką ułatwiającą czytanie oraz 5 pytań z opcjami odpowiedzi.',
    estimatedTime: '20 min',
    previewLines: [
      'Tekst: Piesek Burek marzył o podróży na Księżyc...',
      'Pytanie 1: Jak miał na imię piesek?',
      'Pytanie 2: Czym Burek poleciał w kosmos?'
    ],
    downloadName: 'Ksiezycowy_Piesek_Czytanka.pdf',
    fileName: 'Ksiezycowy_Piesek_Czytanka.pdf',
    fileSize: '620 KB'
  }
];

export const INITIAL_CLASS_EVENTS: ClassEvent[] = [
  {
    id: 'ev-1',
    dateStr: 'Sobota, 22 Sierpnia 2026',
    dayOfWeek: 'Sobota',
    isoDate: '2026-08-22',
    time: '09:30 - 14:30',
    topic: 'Rozpoczęcie Roku Szkolnego: Powitanie i sprawy organizacyjne',
    room: 'Sala nr 14',
    notes: 'Prosimy o przyniesienie piórnika i zeszytu w linie.'
  },
  {
    id: 'ev-2',
    dateStr: 'Sobota, 29 Sierpnia 2026',
    dayOfWeek: 'Sobota',
    isoDate: '2026-08-29',
    time: '09:30 - 14:30',
    topic: 'Alfabet i Wspomnienia z Wakacji: Pisanie i wypowiedzi ustne',
    room: 'Sala nr 14'
  },
  {
    id: 'ev-3',
    dateStr: 'Sobota, 5 Września 2026',
    dayOfWeek: 'Sobota',
    isoDate: '2026-09-05',
    time: '09:30 - 14:30',
    topic: 'Jesień w Lesie: Poznawanie darów przyrody i ortografia (rz / ż)',
    room: 'Sala nr 14'
  },
  {
    id: 'ev-4',
    dateStr: 'Sobota, 12 Września 2026',
    dayOfWeek: 'Sobota',
    isoDate: '2026-09-12',
    time: '09:30 - 14:30',
    topic: 'Legenda o Smoku Wawelskim i Krakowie',
    room: 'Sala nr 14'
  },
  {
    id: 'ev-5',
    dateStr: 'Sobota, 19 Września 2026',
    dayOfWeek: 'Sobota',
    isoDate: '2026-09-19',
    time: '09:30 - 14:30',
    topic: 'Symbole Narodowe: Flaga, Godło i Hymn Polski',
    room: 'Sala nr 14'
  },
  {
    id: 'ev-6',
    dateStr: 'Sobota, 26 Września 2026',
    dayOfWeek: 'Sobota',
    isoDate: '2026-09-26',
    time: '09:30 - 14:30',
    topic: 'Syrenka Warszawska i Święto Warszawy',
    room: 'Sala nr 14'
  },
  {
    id: 'ev-7',
    dateStr: 'Sobota, 3 Października 2026',
    dayOfWeek: 'Sobota',
    isoDate: '2026-10-03',
    time: '09:30 - 14:30',
    topic: 'Czytanie ze Zrozumieniem: Lektury polskie dla dzieci',
    room: 'Sala nr 14'
  },
  {
    id: 'ev-8',
    dateStr: 'Sobota, 10 Października 2026',
    dayOfWeek: 'Sobota',
    isoDate: '2026-10-10',
    time: '09:30 - 14:30',
    topic: 'Dzień Edukacji Narodowej - Warsztaty Plastyczne',
    room: 'Sala nr 14'
  },
  {
    id: 'ev-9',
    dateStr: 'Sobota, 31 Października 2026',
    dayOfWeek: 'Sobota',
    isoDate: '2026-10-31',
    time: '—',
    topic: 'Święto Zmarłych / Halloween - Dzień wolny od zajęć',
    room: '—',
    isHoliday: true
  }
];

export const INITIAL_STUDENT_PROFILES: StudentProfile[] = [];
export const INITIAL_FEEDBACK_MESSAGES: FeedbackMessage[] = [];
export const MOCK_STUDENTS_LIST = INITIAL_STUDENT_PROFILES;
