'use client';

import React from 'react';

/**
 * Friendly mascot component for the reading trainer
 * Uses emoji and animations to create a playful character
 */
export function Mascot({ emotion = 'happy', size = 'large' }: { emotion?: 'happy' | 'excited' | 'proud' | 'encouraging'; size?: 'small' | 'medium' | 'large' }) {
  const emojiMap = {
    happy: '😊',
    excited: '🎉',
    proud: '⭐',
    encouraging: '💪',
  };

  const sizeClasses = {
    small: 'text-4xl',
    medium: 'text-6xl',
    large: 'text-8xl',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`${sizeClasses[size]} animate-bounce`}
        style={{ animationDuration: '2s' }}
        role="img"
        aria-label={`Mascot feeling ${emotion}`}
      >
        {emojiMap[emotion]}
      </div>
      <p className="mt-2 text-lg font-semibold text-gray-700">
        {emotion === 'happy' && "Hi! Let's read together!"}
        {emotion === 'excited' && "Wow! You're doing great!"}
        {emotion === 'proud' && "I'm so proud of you!"}
        {emotion === 'encouraging' && "You can do it! Keep trying!"}
      </p>
    </div>
  );
}


