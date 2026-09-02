import React, { useState } from 'react';
import { GeographyQuizQuestion, LanguageMode } from '../../types';
import { playSuccessSound, playClickSound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { CheckCircle, MapPin, Sparkles } from 'lucide-react';

interface GeographyGameProps {
  questions: GeographyQuizQuestion[];
  languageMode?: LanguageMode;
  onComplete: (stars: number) => void;
}

export const GeographyGame: React.FC<GeographyGameProps> = ({
  questions,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (index: number) => {
    if (selectedOption !== null) return;
    playClickSound();
    setSelectedOption(index);
    setShowExplanation(true);

    if (index === currentQ.correctIndex) {
      playSuccessSound();
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowExplanation(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCompleted(true);
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      onComplete(15);
    }
  };

  return (
    <div className="bg-emerald-50/70 p-4 sm:p-6 rounded-3xl border-3 border-emerald-300">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-black text-black uppercase leading-snug break-words">
            🇵🇱 Odkryj Polskę: Mini Quiz
          </h3>
          <p className="text-xs text-emerald-800 font-bold">
            Poznaj geografię, stolicę, rzeki i polskie symbole narodowe!
          </p>
        </div>

        <div className="bg-emerald-200 text-emerald-900 px-3 py-1 rounded-full text-xs font-black border border-black shadow-[2px_2px_0px_black]">
          Pytanie {currentIndex + 1} z {questions.length}
        </div>
      </div>

      {!completed ? (
        <div className="bg-white p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_black]">
          {/* Question Display */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl p-2 bg-emerald-100 rounded-2xl border-2 border-black shrink-0 shadow-[2px_2px_0px_black]">
              {currentQ.imageOrEmoji || '🇵🇱'}
            </span>
            <div>
              <h4 className="text-base sm:text-lg font-black text-black">
                {currentQ.question}
              </h4>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2.5 mb-5">
            {currentQ.options.map((option, oIdx) => {
              const isSelected = selectedOption === oIdx;
              const isCorrect = oIdx === currentQ.correctIndex;

              return (
                <button
                  key={oIdx}
                  onClick={() => handleSelectOption(oIdx)}
                  disabled={selectedOption !== null}
                  className={`w-full p-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-between cursor-pointer border-2 ${
                    selectedOption !== null
                      ? isCorrect
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                        : isSelected
                        ? 'bg-rose-500 text-white border-rose-600'
                        : 'bg-gray-100 text-gray-400 border-gray-200'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-200 hover:border-emerald-300'
                  }`}
                >
                  <span>{option}</span>
                  {selectedOption !== null && isCorrect && (
                    <CheckCircle className="w-5 h-5 text-white" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Educational Explanation Box */}
          {showExplanation && (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl mb-4 text-xs sm:text-sm text-amber-950 leading-relaxed animate-fade-in">
              <span className="font-black text-amber-900 flex items-center gap-1 mb-1">
                <MapPin className="w-4 h-4 text-rose-500" />
                Ciekawostka o Polsce:
              </span>
              <p>{currentQ.explanation}</p>
            </div>
          )}

          {selectedOption !== null && (
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl text-xs font-black shadow-md cursor-pointer flex items-center gap-2 transition hover:scale-105"
              >
                <span>
                  {currentIndex < questions.length - 1 ? 'Następne pytanie ➔' : 'Zobacz wynik! 🏆'}
                </span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 bg-white border-3 border-emerald-300 rounded-2xl text-center shadow-sm">
          <span className="text-4xl">👑</span>
          <h4 className="text-xl font-black text-emerald-950 mt-2">
            Gratulacje! Świetny wynik: {score} / {questions.length}!
          </h4>
          <p className="text-xs text-emerald-800 font-bold mt-1">
            Znasz już lepiej Polskę, jej symbole i miasta!
          </p>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-300 rounded-xl inline-block text-xs font-black text-amber-900">
            Otrzymujesz +15 Gwiazdek ⭐!
          </div>
        </div>
      )}
    </div>
  );
};
