// Word to Emoji mapping and Polish Syllabifier for Grade 2 Polish School

export const POLISH_WORD_EMOJI_MAP: Record<string, string> = {
  // Symbole i Miasta
  'SYRENKA': '🧜‍♀️',
  'WARSZAWA': '🏰',
  'KRAKÓW': '🐉',
  'KRAKOW': '🐉',
  'GDAŃSK': '⚓',
  'GDANSK': '⚓',
  'ORZEŁ': '🦅',
  'ORZEL': '🦅',
  'FLAGA': '🇵🇱',
  'WISŁA': '🌊',
  'WISLA': '🌊',
  'SMOK': '🐉',
  'WAWEL': '🏰',
  'GODŁO': '🦅',
  'GODLO': '🦅',
  'HYMN': '🎵',
  'OJCZYZNA': '🇵🇱',

  // Szkoła i Nauka
  'SOBOTA': '🏫',
  'SZKOŁA': '🏫',
  'SZKOLA': '🏫',
  'PODRĘCZNIK': '📚',
  'PODRECZNIK': '📚',
  'KSIĄŻKA': '📖',
  'KSIAZKA': '📖',
  'OŁÓWEK': '✏️',
  'OLOWEK': '✏️',
  'PIÓRNIK': '✏️',
  'PIORNIK': '✏️',
  'ZESZYT': '📓',
  'LEKCJA': '👩‍🏫',
  'KLASA': '🏫',
  'LITERA': '🔤',
  'ALFABET': '🔤',
  'CYFRA': '🔢',
  'LICZBA': '🔢',
  'SŁOWO': '🔤',
  'SLOWO': '🔤',

  // Pory Roku, Przyroda i Inne
  'JESIEN': '🍂',
  'JESIEŃ': '🍂',
  'DRZEWO': '🌳',
  'LIŚĆ': '🍁',
  'LISC': '🍁',
  'JABŁKO': '🍎',
  'JABLKO': '🍎',
  'GRZYB': '🍄',
  'DESZCZ': '🌧️',
  'SŁOŃCE': '☀️',
  'SLONCE': '☀️',
  'KACZKA': '🦆',
  'PIES': '🐶',
  'PIESEK': '🐶',
  'KOT': '🐱',
  'KOTEK': '🐱',
  'PTAK': '🐦',
  'JEŻ': '🦔',
  'JEZ': '🦔',
  'RZEKA': '🌊',
  'MORZE': '🌊',
  'LAS': '🌲',
  'KWIAT': '🌸',
  'RÓŻA': '🌹',
  'ROZA': '🌹',
  'TARCZA': '🛡️',
  'MIECZ': '⚔️',
  'KORONA': '👑',
  'KRÓL': '👑',
  'KROL': '👑',
  'SERCE': '❤️',
  'GWIAZDA': '⭐',
  'CZEKOLADA': '🍫',
  'CHLEB': '🍞',
  'MLEKO': '🥛',
  'DOM': '🏠',
  'WODA': '💧',
  'RYBA': '🐟',
  'ZABAWA': '🎮',
  'GRA': '🎮',
};

export function getEmojiForWord(rawWord: string): string {
  if (!rawWord) return '⭐';
  const word = rawWord.trim().toUpperCase();

  // 1. Exact match in dictionary
  if (POLISH_WORD_EMOJI_MAP[word]) {
    return POLISH_WORD_EMOJI_MAP[word];
  }

  // 2. Partial string match
  if (word.includes('SYREN')) return '🧜‍♀️';
  if (word.includes('WARSZ')) return '🏰';
  if (word.includes('KRAK') || word.includes('WAWEL')) return '🐉';
  if (word.includes('GDAŃ') || word.includes('GDAN') || word.includes('BAŁT') || word.includes('BALT')) return '⚓';
  if (word.includes('ORZE') || word.includes('GODŁ') || word.includes('GODL')) return '🦅';
  if (word.includes('FLAG') || word.includes('POLSK')) return '🇵🇱';
  if (word.includes('WISŁ') || word.includes('WISL') || word.includes('RZEK') || word.includes('MORZ')) return '🌊';
  if (word.includes('SOBOT') || word.includes('SZKOŁ') || word.includes('SZKOL') || word.includes('KLAS')) return '🏫';
  if (word.includes('KSIĄŻ') || word.includes('KSIAZ') || word.includes('PODRĘCZ') || word.includes('PODRECZ') || word.includes('CZYT')) return '📚';
  if (word.includes('PIÓR') || word.includes('PIOR') || word.includes('OŁÓW') || word.includes('OLOW') || word.includes('PIS')) return '✏️';
  if (word.includes('TARCZ')) return '🛡️';
  if (word.includes('MIECZ')) return '⚔️';
  if (word.includes('SMOK')) return '🐉';
  if (word.includes('KRÓL') || word.includes('KROL') || word.includes('KORON')) return '👑';
  if (word.includes('GRZYB')) return '🍄';
  if (word.includes('JESIEN') || word.includes('JESIEŃ') || word.includes('LIŚĆ') || word.includes('LISC')) return '🍂';
  if (word.includes('JABŁ') || word.includes('JABL')) return '🍎';
  if (word.includes('DRZEW') || word.includes('LAS')) return '🌳';
  if (word.includes('KACZK')) return '🦆';
  if (word.includes('PIES')) return '🐶';
  if (word.includes('KOT')) return '🐱';
  if (word.includes('PTAK')) return '🐦';
  if (word.includes('JEŻ') || word.includes('JEZ')) return '🦔';
  if (word.includes('SERC')) return '❤️';
  if (word.includes('GWIAZD')) return '⭐';
  if (word.includes('SŁOŃC') || word.includes('SLONC')) return '☀️';
  if (word.includes('DESZCZ')) return '🌧️';
  if (word.includes('KWIAT') || word.includes('RÓŻ') || word.includes('ROZ')) return '🌸';
  if (word.includes('DOM')) return '🏠';

  return '⭐';
}

// Polish Syllable Dictionary
export const POLISH_SYLLABLE_DICTIONARY: Record<string, string[]> = {
  'WARSZAWA': ['WAR', 'SZA', 'WA'],
  'SYRENKA': ['SY', 'REN', 'KA'],
  'KRAKÓW': ['KRA', 'KÓW'],
  'KRAKOW': ['KRA', 'KOW'],
  'GDAŃSK': ['GDAŃSK'],
  'GDANSK': ['GDANSK'],
  'ORZEŁ': ['OR', 'ZEŁ'],
  'ORZEL': ['OR', 'ZEL'],
  'FLAGA': ['FLA', 'GA'],
  'WISŁA': ['WIS', 'ŁA'],
  'WISLA': ['WIS', 'LA'],
  'SOBOTA': ['SO', 'BO', 'TA'],
  'PODRĘCZNIK': ['POD', 'RĘCZ', 'NIK'],
  'PODRECZNIK': ['POD', 'RECZ', 'NIK'],
  'SMOK': ['SMOK'],
  'WAWEL': ['WA', 'WEL'],
  'GODŁO': ['GOD', 'ŁO'],
  'GODLO': ['GOD', 'LO'],
  'HYMN': ['HYMN'],
  'OJCZYZNA': ['OJ', 'CZY', 'ZNA'],
  'TARCZA': ['TAR', 'CZA'],
  'MIECZ': ['MIECZ'],
  'RZEKA': ['RZE', 'KA'],
  'MORZE': ['MO', 'RZE'],
  'BAŁTYK': ['BAŁ', 'TYK'],
  'BALTYK': ['BAL', 'TYK'],
  'POLSKA': ['POL', 'SKA'],
  'LEKCJA': ['LEK', 'CJA'],
  'SZKOŁA': ['SZKO', 'ŁA'],
  'SZKOLA': ['SZKO', 'LA'],
  'KLASA': ['KLA', 'SA'],
  'LITERA': ['LI', 'TE', 'RA'],
  'ALFABET': ['AL', 'FA', 'BET'],
  'ZESZYT': ['ZE', 'SZYT'],
  'OŁÓWEK': ['O', 'ŁÓ', 'WEK'],
  'OLOWEK': ['O', 'ŁO', 'WEK'],
  'PIÓRNIK': ['PIÓR', 'NIK'],
  'PIORNIK': ['PIOR', 'NIK'],
  'KSIĄŻKA': ['KSIĄŻ', 'KA'],
  'KSIAZKA': ['KSIAZ', 'KA'],
  'PIES': ['PIES'],
  'PIESEK': ['PIE', 'SEK'],
  'KOT': ['KOT'],
  'KOTEK': ['KO', 'TEK'],
  'JESIEN': ['JE', 'SIEŃ'],
  'JESIEŃ': ['JE', 'SIEŃ'],
  'DRZEWO': ['DRZE', 'WO'],
  'LIŚĆ': ['LIŚĆ'],
  'LISC': ['LISC'],
  'GRZYB': ['GRZYB'],
  'JABŁKO': ['JABŁ', 'KO'],
  'JABLKO': ['JABL', 'KO'],
  'JEŻ': ['JEŻ'],
  'JEZ': ['JEZ'],
  'KACZKA': ['KACZ', 'KA'],
  'PTAK': ['PTAK'],
  'CZEKOLADA': ['CZE', 'KO', 'LA', 'DA'],
  'MISTRZ': ['MISTRZ'],
  'KASZTAN': ['KASZ', 'TAN'],
  'KACZUSZKA': ['KA', 'CZUSZ', 'KA'],
  'WAKACJE': ['WA', 'KA', 'CJE'],
  'SERCE': ['SER', 'CE'],
  'GWIAZDA': ['GWIAZ', 'DA'],
  'SŁOŃCE': ['SŁOŃ', 'CE'],
  'SLONCE': ['SLON', 'CE'],
  'DESZCZ': ['DESZCZ'],
  'KWIAT': ['KWIAT'],
  'ROŚLINA': ['ROŚ', 'LI', 'NA'],
  'ROSLINA': ['ROS', 'LI', 'NA'],
  'PRZYRODA': ['PRZY', 'RO', 'DA'],
};

export function splitPolishSyllables(rawWord: string): string[] {
  if (!rawWord) return [];
  const word = rawWord.trim().toUpperCase();

  // 1. Explicit hyphenation provided e.g. "WAR-SZA-WA" or "SO-BO-TA"
  if (word.includes('-') || word.includes('/') || word.includes(' ')) {
    const parts = word.split(/[-/\s]+/).filter(Boolean);
    if (parts.length > 0) return parts;
  }

  // 2. Check exact match in dictionary
  if (POLISH_SYLLABLE_DICTIONARY[word]) {
    return POLISH_SYLLABLE_DICTIONARY[word];
  }

  // 3. Algorithmic Polish Syllabification Engine
  const vowels = ['A', 'Ą', 'E', 'Ę', 'I', 'O', 'Ó', 'U', 'Y'];
  const isVowel = (char: string) => vowels.includes(char);

  const nucleusIndices: number[] = [];
  for (let i = 0; i < word.length; i++) {
    if (isVowel(word[i])) {
      // 'I' followed by a vowel softens the consonant and forms 1 vowel sound (e.g. IA, IE, IO, IU)
      if (word[i] === 'I' && i + 1 < word.length && isVowel(word[i + 1])) {
        continue;
      }
      nucleusIndices.push(i);
    }
  }

  if (nucleusIndices.length <= 1) {
    return [word];
  }

  const isDigraphAt = (str: string, pos: number) => {
    if (pos >= str.length - 1) return false;
    const pair = str.slice(pos, pos + 2);
    return ['CZ', 'SZ', 'RZ', 'DZ', 'DŻ', 'DŹ', 'CH'].includes(pair);
  };

  const result: string[] = [];
  let lastCut = 0;

  for (let k = 0; k < nucleusIndices.length - 1; k++) {
    const currVowelIdx = nucleusIndices[k];
    const nextVowelIdx = nucleusIndices[k + 1];
    const consonantsBetween = nextVowelIdx - currVowelIdx - 1;

    let cutAt = currVowelIdx + 1;

    if (consonantsBetween === 0 || consonantsBetween === 1) {
      cutAt = currVowelIdx + 1;
    } else if (consonantsBetween === 2) {
      if (isDigraphAt(word, currVowelIdx + 1)) {
        cutAt = currVowelIdx + 1;
      } else if (isDigraphAt(word, currVowelIdx + 2)) {
        cutAt = currVowelIdx + 2;
      } else {
        cutAt = currVowelIdx + 2;
      }
    } else {
      if (isDigraphAt(word, currVowelIdx + consonantsBetween - 1)) {
        cutAt = currVowelIdx + consonantsBetween - 1;
      } else {
        cutAt = currVowelIdx + Math.floor(consonantsBetween / 2) + 1;
      }
    }

    result.push(word.slice(lastCut, cutAt));
    lastCut = cutAt;
  }

  result.push(word.slice(lastCut));
  return result;
}
