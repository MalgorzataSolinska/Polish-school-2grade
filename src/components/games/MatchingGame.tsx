import React, { useState, useMemo, useEffect } from 'react';
import { MatchingItem, SpellingItem, LanguageMode } from '../../types';
import { playSuccessSound, playErrorSound, playClickSound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { CheckCircle2, Sparkles, RefreshCw, GripVertical, Check } from 'lucide-react';
import { getEmojiForWord } from '../../utils/wordHelpers';
import { isImageUrl, normalizeImageUrl } from '../../utils/imageHelpers';

interface MatchingGameProps {
  items?: MatchingItem[];
  fallbackSpelling?: SpellingItem[];
  languageMode?: LanguageMode;
  onComplete?: (stars: number) => void;
  onNextGame?: () => void;
}

const DEFAULT_MATCHING_ITEMS: MatchingItem[] = [
  {
    id: 'def-1',
    wordPl: 'Orzeł Biały',
    description: 'Godło Polski – dumny biały ptak w złotej koronie na czerwonym tle.',
    emoji: '🦅',
  },
  {
    id: 'def-2',
    wordPl: 'Flaga Polski',
    description: 'Biało-czerwone barwy narodowe, biel symbolizuje czystość, a czerwień odwagę.',
    emoji: '🇵🇱',
  },
  {
    id: 'def-3',
    wordPl: 'Syrenka Warszawska',
    description: 'Legendarna postać z mieczem i tarczą, która czuwa i broni stolicy Polski nad Wisłą.',
    emoji: '🧜‍♀️',
  },
  {
    id: 'def-4',
    wordPl: 'Smok Wawelski',
    description: 'Potwór z krakowskiej legendy mieszkający w pieczarze pod Zamkiem Królewskim na Wawelu.',
    emoji: '🐉',
  },
  {
    id: 'def-5',
    wordPl: 'Rzeka Wisła',
    description: 'Królowa polskich rzek, najdłuższa rzeka w Polsce płynąca od Tatr aż do Morza Bałtyckiego.',
    emoji: '🌊',
  },
  {
    id: 'def-6',
    wordPl: 'Zamek Królewski na Wawelu',
    description: 'Wspaniały zamek w Krakowie, gdzie dawniej mieszkali i rządzili polscy królowie.',
    emoji: '🏰',
  },
];

export const MatchingGame: React.FC<MatchingGameProps> = ({
  items,
  fallbackSpelling,
  onComplete,
  onNextGame,
}) => {
  // Normalize items from props or fallback with automatic link resolution
  const gameItems: MatchingItem[] = useMemo(() => {
    if (items && items.length > 0) {
      return items.map((it, idx) => {
        let resolvedImageUrl = it.imageUrl ? normalizeImageUrl(it.imageUrl) : undefined;
        let resolvedEmoji = it.emoji;

        // If emoji field contains a URL, auto-promote it to imageUrl
        if (!resolvedImageUrl && isImageUrl(it.emoji)) {
          resolvedImageUrl = normalizeImageUrl(it.emoji);
          resolvedEmoji = undefined;
        }

        return {
          id: it.id || `match-${idx}`,
          wordPl: it.wordPl,
          wordEn: it.wordEn,
          description: it.description || it.wordEn || 'Dopasuj do tego hasła',
          emoji: resolvedEmoji || getEmojiForWord(it.wordPl) || '⭐',
          imageUrl: resolvedImageUrl,
        };
      });
    }

    if (fallbackSpelling && fallbackSpelling.length > 0) {
      return fallbackSpelling.map((s, idx) => ({
        id: s.id || `spelling-match-${idx}`,
        wordPl: s.word,
        description: s.hint || `Opis dla słowa: ${s.word}`,
        emoji: s.emoji || getEmojiForWord(s.word) || '⭐',
      }));
    }

    return DEFAULT_MATCHING_ITEMS;
  }, [items, fallbackSpelling]);

  // Set of matched item IDs
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  // Tracking failed image loads to smoothly fallback to emoji
  const [failedImageIds, setFailedImageIds] = useState<string[]>([]);
  // For mobile / click-to-match: selected draggable card id
  const [selectedDescriptionId, setSelectedDescriptionId] = useState<string | null>(null);
  // HTML5 Drag state
  const [draggedDescriptionId, setDraggedDescriptionId] = useState<string | null>(null);
  const [dragOverTargetId, setDragOverTargetId] = useState<string | null>(null);
  const [wrongTargetId, setWrongTargetId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  // Shuffled descriptions for the source pool
  const [shuffledDescriptions, setShuffledDescriptions] = useState<MatchingItem[]>([]);

  // Initialize and shuffle
  const initializeGame = () => {
    setMatchedIds([]);
    setFailedImageIds([]);
    setSelectedDescriptionId(null);
    setDraggedDescriptionId(null);
    setDragOverTargetId(null);
    setWrongTargetId(null);
    setFeedback(null);
    setIsFinished(false);
    // Shuffle descriptions
    const shuffled = [...gameItems].sort(() => Math.random() - 0.5);
    setShuffledDescriptions(shuffled);
  };

  useEffect(() => {
    initializeGame();
  }, [gameItems]);

  const remainingDescriptions = useMemo(() => {
    return shuffledDescriptions.filter((item) => !matchedIds.includes(item.id));
  }, [shuffledDescriptions, matchedIds]);

  // Handle a match attempt
  const attemptMatch = (targetItem: MatchingItem, descriptionId: string) => {
    if (matchedIds.includes(targetItem.id)) return;

    if (targetItem.id === descriptionId) {
      // Correct Match!
      playSuccessSound();
      const updated = [...matchedIds, targetItem.id];
      setMatchedIds(updated);
      setSelectedDescriptionId(null);
      setDraggedDescriptionId(null);
      setDragOverTargetId(null);
      setWrongTargetId(null);
      setFeedback({
        message: `Świetnie! „${targetItem.wordPl}” pasuje idealnie! 🌟`,
        type: 'success',
      });

      if (updated.length === gameItems.length) {
        setIsFinished(true);
        confetti({
          particleCount: 80,
          spread: 90,
          origin: { y: 0.6 },
        });
        if (onComplete) {
          onComplete(15);
        }
      }
    } else {
      // Wrong Match
      playErrorSound();
      setWrongTargetId(targetItem.id);
      setSelectedDescriptionId(null);
      setDraggedDescriptionId(null);
      setDragOverTargetId(null);
      setFeedback({
        message: 'Nie pasuje! Przeczytaj opis uważnie i wybierz inny kafelek. 🤔',
        type: 'error',
      });
      setTimeout(() => {
        setWrongTargetId(null);
      }, 900);
    }
  };

  // Drag and Drop event handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedDescriptionId(id);
    setSelectedDescriptionId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedDescriptionId(null);
    setDragOverTargetId(null);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverTargetId !== targetId) {
      setDragOverTargetId(targetId);
    }
  };

  const handleDragLeave = (_e: React.DragEvent, targetId: string) => {
    if (dragOverTargetId === targetId) {
      setDragOverTargetId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetItem: MatchingItem) => {
    e.preventDefault();
    setDragOverTargetId(null);
    const droppedId = e.dataTransfer.getData('text/plain') || draggedDescriptionId;
    if (droppedId) {
      attemptMatch(targetItem, droppedId);
    }
  };

  // Tap-to-match click handlers (Touch & Click Friendly)
  const handleDescriptionClick = (id: string) => {
    playClickSound();
    if (selectedDescriptionId === id) {
      setSelectedDescriptionId(null);
      setFeedback(null);
    } else {
      setSelectedDescriptionId(id);
      setFeedback({
        message: 'Opis wybrany! Teraz wskaż pasujący kafelek powyżej. 👇',
        type: 'info',
      });
    }
  };

  const handleTargetClick = (targetItem: MatchingItem) => {
    if (matchedIds.includes(targetItem.id)) return;

    if (selectedDescriptionId) {
      attemptMatch(targetItem, selectedDescriptionId);
    } else {
      playClickSound();
      setFeedback({
        message: 'Najpierw wybierz jeden z opisów na dole! 👈',
        type: 'info',
      });
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-4 border-black p-4 sm:p-6 rounded-3xl shadow-[8px_8px_0px_black] space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Game Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-3 border-black">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#FFD700] text-black border-2 border-black px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-1 shadow-[2px_2px_0px_black]">
            <Sparkles className="w-3.5 h-3.5 text-[#FF4F81]" />
            <span>Gra edukacyjna • Dopasowywanie</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight flex items-center gap-2">
            <span>🧩 Dopasuj Opis do Tytułu lub Zdjęcia</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-800 font-bold mt-0.5">
            Wybierz opis i połącz go z pasującym kafelkiem!
          </p>
        </div>

        {/* Progress & Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="bg-white border-2 border-black px-3 py-1.5 rounded-xl font-black text-xs shadow-[2px_2px_0px_black] flex items-center gap-1.5">
            <span>Dopasowano:</span>
            <span className="text-emerald-600 text-sm">
              {matchedIds.length} / {gameItems.length}
            </span>
          </div>
          <button
            onClick={initializeGame}
            className="p-2 bg-yellow-200 hover:bg-yellow-300 border-2 border-black rounded-xl font-bold cursor-pointer shadow-[2px_2px_0px_black] active:scale-95 transition"
            title="Wymieszaj i zagraj od nowa"
          >
            <RefreshCw className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>

      {/* Dynamic Feedback Banner */}
      {feedback && (
        <div
          className={`py-2 px-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_black] text-xs sm:text-sm font-black text-center transition-all animate-bounce-short ${
            feedback.type === 'success'
              ? 'bg-emerald-200 text-emerald-950 border-emerald-900'
              : feedback.type === 'error'
              ? 'bg-rose-200 text-rose-950 border-rose-900'
              : 'bg-yellow-200 text-yellow-950 border-yellow-900'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Main Game Arena */}
      {!isFinished ? (
        <div className="space-y-6">
          {/* Target Square-ish Tiles Grid (Side-by-side, responsive 2 to 4 columns) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-black uppercase text-black tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#FF4F81] rounded-full border border-black inline-block"></span>
                <span>Karty z Hasłami i Obrazkami ({gameItems.length}):</span>
              </h3>
              {selectedDescriptionId ? (
                <span className="text-xs font-black text-[#FF4F81] animate-pulse">
                  Wskaż pasujący kafelek 👇
                </span>
              ) : (
                <span className="text-[11px] text-gray-700 font-bold">
                  Wybierz opis poniżej
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {gameItems.map((item) => {
                const isMatched = matchedIds.includes(item.id);
                const isDragOver = dragOverTargetId === item.id;
                const isWrong = wrongTargetId === item.id;
                const canDrop = Boolean(selectedDescriptionId || draggedDescriptionId) && !isMatched;

                return (
                  <div
                    key={`target-${item.id}`}
                    onDragOver={(e) => handleDragOver(e, item.id)}
                    onDragLeave={(e) => handleDragLeave(e, item.id)}
                    onDrop={(e) => handleDrop(e, item)}
                    onClick={() => handleTargetClick(item)}
                    className={`p-3 rounded-2xl border-3 border-black transition-all cursor-pointer relative shadow-[4px_4px_0px_black] flex flex-col justify-between text-center ${
                      isMatched
                        ? 'bg-emerald-100 border-emerald-800 ring-2 ring-emerald-500'
                        : isWrong
                        ? 'bg-rose-100 border-rose-600 animate-shake'
                        : isDragOver
                        ? 'bg-yellow-200 border-black scale-[1.03] ring-3 ring-yellow-400'
                        : canDrop
                        ? 'bg-white hover:bg-yellow-50 hover:scale-[1.02] border-black'
                        : 'bg-white border-black'
                    }`}
                  >
                    {/* Top status tag if matched */}
                    {isMatched && (
                      <div className="absolute top-2 right-2 z-10">
                        <span className="inline-flex items-center gap-1 bg-emerald-500 text-white border border-black px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase shadow-[1px_1px_0px_black]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Brawo!</span>
                        </span>
                      </div>
                    )}

                    {/* Image or Emoji Display */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-amber-100 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_black] overflow-hidden relative shrink-0">
                      {item.imageUrl && !failedImageIds.includes(item.id) ? (
                        <img
                          src={item.imageUrl}
                          alt={item.wordPl}
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover"
                          onError={() => {
                            setFailedImageIds((prev) => [...prev, item.id]);
                          }}
                        />
                      ) : (
                        <span className="text-3xl sm:text-4xl select-none">
                          {item.emoji || getEmojiForWord(item.wordPl) || '⭐'}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h4 className="text-xs sm:text-sm font-black text-black uppercase tracking-tight mt-2 px-1 line-clamp-1">
                      {item.wordPl}
                    </h4>

                    {/* Drop / Assigned Slot */}
                    <div
                      className={`mt-2 p-2 rounded-xl border-2 text-xs transition-all min-h-[58px] flex items-center justify-center ${
                        isMatched
                          ? 'bg-emerald-200/90 border-emerald-700 text-emerald-950 font-bold text-left text-[11px] leading-snug'
                          : isDragOver
                          ? 'bg-yellow-300 border-black border-dashed font-black text-black scale-102'
                          : canDrop
                          ? 'bg-yellow-100/80 border-black border-dashed font-black text-amber-950'
                          : 'bg-gray-50 border-gray-300 border-dashed text-gray-400 font-bold'
                      }`}
                    >
                      {isMatched ? (
                        <div className="flex items-start gap-1 w-full">
                          <Check className="w-3.5 h-3.5 text-emerald-800 shrink-0 mt-0.5" />
                          <span className="line-clamp-3">{item.description}</span>
                        </div>
                      ) : isDragOver ? (
                        <span className="text-black font-black">📥 Upuść tutaj!</span>
                      ) : selectedDescriptionId ? (
                        <span className="text-amber-900 font-black">👉 Połącz tutaj</span>
                      ) : (
                        <span className="text-gray-400 text-[11px]">Pole na opis</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description Cards Pool (Grid side-by-side) */}
          <div className="pt-4 border-t-3 border-black space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-black uppercase text-black tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#4F81FF] rounded-full border border-black inline-block"></span>
                <span>Dostępne opisy do dopasowania ({remainingDescriptions.length}):</span>
              </h3>
              {selectedDescriptionId && (
                <span className="text-xs font-black text-[#FF4F81] uppercase">
                  ✓ Wybrany opis — wskaż kafelek powyżej
                </span>
              )}
            </div>

            {remainingDescriptions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {remainingDescriptions.map((descItem) => {
                  const isSelected = selectedDescriptionId === descItem.id;
                  const isBeingDragged = draggedDescriptionId === descItem.id;

                  return (
                    <div
                      key={`desc-${descItem.id}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, descItem.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleDescriptionClick(descItem.id)}
                      className={`p-3.5 rounded-2xl border-3 border-black cursor-grab active:cursor-grabbing transition-all select-none relative shadow-[4px_4px_0px_black] flex items-start gap-2.5 ${
                        isBeingDragged
                          ? 'opacity-40 scale-95 bg-gray-200'
                          : isSelected
                          ? 'bg-[#FFD700] ring-4 ring-[#FF4F81] scale-[1.02] shadow-[6px_6px_0px_black]'
                          : 'bg-white hover:bg-yellow-50 hover:scale-[1.01]'
                      }`}
                    >
                      <div className="p-1.5 bg-gray-100 rounded-lg border border-black/30 shrink-0 text-gray-600 mt-0.5">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-black leading-snug">
                          {descItem.description}
                        </p>
                        {isSelected && (
                          <div className="mt-1.5 text-[10px] text-[#FF4F81] font-black uppercase">
                            ✓ Wybrany — wskaż kafelek powyżej!
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-5 bg-emerald-50 rounded-2xl border-2 border-emerald-400 text-center text-emerald-800 font-black text-xs sm:text-sm">
                🎉 Wszystkie opisy zostały już przypisane! Brawo!
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Completed Celebratory Screen */
        <div className="p-6 sm:p-10 bg-emerald-100 border-4 border-black rounded-3xl text-center space-y-6 shadow-[6px_6px_0px_black] animate-fade-in">
          <div className="w-20 h-20 bg-emerald-400 rounded-full border-3 border-black flex items-center justify-center mx-auto shadow-[4px_4px_0px_black] text-4xl animate-bounce">
            🏆
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-tight">
              Wspaniale! Wszystkie opisy dopasowane!
            </h3>
            <p className="text-sm sm:text-base text-gray-800 font-bold mt-1 max-w-xl mx-auto">
              Znasz doskonale wszystkie pojęcia i hasła. Zdobywasz kolejne punkty wiedzy!
            </p>
          </div>

          {/* Summary Grid of Matched Pairs */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border-3 border-black shadow-[4px_4px_0px_black] max-w-3xl mx-auto text-left space-y-3">
            <h4 className="text-xs font-black uppercase text-black tracking-wider border-b-2 border-black/10 pb-2">
              📖 Twoje zestawienie wiedzy:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
              {gameItems.map((item) => (
                <div
                  key={`summary-${item.id}`}
                  className="p-3 bg-yellow-50 rounded-xl border-2 border-black flex items-start gap-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-100 border border-black flex items-center justify-center overflow-hidden shrink-0 shadow-[1px_1px_0px_black]">
                    {item.imageUrl && !failedImageIds.includes(item.id) ? (
                      <img
                        src={item.imageUrl}
                        alt={item.wordPl}
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl select-none">
                        {item.emoji || getEmojiForWord(item.wordPl) || '⭐'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-black text-black text-xs uppercase">{item.wordPl}</h5>
                    <p className="text-[11px] text-gray-800 font-bold leading-tight mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={initializeGame}
              className="bg-yellow-400 hover:bg-yellow-300 text-black border-3 border-black px-6 py-3 rounded-2xl font-black uppercase text-sm shadow-[4px_4px_0px_black] active:scale-95 transition cursor-pointer flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Zagraj jeszcze raz</span>
            </button>
            {onNextGame && (
              <button
                onClick={onNextGame}
                className="bg-[#4F81FF] hover:bg-blue-600 text-white border-3 border-black px-6 py-3 rounded-2xl font-black uppercase text-sm shadow-[4px_4px_0px_black] active:scale-95 transition cursor-pointer flex items-center gap-2"
              >
                <span>Następna gra</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
