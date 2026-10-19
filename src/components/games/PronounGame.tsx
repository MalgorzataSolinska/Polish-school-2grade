import React, { useState } from 'react';
import { SpellingItem } from '../../types';
import { playSuccessSound, playErrorSound, playClickSound } from '../../utils/audio';
import { getPolishPronoun, PolishPronoun, PRONOUN_CONFIG } from '../../utils/pronounHelper';
import { cleanWord } from '../../utils/wordHelpers';
import { CheckCircle2, RotateCcw } from 'lucide-react';

interface PronounGameProps {
  items: SpellingItem[];
  onComplete?: () => void;
  onNextGame?: () => void;
}

export const PronounGame: React.FC<PronounGameProps> = ({ items, onComplete, onNextGame }) => {
  // If items is empty or has items without words, provide standard fallback with user examples
  const safeItems: SpellingItem[] = items && items.length > 0 ? items : [
    { id: 'pro-1', word: 'PARASOL', hint: 'Chroni przed deszczem' },
    { id: 'pro-2', word: 'KURTKA', hint: 'Ciepłe ubranie na jesień i zimę' },
    { id: 'pro-3', word: 'OKNO', hint: 'Wpada przez nie słoneczne światło' },
    { id: 'pro-4', word: 'ORZEŁ', hint: 'Biały ptak w godle Polski' },
    { id: 'pro-5', word: 'FLAGA', hint: 'Biało-czerwony symbol Polski' },
    { id: 'pro-6', word: 'GODŁO', hint: 'Godło Rzeczypospolitej Polskiej' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPronoun, setSelectedPronoun] = useState<PolishPronoun | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [shakeButton, setShakeButton] = useState<PolishPronoun | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [answersHistory, setAnswersHistory] = useState<
    { word: string; correctPronoun: PolishPronoun }[]
  >([]);

  const currentItem = safeItems[currentIndex] || safeItems[0];
  const currentWordClean = cleanWord(currentItem.word);
  const correctPronoun = getPolishPronoun(currentItem.word, currentItem.pronoun);

  const handlePronounSelect = (choice: PolishPronoun) => {
    if (feedback === 'correct') return; // already answered correctly, waiting for transition

    playClickSound();
    setSelectedPronoun(choice);

    if (choice === correctPronoun) {
      playSuccessSound();
      setFeedback('correct');

      // Record to history if not already recorded
      setAnswersHistory((prev) => {
        if (prev.some((h) => h.word === currentWordClean)) return prev;
        return [...prev, { word: currentWordClean, correctPronoun }];
      });

      // Auto advance after a brief moment
      setTimeout(() => {
        if (currentIndex + 1 < safeItems.length) {
          setCurrentIndex((prev) => prev + 1);
          setSelectedPronoun(null);
          setFeedback(null);
        } else {
          setIsFinished(true);
          if (onComplete) onComplete();
        }
      }, 1100);
    } else {
      playErrorSound();
      setFeedback('wrong');
      setShakeButton(choice);
      setTimeout(() => {
        setShakeButton(null);
      }, 600);
    }
  };

  const handleNextWordManual = () => {
    if (currentIndex + 1 < safeItems.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedPronoun(null);
      setFeedback(null);
    } else {
      setIsFinished(true);
      if (onComplete) onComplete();
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedPronoun(null);
    setFeedback(null);
    setIsFinished(false);
    setAnswersHistory([]);
  };

  // Completion screen
  if (isFinished) {
    return (
      <div className="bg-emerald-100 border-4 border-black p-6 sm:p-8 rounded-3xl text-center space-y-6 shadow-[6px_6px_0px_black] animate-fade-in max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-emerald-400 rounded-full border-3 border-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_black]">
          <CheckCircle2 className="w-10 h-10 text-black" />
        </div>

        <div>
          <h3 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-tight">
            Wspaniale! Wszystkie zaimki dopasowane!
          </h3>
          <p className="text-sm font-bold text-gray-800 mt-2">
            Prawidłowo przyporządkowałeś słówka z lekcji do zaimków TEN, TA i TO.
          </p>
        </div>

        {/* Podsumowanie wszystkich słówek */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_black] text-left">
          <span className="text-xs font-black uppercase tracking-wider text-gray-800 block mb-3">
            Twoje dopasowane słówka:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {safeItems.map((item, idx) => {
              const p = getPolishPronoun(item.word, item.pronoun);
              const cfg = PRONOUN_CONFIG[p];
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 bg-yellow-50 rounded-xl border-2 border-black font-black text-xs"
                >
                  <span className={`${cfg.colorBg} ${cfg.textCol} px-2 py-0.5 rounded-md border border-black uppercase text-xs font-black`}>
                    {cfg.label}
                  </span>
                  <span className="text-black uppercase tracking-wide text-sm font-black">{cleanWord(item.word)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRestart}
            className="px-6 py-3 bg-[#FF4F81] text-white border-3 border-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-[4px_4px_0px_black] cursor-pointer hover:translate-y-0.5 hover:shadow-none active:scale-95 transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Zagraj Ponownie</span>
          </button>
          {onNextGame && (
            <button
              onClick={onNextGame}
              className="px-6 py-3 bg-[#FFD700] text-black border-3 border-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-[4px_4px_0px_black] cursor-pointer hover:translate-y-0.5 hover:shadow-none active:scale-95 transition-all flex items-center gap-2"
            >
              <span>Kolejna gra ➔</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const pronounOptions: PolishPronoun[] = ['ten', 'ta', 'to'];

  return (
    <div className="bg-yellow-50 p-4 sm:p-7 rounded-3xl border-4 border-black shadow-[6px_6px_0px_black] space-y-6 w-full max-w-3xl mx-auto animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b-3 border-black pb-3 gap-2">
        <div>
          <span className="text-[11px] font-black uppercase text-[#FF4F81] tracking-wider block">
            Słowo {currentIndex + 1} z {safeItems.length}
          </span>
          <h3 className="text-base sm:text-lg font-black text-black uppercase leading-tight">
            Dopasuj zaimek: TEN, TA czy TO?
          </h3>
        </div>

        <button
          onClick={handleRestart}
          className="p-2 bg-white text-black border-2 border-black rounded-xl text-xs font-black cursor-pointer hover:bg-yellow-200 shadow-[2px_2px_0px_black] shrink-0 active:scale-95 transition"
          title="Zacznij grę od nowa"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Target Card */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border-3 border-black shadow-[5px_5px_0px_black] text-center space-y-5 relative overflow-hidden">
        {/* Word with placeholder for pronoun */}
        <div className="flex flex-wrap items-center justify-center gap-3 py-4">
          {feedback === 'correct' ? (
            <span
              className={`${PRONOUN_CONFIG[correctPronoun].colorBg} ${PRONOUN_CONFIG[correctPronoun].textCol} border-3 border-black px-5 py-2 rounded-2xl text-2xl sm:text-3xl font-black uppercase shadow-[3px_3px_0px_black] animate-pop`}
            >
              {PRONOUN_CONFIG[correctPronoun].label}
            </span>
          ) : (
            <span className="border-3 border-dashed border-gray-400 bg-gray-50 text-gray-400 px-5 py-2 rounded-2xl text-2xl sm:text-3xl font-black uppercase min-w-[100px] text-center">
              {selectedPronoun && feedback === 'wrong' ? '???' : '_____'}
            </span>
          )}

          <span className="text-3xl sm:text-5xl font-black text-black uppercase tracking-wider">
            {currentWordClean}
          </span>
        </div>

        {/* Hint under the word */}
        {currentItem.hint && (
          <p className="text-xs sm:text-sm font-bold text-gray-700 max-w-md mx-auto">
            Wskazówka: {currentItem.hint}
          </p>
        )}

        {/* Feedback Banner */}
        {feedback === 'correct' && (
          <div className="p-3 bg-emerald-100 border-2 border-black rounded-xl text-emerald-950 font-black text-xs sm:text-sm shadow-[2px_2px_0px_black] flex items-center justify-center gap-2 animate-bounce-short">
            <span>
              Brawo! Mówimy: <strong>{PRONOUN_CONFIG[correctPronoun].label} {currentWordClean}</strong> ({PRONOUN_CONFIG[correctPronoun].gender}).
            </span>
          </div>
        )}

        {feedback === 'wrong' && (
          <div className="p-3 bg-rose-100 border-2 border-black rounded-xl text-rose-950 font-black text-xs sm:text-sm shadow-[2px_2px_0px_black] animate-shake">
            <span>
              Ups! Spróbuj jeszcze raz. Czy powiesz <em>ten</em>, <em>ta</em> czy <em>to</em> {currentWordClean.toLowerCase()}?
            </span>
          </div>
        )}
      </div>

      {/* 3 Interactive Pronoun Buttons (TEN, TA, TO) */}
      <div className="space-y-2">
        <div className="text-center">
          <span className="text-xs font-black uppercase text-gray-800 tracking-wider">
            Wybierz odpowiedni zaimek:
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {pronounOptions.map((pronoun) => {
            const config = PRONOUN_CONFIG[pronoun];
            const isSelected = selectedPronoun === pronoun;
            const isCorrectChoice = isSelected && feedback === 'correct';
            const isWrongChoice = shakeButton === pronoun;

            return (
              <button
                key={pronoun}
                onClick={() => handlePronounSelect(pronoun)}
                disabled={feedback === 'correct'}
                className={`group relative p-4 sm:p-5 rounded-2xl border-4 border-black text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 select-none ${
                  isCorrectChoice
                    ? `${config.colorBg} ${config.textCol} ring-4 ring-black shadow-[6px_6px_0px_black] scale-105`
                    : isWrongChoice
                    ? 'bg-rose-300 text-black shadow-[2px_2px_0px_black] animate-shake'
                    : `${config.colorBg} ${config.textCol} ${config.hoverBg} shadow-[5px_5px_0px_black] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_black] active:translate-y-1 active:shadow-[2px_2px_0px_black]`
                }`}
              >
                <div className="flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-black uppercase tracking-wider">
                    {config.label}
                  </span>
                </div>
                <span className="text-[11px] font-bold opacity-90 block">
                  {config.gender}
                </span>
                <span className="text-[10px] font-medium opacity-80 italic hidden sm:block">
                  {config.example}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual advance if child wants to skip waiting */}
      {feedback === 'correct' && (
        <div className="flex justify-end pt-1">
          <button
            onClick={handleNextWordManual}
            className="bg-[#4F81FF] hover:bg-blue-600 text-white font-black text-xs px-4 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_black] cursor-pointer flex items-center gap-1.5 uppercase active:scale-95 transition"
          >
            <span>Dalej ➔</span>
          </button>
        </div>
      )}
    </div>
  );
};
