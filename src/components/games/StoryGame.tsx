import React, { useState } from 'react';
import { StoryTaskData, LanguageMode } from '../../types';
import { playSuccessSound, playClickSound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, Sparkles, BookOpen } from 'lucide-react';

interface StoryGameProps {
  data: StoryTaskData;
  languageMode?: LanguageMode;
  onComplete: (stars: number) => void;
}

export const StoryGame: React.FC<StoryGameProps> = ({
  data,
  onComplete,
}) => {
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: number }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const handleSelectOption = (qId: string, optionIdx: number) => {
    if (submitted) return;
    playClickSound();
    setUserAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    data.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setSubmitted(true);

    if (correctCount === data.questions.length) {
      playSuccessSound();
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      onComplete(15);
    }
  };

  return (
    <div className="bg-indigo-50/70 p-4 sm:p-6 rounded-3xl border-3 border-indigo-300">
      {/* Story Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-200 text-indigo-900 rounded-2xl border border-black shadow-[2px_2px_0px_black]">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-black uppercase leading-snug break-words">{data.title}</h3>
            <p className="text-xs text-indigo-800 font-bold">
              Przeczytaj czytankę i odpowiedz na pytania ze zrozumieniem.
            </p>
          </div>
        </div>
      </div>

      {/* Story Text Box */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_black] mb-6 leading-relaxed">
        <p className="text-sm sm:text-base text-black font-serif font-bold leading-loose">
          "{data.storyPl}"
        </p>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1">
          <span>Pytania do tekstu:</span>
        </h4>

        {data.questions.map((q, idx) => {
          const selectedOption = userAnswers[q.id];
          const isCorrect = submitted && selectedOption === q.correctAnswer;
          const isWrong = submitted && selectedOption !== undefined && selectedOption !== q.correctAnswer;

          return (
            <div
              key={q.id}
              className={`p-4 rounded-2xl bg-white border-3 transition border-black shadow-[3px_3px_0px_black] ${
                submitted
                  ? isCorrect
                    ? 'bg-emerald-100'
                    : isWrong
                    ? 'bg-rose-100'
                    : 'bg-white'
                  : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h5 className="text-sm font-black text-black">
                    {idx + 1}. {q.question}
                  </h5>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                {q.options.map((opt, oIdx) => {
                  const isThisSelected = selectedOption === oIdx;
                  const isThisCorrect = submitted && oIdx === q.correctAnswer;

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(q.id, oIdx)}
                      disabled={submitted}
                      className={`p-2.5 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-between cursor-pointer border-2 border-black shadow-[2px_2px_0px_black] ${
                        submitted
                          ? isThisCorrect
                            ? 'bg-emerald-400 text-black'
                            : isThisSelected
                            ? 'bg-rose-500 text-white'
                            : 'bg-gray-100 text-gray-500'
                          : isThisSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-indigo-50 hover:bg-indigo-100 text-black'
                      }`}
                    >
                      <span>{opt}</span>
                      {submitted && isThisCorrect && <CheckCircle2 className="w-4 h-4 text-black" />}
                      {submitted && isThisSelected && !isThisCorrect && <XCircle className="w-4 h-4 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit or Results Button */}
      <div className="mt-6 flex justify-center">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(userAnswers).length < data.questions.length}
            className={`px-6 py-3 rounded-2xl text-sm font-black transition cursor-pointer shadow-md flex items-center gap-2 ${
              Object.keys(userAnswers).length === data.questions.length
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Sprawdź odpowiedzi! 📝</span>
          </button>
        ) : (
          <div className="text-center p-4 bg-white border-2 border-indigo-300 rounded-2xl shadow-sm max-w-md w-full">
            <span className="text-3xl">🏆</span>
            <h4 className="text-base font-black text-indigo-950 mt-1">
              Wynik: {score} / {data.questions.length} prawidłowych!
            </h4>
            <p className="text-xs text-indigo-700 font-bold mt-0.5">
              Otrzymujesz +15 Gwiazdek ⭐ za czytanie ze zrozumieniem!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
