'use client';

import Editor from '@monaco-editor/react';

interface CodePreviewProps {
  code: string;
  language: string;
}

export default function CodePreview({ code, language }: CodePreviewProps) {
  return (
    <div className="h-[600px]">
      <Editor
        height="100%"
        language={language}
        value={code}
        theme="vs-dark"
        options={{
          readOnly: true,
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
        }}
      />
    </div>
  );
}
