
import React from 'react';

const MarkdownPreview = ({ content }: { content: string }) => {
  // Regex to find markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  const renderLine = (line: string) => {
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(line)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }
      // Add the link
      const [fullMatch, text, url] = match;
      parts.push(
        <a
          key={url + text}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:text-primary/80"
        >
          {text}
        </a>
      );
      lastIndex = match.index + fullMatch.length;
    }

    // Add any remaining text after the last link
    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }
    
    return parts.length > 0 ? <>{parts}</> : line;
  };
  
  return (
    <div className="space-y-2 text-sm">
      {content.split('\n').map((line, i) => {
        if (line.startsWith('### ')) {
            return <h3 key={i} className="text-lg font-semibold mt-3">{line.substring(4)}</h3>
        }
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-xl font-semibold mt-4 pb-1 border-b">{line.substring(3)}</h2>
        }
        if (line.startsWith('# ')) {
          return <h1 key={i} className="text-2xl font-bold border-b pb-2 mt-6">{line.substring(2)}</h1>
        }
        if (line.startsWith('**')) {
            const boldEnd = line.indexOf('**', 2);
            if (boldEnd !== -1) {
                return <p key={i}><strong className="font-semibold">{line.substring(2, boldEnd)}</strong>{renderLine(line.substring(boldEnd + 2))}</p>
            }
        }
        if (line.startsWith('- ')) {
          return <div key={i} className="flex items-start"><span className="mr-2 mt-1">&#8226;</span><p>{renderLine(line.substring(2))}</p></div>
        }
        if (line.trim() === '') {
            return <div key={i} className="h-3" />
        }
        return <p key={i}>{renderLine(line)}</p>
      })}
    </div>
  )
}

export default MarkdownPreview;
