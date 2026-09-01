import React from 'react';

interface FormattedTextProps {
  text: string;
  className?: string;
}

export const FormattedText: React.FC<FormattedTextProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Split by alignment blocks if any, otherwise treat as single block
  const renderFormattedLine = (line: string, key: string | number) => {
    // Check if line is bullet list item
    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('* ');
    const content = isBullet ? line.trim().replace(/^[-•*]\s*/, '') : line;

    // Parse inline styles: bold (**text** or <b>text</b>), italic (*text* or <i>text</i>), 
    // underline (<u>text</u> or __text__), highlight (==text== or [highlight]text[/highlight]),
    // colors ([color=xxx]text[/color])

    const parts: React.ReactNode[] = [];
    let current = content;
    let partKey = 0;

    // Regex matching inline formatting tokens
    const regex = /(\*\*[^*]+\*\*|__[^_]+__|==[^=]+==|<u>[\s\S]*?<\/u>|<b>[\s\S]*?<\/b>|<i>[\s\S]*?<\/i>|\[highlight\][\s\S]*?\[\/highlight\]|\[color=([^\]]+)\]([\s\S]*?)\[\/color\])/;

    while (current.length > 0) {
      const match = current.match(regex);
      if (!match || match.index === undefined) {
        parts.push(current);
        break;
      }

      if (match.index > 0) {
        parts.push(current.substring(0, match.index));
      }

      const matchedToken = match[0];

      if (matchedToken.startsWith('**') && matchedToken.endsWith('**')) {
        parts.push(
          <strong key={`b-${partKey++}`} className="font-black text-black">
            {matchedToken.slice(2, -2)}
          </strong>
        );
      } else if (matchedToken.startsWith('<b>') && matchedToken.endsWith('</b>')) {
        parts.push(
          <strong key={`b2-${partKey++}`} className="font-black text-black">
            {matchedToken.slice(3, -4)}
          </strong>
        );
      } else if (matchedToken.startsWith('__') && matchedToken.endsWith('__')) {
        parts.push(
          <span key={`u-${partKey++}`} className="underline decoration-2 underline-offset-2">
            {matchedToken.slice(2, -2)}
          </span>
        );
      } else if (matchedToken.startsWith('<u>') && matchedToken.endsWith('</u>')) {
        parts.push(
          <span key={`u2-${partKey++}`} className="underline decoration-2 underline-offset-2">
            {matchedToken.slice(3, -4)}
          </span>
        );
      } else if (matchedToken.startsWith('==') && matchedToken.endsWith('==')) {
        parts.push(
          <mark key={`m-${partKey++}`} className="bg-yellow-200 text-black px-1 py-0.5 rounded border border-black/20 font-black">
            {matchedToken.slice(2, -2)}
          </mark>
        );
      } else if (matchedToken.startsWith('[highlight]') && matchedToken.endsWith('[/highlight]')) {
        parts.push(
          <mark key={`m2-${partKey++}`} className="bg-yellow-200 text-black px-1 py-0.5 rounded border border-black/20 font-black">
            {matchedToken.slice(11, -12)}
          </mark>
        );
      } else if (matchedToken.startsWith('<i>') && matchedToken.endsWith('</i>')) {
        parts.push(
          <em key={`i-${partKey++}`} className="italic">
            {matchedToken.slice(3, -4)}
          </em>
        );
      } else if (matchedToken.startsWith('[color=')) {
        const color = match[2];
        const innerText = match[3];
        let colorClass = 'text-[#FF4F81]';
        if (color === 'red' || color === 'czerwony') colorClass = 'text-rose-600';
        else if (color === 'blue' || color === 'niebieski') colorClass = 'text-blue-600';
        else if (color === 'green' || color === 'zielony') colorClass = 'text-emerald-700';
        else if (color === 'purple' || color === 'fioletowy') colorClass = 'text-purple-600';
        else if (color === 'pink' || color === 'rozowy') colorClass = 'text-[#FF4F81]';

        parts.push(
          <span key={`c-${partKey++}`} className={`font-black ${colorClass}`}>
            {innerText}
          </span>
        );
      } else {
        parts.push(matchedToken);
      }

      current = current.substring(match.index + matchedToken.length);
    }

    if (isBullet) {
      return (
        <li key={key} className="flex items-start gap-2 my-1 text-black font-bold">
          <span className="text-[#FF4F81] font-black text-base leading-none select-none">•</span>
          <span className="flex-1">{parts}</span>
        </li>
      );
    }

    return (
      <p key={key} className="my-1.5 leading-relaxed font-bold">
        {parts}
      </p>
    );
  };

  // Check if whole text or sections have alignment tags like [align=center]...[/align]
  const alignRegex = /\[align=(left|center|right|justify)\]([\s\S]*?)\[\/align\]/g;
  const sections: { align?: string; content: string }[] = [];

  let lastIndex = 0;
  let alignMatch: RegExpExecArray | null;

  while ((alignMatch = alignRegex.exec(text)) !== null) {
    if (alignMatch.index > lastIndex) {
      sections.push({ content: text.substring(lastIndex, alignMatch.index) });
    }
    sections.push({
      align: alignMatch[1],
      content: alignMatch[2],
    });
    lastIndex = alignRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    sections.push({ content: text.substring(lastIndex) });
  }

  if (sections.length === 0) {
    sections.push({ content: text });
  }

  return (
    <div className={`space-y-2 text-black ${className}`}>
      {sections.map((section, sIdx) => {
        let alignClass = 'text-left';
        if (section.align === 'center') alignClass = 'text-center';
        else if (section.align === 'right') alignClass = 'text-right';
        else if (section.align === 'justify') alignClass = 'text-justify';

        const lines = section.content.split('\n');

        return (
          <div key={`sec-${sIdx}`} className={alignClass}>
            {lines.map((line, lIdx) => {
              if (line.trim() === '') {
                return <div key={`empty-${lIdx}`} className="h-2" />;
              }
              return renderFormattedLine(line, `l-${sIdx}-${lIdx}`);
            })}
          </div>
        );
      })}
    </div>
  );
};
