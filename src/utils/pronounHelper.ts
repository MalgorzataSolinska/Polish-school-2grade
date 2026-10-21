// Helper for Polish demonstrative pronouns: TEN, TA, TO (Zaimki Wskazujące)
import { cleanWord } from './wordHelpers';

export type PolishPronoun = 'ten' | 'ta' | 'to';

// Common Polish nouns taught in Polish elementary school (klasa 2)
export const KNOWN_POLISH_PRONOUNS: Record<string, PolishPronoun> = {
  // Słowa ze zjazdu podane przez użytkownika
  'PARASOL': 'ten',
  'KURTKA': 'ta',
  'OKNO': 'to',

  // Symbole narodowe, geografia i historia
  'SYRENKA': 'ta',
  'WARSZAWA': 'ta',
  'WISŁA': 'ta',
  'WISLA': 'ta',
  'ORZEŁ': 'ten',
  'ORZEL': 'ten',
  'FLAGA': 'ta',
  'GODŁO': 'to',
  'GODLO': 'to',
  'KRAKÓW': 'ten',
  'KRAKOW': 'ten',
  'GDAŃSK': 'ten',
  'GDANSK': 'ten',
  'SMOK': 'ten',
  'WAWEL': 'ten',
  'HYMN': 'ten',
  'OJCZYZNA': 'ta',
  'ZAMEK': 'ten',
  'TARCZA': 'ta',
  'MIECZ': 'ten',
  'RZEKA': 'ta',
  'MORZE': 'to',
  'BAŁTYK': 'ten',
  'BALTYK': 'ten',
  'TATRY': 'ta', // potocznie l.poj góra
  'GÓRA': 'ta',
  'GORA': 'ta',
  'GÓRY': 'ta',
  'MIASTO': 'to',
  'WIEŚ': 'ta',
  'WIES': 'ta',
  'JEZIORO': 'to',
  'LAS': 'ten',
  'POLE': 'to',

  // Szkoła, przybory i nauka
  'SOBOTA': 'ta',
  'SZKOŁA': 'ta',
  'SZKOLA': 'ta',
  'PODRĘCZNIK': 'ten',
  'PODRECZNIK': 'ten',
  'KSIĄŻKA': 'ta',
  'KSIAZKA': 'ta',
  'ZESZYT': 'ten',
  'PIÓRNIK': 'ten',
  'PIORNIK': 'ten',
  'OŁÓWEK': 'ten',
  'OLOWEK': 'ten',
  'DŁUGOPIS': 'ten',
  'DLUGOPIS': 'ten',
  'GUMKA': 'ta',
  'LINIJKA': 'ta',
  'KLEJ': 'ten',
  'NOŻYCZKI': 'to',
  'PLECAK': 'ten',
  'TORBA': 'ta',
  'KLASA': 'ta',
  'TABLICA': 'ta',
  'KREDA': 'ta',
  'ŁAWKA': 'ta',
  'LAWKA': 'ta',
  'KRZESŁO': 'to',
  'KRZESLO': 'to',
  'BIURKO': 'to',
  'ALFABET': 'ten',
  'LITERA': 'ta',
  'SYLABA': 'ta',
  'SŁOWO': 'to',
  'SLOWO': 'to',
  'ZDANIE': 'to',
  'ZADANIE': 'to',
  'ĆWICZENIE': 'to',
  'CWICZENIE': 'to',
  'LEKCJA': 'ta',

  // Wakacje, pory roku i pogoda
  'WAKACJE': 'ta',
  'SŁOŃCE': 'to',
  'SLONCE': 'to',
  'CHMURA': 'ta',
  'DESZCZ': 'ten',
  'WIATR': 'ten',
  'ŚNIEG': 'ten',
  'SNIEG': 'ten',
  'TĘCZA': 'ta',
  'TECZA': 'ta',
  'NIEBO': 'to',
  'POWODŹ': 'ta',
  'POWODZ': 'ta',
  'BURZA': 'ta',
  'POGODA': 'ta',
  'WIOSNA': 'ta',
  'LATO': 'to',
  'JESIEŃ': 'ta',
  'JESIEN': 'ta',
  'ZIMA': 'ta',
  'BAŁWAN': 'ten',
  'BALWAN': 'ten',

  // Ubrania i przedmioty
  'CZAPKA': 'ta',
  'SZALIK': 'ten',
  'RĘKAWICZKA': 'ta',
  'REKAWICZKA': 'ta',
  'BUT': 'ten',
  'SWETER': 'ten',
  'BLUZA': 'ta',
  'SUKIENKA': 'ta',
  'SPÓDNICA': 'ta',
  'SPODNICA': 'ta',
  'ZEGAR': 'ten',
  'TELEWIZOR': 'ten',
  'KOMPUTER': 'ten',
  'CZAJNIK': 'ten',
  'PRALKA': 'ta',
  'LAMPA': 'ta',
  'DYWAN': 'ten',
  'ŁÓŻKO': 'to',
  'LOZKO': 'to',
  'DRZWI': 'to',

  // Przyroda, rośliny i zwierzęta
  'DRZEWO': 'to',
  'LIŚĆ': 'ten',
  'LISC': 'ten',
  'KWIAT': 'ten',
  'RÓŻA': 'ta',
  'ROZA': 'ta',
  'JABŁKO': 'to',
  'JABLKO': 'to',
  'GRUSZKA': 'ta',
  'ŚLIWKA': 'ta',
  'SLIWKA': 'ta',
  'GRZYB': 'ten',
  'PIES': 'ten',
  'PIESEK': 'ten',
  'KOT': 'ten',
  'KOTEK': 'ten',
  'PTAK': 'ten',
  'KACZKA': 'ta',
  'KURA': 'ta',
  'KOGUT': 'ten',
  'KROWA': 'ta',
  'KOŃ': 'ten',
  'KON': 'ten',
  'ŚWINIA': 'ta',
  'SWINIA': 'ta',
  'OWCA': 'ta',
  'KOZA': 'ta',
  'JEŻ': 'ten',
  'JEZ': 'ten',
  'DZIECKO': 'to',
  'ZWIERZĘ': 'to',
  'ZWIERZE': 'to',
  'PISKLĘ': 'to',
  'PISKLE': 'to',
  'ŹREBIĘ': 'to',
  'ZREBIE': 'to',

  // Jedzenie
  'CHLEB': 'ten',
  'MASŁO': 'to',
  'MASLO': 'to',
  'MLEKO': 'to',
  'SER': 'ten',
  'WODA': 'ta',
  'SOK': 'ten',
  'HERBATA': 'ta',
  'CIASTO': 'to',

  // Pojazdy i miejsca
  'AUTO': 'to',
  'SAMOCHÓD': 'ten',
  'SAMOCHOD': 'ten',
  'ROWER': 'ten',
  'POCIĄG': 'ten',
  'POCIAG': 'ten',
  'SAMOLOT': 'ten',
  'STATEK': 'ten',
  'PARK': 'ten',
  'PLAC': 'ten',
  'SKLEP': 'ten',
  'KINO': 'to',
  'TEATR': 'ten',
  'MUZEUM': 'to',

  // Ludzie i rodzina
  'TATA': 'ten',
  'MAMA': 'ta',
  'BRAT': 'ten',
  'SIOSTRA': 'ta',
  'DZIADEK': 'ten',
  'BABCIA': 'ta',
  'WUJEK': 'ten',
  'CIOCIA': 'ta',
  'KOLEGA': 'ten',
  'KOLEŻANKA': 'ta',
  'KOLEZANKA': 'ta',
  'PRZYJACIEL': 'ten',
  'CHŁOPIEC': 'ten',
  'CHLOPIEC': 'ten',
  'DZIEWCZYNKA': 'ta',
  'NAUCZYCIEL': 'ten',
  'NAUCZYCIELKA': 'ta',

  // Ciało i abstrakcje
  'OKO': 'to',
  'UCHO': 'to',
  'RĘKA': 'ta',
  'REKA': 'ta',
  'NOGA': 'ta',
  'GŁOWA': 'ta',
  'GLOWA': 'ta',
  'DŁOŃ': 'ta',
  'DLON': 'ta',
  'TWARZ': 'ta',
  'SERCE': 'to',
  'IMIĘ': 'to',
  'IMIE': 'to',
  'ŚWIĘTO': 'to',
  'SWIETO': 'to',
  'NOC': 'ta',
};

// Exceptional Polish feminine nouns ending in consonant
const FEMININE_CONSONANT_WORDS = new Set([
  'NOC', 'DŁOŃ', 'DLON', 'TWARZ', 'MYSZ', 'KOŚĆ', 'KOSC', 'WIEŚ', 'WIES',
  'JESIEŃ', 'JESIEN', 'RZECZ', 'KREW', 'SÓL', 'SOL', 'PIEŚŃ', 'PIESN',
  'POWODŹ', 'POWODZ', 'CZEŚĆ', 'CZESC', 'CZĘŚĆ', 'POMOC', 'MŁODZIEŻ',
  'MLODZIEZ', 'PODRÓŻ', 'PODROZ', 'MIŁOŚĆ', 'MILOSC', 'RADOŚĆ', 'RADOSC',
  'KĄPIEL', 'KAPIEL', 'ODPOWIEDŹ', 'ODPOWIEDZ', 'PAMIĘĆ', 'PAMIEC',
]);

// Exceptional Polish masculine nouns ending in -a
const MASCULINE_A_WORDS = new Set([
  'TATA', 'KOLEGA', 'MĘŻCZYZNA', 'MEZCZYZNA', 'KIEROWCA', 'POETA', 'ARTYSTA',
  'TURYSTA', 'DORADCA', 'SĘDZIA', 'SEDZIA', 'HRABIA', 'MONARCHA',
]);

/**
 * Determines the demonstrative pronoun ('ten' | 'ta' | 'to') for a given Polish word.
 */
export function getPolishPronoun(rawWord: string, customPronoun?: 'ten' | 'ta' | 'to'): PolishPronoun {
  if (customPronoun === 'ten' || customPronoun === 'ta' || customPronoun === 'to') {
    return customPronoun;
  }

  const clean = cleanWord(rawWord);
  if (!clean) return 'to';

  // 1. Direct dictionary match
  if (KNOWN_POLISH_PRONOUNS[clean]) {
    return KNOWN_POLISH_PRONOUNS[clean];
  }

  // 2. Specific masculine -a exceptions
  if (MASCULINE_A_WORDS.has(clean)) {
    return 'ten';
  }

  // 3. Specific feminine consonant exceptions
  if (FEMININE_CONSONANT_WORDS.has(clean) || clean.endsWith('OŚĆ') || clean.endsWith('OSC')) {
    return 'ta';
  }

  // 4. Latin loanwords ending in -um (muzeum, akwarium, liceum, centrum) -> neuter ('to')
  if (clean.endsWith('UM') && clean.length > 3) {
    return 'to';
  }

  // 5. Neuter endings: -o, -e, -ę, -ię
  const lastChar = clean.slice(-1);
  if (lastChar === 'O' || lastChar === 'Ó' && clean === 'PIÓRO') {
    return 'to';
  }
  if (lastChar === 'E' || lastChar === 'Ę') {
    return 'to';
  }

  // 6. Feminine endings: -a, -i
  if (lastChar === 'A' || lastChar === 'I') {
    return 'ta';
  }

  // 7. By default, Polish nouns ending in a consonant are masculine ('ten')
  return 'ten';
}

/**
 * Formatted label for demonstrative pronoun button
 */
export const PRONOUN_CONFIG: Record<
  PolishPronoun,
  {
    pronoun: PolishPronoun;
    label: string;
    gender: string;
    colorBg: string;
    hoverBg: string;
    borderCol: string;
    textCol: string;
    example: string;
  }
> = {
  ten: {
    pronoun: 'ten',
    label: 'TEN',
    gender: 'rodzaj męski',
    colorBg: 'bg-[#4F81FF]',
    hoverBg: 'hover:bg-blue-600',
    borderCol: 'border-black',
    textCol: 'text-white',
    example: 'np. ten parasol, ten zeszyt',
  },
  ta: {
    pronoun: 'ta',
    label: 'TA',
    gender: 'rodzaj żeński',
    colorBg: 'bg-[#FF4F81]',
    hoverBg: 'hover:bg-pink-600',
    borderCol: 'border-black',
    textCol: 'text-white',
    example: 'np. ta kurtka, ta szkoła',
  },
  to: {
    pronoun: 'to',
    label: 'TO',
    gender: 'rodzaj nijaki',
    colorBg: 'bg-[#FFD700]',
    hoverBg: 'hover:bg-yellow-400',
    borderCol: 'border-black',
    textCol: 'text-black',
    example: 'np. to okno, to słońce',
  },
};
