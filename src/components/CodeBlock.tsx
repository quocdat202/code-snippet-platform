"use client";

import { useCallback, useState } from "react";
import { Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  code: string;
  language: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="relative">
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={handleCopy}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
          title="Copy code"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4 text-gray-300" />
          )}
        </button>
      </div>
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
          <span className="text-sm text-gray-300 font-mono">{language}</span>
        </div>
        <pre className="p-4 overflow-x-auto">
          <SyntaxHighlighter language="javascript" style={vscDarkPlus}>
            {code}
          </SyntaxHighlighter>
        </pre>
      </div>
    </div>
  );
}
