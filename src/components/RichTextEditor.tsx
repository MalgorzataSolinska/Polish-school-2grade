import React, { useRef, useState } from 'react';
import {
  Bold,
  Underline,
  Italic,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  Palette,
  Eye,
  Edit3,
  CornerDownLeft,
} from 'lucide-react';
import { FormattedText } from './FormattedText';

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  helpText?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Wpisz tekst...',
  rows = 4,
  required = false,
  helpText,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeColor, setActiveColor] = useState<string>('red');

  // Insert or wrap selected text with tag
  const wrapSelection = (before: string, after: string, defaultText = 'wyróżniony tekst') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const replacement = selected ? `${before}${selected}${after}` : `${before}${defaultText}${after}`;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = selected ? start + replacement.length : start + before.length + defaultText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newValue = value.substring(0, start) + text + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 10);
  };

  const applyAlignment = (align: 'left' | 'center' | 'right' | 'justify') => {
    wrapSelection(`[align=${align}]\n`, `\n[/align]`, 'Wpisz wyjustowany lub wyśrodkowany akapit...');
  };

  const applyColor = (colorName: string) => {
    wrapSelection(`[color=${colorName}]`, `[/color]`, 'kolorowy tekst');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="block text-[11px] font-black uppercase text-black">
          {label} {required && <span className="text-rose-600">*</span>}
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`px-2.5 py-1 rounded-lg border-2 border-black text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer transition shadow-[1px_1px_0px_black] ${
              showPreview ? 'bg-[#FF4F81] text-white' : 'bg-yellow-200 text-black hover:bg-yellow-300'
            }`}
          >
            {showPreview ? <Edit3 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            <span>{showPreview ? 'Edytor' : 'Podgląd na żywo'}</span>
          </button>
        </div>
      </div>

      {/* Main Container with Editor and Side Formatting Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-yellow-50/80 p-2.5 rounded-2xl border-2 border-black">
        {/* Left/Top Content Area */}
        <div className="md:col-span-9 flex flex-col space-y-1.5">
          {showPreview ? (
            <div className="p-3 bg-white rounded-xl border-2 border-black min-h-[120px] max-h-[260px] overflow-y-auto">
              <span className="text-[10px] font-black uppercase text-gray-500 block mb-1">
                👁️ Podgląd sformatowanego tekstu:
              </span>
              {value ? (
                <FormattedText text={value} className="text-xs" />
              ) : (
                <p className="text-xs text-gray-400 italic font-bold">Wpisz tekst, aby zobaczyć podgląd...</p>
              )}
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                // When pressing Enter in textarea, make sure it inserts newline without triggering form submit
                if (e.key === 'Enter') {
                  e.stopPropagation();
                }
              }}
              required={required}
              rows={rows}
              placeholder={placeholder}
              className="w-full p-3 rounded-xl border-2 border-black text-xs font-bold bg-white text-black focus:ring-2 focus:ring-[#FF4F81] focus:outline-none leading-relaxed"
            />
          )}

          {helpText && (
            <p className="text-[10px] text-gray-700 font-bold">{helpText}</p>
          )}
        </div>

        {/* Side / Bottom Formatting Controls Panel */}
        <div className="md:col-span-3 bg-white p-2.5 rounded-xl border-2 border-black flex flex-col justify-between space-y-2">
          <div>
            <span className="text-[9px] font-black uppercase text-gray-800 block mb-1 pb-1 border-b border-black/20">
              🛠️ Narzędzia formatowania:
            </span>

            {/* Basic Styles */}
            <div className="grid grid-cols-4 gap-1 mb-2">
              <button
                type="button"
                onClick={() => wrapSelection('**', '**', 'pogrubiony tekst')}
                className="p-1.5 bg-yellow-100 hover:bg-yellow-200 rounded-lg border border-black text-xs font-black flex items-center justify-center cursor-pointer active:scale-95 transition"
                title="Pogrubienie (Bold)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => wrapSelection('<u>', '</u>', 'podkreślony tekst')}
                className="p-1.5 bg-yellow-100 hover:bg-yellow-200 rounded-lg border border-black text-xs font-black flex items-center justify-center cursor-pointer active:scale-95 transition"
                title="Podkreślenie (Underline)"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => wrapSelection('<i>', '</i>', 'pochylony tekst')}
                className="p-1.5 bg-yellow-100 hover:bg-yellow-200 rounded-lg border border-black text-xs font-black flex items-center justify-center cursor-pointer active:scale-95 transition"
                title="Kursywa (Italic)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => wrapSelection('==', '==', 'wyróżnienie')}
                className="p-1.5 bg-amber-200 hover:bg-amber-300 rounded-lg border border-black text-xs font-black flex items-center justify-center cursor-pointer active:scale-95 transition"
                title="Żółty marker wyróżnienia"
              >
                <Highlighter className="w-3.5 h-3.5 text-amber-900" />
              </button>
            </div>

            {/* Alignments */}
            <span className="text-[9px] font-black uppercase text-gray-700 block mb-1">Wyrównanie:</span>
            <div className="grid grid-cols-4 gap-1 mb-2">
              <button
                type="button"
                onClick={() => applyAlignment('left')}
                className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg border border-black text-xs flex items-center justify-center cursor-pointer active:scale-95 transition"
                title="Wyrównaj do lewej"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => applyAlignment('center')}
                className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg border border-black text-xs flex items-center justify-center cursor-pointer active:scale-95 transition"
                title="Wyśrodkuj"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => applyAlignment('right')}
                className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg border border-black text-xs flex items-center justify-center cursor-pointer active:scale-95 transition"
                title="Wyrównaj do prawej"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => applyAlignment('justify')}
                className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg border border-black text-xs flex items-center justify-center cursor-pointer active:scale-95 transition"
                title="Wyjustuj tekst (obie strony)"
              >
                <AlignJustify className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Colors */}
            <span className="text-[9px] font-black uppercase text-gray-700 block mb-1">Kolor tekstu:</span>
            <div className="flex items-center gap-1 mb-2">
              <button
                type="button"
                onClick={() => applyColor('red')}
                className="w-5 h-5 rounded-full bg-rose-600 border border-black hover:scale-110 transition cursor-pointer"
                title="Czerwony"
              />
              <button
                type="button"
                onClick={() => applyColor('blue')}
                className="w-5 h-5 rounded-full bg-blue-600 border border-black hover:scale-110 transition cursor-pointer"
                title="Niebieski"
              />
              <button
                type="button"
                onClick={() => applyColor('green')}
                className="w-5 h-5 rounded-full bg-emerald-600 border border-black hover:scale-110 transition cursor-pointer"
                title="Zielony"
              />
              <button
                type="button"
                onClick={() => applyColor('pink')}
                className="w-5 h-5 rounded-full bg-[#FF4F81] border border-black hover:scale-110 transition cursor-pointer"
                title="Różowy"
              />
            </div>
          </div>

          {/* Quick Insert helpers: New line & Bullet */}
          <div className="pt-1.5 border-t border-black/20 space-y-1">
            <button
              type="button"
              onClick={() => insertAtCursor('\n• ')}
              className="w-full py-1 px-1.5 bg-yellow-100 hover:bg-yellow-200 text-black rounded-lg border border-black text-[10px] font-black flex items-center justify-center gap-1 cursor-pointer"
            >
              <List className="w-3 h-3 text-[#FF4F81]" />
              <span>+ Punkt listy (•)</span>
            </button>
            <button
              type="button"
              onClick={() => insertAtCursor('\n\n')}
              className="w-full py-1 px-1.5 bg-blue-50 hover:bg-blue-100 text-black rounded-lg border border-black text-[10px] font-black flex items-center justify-center gap-1 cursor-pointer"
            >
              <CornerDownLeft className="w-3 h-3 text-blue-600" />
              <span>+ Nowy akapit (↵)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
