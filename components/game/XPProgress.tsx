'use client';

import React from 'react';

interface XPProgressProps {
  currentXP: number;
  level: number;
  xpForNextLevel?: number;
  xpGained?: number;
}

/**
 * XP Progress bar component
 * Shows current XP, level, and progress to next level
 */
export function XPProgress({ currentXP, level, xpForNextLevel = 100, xpGained }: XPProgressProps) {
  // Calculate XP needed for current level (simplified: each level needs 100 more XP)
  const xpForCurrentLevel = (level - 1) * 100;
  const xpInCurrentLevel = currentXP - xpForCurrentLevel;
  const progress = Math.min(100, (xpInCurrentLevel / xpForNextLevel) * 100);

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-purple-600">Level {level}</span>
          {xpGained && xpGained > 0 && (
            <span className="text-lg font-semibold text-green-600 animate-pulse">
              +{xpGained} XP
            </span>
          )}
        </div>
        <span className="text-lg font-semibold text-gray-700">{currentXP} XP</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-gray-600 text-center">
        {xpInCurrentLevel} / {xpForNextLevel} XP to Level {level + 1}
      </p>
    </div>
  );
}


