'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface BadgeDisplayProps {
  emoji: string;
  text: string;
  score: number;
  showAnimation?: boolean;
}

/**
 * Badge display component
 * Shows achievement badge with emoji and text
 */
export function BadgeDisplay({ emoji, text, score, showAnimation = true }: BadgeDisplayProps) {
  return (
    <Card className={`text-center ${showAnimation ? 'animate-pulse' : ''}`}>
      <CardContent className="pt-6">
        <div className="text-6xl mb-4">{emoji}</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{text}</h3>
        <p className="text-lg text-gray-600">Score: {score}/100</p>
      </CardContent>
    </Card>
  );
}


