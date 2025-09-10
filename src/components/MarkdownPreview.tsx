import React from 'react';

const MarkdownPreview = ({ content }: { content: string }) => {
  return (
    <div className="space-y-2 text-sm">
      {content.split('\n').map((line, i) => {
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-xl font-semibold mt-4 pb-1">{line.substring(3)}</h2>
        }
        if (line.startsWith('# ')) {
          return <h1 key={i} className="text-2xl font-bold border-b pb-2 mt-6">{line.substring(2)}</h1>
        }
        if (line.startsWith('- ')) {
          return <div key={i} className="flex items-start"><span className="mr-2 mt-1">&#8226;</span><p>{line.substring(2)}</p></div>
        }
        if (line.trim() === '') {
            return <div key={i} className="h-3" />
        }
        return <p key={i}>{line}</p>
      })}
    </div>
  )
}

export default MarkdownPreview;
