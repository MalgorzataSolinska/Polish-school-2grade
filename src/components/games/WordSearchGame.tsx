import React, { useState, useEffect } from 'react';
import { WordSearchData, LanguageMode } from '../../types';
import { playSuccessSound, playClickSound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { cleanWord } from '../../utils/wordHelpers';

interface WordSearchGameProps {
  data: WordSearchData;
  languageMode?: LanguageMode;
  onComplete: (stars: number) => void;
  onNextGame?: () => void;
}

export const WordSearchGame: React.FC<WordSearchGameProps> = ({
  data,
  onComplete,
  onNextGame,
}) => {
  const [grid, setGrid] = useState<string[][]>([]);
  const [selectedIndices, setSelectedIndices] = useState<[number, number][]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [wordLocations, setWordLocations] = useState<{ [word: string]: [number, number][] }>({});
  const [foundCells, setFoundCells] = useState<[number, number][]>([]);
  const [completed, setCompleted] = useState(false);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [startCell, setStartCell] = useState<[number, number] | null>(null);

  // Generate grid containing ALL words reliably
  useEffect(() => {
    generateGrid();
  }, [data]);

  const generateGrid = () => {
    const wordsToPlace = [...data.words].sort(
      (a, b) => cleanWord(b.pl).length - cleanWord(a.pl).length
    );
    const numWords = wordsToPlace.length;
    const maxWordLen = Math.max(
      ...wordsToPlace.map((w) => cleanWord(w.pl).length)
    );
    // Dynamic grid size: ensure enough space for all words
    const size = Math.max(data.gridSize || 8, maxWordLen, Math.min(10, Math.ceil(Math.sqrt(numWords * 9))));

    const alphabet = 'AĄBCĆDEĘFGHIJKLŁMNŃOÓPRŚSTUWYŻŹ';
    let newGrid: string[][] = [];
    let locations: { [word: string]: [number, number][] } = {};
    let allPlaced = false;
    let gridAttempts = 0;

    const directions = [
      { dr: 0, dc: 1 },  // Horizontal ->
      { dr: 1, dc: 0 },  // Vertical v
      { dr: 1, dc: 1 },  // Diagonal down-right
      { dr: -1, dc: 1 }, // Diagonal up-right
    ];

    while (!allPlaced && gridAttempts < 100) {
      gridAttempts++;
      newGrid = Array(size)
        .fill(null)
        .map(() => Array(size).fill(''));
      locations = {};
      allPlaced = true;

      for (const item of wordsToPlace) {
        const word = cleanWord(item.pl);
        let placed = false;
        let wordAttempts = 0;

        while (!placed && wordAttempts < 300) {
          wordAttempts++;
          const dir = directions[Math.floor(Math.random() * directions.length)];
          const len = word.length;

          const minRow = dir.dr < 0 ? len - 1 : 0;
          const maxRow = dir.dr > 0 ? size - len : size - 1;
          const minCol = dir.dc < 0 ? len - 1 : 0;
          const maxCol = dir.dc > 0 ? size - len : size - 1;

          if (maxRow < minRow || maxCol < minCol) continue;

          const row = Math.floor(Math.random() * (maxRow - minRow + 1)) + minRow;
          const col = Math.floor(Math.random() * (maxCol - minCol + 1)) + minCol;

          let canPlace = true;
          for (let i = 0; i < len; i++) {
            const r = row + i * dir.dr;
            const c = col + i * dir.dc;
            if (newGrid[r][c] !== '' && newGrid[r][c] !== word[i]) {
              canPlace = false;
              break;
            }
          }

          if (canPlace) {
            const coords: [number, number][] = [];
            for (let i = 0; i < len; i++) {
              const r = row + i * dir.dr;
              const c = col + i * dir.dc;
              newGrid[r][c] = word[i];
              coords.push([r, c]);
            }
            locations[word] = coords;
            placed = true;
          }
        }

        if (!placed) {
          allPlaced = false;
          break; // restart grid generation with new random placements
        }
      }
    }

    // Fill remaining empty cells with random letters
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!newGrid[r][c]) {
          newGrid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }

    setGrid(newGrid);
    setWordLocations(locations);
    setSelectedIndices([]);
    setFoundWords([]);
    setFoundCells([]);
    setCompleted(false);
    setIsDragging(false);
    setStartCell(null);
  };

  // Calculate straight line of cells between (r1, c1) and (r2, c2)
  const getLineCells = (r1: number, c1: number, r2: number, c2: number): [number, number][] => {
    if (r1 === r2 && c1 === c2) {
      return [[r1, c1]];
    }

    const dr = r2 - r1;
    const dc = c2 - c1;
    const absDr = Math.abs(dr);
    const absDc = Math.abs(dc);

    if (dr === 0) {
      // Horizontal
      const stepC = dc > 0 ? 1 : -1;
      const cells: [number, number][] = [];
      for (let c = c1; stepC > 0 ? c <= c2 : c >= c2; c += stepC) {
        cells.push([r1, c]);
      }
      return cells;
    } else if (dc === 0) {
      // Vertical
      const stepR = dr > 0 ? 1 : -1;
      const cells: [number, number][] = [];
      for (let r = r1; stepR > 0 ? r <= r2 : r >= r2; r += stepR) {
        cells.push([r, c1]);
      }
      return cells;
    } else if (absDr === absDc) {
      // Diagonal
      const stepR = dr > 0 ? 1 : -1;
      const stepC = dc > 0 ? 1 : -1;
      const cells: [number, number][] = [];
      for (let i = 0; i <= absDr; i++) {
        cells.push([r1 + i * stepR, c1 + i * stepC]);
      }
      return cells;
    } else {
      // Snap to dominant direction
      if (absDr > absDc * 2) {
        const stepR = dr > 0 ? 1 : -1;
        const cells: [number, number][] = [];
        for (let r = r1; stepR > 0 ? r <= r2 : r >= r2; r += stepR) {
          cells.push([r, c1]);
        }
        return cells;
      } else if (absDc > absDr * 2) {
        const stepC = dc > 0 ? 1 : -1;
        const cells: [number, number][] = [];
        for (let c = c1; stepC > 0 ? c <= c2 : c >= c2; c += stepC) {
          cells.push([r1, c]);
        }
        return cells;
      } else {
        const len = Math.min(absDr, absDc);
        const stepR = dr > 0 ? 1 : -1;
        const stepC = dc > 0 ? 1 : -1;
        const cells: [number, number][] = [];
        for (let i = 0; i <= len; i++) {
          cells.push([r1 + i * stepR, c1 + i * stepC]);
        }
        return cells;
      }
    }
  };

  const checkWordSelection = (cells: [number, number][]) => {
    if (cells.length === 0) return false;
    const forwardStr = cells.map(([r, c]) => grid[r][c]).join('');
    const backwardStr = forwardStr.split('').reverse().join('');

    const matchedWordObj = data.words.find((w) => {
      const target = cleanWord(w.pl);
      const isNotAlreadyFound = !foundWords.includes(target);
      return isNotAlreadyFound && (target === forwardStr || target === backwardStr);
    });

    if (matchedWordObj) {
      const matchedWordStr = cleanWord(matchedWordObj.pl);
      const updatedFound = [...foundWords, matchedWordStr];
      setFoundWords(updatedFound);

      // Add to permanently found cells
      setFoundCells((prev) => {
        const newFound = [...prev];
        cells.forEach(([r, c]) => {
          if (!newFound.some(([fr, fc]) => fr === r && fc === c)) {
            newFound.push([r, c]);
          }
        });
        return newFound;
      });

      playSuccessSound();

      if (updatedFound.length === data.words.length) {
        setCompleted(true);
        confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } });
        onComplete(10);
      }
      return true;
    }
    return false;
  };

  const handlePointerDownCell = (r: number, c: number) => {
    if (completed) return;
    playClickSound();

    // If user already tapped a start cell and now taps a second cell
    if (startCell && !isDragging) {
      const line = getLineCells(startCell[0], startCell[1], r, c);
      const isMatch = checkWordSelection(line);
      if (isMatch) {
        setSelectedIndices([]);
        setStartCell(null);
        return;
      }
    }

    // Start a new drag / selection
    setIsDragging(true);
    setStartCell([r, c]);
    setSelectedIndices([[r, c]]);
  };

  const handlePointerMoveGrid = (clientX: number, clientY: number) => {
    if (!isDragging || !startCell || completed) return;

    const element = document.elementFromPoint(clientX, clientY);
    if (element) {
      const rowAttr = element.getAttribute('data-row');
      const colAttr = element.getAttribute('data-col');
      if (rowAttr !== null && colAttr !== null) {
        const r = parseInt(rowAttr, 10);
        const c = parseInt(colAttr, 10);
        const line = getLineCells(startCell[0], startCell[1], r, c);
        setSelectedIndices(line);
      }
    }
  };

  const handlePointerUpGrid = () => {
    if (!isDragging || completed) return;
    setIsDragging(false);

    if (selectedIndices.length > 0) {
      const isMatch = checkWordSelection(selectedIndices);
      if (!isMatch) {
        setSelectedIndices([]);
        setStartCell(null);
      } else {
        setSelectedIndices([]);
        setStartCell(null);
      }
    }
  };

  return (
    <div className="bg-yellow-50 p-4 sm:p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0px_black] space-y-6 w-full">
      {/* Game Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b-3 border-black pb-3 gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-black text-black uppercase leading-snug break-words">
            🔍 Wykreślanka: Znajdź Słowa
          </h3>
          <p className="text-xs text-black font-bold">
            Przeciągnij palcem/myszką po literach słowa
          </p>
        </div>

        <button
          onClick={generateGrid}
          className="p-2 bg-white text-black border-2 border-black rounded-xl text-xs font-black cursor-pointer hover:bg-yellow-200 shadow-[2px_2px_0px_black] shrink-0 flex items-center gap-1.5 uppercase"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Wymieszaj litery</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Letter Grid Container with drag events */}
        <div className="md:col-span-2 flex justify-center w-full">
          <div
            className="grid bg-white p-1.5 sm:p-3 rounded-2xl border-2 sm:border-4 border-black shadow-[3px_3px_0px_black] sm:shadow-[5px_5px_0px_black] touch-none select-none w-full max-w-[450px] mx-auto gap-1 sm:gap-1.5"
            style={{
              gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))`,
            }}
            onPointerMove={(e) => handlePointerMoveGrid(e.clientX, e.clientY)}
            onPointerUp={handlePointerUpGrid}
            onPointerLeave={handlePointerUpGrid}
            onTouchMove={(e) => {
              if (e.touches.length > 0) {
                handlePointerMoveGrid(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onTouchEnd={handlePointerUpGrid}
          >
            {grid.map((row, r) =>
              row.map((letter, c) => {
                const isSelected = selectedIndices.some(([rowIdx, colIdx]) => rowIdx === r && colIdx === c);
                const isFoundCell = foundCells.some(([rowIdx, colIdx]) => rowIdx === r && colIdx === c);

                return (
                  <button
                    key={`${r}-${c}`}
                    data-row={r}
                    data-col={c}
                    onPointerDown={() => handlePointerDownCell(r, c)}
                    className={`aspect-square w-full h-full text-[clamp(0.6rem,3.5vw,1.1rem)] font-black rounded-md sm:rounded-xl transition-all cursor-pointer flex items-center justify-center select-none border sm:border-2 ${
                      isSelected
                        ? 'bg-[#FF4F81] text-white border-black scale-110 shadow-[2px_2px_0px_black] z-10'
                        : isFoundCell
                        ? 'bg-emerald-400 text-black border-black font-black shadow-[1px_1px_0px_black] rotate-[-1deg]'
                        : 'bg-white hover:bg-yellow-200 text-black border-black hover:scale-105'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Word Checklist */}
        <div className="bg-white p-4 rounded-2xl border-3 border-black shadow-[4px_4px_0px_black]">
          <h4 className="text-xs font-black uppercase tracking-wider text-black mb-3 flex items-center justify-between border-b-2 border-black pb-2">
            <span>Słowa do znalezienia:</span>
            <span className="text-rose-600 font-black">
              {foundWords.length}/{data.words.length}
            </span>
          </h4>

          <div className="space-y-2">
            {[...data.words]
              .sort((a, b) => {
                const aFound = foundWords.includes(a.pl.toUpperCase());
                const bFound = foundWords.includes(b.pl.toUpperCase());
                if (aFound && !bFound) return 1;
                if (!aFound && bFound) return -1;
                return 0;
              })
              .map((w, idx) => {
                const isFound = foundWords.includes(w.pl.toUpperCase());
                return (
                  <div
                    key={w.pl + idx}
                    className={`p-2.5 rounded-xl flex items-center justify-between text-xs sm:text-sm font-black transition border-2 border-black shadow-[2px_2px_0px_black] ${
                      isFound
                        ? 'bg-emerald-300 text-black line-through opacity-75'
                        : 'bg-amber-100 text-black'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isFound ? (
                        <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-black shrink-0" />
                      )}
                      <span className="whitespace-nowrap">{w.pl}</span>
                    </div>
                  </div>
                );
              })}
          </div>

          {completed && (
            <div className="mt-4 p-3.5 bg-emerald-300 border-3 border-black rounded-2xl text-center shadow-[3px_3px_0px_black] space-y-2">
              <span className="text-2xl">🎉</span>
              <p className="text-xs font-black text-black uppercase">
                Wspaniale! Znaleziono wszystkie słowa!
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={generateGrid}
                  className="w-full bg-[#FF4F81] text-white border-2 border-black font-black px-3 py-2 rounded-xl text-xs uppercase cursor-pointer shadow-[2px_2px_0px_black] hover:bg-rose-600 transition"
                >
                  Zagraj Ponownie 🔄
                </button>
                {onNextGame && (
                  <button
                    onClick={onNextGame}
                    className="w-full bg-[#FFD700] text-black border-2 border-black font-black px-3 py-2 rounded-xl text-xs uppercase cursor-pointer shadow-[2px_2px_0px_black] hover:bg-yellow-300 transition"
                  >
                    Przejdź do kolejnej gry ➔
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
