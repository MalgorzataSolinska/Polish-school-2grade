import React, { useState } from 'react';
import { playSuccessSound, playErrorSound } from '../../utils/audio';
import { Sparkles, Trophy, RefreshCw, Heart, CheckCircle2, RotateCcw, Lightbulb } from 'lucide-react';
import { SpellingItem } from '../../types';

interface SecretWordGameProps {
  items: SpellingItem[];
  onComplete: () => void;
  onNextGame?: () => void;
}

const POLISH_ALPHABET = [
  'A', 'Ą', 'B', 'C', 'Ć', 'D', 'E', 'Ę', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'Ł',
  'M', 'N', 'Ń', 'O', 'Ó', 'P', 'R', 'S', 'Ś', 'T', 'U', 'W', 'Y', 'Z', 'Ź', 'Ż'
];

export const SecretWordGame: React.FC<SecretWordGameProps> = ({ items, onComplete, onNextGame }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const maxHearts = 6;

  const currentItem = items[currentIndex] || {
    word: 'SYRENKA',
    hint: 'Symbol Warszawy z mieczem i tarczą',
    emoji: '🧜‍♀️'
  };

  const targetWord = currentItem.word.toUpperCase().replace(/\s+/g, '');
  const isWordGuessed = targetWord.split('').every((letter) => guessedLetters.includes(letter));
  const isGameOver = wrongGuesses.length >= maxHearts;

  const handleGuess = (letter: string) => {
    if (guessedLetters.includes(letter) || wrongGuesses.includes(letter) || isWordGuessed || isGameOver) {
      return;
    }

    if (targetWord.includes(letter)) {
      playSuccessSound();
      const updated = [...guessedLetters, letter];
      setGuessedLetters(updated);

      // Check if all letters guessed
      if (targetWord.split('').every((l) => updated.includes(l))) {
        setTimeout(() => {
          if (currentIndex < items.length - 1) {
            // prepare next word
          } else {
            setCompleted(true);
            onComplete();
          }
        }, 1200);
      }
    } else {
      playErrorSound();
      setWrongGuesses((prev) => [...prev, letter]);
    }
  };

  const handleRevealNextLetter = () => {
    if (isWordGuessed || isGameOver) return;

    // Find the first letter in targetWord from left to right that is not yet guessed
    const firstUnguessedLetter = targetWord.split('').find((letter) => !guessedLetters.includes(letter));

    if (firstUnguessedLetter) {
      playSuccessSound();
      const updated = [...guessedLetters, firstUnguessedLetter];
      setGuessedLetters(updated);

      if (targetWord.split('').every((l) => updated.includes(l))) {
        setTimeout(() => {
          if (currentIndex < items.length - 1) {
            // prepare next word
          } else {
            setCompleted(true);
            onComplete();
          }
        }, 1200);
      }
    }
  };

  const handleNextWord = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setGuessedLetters([]);
      setWrongGuesses([]);
    } else {
      setCompleted(true);
      onComplete();
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setGuessedLetters([]);
    setWrongGuesses([]);
    setCompleted(false);
  };

  if (completed) {
    return (
      <div className="bg-emerald-100 p-8 rounded-3xl border-4 border-black text-center space-y-4 shadow-[8px_8px_0px_black] animate-fade-in">
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto drop-shadow-[2px_2px_0px_black]" />
        <h3 className="text-2xl font-black text-black uppercase">
          Brawo! Odgadłeś wszystkie tajemnicze słowa! 🎉
        </h3>
        <p className="text-sm font-bold text-gray-800">
          Znasz już znakomicie polską ortografię i słownictwo z lekcji!
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRestart}
            className="bg-[#FF4F81] text-white border-3 border-black font-black px-6 py-3 rounded-2xl text-xs uppercase cursor-pointer shadow-[4px_4px_0px_black] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Zagraj Ponownie 🔄</span>
          </button>
          {onNextGame && (
            <button
              onClick={onNextGame}
              className="bg-[#FFD700] text-black border-3 border-black font-black px-6 py-3 rounded-2xl text-xs uppercase cursor-pointer shadow-[4px_4px_0px_black] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2"
            >
              <span>Przejdź do kolejnej gry ➔</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const rawHint = currentItem.hint || '';
  const wordLower = targetWord.toLowerCase();
  const isRevealingWord =
    wordLower.length > 0 &&
    (rawHint.toLowerCase().includes(wordLower) ||
      rawHint.toLowerCase().includes('słowo nr') ||
      rawHint.toLowerCase().includes('do poćwiczenia'));

  const displayHint = isRevealingWord || !rawHint.trim()
    ? 'Odgadnij litery polskiego słowa!'
    : rawHint;

  return (
    <div className="bg-yellow-50 p-4 sm:p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0px_black] space-y-6">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b-3 border-black pb-3">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{currentItem.emoji || '🎯'}</span>
          <div>
            <h3 className="text-base sm:text-lg font-black text-black uppercase">
              Tajne Słowo ({currentIndex + 1} z {items.length})
            </h3>
            <p className="text-xs font-bold text-gray-700">
              Podpowiedź: {displayHint}
            </p>
          </div>
        </div>

        {/* Hearts */}
        <div className="flex items-center gap-1">
          {Array.from({ length: maxHearts }).map((_, idx) => (
            <Heart
              key={idx}
              className={`w-5 h-5 ${
                idx < maxHearts - wrongGuesses.length
                  ? 'text-rose-500 fill-rose-500 drop-shadow-[1px_1px_0px_black]'
                  : 'text-gray-300 fill-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Secret Word Boxes */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 my-4 sm:my-6">
        {targetWord.split('').map((char, idx) => {
          const isRevealed = guessedLetters.includes(char) || isGameOver;
          return (
            <div
              key={idx}
              className={`w-9 h-11 sm:w-14 sm:h-16 rounded-xl sm:rounded-2xl border-2 sm:border-3 border-black flex items-center justify-center text-lg sm:text-2xl font-black shadow-[2px_2px_0px_black] sm:shadow-[3px_3px_0px_black] transition-all shrink-0 whitespace-nowrap select-none ${
                isRevealed
                  ? 'bg-[#FFD700] text-black scale-105'
                  : 'bg-white text-gray-300'
              }`}
            >
              {isRevealed ? char : '?'}
            </div>
          );
        })}
      </div>

      {/* Masked Hint Button (Paróweczka) at the bottom */}
      {!isWordGuessed && !isGameOver && (
        <div className="flex justify-center my-2">
          <button
            onClick={handleRevealNextLetter}
            className="group flex items-center gap-2 px-3.5 py-1.5 bg-amber-200 hover:bg-amber-300 text-black border-2 border-black rounded-full shadow-[2px_2px_0px_black] active:scale-95 transition-all cursor-pointer"
            title="Kliknij, aby odsłonić kolejną literkę w słowie"
          >
            <span className="text-sm">💡</span>
            <span className="text-[11px] font-black uppercase text-black hidden group-hover:inline-block group-focus:inline-block transition-all">
              Podpowiedź: Pokaż literkę 🔍
            </span>
            <span className="text-[11px] font-black uppercase text-gray-700 inline-block group-hover:hidden group-focus:hidden">
              • • •
            </span>
          </button>
        </div>
      )}

      {/* Message Box when guessed */}
      {isWordGuessed && (
        <div className="bg-emerald-200 border-3 border-black p-3 rounded-2xl text-center space-y-2 animate-bounce">
          <p className="text-xs font-black text-black uppercase flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-800" />
            <span>Super! Słowo odgadnięte: <strong>{targetWord}</strong>!</span>
          </p>
          <button
            onClick={handleNextWord}
            className="bg-emerald-600 text-white border-2 border-black font-black px-4 py-1.5 rounded-xl text-xs uppercase cursor-pointer shadow-[2px_2px_0px_black]"
          >
            Następne Słowo ➡️
          </button>
        </div>
      )}

      {/* Game Over Box */}
      {isGameOver && (
        <div className="bg-rose-200 border-3 border-black p-3 rounded-2xl text-center space-y-2">
          <p className="text-xs font-black text-rose-900 uppercase">
            Niestety, zabrakło serduszek! Prawidłowe słowo to: <strong>{targetWord}</strong>
          </p>
          <button
            onClick={handleNextWord}
            className="bg-rose-600 text-white border-2 border-black font-black px-4 py-1.5 rounded-xl text-xs uppercase cursor-pointer shadow-[2px_2px_0px_black]"
          >
            Przejdź Dalej ➡️
          </button>
        </div>
      )}

      {/* On-screen Polish Keyboard for easy phone tapping */}
      <div className="space-y-2">
        <p className="text-[11px] font-black uppercase text-black text-center">
          Dotknij literę, aby sprawdzić, czy jest w słowie:
        </p>
        <div className="flex flex-wrap justify-center gap-1.5 max-w-xl mx-auto">
          {POLISH_ALPHABET.map((letter) => {
            const isUsedCorrect = guessedLetters.includes(letter);
            const isUsedWrong = wrongGuesses.includes(letter);

            return (
              <button
                key={letter}
                onClick={() => handleGuess(letter)}
                disabled={isUsedCorrect || isUsedWrong || isWordGuessed || isGameOver}
                className={`w-9 h-10 sm:w-11 sm:h-12 rounded-xl border-2 border-black font-black text-xs sm:text-sm cursor-pointer transition active:scale-95 shadow-[2px_2px_0px_black] ${
                  isUsedCorrect
                    ? 'bg-emerald-400 text-black border-emerald-950 opacity-60 shadow-none'
                    : isUsedWrong
                    ? 'bg-gray-300 text-gray-500 opacity-40 shadow-none'
                    : 'bg-white text-black hover:bg-yellow-200'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
