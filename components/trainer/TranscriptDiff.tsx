'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorDetail } from '@/types/results';

interface TranscriptDiffProps {
  reference: string;
  transcript: string;
  errors: ErrorDetail[];
}

/**
 * Component that displays the reference text with highlighted errors
 * Shows substitutions, insertions, and deletions with different colors
 */
export function TranscriptDiff({ reference, transcript, errors }: TranscriptDiffProps) {
  // Tokenize reference text
  const refWords = reference
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0);

  // Create a map of error positions
  const errorMap = new Map<number, ErrorDetail>();
  errors.forEach(error => {
    errorMap.set(error.position, error);
  });

  // Get original reference words with punctuation preserved
  const originalRefWords = reference.split(/(\s+)/);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Your Reading vs Reference</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Reference text with highlights */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Reference Text:</h3>
            <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
              <p className="text-lg leading-relaxed">
                {originalRefWords.map((word, index) => {
                  const cleanWord = word.trim().toLowerCase().replace(/[^\w]/g, '');
                  if (!cleanWord) return word;
                  
                  const wordIndex = refWords.indexOf(cleanWord);
                  const error = wordIndex !== -1 ? errorMap.get(wordIndex) : null;
                  
                  if (error?.type === 'substitution') {
                    return (
                      <span key={index} className="bg-yellow-200 underline decoration-2 decoration-yellow-500">
                        {word}
                      </span>
                    );
                  } else if (error?.type === 'deletion') {
                    return (
                      <span key={index} className="bg-red-200 line-through decoration-2 decoration-red-500">
                        {word}
                      </span>
                    );
                  }
                  return <span key={index}>{word}</span>;
                })}
              </p>
            </div>
          </div>

          {/* Transcript */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-700">What You Read:</h3>
            <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
              <p className="text-lg leading-relaxed text-gray-800">{transcript || 'No transcript available'}</p>
            </div>
          </div>

          {/* Error legend */}
          {errors.length > 0 && (
            <div className="mt-4 p-4 bg-gray-100 rounded-xl">
              <h4 className="font-semibold mb-2">Legend:</h4>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-2">
                  <span className="bg-yellow-200 px-2 py-1 rounded">Yellow</span>
                  <span>Wrong word (substitution)</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="bg-red-200 line-through px-2 py-1 rounded">Red</span>
                  <span>Missing word (deletion)</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="bg-green-200 px-2 py-1 rounded">Green</span>
                  <span>Extra word (insertion)</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


