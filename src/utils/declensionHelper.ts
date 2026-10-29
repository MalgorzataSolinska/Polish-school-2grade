// Declension helper for Polish noun cases: Mianownik, Dopełniacz, Biernik
// Specifically tailored for 2nd grade Polish school students (klasa 2)

import { cleanWord } from './wordHelpers';

export type PolishGrammarGender = 'fem' | 'masc_anim' | 'masc_inanim' | 'neut';

export type DeclensionCaseType = 'mianownik' | 'dopelniacz' | 'biernik';

export interface CaseSentenceData {
  caseType: DeclensionCaseType;
  caseName: string; // "Mianownik", "Dopełniacz", "Biernik"
  question: string; // "Kto? Co?", "Kogo? Czego nie ma?", "Kogo? Co widzę?"
  correctForm: string; // e.g. "pralka", "pralki", "pralkę"
  sentencePrefix: string; // e.g. "Tu jest moja", "Nie ma mojej", "Widzę moją"
  sentenceSuffix: string; // e.g. "."
  fullSentence: string; // e.g. "Tu jest moja pralka."
}

export interface WordDeclension {
  baseWord: string; // e.g. "PRALKA"
  displayWord: string; // e.g. "Pralka"
  gender: PolishGrammarGender;
  genderLabel: string; // "rodzaj żeński", "rodzaj męski", "rodzaj nijaki"
  mianownik: CaseSentenceData;
  dopelniacz: CaseSentenceData;
  biernik: CaseSentenceData;
  options: string[]; // Shuffled list of correct forms + 1-2 plausible distractors
}

interface RawDeclensionEntry {
  gender: PolishGrammarGender;
  m: string; // Mianownik (form)
  d: string; // Dopełniacz (form)
  b: string; // Biernik (form)
  distractors: string[]; // Additional forms (e.g. Narzędnik, Miejscownik)
}

// Curated dictionary for elementary Polish vocabulary with verified grammatical forms
const KNOWN_DECLENSIONS: Record<string, RawDeclensionEntry> = {
  // Zawody i osoby (ludzie - męskoosobowy / żywotny)
  'NAUKOWIEC': {
    gender: 'masc_anim',
    m: 'naukowiec',
    d: 'naukowca',
    b: 'naukowca',
    distractors: ['naukowcem', 'naukowcowi'],
  },
  'PIŁKARZ': {
    gender: 'masc_anim',
    m: 'piłkarz',
    d: 'piłkarza',
    b: 'piłkarza',
    distractors: ['piłkarzem', 'piłkarzowi'],
  },
  'PILKARZ': {
    gender: 'masc_anim',
    m: 'piłkarz',
    d: 'piłkarza',
    b: 'piłkarza',
    distractors: ['piłkarzem', 'piłkarzowi'],
  },
  'ASTRONOM': {
    gender: 'masc_anim',
    m: 'astronom',
    d: 'astronoma',
    b: 'astronoma',
    distractors: ['astronomem', 'astronomowi'],
  },
  'LEKARZ': {
    gender: 'masc_anim',
    m: 'lekarz',
    d: 'lekarza',
    b: 'lekarza',
    distractors: ['lekarzem', 'lekarzowi'],
  },
  'NAUCZYCIEL': {
    gender: 'masc_anim',
    m: 'nauczyciel',
    d: 'nauczyciela',
    b: 'nauczyciela',
    distractors: ['nauczycielem', 'nauczycielowi'],
  },
  'STRAŻAK': {
    gender: 'masc_anim',
    m: 'strażak',
    d: 'strażaka',
    b: 'strażaka',
    distractors: ['strażakiem', 'strażakowi'],
  },
  'STRAZAK': {
    gender: 'masc_anim',
    m: 'strażak',
    d: 'strażaka',
    b: 'strażaka',
    distractors: ['strażakiem', 'strażakowi'],
  },
  'POLICJANT': {
    gender: 'masc_anim',
    m: 'policjant',
    d: 'policjanta',
    b: 'policjanta',
    distractors: ['policjantem', 'policjantowi'],
  },
  'KIEROWCA': {
    gender: 'masc_anim',
    m: 'kierowca',
    d: 'kierowcy',
    b: 'kierowcę',
    distractors: ['kierowcą', 'kierowcy'],
  },
  'ARTYSTA': {
    gender: 'masc_anim',
    m: 'artysta',
    d: 'artysty',
    b: 'artystę',
    distractors: ['artystą', 'artyście'],
  },
  'MALARZ': {
    gender: 'masc_anim',
    m: 'malarz',
    d: 'malarza',
    b: 'malarza',
    distractors: ['malarzem', 'malarzowi'],
  },
  'PISARZ': {
    gender: 'masc_anim',
    m: 'pisarz',
    d: 'pisarza',
    b: 'pisarza',
    distractors: ['pisarzem', 'pisarzowi'],
  },
  'MUZYK': {
    gender: 'masc_anim',
    m: 'muzyk',
    d: 'muzyka',
    b: 'muzyka',
    distractors: ['muzykiem', 'muzykowi'],
  },
  'AKTOR': {
    gender: 'masc_anim',
    m: 'aktor',
    d: 'aktora',
    b: 'aktora',
    distractors: ['aktorem', 'aktorowi'],
  },
  'KUCHARZ': {
    gender: 'masc_anim',
    m: 'kucharz',
    d: 'kucharza',
    b: 'kucharza',
    distractors: ['kucharzem', 'kucharzowi'],
  },
  'SPORTOWIEC': {
    gender: 'masc_anim',
    m: 'sportowiec',
    d: 'sportowca',
    b: 'sportowca',
    distractors: ['sportowcem', 'sportowcowi'],
  },
  'BRAMKARZ': {
    gender: 'masc_anim',
    m: 'bramkarz',
    d: 'bramkarza',
    b: 'bramkarza',
    distractors: ['bramkarzem', 'bramkarzowi'],
  },
  'CHŁOPIEC': {
    gender: 'masc_anim',
    m: 'chłopiec',
    d: 'chłopca',
    b: 'chłopca',
    distractors: ['chłopcem', 'chłopcu'],
  },
  'CHLOPIEC': {
    gender: 'masc_anim',
    m: 'chłopiec',
    d: 'chłopca',
    b: 'chłopca',
    distractors: ['chłopcem', 'chłopcu'],
  },
  // Słowo podane w poleceniu użytkownika
  'TELEFON': {
    gender: 'masc_inanim',
    m: 'telefon',
    d: 'telefonu',
    b: 'telefon',
    distractors: ['telefonem', 'telefonie'],
  },
  'PRALKA': {
    gender: 'fem',
    m: 'pralka',
    d: 'pralki',
    b: 'pralkę',
    distractors: ['pralką', 'pralce'],
  },
  'KUCHNIA': {
    gender: 'fem',
    m: 'kuchnia',
    d: 'kuchni',
    b: 'kuchnię',
    distractors: ['kuchnią', 'kuchnie', 'kuchce'],
  },
  'ŁAZIENKA': {
    gender: 'fem',
    m: 'łazienka',
    d: 'łazienki',
    b: 'łazienkę',
    distractors: ['łazienką', 'łazience'],
  },
  'LAZIENKA': {
    gender: 'fem',
    m: 'łazienka',
    d: 'łazienki',
    b: 'łazienkę',
    distractors: ['łazienką', 'łazience'],
  },
  'SYPIALNIA': {
    gender: 'fem',
    m: 'sypialnia',
    d: 'sypialni',
    b: 'sypialnię',
    distractors: ['sypialnią', 'sypialnie'],
  },
  'JADALNIA': {
    gender: 'fem',
    m: 'jadalnia',
    d: 'jadalni',
    b: 'jadalnię',
    distractors: ['jadalnią', 'jadalnie'],
  },
  'BABCIA': {
    gender: 'fem',
    m: 'babcia',
    d: 'babci',
    b: 'babcię',
    distractors: ['babcią', 'babcie'],
  },
  'CIOCIA': {
    gender: 'fem',
    m: 'ciocia',
    d: 'cioci',
    b: 'ciocię',
    distractors: ['ciocią', 'ciocie'],
  },
  'ZIEMIA': {
    gender: 'fem',
    m: 'ziemia',
    d: 'ziemi',
    b: 'ziemię',
    distractors: ['ziemią', 'ziemie'],
  },
  'DYNIA': {
    gender: 'fem',
    m: 'dynia',
    d: 'dyni',
    b: 'dynię',
    distractors: ['dynią', 'dynie'],
  },

  // Sprzęty AGD i elektronika (Dopełniacz na -a: telewizora, komputera, czajnika itp.)
  'TELEWIZOR': {
    gender: 'masc_inanim',
    m: 'telewizor',
    d: 'telewizora',
    b: 'telewizor',
    distractors: ['telewizorem', 'telewizorze'],
  },
  'KOMPUTER': {
    gender: 'masc_inanim',
    m: 'komputer',
    d: 'komputera',
    b: 'komputer',
    distractors: ['komputerem', 'komputerze'],
  },
  'CZAJNIK': {
    gender: 'masc_inanim',
    m: 'czajnik',
    d: 'czajnika',
    b: 'czajnik',
    distractors: ['czajnikiem', 'czajniku'],
  },
  'LAPTOP': {
    gender: 'masc_inanim',
    m: 'laptop',
    d: 'laptopa',
    b: 'laptop',
    distractors: ['laptopem', 'laptopie'],
  },
  'SMARTFON': {
    gender: 'masc_inanim',
    m: 'smartfon',
    d: 'smartfona',
    b: 'smartfon',
    distractors: ['smartfonem', 'smartfonie'],
  },
  'TABLET': {
    gender: 'masc_inanim',
    m: 'tablet',
    d: 'tableta',
    b: 'tablet',
    distractors: ['tabletem', 'tablecie'],
  },
  'TOSTER': {
    gender: 'masc_inanim',
    m: 'toster',
    d: 'tostera',
    b: 'toster',
    distractors: ['tosterem', 'tosterze'],
  },
  'MIKSER': {
    gender: 'masc_inanim',
    m: 'mikser',
    d: 'miksera',
    b: 'mikser',
    distractors: ['mikserem', 'mikserze'],
  },
  'ODKURZACZ': {
    gender: 'masc_inanim',
    m: 'odkurzacz',
    d: 'odkurzacza',
    b: 'odkurzacz',
    distractors: ['odkurzaczem', 'odkurzaczu'],
  },

  // Słówka z 22 sierpnia (rozpoczęcie roku)
  'PARASOL': {
    gender: 'masc_inanim',
    m: 'parasol',
    d: 'parasola',
    b: 'parasol',
    distractors: ['parasolu', 'parasolem'],
  },
  'KURTKA': {
    gender: 'fem',
    m: 'kurtka',
    d: 'kurtki',
    b: 'kurtkę',
    distractors: ['kurtką', 'kurtce'],
  },
  'OKNO': {
    gender: 'neut',
    m: 'okno',
    d: 'okna',
    b: 'okno',
    distractors: ['oknem', 'oknie'],
  },
  'ORZEŁ': {
    gender: 'masc_anim',
    m: 'orzeł',
    d: 'orła',
    b: 'orła',
    distractors: ['orłem', 'orłowi'],
  },
  'ORZEL': {
    gender: 'masc_anim',
    m: 'orzeł',
    d: 'orła',
    b: 'orła',
    distractors: ['orłem', 'orłowi'],
  },
  'FLAGA': {
    gender: 'fem',
    m: 'flaga',
    d: 'flagi',
    b: 'flagę',
    distractors: ['flagą', 'fladze'],
  },
  'GODŁO': {
    gender: 'neut',
    m: 'godło',
    d: 'godła',
    b: 'godło',
    distractors: ['godłem', 'godle'],
  },
  'GODLO': {
    gender: 'neut',
    m: 'godło',
    d: 'godła',
    b: 'godło',
    distractors: ['godłem', 'godle'],
  },
  'SYRENKA': {
    gender: 'fem',
    m: 'syrenka',
    d: 'syrenki',
    b: 'syrenkę',
    distractors: ['syrenką', 'syrence'],
  },
  'ZAMEK': {
    gender: 'masc_inanim',
    m: 'zamek',
    d: 'zamku',
    b: 'zamek',
    distractors: ['zamkiem', 'zamkowi'],
  },
  'WISŁA': {
    gender: 'fem',
    m: 'Wisła',
    d: 'Wisły',
    b: 'Wisłę',
    distractors: ['Wisłą', 'Wiśle'],
  },
  'WISLA': {
    gender: 'fem',
    m: 'Wisła',
    d: 'Wisły',
    b: 'Wisłę',
    distractors: ['Wisłą', 'Wiśle'],
  },
  'WARSZAWA': {
    gender: 'fem',
    m: 'Warszawa',
    d: 'Warszawy',
    b: 'Warszawę',
    distractors: ['Warszawą', 'Warszawie'],
  },
  'KRAKÓW': {
    gender: 'masc_inanim',
    m: 'Kraków',
    d: 'Krakowa',
    b: 'Kraków',
    distractors: ['Krakowem', 'Krakowie'],
  },
  'KRAKOW': {
    gender: 'masc_inanim',
    m: 'Kraków',
    d: 'Krakowa',
    b: 'Kraków',
    distractors: ['Krakowem', 'Krakowie'],
  },
  'GDAŃSK': {
    gender: 'masc_inanim',
    m: 'Gdańsk',
    d: 'Gdańska',
    b: 'Gdańsk',
    distractors: ['Gdańskiem', 'Gdańsku'],
  },
  'GDANSK': {
    gender: 'masc_inanim',
    m: 'Gdańsk',
    d: 'Gdańska',
    b: 'Gdańsk',
    distractors: ['Gdańskiem', 'Gdańsku'],
  },

  // Słówka z 29 sierpnia i szkolne
  'SZKOŁA': {
    gender: 'fem',
    m: 'szkoła',
    d: 'szkoły',
    b: 'szkołę',
    distractors: ['szkołą', 'szkole'],
  },
  'SZKOLA': {
    gender: 'fem',
    m: 'szkoła',
    d: 'szkoły',
    b: 'szkołę',
    distractors: ['szkołą', 'szkole'],
  },
  'KSIĄŻKA': {
    gender: 'fem',
    m: 'książka',
    d: 'książki',
    b: 'książkę',
    distractors: ['książką', 'książce'],
  },
  'KSIAZKA': {
    gender: 'fem',
    m: 'książka',
    d: 'książki',
    b: 'książkę',
    distractors: ['książką', 'książce'],
  },
  'SŁOŃCE': {
    gender: 'neut',
    m: 'słońce',
    d: 'słońca',
    b: 'słońce',
    distractors: ['słońcem', 'słońcu'],
  },
  'SLONCE': {
    gender: 'neut',
    m: 'słońce',
    d: 'słońca',
    b: 'słońce',
    distractors: ['słońcem', 'słońcu'],
  },
  'MORZE': {
    gender: 'neut',
    m: 'morze',
    d: 'morza',
    b: 'morze',
    distractors: ['morzem', 'morzu'],
  },
  'PIES': {
    gender: 'masc_anim',
    m: 'pies',
    d: 'psa',
    b: 'psa',
    distractors: ['psem', 'psu'],
  },
  'KOT': {
    gender: 'masc_anim',
    m: 'kot',
    d: 'kota',
    b: 'kota',
    distractors: ['kotem', 'kotu'],
  },
  'ZESZYT': {
    gender: 'masc_inanim',
    m: 'zeszyt',
    d: 'zeszytu',
    b: 'zeszyt',
    distractors: ['zeszytem', 'zeszycie'],
  },
  'PIÓRNIK': {
    gender: 'masc_inanim',
    m: 'piórnik',
    d: 'piórnika',
    b: 'piórnik',
    distractors: ['piórnikiem', 'piórniku'],
  },
  'PIORNIK': {
    gender: 'masc_inanim',
    m: 'piórnik',
    d: 'piórnika',
    b: 'piórnik',
    distractors: ['piórnikiem', 'piórniku'],
  },
  'PLECAK': {
    gender: 'masc_inanim',
    m: 'plecak',
    d: 'plecaka',
    b: 'plecak',
    distractors: ['plecakiem', 'plecaku'],
  },
  'JABŁKO': {
    gender: 'neut',
    m: 'jabłko',
    d: 'jabłka',
    b: 'jabłko',
    distractors: ['jabłkiem', 'jabłku'],
  },
  'JABLKO': {
    gender: 'neut',
    m: 'jabłko',
    d: 'jabłka',
    b: 'jabłko',
    distractors: ['jabłkiem', 'jabłku'],
  },
  'DOM': {
    gender: 'masc_inanim',
    m: 'dom',
    d: 'domu',
    b: 'dom',
    distractors: ['domem', 'domowi'],
  },
  'SAMOCHÓD': {
    gender: 'masc_inanim',
    m: 'samochód',
    d: 'samochodu',
    b: 'samochód',
    distractors: ['samochodem', 'samochodzie'],
  },
  'SAMOCHOD': {
    gender: 'masc_inanim',
    m: 'samochód',
    d: 'samochodu',
    b: 'samochód',
    distractors: ['samochodem', 'samochodzie'],
  },
  'ROWER': {
    gender: 'masc_inanim',
    m: 'rower',
    d: 'roweru',
    b: 'rower',
    distractors: ['rowerem', 'rowerze'],
  },
  'DRZEWO': {
    gender: 'neut',
    m: 'drzewo',
    d: 'drzewa',
    b: 'drzewo',
    distractors: ['drzewem', 'drzewie'],
  },
  'KWIAT': {
    gender: 'masc_inanim',
    m: 'kwiat',
    d: 'kwiatu',
    b: 'kwiat',
    distractors: ['kwiatem', 'kwiecie'],
  },
  'CZAPKA': {
    gender: 'fem',
    m: 'czapka',
    d: 'czapki',
    b: 'czapkę',
    distractors: ['czapką', 'czapce'],
  },
  'SZALIK': {
    gender: 'masc_inanim',
    m: 'szalik',
    d: 'szalika',
    b: 'szalik',
    distractors: ['szalikiem', 'szaliku'],
  },
  'BLUZA': {
    gender: 'fem',
    m: 'bluza',
    d: 'bluzy',
    b: 'bluzę',
    distractors: ['bluzą', 'bluzie'],
  },
  'OŁÓWEK': {
    gender: 'masc_inanim',
    m: 'ołówek',
    d: 'ołówka',
    b: 'ołówek',
    distractors: ['ołówkiem', 'ołówku'],
  },
  'OLOWEK': {
    gender: 'masc_inanim',
    m: 'ołówek',
    d: 'ołówka',
    b: 'ołówek',
    distractors: ['ołówkiem', 'ołówku'],
  },
  'DŁUGOPIS': {
    gender: 'masc_inanim',
    m: 'długopis',
    d: 'długopisu',
    b: 'długopis',
    distractors: ['długopisem', 'długopisie'],
  },
  'DLUGOPIS': {
    gender: 'masc_inanim',
    m: 'długopis',
    d: 'długopisu',
    b: 'długopis',
    distractors: ['długopisem', 'długopisie'],
  },
  'GUMKA': {
    gender: 'fem',
    m: 'gumka',
    d: 'gumki',
    b: 'gumkę',
    distractors: ['gumką', 'gumce'],
  },
  'LINIJKA': {
    gender: 'fem',
    m: 'linijka',
    d: 'linijki',
    b: 'linijkę',
    distractors: ['linijką', 'linijce'],
  },
  'SMOK': {
    gender: 'masc_anim',
    m: 'smok',
    d: 'smoka',
    b: 'smoka',
    distractors: ['smokiem', 'smoku'],
  },
  'PTAK': {
    gender: 'masc_anim',
    m: 'ptak',
    d: 'ptaka',
    b: 'ptaka',
    distractors: ['ptakiem', 'ptaku'],
  },
  'KRZESŁO': {
    gender: 'neut',
    m: 'krzesło',
    d: 'krzesła',
    b: 'krzesło',
    distractors: ['krzesłem', 'krześle'],
  },
  'KRZESLO': {
    gender: 'neut',
    m: 'krzesło',
    d: 'krzesła',
    b: 'krzesło',
    distractors: ['krzesłem', 'krześle'],
  },
  'BIURKO': {
    gender: 'neut',
    m: 'biurko',
    d: 'biurka',
    b: 'biurko',
    distractors: ['biurkiem', 'biurku'],
  },
  'PODRĘCZNIK': {
    gender: 'masc_inanim',
    m: 'podręcznik',
    d: 'podręcznika',
    b: 'podręcznik',
    distractors: ['podręcznikiem', 'podręczniku'],
  },
  'PODRECZNIK': {
    gender: 'masc_inanim',
    m: 'podręcznik',
    d: 'podręcznika',
    b: 'podręcznik',
    distractors: ['podręcznikiem', 'podręczniku'],
  },
  'ALFABET': {
    gender: 'masc_inanim',
    m: 'alfabet',
    d: 'alfabetu',
    b: 'alfabet',
    distractors: ['alfabetem', 'alfabecie'],
  },
  'SOBOTA': {
    gender: 'fem',
    m: 'sobota',
    d: 'soboty',
    b: 'sobotę',
    distractors: ['sobotą', 'sobocie'],
  },
};

/**
 * Returns sentence prefixes based on Polish grammatical gender:
 * - Żeński: "Tu jest moja ...", "Nie ma mojej ...", "Widzę moją ..."
 * - Męski nieożywiony: "Tu jest mój ...", "Nie ma mojego ...", "Widzę mój ..."
 * - Męski ożywiony: "Tu jest mój ...", "Nie ma mojego ...", "Widzę mojego ..."
 * - Nijaki: "Tu jest moje ...", "Nie ma mojego ...", "Widzę moje ..."
 */

export function isPersonOrProfession(cleanWord: string): boolean {
  const clean = cleanWord.toLowerCase().trim();
  return (
    /^(naukowiec|pilkarz|piłkarz|astronom|lekarz|nauczyciel|malarz|pisarz|muzyk|strazak|strażak|policjant|kierowca|sportowiec|bramkarz|aktor|kucharz|piekarz|murarz|marynarz|rycerz|zolnierz|żołnierz|uczen|uczeń|kolega|brat|tata|syn|chlopiec|chłopiec|pan|krol|król|prezydent|student|dyrektor|profesor|doktor|trener|fryzjer|kelner|inżynier|inzynier|artysta|programista|autor|bohater|lider|kapitan|pilot|sedzia|sędzia|pływak|plywak|biegacz|tancerz|piosenkarz|dziennikarz|fotograf|ogrodnik|rolnik|górnik|gornik|mechanik|informatyk|matematyk|chemik|fizyk|biolog|geograf|historyk|adwokat|aptekarz|sprzedawca|weterynarz|dentysta|leśnik|lesnik|strażnik|straznik|prawnik|architekt|astronau|kosmonauta|człowiek|czlowiek|sąsiad|sasiad|gość|gosc)/i.test(clean) ||
    /(arz|erz|mistrz|olog|zof|ant|ent|or|er|ik|yk|ist|ista|yst|ysta|ca|ec)$/i.test(clean)
  );
}

function getSentencePrefixes(gender: PolishGrammarGender, rawWord?: string): {
  mianownikPrefix: string;
  dopelniaczPrefix: string;
  biernikPrefix: string;
} {
  const clean = rawWord ? cleanWord(rawWord).toLowerCase().trim() : '';
  const isPerson = clean ? isPersonOrProfession(clean) : false;

  if (isPerson) {
    return {
      mianownikPrefix: 'Gdzie jest',
      dopelniaczPrefix: 'Nie ma',
      biernikPrefix: 'Widzę',
    };
  }

  switch (gender) {
    case 'fem':
      return {
        mianownikPrefix: 'Tu jest moja',
        dopelniaczPrefix: 'Nie ma mojej',
        biernikPrefix: 'Widzę moją',
      };
    case 'masc_inanim':
      return {
        mianownikPrefix: 'Tu jest mój',
        dopelniaczPrefix: 'Nie ma mojego',
        biernikPrefix: 'Widzę mój',
      };
    case 'masc_anim':
      return {
        mianownikPrefix: 'Gdzie jest nasz',
        dopelniaczPrefix: 'Nie ma naszego',
        biernikPrefix: 'Widzę naszego',
      };
    case 'neut':
      return {
        mianownikPrefix: 'Tu jest moje',
        dopelniaczPrefix: 'Nie ma mojego',
        biernikPrefix: 'Widzę moje',
      };
  }
}

function getGenderLabel(gender: PolishGrammarGender): string {
  switch (gender) {
    case 'fem':
      return 'rodzaj żeński (ta)';
    case 'masc_anim':
      return 'rodzaj męski żywotny (ten)';
    case 'masc_inanim':
      return 'rodzaj męski nieżywotny (ten)';
    case 'neut':
      return 'rodzaj nijaki (to)';
  }
}

/**
 * Algorithmic generator for any custom Polish noun added by teacher
 */
function generateAlgorithmicDeclension(rawWord: string): RawDeclensionEntry {
  const clean = cleanWord(rawWord).toLowerCase();
  const lastChar = clean.slice(-1);

  // Feminine in -a (e.g. pralka, kurtka, flaga, kuchnia, sypialnia, babcia)
  if (lastChar === 'a') {
    // Feminine ending in -ia (e.g. kuchnia, sypialnia, babcia, ciocia, ziemia, lilia, armia)
    if (clean.endsWith('ia')) {
      const stemWithoutIa = clean.slice(0, -2); // e.g. "kuchn", "babc", "sypialn"
      // Borrowed/foreign nouns in -lia, -ria, -ia take -ii (armii, lilii, historii)
      const takesDoubleI =
        /(ria|lia|fii|gii)$/i.test(clean) ||
        /(armia|lilia|historia|geografia|filharmonia|dania|francja|grecja)/i.test(clean);
      const dEnding = takesDoubleI ? 'ii' : 'i';
      return {
        gender: 'fem',
        m: clean,
        d: stemWithoutIa + dEnding,
        b: stemWithoutIa + 'ię',
        distractors: [stemWithoutIa + 'ią', stemWithoutIa + 'ie'],
      };
    }

    // Feminine ending in -ja (e.g. lekcja, stacja, szyja, żmija, nadzieja)
    if (clean.endsWith('ja')) {
      if (/[aeiouy]ja$/i.test(clean)) {
        // Vowel + ja: szyja -> szyi, żmija -> żmii, nadzieja -> nadziei
        const stemWithoutJa = clean.slice(0, -2);
        return {
          gender: 'fem',
          m: clean,
          d: stemWithoutJa + 'i',
          b: stemWithoutJa + 'ję',
          distractors: [stemWithoutJa + 'ją', clean],
        };
      } else {
        // Consonant + ja: lekcja -> lekcji, stacja -> stacji
        const stemWithoutA = clean.slice(0, -1);
        return {
          gender: 'fem',
          m: clean,
          d: stemWithoutA + 'i',
          b: stemWithoutA + 'ę',
          distractors: [stemWithoutA + 'ą', stemWithoutA + 'e'],
        };
      }
    }

    // Regular feminine in -a: pralka, kurtka, flaga, szkoła, woda, sobota
    const stem = clean.slice(0, -1);
    const stemLast = stem.slice(-1);
    // In Polish, after k, g, l write -i, after hard consonants write -y
    const dEnding = stemLast === 'k' || stemLast === 'g' || stemLast === 'l' ? 'i' : 'y';
    return {
      gender: 'fem',
      m: clean,
      d: stem + dEnding,
      b: stem + 'ę',
      distractors: [stem + 'ą', stem + 'e'],
    };
  }

  // Neuter in -o or -e
  if (lastChar === 'o' || lastChar === 'e' || lastChar === 'ę') {
    const stem = clean.slice(0, -1);
    return {
      gender: 'neut',
      m: clean,
      d: stem + 'a',
      b: clean,
      distractors: [stem + 'em', stem + 'u'],
    };
  }

  // Masculine words
  const isPerson = isPersonOrProfession(clean);
  const isAnimal = /^(pies|kot|orzel|orzeł|ptak|smok|wilk|kon|koń|lew|tygrys|slon|słoń|niedzwiedz|niedźwiedź|zubr|żubr|bocian|jez|jeż|lis|zajac|zając|waz|wąż|delfin|rekin|wieloryb|zuraw|żuraw|wrobel|wróbel|golab|gołąb|kogut|kaczor|indyk|chomik|krolik|królik|zolw|żółw|bobr|bóbr|kret|dzik|borsuk|hipopotam|nosorozec|nosorożec|strus|struś)/i.test(clean);
  const isLikelyAnim = isPerson || isAnimal;

  // Masculine personal nouns ending in -a (kierowca, artysta, programista, kolega, tata)
  if (isPerson && clean.endsWith('a')) {
    const stem = clean.slice(0, -1);
    const stemLast = stem.slice(-1);
    const dEnding = stemLast === 'k' || stemLast === 'g' || stemLast === 'l' ? 'i' : 'y';
    return {
      gender: 'masc_anim',
      m: clean,
      d: stem + dEnding,
      b: stem + 'ę',
      distractors: [stem + 'ą', stem + 'e'],
    };
  }

  const gender: PolishGrammarGender = isLikelyAnim ? 'masc_anim' : 'masc_inanim';

  // In Polish:
  // 1. ALL animate masculine nouns (people, professions, animals) ALWAYS take -a in Dopełniacz!
  //    (naukowiec -> naukowca, piłkarz -> piłkarza, astronom -> astronoma, lekarz -> lekarza, pies -> psa, kot -> kota)
  // 2. Diminutives, tools, everyday items, electronic devices in -ik, -yk, -ak, -or, -er, -ar, -arz, -acz, -ek, -om, -ant, -ent, -iec
  const takesAInDopelniacz =
    isLikelyAnim ||
    /(ik|yk|ak|or|er|ar|arz|acz|fon|top|let|ot|ek|iec|ant|ent|om|ist)$/i.test(clean) ||
    /^(telewizor|komputer|czajnik|laptop|smartfon|tablet|pilot|toster|mikser|blender|odkurzacz|zegar|zegarek|talerz|parasol|dolar|funt|zloty|złoty|klucz|noż|nóż|widelec|garnek|dzbanek)/i.test(clean);

  let dForm: string;
  if (clean.endsWith('iec')) {
    // Suffix -iec: fleeting 'e' drops out (naukowiec -> naukowca, chłopiec -> chłopca, sportowiec -> sportowca)
    const baseStem = clean.slice(0, -3);
    dForm = baseStem + 'ca';
  } else if (clean.endsWith('ek') && clean.length > 3) {
    // Fleeting 'e' in -ek (ołówek -> ołówka, dziadek -> dziadka, wujek -> wujka)
    const baseStem = clean.slice(0, -2);
    dForm = baseStem + 'ka';
  } else if (takesAInDopelniacz) {
    dForm = clean + 'a';
  } else {
    dForm = clean + 'u';
  }

  // Biernik: In Polish for ALL animate & personal masculine nouns:
  // BIERNIK = DOPEŁNIACZ (końcówka -a, np. widzę naukowca, piłkarza, astronoma, psa)!
  // For inanimate masculine nouns: BIERNIK = MIANOWNIK (np. widzę telefon, komputer, stół)!
  const bForm = isLikelyAnim ? dForm : clean;

  const distractors = [clean + 'em'];
  if (isLikelyAnim) {
    distractors.push(clean + 'owi');
  } else {
    if (clean.endsWith('or') || clean.endsWith('er')) {
      distractors.push(clean.slice(0, -1) + 'ze');
    } else {
      distractors.push(clean + 'u');
    }
  }

  return {
    gender,
    m: clean,
    d: dForm,
    b: bForm,
    distractors,
  };
}

/**
 * Fisher-Yates array shuffle helper
 */
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Primary function to build complete declension data for a word.
 */
export function getDeclensionForWord(rawWord: string): WordDeclension {
  const clean = cleanWord(rawWord);
  const upper = clean.toUpperCase();

  const entry: RawDeclensionEntry = KNOWN_DECLENSIONS[upper] || generateAlgorithmicDeclension(rawWord);

  const prefixes = getSentencePrefixes(entry.gender, rawWord);
  const genderLabel = getGenderLabel(entry.gender);

  const mianownik: CaseSentenceData = {
    caseType: 'mianownik',
    caseName: 'Mianownik',
    question: 'Kto? Co?',
    correctForm: entry.m,
    sentencePrefix: prefixes.mianownikPrefix,
    sentenceSuffix: '.',
    fullSentence: `${prefixes.mianownikPrefix} ${entry.m}.`,
  };

  const dopelniacz: CaseSentenceData = {
    caseType: 'dopelniacz',
    caseName: 'Dopełniacz',
    question: 'Kogo? Czego nie ma?',
    correctForm: entry.d,
    sentencePrefix: prefixes.dopelniaczPrefix,
    sentenceSuffix: '.',
    fullSentence: `${prefixes.dopelniaczPrefix} ${entry.d}.`,
  };

  const biernik: CaseSentenceData = {
    caseType: 'biernik',
    caseName: 'Biernik',
    question: 'Kogo? Co widzę?',
    correctForm: entry.b,
    sentencePrefix: prefixes.biernikPrefix,
    sentenceSuffix: '.',
    fullSentence: `${prefixes.biernikPrefix} ${entry.b}.`,
  };

  // Collect unique options (correct answers + distractors)
  const optionsSet = new Set<string>();
  optionsSet.add(entry.m);
  optionsSet.add(entry.d);
  optionsSet.add(entry.b);

  if (entry.distractors && entry.distractors.length > 0) {
    entry.distractors.forEach((dist) => optionsSet.add(dist));
  }

  // Capitalize first letter of display word nicely
  const displayWord = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();

  return {
    baseWord: upper,
    displayWord,
    gender: entry.gender,
    genderLabel,
    mianownik,
    dopelniacz,
    biernik,
    options: shuffle(Array.from(optionsSet)),
  };
}

export interface DeclensionLetterChallenge {
  id: string;
  baseWord: string;
  caseType: DeclensionCaseType;
  caseName: string;
  caseQuestion: string;
  sentencePrefix: string;
  wordStem: string;
  missingLetters: string; // e.g. "on", "a", "i", "ę"
  sentenceSuffix: string;
  fullWord: string;
  fullSentence: string;
  hint?: string;
  letterChoices: string[]; // Shuffled array of uppercase letters (correct + distractors)
}

interface RawCaseChallenge {
  prefix: string;
  stem: string;
  missing: string;
  suffix: string;
  fullWord: string;
  fullSentence: string;
}

const CURATED_CASE_CHALLENGES: Record<
  string,
  {
    mianownik: RawCaseChallenge;
    dopelniacz: RawCaseChallenge;
    biernik: RawCaseChallenge;
  }
> = {
  NAUKOWIEC: {
    mianownik: {
      prefix: 'Gdzie jest nasz mądry ',
      stem: 'naukow',
      missing: 'iec',
      suffix: '?',
      fullWord: 'naukowiec',
      fullSentence: 'Gdzie jest nasz mądry naukowiec?',
    },
    dopelniacz: {
      prefix: 'W laboratorium dzisiaj nie ma ',
      stem: 'naukow',
      missing: 'ca',
      suffix: '!',
      fullWord: 'naukowca',
      fullSentence: 'W laboratorium dzisiaj nie ma naukowca!',
    },
    biernik: {
      prefix: 'W telewizji z dumą oglądamy znanego ',
      stem: 'naukow',
      missing: 'ca',
      suffix: '.',
      fullWord: 'naukowca',
      fullSentence: 'W telewizji z dumą oglądamy znanego naukowca.',
    },
  },
  PIŁKARZ: {
    mianownik: {
      prefix: 'Gdzie jest nasz najlepszy ',
      stem: 'piłk',
      missing: 'arz',
      suffix: '?',
      fullWord: 'piłkarz',
      fullSentence: 'Gdzie jest nasz najlepszy piłkarz?',
    },
    dopelniacz: {
      prefix: 'Na dzisiejszym treningu nie ma ',
      stem: 'piłk',
      missing: 'arza',
      suffix: '!',
      fullWord: 'piłkarza',
      fullSentence: 'Na dzisiejszym treningu nie ma piłkarza!',
    },
    biernik: {
      prefix: 'Na boisku z radością widzę ',
      stem: 'piłk',
      missing: 'arza',
      suffix: '.',
      fullWord: 'piłkarza',
      fullSentence: 'Na boisku z radością widzę piłkarza.',
    },
  },
  PILKARZ: {
    mianownik: {
      prefix: 'Gdzie jest nasz najlepszy ',
      stem: 'piłk',
      missing: 'arz',
      suffix: '?',
      fullWord: 'piłkarz',
      fullSentence: 'Gdzie jest nasz najlepszy piłkarz?',
    },
    dopelniacz: {
      prefix: 'Na dzisiejszym treningu nie ma ',
      stem: 'piłk',
      missing: 'arza',
      suffix: '!',
      fullWord: 'piłkarza',
      fullSentence: 'Na dzisiejszym treningu nie ma piłkarza!',
    },
    biernik: {
      prefix: 'Na boisku z radością widzę ',
      stem: 'piłk',
      missing: 'arza',
      suffix: '.',
      fullWord: 'piłkarza',
      fullSentence: 'Na boisku z radością widzę piłkarza.',
    },
  },
  ASTRONOM: {
    mianownik: {
      prefix: 'Gdzie jest nasz wybitny ',
      stem: 'astron',
      missing: 'om',
      suffix: '?',
      fullWord: 'astronom',
      fullSentence: 'Gdzie jest nasz wybitny astronom?',
    },
    dopelniacz: {
      prefix: 'W ciemnym obserwatorium nie ma ',
      stem: 'astron',
      missing: 'oma',
      suffix: '!',
      fullWord: 'astronoma',
      fullSentence: 'W ciemnym obserwatorium nie ma astronoma!',
    },
    biernik: {
      prefix: 'Na ciekawym wykładzie o kosmosie widzę ',
      stem: 'astron',
      missing: 'oma',
      suffix: '.',
      fullWord: 'astronoma',
      fullSentence: 'Na ciekawym wykładzie o kosmosie widzę astronoma.',
    },
  },
  LEKARZ: {
    mianownik: {
      prefix: 'Gdzie jest nasz troskliwy ',
      stem: 'lek',
      missing: 'arz',
      suffix: '?',
      fullWord: 'lekarz',
      fullSentence: 'Gdzie jest nasz troskliwy lekarz?',
    },
    dopelniacz: {
      prefix: 'W przychodni zdrowia nie ma ',
      stem: 'lek',
      missing: 'arza',
      suffix: '!',
      fullWord: 'lekarza',
      fullSentence: 'W przychodni zdrowia nie ma lekarza!',
    },
    biernik: {
      prefix: 'W gabinecie lekarskim widzę ',
      stem: 'lek',
      missing: 'arza',
      suffix: '.',
      fullWord: 'lekarza',
      fullSentence: 'W gabinecie lekarskim widzę lekarza.',
    },
  },
  NAUCZYCIEL: {
    mianownik: {
      prefix: 'Gdzie jest nasz ulubiony ',
      stem: 'nauczyc',
      missing: 'iel',
      suffix: '?',
      fullWord: 'nauczyciel',
      fullSentence: 'Gdzie jest nasz ulubiony nauczyciel?',
    },
    dopelniacz: {
      prefix: 'W klasie szkolnej dzisiaj nie ma ',
      stem: 'nauczyc',
      missing: 'iela',
      suffix: '!',
      fullWord: 'nauczyciela',
      fullSentence: 'W klasie szkolnej dzisiaj nie ma nauczyciela!',
    },
    biernik: {
      prefix: 'Przy szkolnej tablicy widzę ',
      stem: 'nauczyc',
      missing: 'iela',
      suffix: '.',
      fullWord: 'nauczyciela',
      fullSentence: 'Przy szkolnej tablicy widzę nauczyciela.',
    },
  },
  STRAŻAK: {
    mianownik: {
      prefix: 'Gdzie jest nasz odważny ',
      stem: 'straż',
      missing: 'ak',
      suffix: '?',
      fullWord: 'strażak',
      fullSentence: 'Gdzie jest nasz odważny strażak?',
    },
    dopelniacz: {
      prefix: 'W remizie strażackiej nie ma ',
      stem: 'straż',
      missing: 'aka',
      suffix: '!',
      fullWord: 'strażaka',
      fullSentence: 'W remizie strażackiej nie ma strażaka!',
    },
    biernik: {
      prefix: 'W czerwonym wozie z syreną widzę ',
      stem: 'straż',
      missing: 'aka',
      suffix: '.',
      fullWord: 'strażaka',
      fullSentence: 'W czerwonym wozie z syreną widzę strażaka.',
    },
  },
  STRAZAK: {
    mianownik: {
      prefix: 'Gdzie jest nasz odważny ',
      stem: 'straż',
      missing: 'ak',
      suffix: '?',
      fullWord: 'strażak',
      fullSentence: 'Gdzie jest nasz odważny strażak?',
    },
    dopelniacz: {
      prefix: 'W remizie strażackiej nie ma ',
      stem: 'straż',
      missing: 'aka',
      suffix: '!',
      fullWord: 'strażaka',
      fullSentence: 'W remizie strażackiej nie ma strażaka!',
    },
    biernik: {
      prefix: 'W czerwonym wozie z syreną widzę ',
      stem: 'straż',
      missing: 'aka',
      suffix: '.',
      fullWord: 'strażaka',
      fullSentence: 'W czerwonym wozie z syreną widzę strażaka.',
    },
  },
  POLICJANT: {
    mianownik: {
      prefix: 'Gdzie jest nasz dzielny ',
      stem: 'policj',
      missing: 'ant',
      suffix: '?',
      fullWord: 'policjant',
      fullSentence: 'Gdzie jest nasz dzielny policjant?',
    },
    dopelniacz: {
      prefix: 'Na ruchliwym skrzyżowaniu nie ma ',
      stem: 'policj',
      missing: 'anta',
      suffix: '!',
      fullWord: 'policjanta',
      fullSentence: 'Na ruchliwym skrzyżowaniu nie ma policjanta!',
    },
    biernik: {
      prefix: 'Na bezpiecznym przejściu dla pieszych widzę ',
      stem: 'policj',
      missing: 'anta',
      suffix: '.',
      fullWord: 'policjanta',
      fullSentence: 'Na bezpiecznym przejściu dla pieszych widzę policjanta.',
    },
  },
  KIEROWCA: {
    mianownik: {
      prefix: 'Gdzie jest nasz punktualny ',
      stem: 'kierow',
      missing: 'ca',
      suffix: '?',
      fullWord: 'kierowca',
      fullSentence: 'Gdzie jest nasz punktualny kierowca?',
    },
    dopelniacz: {
      prefix: 'W żółtym autobusie szkolnym nie ma ',
      stem: 'kierow',
      missing: 'cy',
      suffix: '!',
      fullWord: 'kierowcy',
      fullSentence: 'W żółtym autobusie szkolnym nie ma kierowcy!',
    },
    biernik: {
      prefix: 'Za bezpieczną kierownicą widzę ',
      stem: 'kierow',
      missing: 'cę',
      suffix: '.',
      fullWord: 'kierowcę',
      fullSentence: 'Za bezpieczną kierownicą widzę kierowcę.',
    },
  },
  ARTYSTA: {
    mianownik: {
      prefix: 'Gdzie jest nasz utalentowany ',
      stem: 'artys',
      missing: 'ta',
      suffix: '?',
      fullWord: 'artysta',
      fullSentence: 'Gdzie jest nasz utalentowany artysta?',
    },
    dopelniacz: {
      prefix: 'W pięknej galerii sztuki nie ma ',
      stem: 'artys',
      missing: 'ty',
      suffix: '!',
      fullWord: 'artysty',
      fullSentence: 'W pięknej galerii sztuki nie ma artysty!',
    },
    biernik: {
      prefix: 'Przy kolorowej sztaludze widzę ',
      stem: 'artys',
      missing: 'tę',
      suffix: '.',
      fullWord: 'artystę',
      fullSentence: 'Przy kolorowej sztaludze widzę artystę.',
    },
  },
  MALARZ: {
    mianownik: {
      prefix: 'Gdzie jest nasz wspaniały ',
      stem: 'mal',
      missing: 'arz',
      suffix: '?',
      fullWord: 'malarz',
      fullSentence: 'Gdzie jest nasz wspaniały malarz?',
    },
    dopelniacz: {
      prefix: 'W jasnej pracowni dzisiaj nie ma ',
      stem: 'mal',
      missing: 'arza',
      suffix: '!',
      fullWord: 'malarza',
      fullSentence: 'W jasnej pracowni dzisiaj nie ma malarza!',
    },
    biernik: {
      prefix: 'Z pędzlem i farbami widzę ',
      stem: 'mal',
      missing: 'arza',
      suffix: '.',
      fullWord: 'malarza',
      fullSentence: 'Z pędzlem i farbami widzę malarza.',
    },
  },
  PISARZ: {
    mianownik: {
      prefix: 'Gdzie jest nasz słynny ',
      stem: 'pis',
      missing: 'arz',
      suffix: '?',
      fullWord: 'pisarz',
      fullSentence: 'Gdzie jest nasz słynny pisarz?',
    },
    dopelniacz: {
      prefix: 'W szkolnej bibliotece nie ma ',
      stem: 'pis',
      missing: 'arza',
      suffix: '!',
      fullWord: 'pisarza',
      fullSentence: 'W szkolnej bibliotece nie ma pisarza!',
    },
    biernik: {
      prefix: 'Na spotkaniu autorskim z radością widzę ',
      stem: 'pis',
      missing: 'arza',
      suffix: '.',
      fullWord: 'pisarza',
      fullSentence: 'Na spotkaniu autorskim z radością widzę pisarza.',
    },
  },
  MUZYK: {
    mianownik: {
      prefix: 'Gdzie jest nasz zdolny ',
      stem: 'muz',
      missing: 'yk',
      suffix: '?',
      fullWord: 'muzyk',
      fullSentence: 'Gdzie jest nasz zdolny muzyk?',
    },
    dopelniacz: {
      prefix: 'W wielkiej sali koncertowej nie ma ',
      stem: 'muz',
      missing: 'yka',
      suffix: '!',
      fullWord: 'muzyka',
      fullSentence: 'W wielkiej sali koncertowej nie ma muzyka!',
    },
    biernik: {
      prefix: 'Z gitarą na scenie widzę ',
      stem: 'muz',
      missing: 'yka',
      suffix: '.',
      fullWord: 'muzyka',
      fullSentence: 'Z gitarą na scenie widzę muzyka.',
    },
  },
  AKTOR: {
    mianownik: {
      prefix: 'Gdzie jest nasz znakomity ',
      stem: 'akt',
      missing: 'or',
      suffix: '?',
      fullWord: 'aktor',
      fullSentence: 'Gdzie jest nasz znakomity aktor?',
    },
    dopelniacz: {
      prefix: 'Na deskach teatru dzisiaj nie ma ',
      stem: 'akt',
      missing: 'ora',
      suffix: '!',
      fullWord: 'aktora',
      fullSentence: 'Na deskach teatru dzisiaj nie ma aktora!',
    },
    biernik: {
      prefix: 'W ciekawym przedstawieniu widzę ',
      stem: 'akt',
      missing: 'ora',
      suffix: '.',
      fullWord: 'aktora',
      fullSentence: 'W ciekawym przedstawieniu widzę aktora.',
    },
  },
  KUCHARZ: {
    mianownik: {
      prefix: 'Gdzie jest nasz mistrzowski ',
      stem: 'kuch',
      missing: 'arz',
      suffix: '?',
      fullWord: 'kucharz',
      fullSentence: 'Gdzie jest nasz mistrzowski kucharz?',
    },
    dopelniacz: {
      prefix: 'W szkolnej stołówce dzisiaj nie ma ',
      stem: 'kuch',
      missing: 'arza',
      suffix: '!',
      fullWord: 'kucharza',
      fullSentence: 'W szkolnej stołówce dzisiaj nie ma kucharza!',
    },
    biernik: {
      prefix: 'W czapce kucharskiej z uśmiechem widzę ',
      stem: 'kuch',
      missing: 'arza',
      suffix: '.',
      fullWord: 'kucharza',
      fullSentence: 'W czapce kucharskiej z uśmiechem widzę kucharza.',
    },
  },
  TELEFON: {
    mianownik: {
      prefix: 'Gdzie jest mój ',
      stem: 'telef',
      missing: 'on',
      suffix: '?',
      fullWord: 'telefon',
      fullSentence: 'Gdzie jest mój telefon?',
    },
    dopelniacz: {
      prefix: 'W mojej kieszeni nie ma ',
      stem: 'telef',
      missing: 'onu',
      suffix: '!',
      fullWord: 'telefonu',
      fullSentence: 'W mojej kieszeni nie ma telefonu!',
    },
    biernik: {
      prefix: 'Na biurku w pokoju widzę ',
      stem: 'telef',
      missing: 'on',
      suffix: '.',
      fullWord: 'telefon',
      fullSentence: 'Na biurku w pokoju widzę telefon.',
    },
  },
  PRALKA: {
    mianownik: {
      prefix: 'Tu stoi moja nowa ',
      stem: 'pralk',
      missing: 'a',
      suffix: '.',
      fullWord: 'pralka',
      fullSentence: 'Tu stoi moja nowa pralka.',
    },
    dopelniacz: {
      prefix: 'W nowym mieszkaniu nie ma ',
      stem: 'pralk',
      missing: 'i',
      suffix: '!',
      fullWord: 'pralki',
      fullSentence: 'W nowym mieszkaniu nie ma pralki!',
    },
    biernik: {
      prefix: 'W sklepie z mamą oglądam ',
      stem: 'pralk',
      missing: 'ę',
      suffix: '.',
      fullWord: 'pralkę',
      fullSentence: 'W sklepie z mamą oglądam pralkę.',
    },
  },
  KUCHNIA: {
    mianownik: {
      prefix: 'W naszym domu jest piękna ',
      stem: 'kuchn',
      missing: 'ia',
      suffix: '.',
      fullWord: 'kuchnia',
      fullSentence: 'W naszym domu jest piękna kuchnia.',
    },
    dopelniacz: {
      prefix: 'Nie ma mojej ',
      stem: 'kuchn',
      missing: 'i',
      suffix: '!',
      fullWord: 'kuchni',
      fullSentence: 'Nie ma mojej kuchni!',
    },
    biernik: {
      prefix: 'Przez otwarte drzwi oglądam jasną ',
      stem: 'kuchn',
      missing: 'ię',
      suffix: '.',
      fullWord: 'kuchnię',
      fullSentence: 'Przez otwarte drzwi oglądam jasną kuchnię.',
    },
  },
  TELEWIZOR: {
    mianownik: {
      prefix: 'W naszym salonie stoi nowoczesny ',
      stem: 'telewiz',
      missing: 'or',
      suffix: '.',
      fullWord: 'telewizor',
      fullSentence: 'W naszym salonie stoi nowoczesny telewizor.',
    },
    dopelniacz: {
      prefix: 'W pokoju dziecięcym nie ma ',
      stem: 'telewiz',
      missing: 'ora',
      suffix: '!',
      fullWord: 'telewizora',
      fullSentence: 'W pokoju dziecięcym nie ma telewizora!',
    },
    biernik: {
      prefix: 'Wieczorem z całą rodziną włączamy ',
      stem: 'telewiz',
      missing: 'or',
      suffix: '.',
      fullWord: 'telewizor',
      fullSentence: 'Wieczorem z całą rodziną włączamy telewizor.',
    },
  },
  KOMPUTER: {
    mianownik: {
      prefix: 'Na biurku ucznia stoi szybki ',
      stem: 'komput',
      missing: 'er',
      suffix: '.',
      fullWord: 'komputer',
      fullSentence: 'Na biurku ucznia stoi szybki komputer.',
    },
    dopelniacz: {
      prefix: 'W sali gimnastycznej nie ma ',
      stem: 'komput',
      missing: 'era',
      suffix: '!',
      fullWord: 'komputera',
      fullSentence: 'W sali gimnastycznej nie ma komputera!',
    },
    biernik: {
      prefix: 'Do nauki i ciekawych zadań włączam ',
      stem: 'komput',
      missing: 'er',
      suffix: '.',
      fullWord: 'komputer',
      fullSentence: 'Do nauki i ciekawych zadań włączam komputer.',
    },
  },
  CZAJNIK: {
    mianownik: {
      prefix: 'W kuchni na kuchence stoi gorący ',
      stem: 'czajn',
      missing: 'ik',
      suffix: '.',
      fullWord: 'czajnik',
      fullSentence: 'W kuchni na kuchence stoi gorący czajnik.',
    },
    dopelniacz: {
      prefix: 'Na wycieczce w namiocie nie mamy ',
      stem: 'czajn',
      missing: 'ika',
      suffix: '!',
      fullWord: 'czajnika',
      fullSentence: 'Na wycieczce w namiocie nie mamy czajnika!',
    },
    biernik: {
      prefix: 'Przed zrobieniem herbaty napełniam ',
      stem: 'czajn',
      missing: 'ik',
      suffix: '.',
      fullWord: 'czajnik',
      fullSentence: 'Przed zrobieniem herbaty napełniam czajnik.',
    },
  },
  LAPTOP: {
    mianownik: {
      prefix: 'Na stoliku leży nowoczesny ',
      stem: 'lapt',
      missing: 'op',
      suffix: '.',
      fullWord: 'laptop',
      fullSentence: 'Na stoliku leży nowoczesny laptop.',
    },
    dopelniacz: {
      prefix: 'W plecaku podróżnym nie ma ',
      stem: 'lapt',
      missing: 'opa',
      suffix: '!',
      fullWord: 'laptopa',
      fullSentence: 'W plecaku podróżnym nie ma laptopa!',
    },
    biernik: {
      prefix: 'Do nauki i pisania otwieram ',
      stem: 'lapt',
      missing: 'op',
      suffix: '.',
      fullWord: 'laptop',
      fullSentence: 'Do nauki i pisania otwieram laptop.',
    },
  },
  KURTKA: {
    mianownik: {
      prefix: 'Gdzie wisi moja ciepła ',
      stem: 'kurtk',
      missing: 'a',
      suffix: '?',
      fullWord: 'kurtka',
      fullSentence: 'Gdzie wisi moja ciepła kurtka?',
    },
    dopelniacz: {
      prefix: 'W szafie nie ma mojej ',
      stem: 'kurtk',
      missing: 'i',
      suffix: '!',
      fullWord: 'kurtki',
      fullSentence: 'W szafie nie ma mojej kurtki!',
    },
    biernik: {
      prefix: 'Na spacer do parku wkładam ',
      stem: 'kurtk',
      missing: 'ę',
      suffix: '.',
      fullWord: 'kurtkę',
      fullSentence: 'Na spacer do parku wkładam kurtkę.',
    },
  },
  PARASOL: {
    mianownik: {
      prefix: 'W przedpokoju leży duży ',
      stem: 'paras',
      missing: 'ol',
      suffix: '.',
      fullWord: 'parasol',
      fullSentence: 'W przedpokoju leży duży parasol.',
    },
    dopelniacz: {
      prefix: 'Gdy mocno pada deszcz, nie mam ',
      stem: 'paras',
      missing: 'ola',
      suffix: '!',
      fullWord: 'parasola',
      fullSentence: 'Gdy mocno pada deszcz, nie mam parasola!',
    },
    biernik: {
      prefix: 'W deszczowy dzień biorę ze sobą ',
      stem: 'paras',
      missing: 'ol',
      suffix: '.',
      fullWord: 'parasol',
      fullSentence: 'W deszczowy dzień biorę ze sobą parasol.',
    },
  },
  OKNO: {
    mianownik: {
      prefix: 'W naszej klasie jest duże ',
      stem: 'okn',
      missing: 'o',
      suffix: '.',
      fullWord: 'okno',
      fullSentence: 'W naszej klasie jest duże okno.',
    },
    dopelniacz: {
      prefix: 'W ciemnej piwnicy nie ma żadnego ',
      stem: 'okn',
      missing: 'a',
      suffix: '!',
      fullWord: 'okna',
      fullSentence: 'W ciemnej piwnicy nie ma żadnego okna!',
    },
    biernik: {
      prefix: 'W ciepły poranek otwieram ',
      stem: 'okn',
      missing: 'o',
      suffix: '.',
      fullWord: 'okno',
      fullSentence: 'W ciepły poranek otwieram okno.',
    },
  },
  OŁÓWEK: {
    mianownik: {
      prefix: 'Gdzie leży mój ostry ',
      stem: 'ołów',
      missing: 'ek',
      suffix: '?',
      fullWord: 'ołówek',
      fullSentence: 'Gdzie leży mój ostry ołówek?',
    },
    dopelniacz: {
      prefix: 'W piórniku nie ma czerwonego ',
      stem: 'ołów',
      missing: 'ka',
      suffix: '!',
      fullWord: 'ołówka',
      fullSentence: 'W piórniku nie ma czerwonego ołówka!',
    },
    biernik: {
      prefix: 'Do rysowania zamku wybieram ',
      stem: 'ołów',
      missing: 'ek',
      suffix: '.',
      fullWord: 'ołówek',
      fullSentence: 'Do rysowania zamku wybieram ołówek.',
    },
  },
  OLOWEK: {
    mianownik: {
      prefix: 'Gdzie leży mój ostry ',
      stem: 'ołów',
      missing: 'ek',
      suffix: '?',
      fullWord: 'ołówek',
      fullSentence: 'Gdzie leży mój ostry ołówek?',
    },
    dopelniacz: {
      prefix: 'W piórniku nie ma czerwonego ',
      stem: 'ołów',
      missing: 'ka',
      suffix: '!',
      fullWord: 'ołówka',
      fullSentence: 'W piórniku nie ma czerwonego ołówka!',
    },
    biernik: {
      prefix: 'Do rysowania zamku wybieram ',
      stem: 'ołów',
      missing: 'ek',
      suffix: '.',
      fullWord: 'ołówek',
      fullSentence: 'Do rysowania zamku wybieram ołówek.',
    },
  },
  ZESZYT: {
    mianownik: {
      prefix: 'Na szkolnej ławce leży czysty ',
      stem: 'zeszy',
      missing: 't',
      suffix: '.',
      fullWord: 'zeszyt',
      fullSentence: 'Na szkolnej ławce leży czysty zeszyt.',
    },
    dopelniacz: {
      prefix: 'W plecaku Julka nie ma dziś ',
      stem: 'zeszy',
      missing: 'tu',
      suffix: '!',
      fullWord: 'zeszytu',
      fullSentence: 'W plecaku Julka nie ma dziś zeszytu!',
    },
    biernik: {
      prefix: 'Do polskiej szkoły pakuję nowy ',
      stem: 'zeszy',
      missing: 't',
      suffix: '.',
      fullWord: 'zeszyt',
      fullSentence: 'Do polskiej szkoły pakuję nowy zeszyt.',
    },
  },
  FLAGA: {
    mianownik: {
      prefix: 'Na wietrze powiewa biało-czerwona ',
      stem: 'flag',
      missing: 'a',
      suffix: '.',
      fullWord: 'flaga',
      fullSentence: 'Na wietrze powiewa biało-czerwona flaga.',
    },
    dopelniacz: {
      prefix: 'Na dachu tego budynku nie ma ',
      stem: 'flag',
      missing: 'i',
      suffix: '!',
      fullWord: 'flagi',
      fullSentence: 'Na dachu tego budynku nie ma flagi!',
    },
    biernik: {
      prefix: 'Podczas uroczystości dumnie niosę ',
      stem: 'flag',
      missing: 'ę',
      suffix: '.',
      fullWord: 'flagę',
      fullSentence: 'Podczas uroczystości dumnie niosę flagę.',
    },
  },
  PIES: {
    mianownik: {
      prefix: 'W ogrodzie biega mały, wesoły ',
      stem: 'pi',
      missing: 'es',
      suffix: '.',
      fullWord: 'pies',
      fullSentence: 'W ogrodzie biega mały, wesoły pies.',
    },
    dopelniacz: {
      prefix: 'Dzisiaj na podwórku nie ma ',
      stem: 'ps',
      missing: 'a',
      suffix: '!',
      fullWord: 'psa',
      fullSentence: 'Dzisiaj na podwórku nie ma psa!',
    },
    biernik: {
      prefix: 'Przez otwarte okno radośnie wołam ',
      stem: 'ps',
      missing: 'a',
      suffix: '.',
      fullWord: 'psa',
      fullSentence: 'Przez otwarte okno radośnie wołam psa.',
    },
  },
  KSIĄŻKA: {
    mianownik: {
      prefix: 'Na drewnianej półce leży gruba ',
      stem: 'książk',
      missing: 'a',
      suffix: '.',
      fullWord: 'książka',
      fullSentence: 'Na drewnianej półce leży gruba książka.',
    },
    dopelniacz: {
      prefix: 'W szkolnej bibliotece nie ma już tej ',
      stem: 'książk',
      missing: 'i',
      suffix: '!',
      fullWord: 'książki',
      fullSentence: 'W szkolnej bibliotece nie ma już tej książki!',
    },
    biernik: {
      prefix: 'Wieczorem przed snem czytam ',
      stem: 'książk',
      missing: 'ę',
      suffix: '.',
      fullWord: 'książkę',
      fullSentence: 'Wieczorem przed snem czytam książkę.',
    },
  },
  KSIAZKA: {
    mianownik: {
      prefix: 'Na drewnianej półce leży gruba ',
      stem: 'książk',
      missing: 'a',
      suffix: '.',
      fullWord: 'książka',
      fullSentence: 'Na drewnianej półce leży gruba książka.',
    },
    dopelniacz: {
      prefix: 'W szkolnej bibliotece nie ma już tej ',
      stem: 'książk',
      missing: 'i',
      suffix: '!',
      fullWord: 'książki',
      fullSentence: 'W szkolnej bibliotece nie ma już tej książki!',
    },
    biernik: {
      prefix: 'Wieczorem przed snem czytam ',
      stem: 'książk',
      missing: 'ę',
      suffix: '.',
      fullWord: 'książkę',
      fullSentence: 'Wieczorem przed snem czytam książkę.',
    },
  },
  SZKOŁA: {
    mianownik: {
      prefix: 'W każdą sobotę czeka na nas polska ',
      stem: 'szkoł',
      missing: 'a',
      suffix: '.',
      fullWord: 'szkoła',
      fullSentence: 'W każdą sobotę czeka na nas polska szkoła.',
    },
    dopelniacz: {
      prefix: 'W czasie wakacji w budynku nie ma ',
      stem: 'szkoł',
      missing: 'y',
      suffix: '!',
      fullWord: 'szkoły',
      fullSentence: 'W czasie wakacji w budynku nie ma szkoły!',
    },
    biernik: {
      prefix: 'Wszyscy bardzo lubimy naszą ',
      stem: 'szkoł',
      missing: 'ę',
      suffix: '.',
      fullWord: 'szkołę',
      fullSentence: 'Wszyscy bardzo lubimy naszą szkołę.',
    },
  },
  SZKOLA: {
    mianownik: {
      prefix: 'W każdą sobotę czeka na nas polska ',
      stem: 'szkoł',
      missing: 'a',
      suffix: '.',
      fullWord: 'szkoła',
      fullSentence: 'W każdą sobotę czeka na nas polska szkoła.',
    },
    dopelniacz: {
      prefix: 'W czasie wakacji w budynku nie ma ',
      stem: 'szkoł',
      missing: 'y',
      suffix: '!',
      fullWord: 'szkoły',
      fullSentence: 'W czasie wakacji w budynku nie ma szkoły!',
    },
    biernik: {
      prefix: 'Wszyscy bardzo lubimy naszą ',
      stem: 'szkoł',
      missing: 'ę',
      suffix: '.',
      fullWord: 'szkołę',
      fullSentence: 'Wszyscy bardzo lubimy naszą szkołę.',
    },
  },
  PIÓRNIK: {
    mianownik: {
      prefix: 'Gdzie leży mój ulubiony ',
      stem: 'piórn',
      missing: 'ik',
      suffix: '?',
      fullWord: 'piórnik',
      fullSentence: 'Gdzie leży mój ulubiony piórnik?',
    },
    dopelniacz: {
      prefix: 'Na biurku nie ma szkolnego ',
      stem: 'piórn',
      missing: 'ika',
      suffix: '!',
      fullWord: 'piórnika',
      fullSentence: 'Na biurku nie ma szkolnego piórnika!',
    },
    biernik: {
      prefix: 'Do szkolnego plecaka chętnie pakuję ',
      stem: 'piórn',
      missing: 'ik',
      suffix: '.',
      fullWord: 'piórnik',
      fullSentence: 'Do szkolnego plecaka chętnie pakuję piórnik.',
    },
  },
  PIORNIK: {
    mianownik: {
      prefix: 'Gdzie leży mój ulubiony ',
      stem: 'piórn',
      missing: 'ik',
      suffix: '?',
      fullWord: 'piórnik',
      fullSentence: 'Gdzie leży mój ulubiony piórnik?',
    },
    dopelniacz: {
      prefix: 'Na biurku nie ma szkolnego ',
      stem: 'piórn',
      missing: 'ika',
      suffix: '!',
      fullWord: 'piórnika',
      fullSentence: 'Na biurku nie ma szkolnego piórnika!',
    },
    biernik: {
      prefix: 'Do szkolnego plecaka chętnie pakuję ',
      stem: 'piórn',
      missing: 'ik',
      suffix: '.',
      fullWord: 'piórnik',
      fullSentence: 'Do szkolnego plecaka chętnie pakuję piórnik.',
    },
  },
  SŁOŃCE: {
    mianownik: {
      prefix: 'Na niebie świeci gorące ',
      stem: 'słońc',
      missing: 'e',
      suffix: '.',
      fullWord: 'słońce',
      fullSentence: 'Na niebie świeci gorące słońce.',
    },
    dopelniacz: {
      prefix: 'Gdy niebo zasnują chmury, nie ma ',
      stem: 'słońc',
      missing: 'a',
      suffix: '!',
      fullWord: 'słońca',
      fullSentence: 'Gdy niebo zasnują chmury, nie ma słońca!',
    },
    biernik: {
      prefix: 'Przez okno klasy z uśmiechem witam ',
      stem: 'słońc',
      missing: 'e',
      suffix: '.',
      fullWord: 'słońce',
      fullSentence: 'Przez okno klasy z uśmiechem witam słońce.',
    },
  },
  SLONCE: {
    mianownik: {
      prefix: 'Na niebie świeci gorące ',
      stem: 'słońc',
      missing: 'e',
      suffix: '.',
      fullWord: 'słońce',
      fullSentence: 'Na niebie świeci gorące słońce.',
    },
    dopelniacz: {
      prefix: 'Gdy niebo zasnują chmury, nie ma ',
      stem: 'słońc',
      missing: 'a',
      suffix: '!',
      fullWord: 'słońca',
      fullSentence: 'Gdy niebo zasnują chmury, nie ma słońca!',
    },
    biernik: {
      prefix: 'Przez okno klasy z uśmiechem witam ',
      stem: 'słońc',
      missing: 'e',
      suffix: '.',
      fullWord: 'słońce',
      fullSentence: 'Przez okno klasy z uśmiechem witam słońce.',
    },
  },
  MORZE: {
    mianownik: {
      prefix: 'W oddali szumi polskie ',
      stem: 'morz',
      missing: 'e',
      suffix: '.',
      fullWord: 'morze',
      fullSentence: 'W oddali szumi polskie morze.',
    },
    dopelniacz: {
      prefix: 'Wysoko w górach niestety nie ma ',
      stem: 'morz',
      missing: 'a',
      suffix: '!',
      fullWord: 'morza',
      fullSentence: 'Wysoko w górach niestety nie ma morza!',
    },
    biernik: {
      prefix: 'W czasie wakacji chętnie odwiedzam ',
      stem: 'morz',
      missing: 'e',
      suffix: '.',
      fullWord: 'morze',
      fullSentence: 'W czasie wakacji chętnie odwiedzam morze.',
    },
  },
  ORZEŁ: {
    mianownik: {
      prefix: 'W polskim godle dumnie widnieje biały ',
      stem: 'orz',
      missing: 'eł',
      suffix: '.',
      fullWord: 'orzeł',
      fullSentence: 'W polskim godle dumnie widnieje biały orzeł.',
    },
    dopelniacz: {
      prefix: 'Na tej monecie nie ma wizerunku ',
      stem: 'orł',
      missing: 'a',
      suffix: '!',
      fullWord: 'orła',
      fullSentence: 'Na tej monecie nie ma wizerunku orła!',
    },
    biernik: {
      prefix: 'W herbie Polski z dumą podziwiam białego ',
      stem: 'orł',
      missing: 'a',
      suffix: '.',
      fullWord: 'orła',
      fullSentence: 'W herbie Polski z dumą podziwiam białego orła.',
    },
  },
  ORZEL: {
    mianownik: {
      prefix: 'W polskim godle dumnie widnieje biały ',
      stem: 'orz',
      missing: 'eł',
      suffix: '.',
      fullWord: 'orzeł',
      fullSentence: 'W polskim godle dumnie widnieje biały orzeł.',
    },
    dopelniacz: {
      prefix: 'Na tej monecie nie ma wizerunku ',
      stem: 'orł',
      missing: 'a',
      suffix: '!',
      fullWord: 'orła',
      fullSentence: 'Na tej monecie nie ma wizerunku orła!',
    },
    biernik: {
      prefix: 'W herbie Polski z dumą podziwiam białego ',
      stem: 'orł',
      missing: 'a',
      suffix: '.',
      fullWord: 'orła',
      fullSentence: 'W herbie Polski z dumą podziwiam białego orła.',
    },
  },
  SYRENKA: {
    mianownik: {
      prefix: 'Nad brzegiem rzeki stoi warszawska ',
      stem: 'syrenk',
      missing: 'a',
      suffix: '.',
      fullWord: 'syrenka',
      fullSentence: 'Nad brzegiem rzeki stoi warszawska syrenka.',
    },
    dopelniacz: {
      prefix: 'W żadnym innym mieście nie ma takiej ',
      stem: 'syrenk',
      missing: 'i',
      suffix: '!',
      fullWord: 'syrenki',
      fullSentence: 'W żadnym innym mieście nie ma takiej syrenki!',
    },
    biernik: {
      prefix: 'Na herbie Warszawy widzę dzielną ',
      stem: 'syrenk',
      missing: 'ę',
      suffix: '.',
      fullWord: 'syrenkę',
      fullSentence: 'Na herbie Warszawy widzę dzielną syrenkę.',
    },
  },
  ZAMEK: {
    mianownik: {
      prefix: 'W Warszawie wznosi się Królewski ',
      stem: 'zam',
      missing: 'ek',
      suffix: '.',
      fullWord: 'zamek',
      fullSentence: 'W Warszawie wznosi się Królewski zamek.',
    },
    dopelniacz: {
      prefix: 'W tej małej wiosce nie ma żadnego ',
      stem: 'zam',
      missing: 'ku',
      suffix: '!',
      fullWord: 'zamku',
      fullSentence: 'W tej małej wiosce nie ma żadnego zamku!',
    },
    biernik: {
      prefix: 'Podczas wycieczki do stolicy zwiedzam ',
      stem: 'zam',
      missing: 'ek',
      suffix: '.',
      fullWord: 'zamek',
      fullSentence: 'Podczas wycieczki do stolicy zwiedzam zamek.',
    },
  },
  WISŁA: {
    mianownik: {
      prefix: 'Przez całą Polskę płynie piękna rzeka ',
      stem: 'wisł',
      missing: 'a',
      suffix: '.',
      fullWord: 'Wisła',
      fullSentence: 'Przez całą Polskę płynie piękna rzeka Wisła.',
    },
    dopelniacz: {
      prefix: 'W Krakowie nie ma mostu bez widoku ',
      stem: 'wisł',
      missing: 'y',
      suffix: '!',
      fullWord: 'Wisły',
      fullSentence: 'W Krakowie nie ma mostu bez widoku Wisły!',
    },
    biernik: {
      prefix: 'Podczas rejsu statkiem przepływamy szeroką ',
      stem: 'wisł',
      missing: 'ę',
      suffix: '.',
      fullWord: 'Wisłę',
      fullSentence: 'Podczas rejsu statkiem przepływamy szeroką Wisłę.',
    },
  },
  WISLA: {
    mianownik: {
      prefix: 'Przez całą Polskę płynie piękna rzeka ',
      stem: 'wisł',
      missing: 'a',
      suffix: '.',
      fullWord: 'Wisła',
      fullSentence: 'Przez całą Polskę płynie piękna rzeka Wisła.',
    },
    dopelniacz: {
      prefix: 'W Krakowie nie ma mostu bez widoku ',
      stem: 'wisł',
      missing: 'y',
      suffix: '!',
      fullWord: 'Wisły',
      fullSentence: 'W Krakowie nie ma mostu bez widoku Wisły!',
    },
    biernik: {
      prefix: 'Podczas rejsu statkiem przepływamy szeroką ',
      stem: 'wisł',
      missing: 'ę',
      suffix: '.',
      fullWord: 'Wisłę',
      fullSentence: 'Podczas rejsu statkiem przepływamy szeroką Wisłę.',
    },
  },
  KOT: {
    mianownik: {
      prefix: 'Na parapecie smacznie śpi bury ',
      stem: 'ko',
      missing: 't',
      suffix: '.',
      fullWord: 'kot',
      fullSentence: 'Na parapecie smacznie śpi bury kot.',
    },
    dopelniacz: {
      prefix: 'W kuchni przy misce nie ma małego ',
      stem: 'ko',
      missing: 'ta',
      suffix: '!',
      fullWord: 'kota',
      fullSentence: 'W kuchni przy misce nie ma małego kota!',
    },
    biernik: {
      prefix: 'Przez miękkie futerko głaszczę mojego ',
      stem: 'ko',
      missing: 'ta',
      suffix: '.',
      fullWord: 'kota',
      fullSentence: 'Przez miękkie futerko głaszczę mojego kota.',
    },
  },
  PLECAK: {
    mianownik: {
      prefix: 'Gdzie stoi mój nowy, szkolny ',
      stem: 'plec',
      missing: 'ak',
      suffix: '?',
      fullWord: 'plecak',
      fullSentence: 'Gdzie stoi mój nowy, szkolny plecak?',
    },
    dopelniacz: {
      prefix: 'W przedpokoju nie ma mojego ',
      stem: 'plec',
      missing: 'aka',
      suffix: '!',
      fullWord: 'plecaka',
      fullSentence: 'W przedpokoju nie ma mojego plecaka!',
    },
    biernik: {
      prefix: 'Do polskiej szkoły dumnie niosę ',
      stem: 'plec',
      missing: 'ak',
      suffix: '.',
      fullWord: 'plecak',
      fullSentence: 'Do polskiej szkoły dumnie niosę plecak.',
    },
  },
  DRZEWO: {
    mianownik: {
      prefix: 'Przed szkołą rośnie wysokie, zielone ',
      stem: 'drzew',
      missing: 'o',
      suffix: '.',
      fullWord: 'drzewo',
      fullSentence: 'Przed szkołą rośnie wysokie, zielone drzewo.',
    },
    dopelniacz: {
      prefix: 'Na środku boiska nie ma żadnego ',
      stem: 'drzew',
      missing: 'a',
      suffix: '!',
      fullWord: 'drzewa',
      fullSentence: 'Na środku boiska nie ma żadnego drzewa!',
    },
    biernik: {
      prefix: 'W ogrodzie podlewam młode ',
      stem: 'drzew',
      missing: 'o',
      suffix: '.',
      fullWord: 'drzewo',
      fullSentence: 'W ogrodzie podlewam młode drzewo.',
    },
  },
  CZAPKA: {
    mianownik: {
      prefix: 'Gdzie leży moja ciepła ',
      stem: 'czapk',
      missing: 'a',
      suffix: '?',
      fullWord: 'czapka',
      fullSentence: 'Gdzie leży moja ciepła czapka?',
    },
    dopelniacz: {
      prefix: 'W szufladzie nie ma zimowej ',
      stem: 'czapk',
      missing: 'i',
      suffix: '!',
      fullWord: 'czapki',
      fullSentence: 'W szufladzie nie ma zimowej czapki!',
    },
    biernik: {
      prefix: 'Na mroźny dzień wkładam ',
      stem: 'czapk',
      missing: 'ę',
      suffix: '.',
      fullWord: 'czapkę',
      fullSentence: 'Na mroźny dzień wkładam czapkę.',
    },
  },
  GODŁO: {
    mianownik: {
      prefix: 'W klasie wisi polskie narodowe ',
      stem: 'godł',
      missing: 'o',
      suffix: '.',
      fullWord: 'godło',
      fullSentence: 'W klasie wisi polskie narodowe godło.',
    },
    dopelniacz: {
      prefix: 'Na tym rysunku nie ma jeszcze ',
      stem: 'godł',
      missing: 'a',
      suffix: '!',
      fullWord: 'godła',
      fullSentence: 'Na tym rysunku nie ma jeszcze godła!',
    },
    biernik: {
      prefix: 'Na ścianie z szacunkiem oglądamy ',
      stem: 'godł',
      missing: 'o',
      suffix: '.',
      fullWord: 'godło',
      fullSentence: 'Na ścianie z szacunkiem oglądamy godło.',
    },
  },
  GODLO: {
    mianownik: {
      prefix: 'W klasie wisi polskie narodowe ',
      stem: 'godł',
      missing: 'o',
      suffix: '.',
      fullWord: 'godło',
      fullSentence: 'W klasie wisi polskie narodowe godło.',
    },
    dopelniacz: {
      prefix: 'Na tym rysunku nie ma jeszcze ',
      stem: 'godł',
      missing: 'a',
      suffix: '!',
      fullWord: 'godła',
      fullSentence: 'Na tym rysunku nie ma jeszcze godła!',
    },
    biernik: {
      prefix: 'Na ścianie z szacunkiem oglądamy ',
      stem: 'godł',
      missing: 'o',
      suffix: '.',
      fullWord: 'godło',
      fullSentence: 'Na ścianie z szacunkiem oglądamy godło.',
    },
  },
};

const COMMON_DISTRACTOR_LETTERS = ['A', 'E', 'I', 'O', 'U', 'Y', 'Ę', 'Ą', 'K', 'T', 'L', 'M', 'N', 'S', 'P', 'R', 'D'];

/**
 * Creates letter choices for a challenge: the correct missing letters + 4-5 distractors
 */
function createLetterChoices(missingLetters: string): string[] {
  const letters = missingLetters.toUpperCase().split('');
  const neededLetters = [...letters];

  // Pick 4-5 distractor letters not duplicating too much
  const distractors: string[] = [];
  const shuffledCommon = shuffle([...COMMON_DISTRACTOR_LETTERS]);

  for (const cand of shuffledCommon) {
    if (distractors.length >= 5) break;
    if (!neededLetters.includes(cand) || distractors.filter((d) => d === cand).length === 0) {
      distractors.push(cand);
    }
  }

  return shuffle([...neededLetters, ...distractors]);
}

/**
 * Algorithmic generator for any custom word not in the curated dictionary
 */
function generateFallbackChallenges(rawWord: string): {
  mianownik: RawCaseChallenge;
  dopelniacz: RawCaseChallenge;
  biernik: RawCaseChallenge;
} {
  const clean = cleanWord(rawWord).toLowerCase();
  const upper = clean.toUpperCase();
  const entry: RawDeclensionEntry = KNOWN_DECLENSIONS[upper] || generateAlgorithmicDeclension(rawWord);
  const isPerson = isPersonOrProfession(clean);

  // Compute common stem
  let stem = clean;
  if (clean.endsWith('iec')) {
    stem = clean.slice(0, -3); // e.g. "naukow" for "naukowiec"
  } else if (stem.length > 3) {
    if (stem.endsWith('ia') || stem.endsWith('ja')) {
      stem = stem.slice(0, -2);
    } else if (stem.endsWith('a') || stem.endsWith('o') || stem.endsWith('e')) {
      stem = stem.slice(0, -1);
    } else {
      stem = stem.slice(0, -2);
    }
  } else if (stem.length > 2) {
    stem = stem.slice(0, -1);
  }

  const buildChallenge = (
    form: string,
    prefix: string,
    suffix: string,
    defaultFallbackChar: string
  ): RawCaseChallenge => {
    const lower = form.toLowerCase();
    let caseStem = stem;
    let missing = '';

    // If form starts with common stem and leaves at least 1 missing letter
    if (lower.startsWith(caseStem) && lower.length > caseStem.length) {
      missing = lower.slice(caseStem.length);
    } else {
      // Split safely into stem + ending so fullWord = caseStem + missing ALWAYS
      const splitIdx = Math.max(1, lower.length - (lower.length > 4 ? 2 : 1));
      caseStem = lower.slice(0, splitIdx);
      missing = lower.slice(splitIdx) || defaultFallbackChar;
    }

    return {
      prefix,
      stem: caseStem,
      missing,
      suffix,
      fullWord: form,
      fullSentence: `${prefix}${form}${suffix}`,
    };
  };

  const prefixes = getSentencePrefixes(entry.gender, rawWord);
  const mianPrefix = isPerson
    ? 'Gdzie jest '
    : `Gdzie jest ${prefixes.mianownikPrefix.toLowerCase().replace('tu jest ', '').replace('gdzie jest ', '')} `;
  const dopPrefix = isPerson
    ? 'Nie ma '
    : `${prefixes.dopelniaczPrefix} `;
  const bierPrefix = isPerson
    ? 'Widzę '
    : `${prefixes.biernikPrefix} `;

  return {
    mianownik: buildChallenge(entry.m, mianPrefix, '?', 'a'),
    dopelniacz: buildChallenge(entry.d, dopPrefix, '!', 'i'),
    biernik: buildChallenge(entry.b, bierPrefix, '.', 'ę'),
  };
}

/**
 * Generates an array of individual, shuffled sentence challenges for the "Cases" game.
 * Each challenge asks the child to fill in the missing letters for a word stem in a sentence.
 *
 * Words and grammatical cases (Mianownik, Dopełniacz, Biernik) are mixed and shuffled!
 */
export function generateDeclensionLetterChallenges(
  inputWords: { word: string; hint?: string }[] | string[]
): DeclensionLetterChallenge[] {
  // Normalized word list
  const wordEntries: { word: string; hint?: string }[] = (inputWords || []).map((item) => {
    if (typeof item === 'string') {
      return { word: item };
    }
    return item;
  });

  const words = wordEntries.length > 0 ? wordEntries : [{ word: 'TELEFON' }, { word: 'PRALKA' }, { word: 'KURTKA' }];

  const allChallenges: DeclensionLetterChallenge[] = [];
  const cases: DeclensionCaseType[] = ['mianownik', 'dopelniacz', 'biernik'];

  const caseMeta: Record<DeclensionCaseType, { name: string; question: string }> = {
    mianownik: { name: 'Mianownik', question: 'Kto? Co?' },
    dopelniacz: { name: 'Dopełniacz', question: 'Kogo? Czego nie ma?' },
    biernik: { name: 'Biernik', question: 'Kogo? Co widzę?' },
  };

  words.forEach((entry, wordIndex) => {
    const upper = cleanWord(entry.word).toUpperCase();
    const challengeSet = CURATED_CASE_CHALLENGES[upper] || generateFallbackChallenges(entry.word);

    cases.forEach((cType) => {
      const cData = challengeSet[cType];
      if (cData && cData.missing.length > 0) {
        allChallenges.push({
          id: `case-ch-${upper}-${cType}-${wordIndex}`,
          baseWord: upper,
          caseType: cType,
          caseName: caseMeta[cType].name,
          caseQuestion: caseMeta[cType].question,
          sentencePrefix: cData.prefix,
          wordStem: cData.stem,
          missingLetters: cData.missing,
          sentenceSuffix: cData.suffix,
          fullWord: cData.fullWord,
          fullSentence: cData.fullSentence,
          hint: entry.hint,
          letterChoices: createLetterChoices(cData.missing),
        });
      }
    });
  });

  // Shuffle the challenges thoroughly so words and cases are mixed!
  const shuffledChallenges = shuffle(allChallenges);

  // Pick up to 10-12 diverse challenges per round (or all if <= 10)
  const maxChallenges = Math.min(shuffledChallenges.length, Math.max(8, words.length * 2));
  return shuffledChallenges.slice(0, maxChallenges);
}

