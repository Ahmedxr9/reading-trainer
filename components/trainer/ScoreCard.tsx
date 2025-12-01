'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BadgeDisplay } from '@/components/game/BadgeDisplay';
import { getBadge, calculateXP } from '@/lib/diff';
import { DifficultyLevel } from '@/types/text';

interface ScoreCardProps {
  score: number;
  wer: number;
  substitutions: number;
  insertions: number;
  deletions: number;
  difficulty: DifficultyLevel;
  xpGained: number;
}

/**
 * Score card component displaying reading results
 * Shows score, WER, error breakdown, and XP gained
 */
export function ScoreCard({
  score,
  wer,
  substitutions,
  insertions,
  deletions,
  difficulty,
  xpGained,
}: ScoreCardProps) {
  const badge = getBadge(score);

  return (
    <div className="space-y-6">
      <BadgeDisplay emoji={badge.emoji} text={badge.text} score={score} />

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">{score}</div>
              <div className="text-xl text-gray-600">out of 100</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-700">{(wer * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Word Error Rate</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-700">+{xpGained}</div>
                <div className="text-sm text-gray-600">XP Gained</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-semibold mb-3 text-gray-800">Error Breakdown:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Substitutions (wrong words):</span>
                  <span className="font-semibold text-yellow-600">{substitutions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Insertions (extra words):</span>
                  <span className="font-semibold text-green-600">{insertions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Deletions (missing words):</span>
                  <span className="font-semibold text-red-600">{deletions}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


