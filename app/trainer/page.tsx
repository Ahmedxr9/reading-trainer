'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Recorder } from '@/components/trainer/Recorder';
import { TranscriptDiff } from '@/components/trainer/TranscriptDiff';
import { ScoreCard } from '@/components/trainer/ScoreCard';
import { Mascot } from '@/components/game/Mascot';
import { transcribeFromBuffer } from '@/lib/whisper';
import { calculateWER, calculateScore, calculateXP } from '@/lib/diff';
import { ReadingText, DifficultyLevel } from '@/types/text';
import { ReadingResult } from '@/types/results';
import { supabase } from '@/lib/supabase';

export default function TrainerPage() {
  const router = useRouter();
  const t = useTranslations();
  const [selectedText, setSelectedText] = useState<ReadingText | null>(null);
  const [texts, setTexts] = useState<ReadingText[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingTexts, setIsLoadingTexts] = useState(true);
  const [result, setResult] = useState<{
    transcript: string;
    score: number;
    wer: number;
    substitutions: number;
    insertions: number;
    deletions: number;
    errors: any[];
  } | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

  // Загрузка текстов из Supabase
  useEffect(() => {
    async function loadTexts() {
      try {
        const { data, error } = await supabase
          .from('reading_texts')
          .select('*')
          .eq('is_active', true)
          .order('difficulty', { ascending: true });

        if (error) {
          console.error('Ошибка загрузки текстов:', error);
          // Fallback на локальные тексты если Supabase недоступен
          const localTexts = await import('@/data/texts.json');
          setTexts(localTexts.default as ReadingText[]);
        } else if (data && data.length > 0) {
          // Преобразуем данные из Supabase в формат ReadingText
          const formattedTexts: ReadingText[] = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            content: item.content,
            difficulty: item.difficulty,
            wordCount: item.word_count,
            category: item.category,
          }));
          setTexts(formattedTexts);
        } else {
          // Если нет текстов в БД, используем локальные
          const localTexts = await import('@/data/texts.json');
          setTexts(localTexts.default as ReadingText[]);
        }
      } catch (error) {
        console.error('Ошибка при загрузке текстов:', error);
        // Fallback на локальные тексты
        const localTexts = await import('@/data/texts.json');
        setTexts(localTexts.default as ReadingText[]);
      } finally {
        setIsLoadingTexts(false);
      }
    }

    loadTexts();
  }, []);

  // Проверка авторизации
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      // Разрешаем доступ даже без авторизации (анонимное использование)
    }
    checkAuth();
  }, []);

  // Обработка выбора текста
  const handleTextSelect = (text: ReadingText) => {
    setSelectedText(text);
    setResult(null);
    setAudioBuffer(null);
  };

  // Обработка завершения записи
  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      // Декодируем аудио
      const audioContext = new AudioContext({ sampleRate: 16000 });
      const buffer = await audioContext.decodeAudioData(await audioBlob.arrayBuffer());
      setAudioBuffer(buffer);

      // Транскрибируем с помощью Whisper
      const transcript = await transcribeFromBuffer(buffer);

      if (!selectedText) {
        throw new Error('Текст не выбран');
      }

      // Вычисляем WER и ошибки
      const werResult = calculateWER(selectedText.content, transcript);
      const score = calculateScore(werResult.wer);
      const xpGained = calculateXP(score, selectedText.difficulty);

      setResult({
        transcript,
        score,
        wer: werResult.wer,
        substitutions: werResult.substitutions,
        insertions: werResult.insertions,
        deletions: werResult.deletions,
        errors: werResult.errors,
      });

      // Сохраняем результат в базу данных
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const readingResult: Omit<ReadingResult, 'id' | 'timestamp'> = {
          userId: user?.id || `anon_${Date.now()}`,
          textId: selectedText.id,
          score,
          wer: werResult.wer,
          levenshteinDistance: 0,
          substitutions: werResult.substitutions,
          insertions: werResult.insertions,
          deletions: werResult.deletions,
          transcript,
          reference: selectedText.content,
        };

        // Сохраняем в Supabase
        const saveResponse = await fetch('/api/saveResult', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(readingResult),
        });

        if (!saveResponse.ok) {
          console.warn('Не удалось сохранить результат:', await saveResponse.text());
        }

        // Обновляем XP пользователя, если он авторизован
        if (user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('xp, level')
            .eq('id', user.id)
            .single();

          if (profile) {
            const newXP = profile.xp + xpGained;
            const newLevel = Math.floor(newXP / 100) + 1;

            await supabase
              .from('user_profiles')
              .update({ xp: newXP, level: newLevel })
              .eq('id', user.id);
          }
        }
      } catch (error) {
        console.warn('Ошибка сохранения результата:', error);
        // Продолжаем работу - результат все равно показан пользователю
      }
    } catch (error) {
      console.error('Ошибка обработки записи:', error);
      alert(t('errors.processingFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Текст-в-речь для справочного текста
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      utterance.lang = 'ru-RU';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Фильтрация текстов по сложности
  const textsByDifficulty = {
    easy: texts.filter((t: ReadingText) => t.difficulty === 'easy'),
    medium: texts.filter((t: ReadingText) => t.difficulty === 'medium'),
    hard: texts.filter((t: ReadingText) => t.difficulty === 'hard'),
  };

  const getDifficultyLabel = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'easy':
        return t('trainer.easyLevel');
      case 'medium':
        return t('trainer.mediumLevel');
      case 'hard':
        return t('trainer.hardLevel');
    }
  };

  if (isLoadingTexts) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl animate-spin">⏳</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            {t('trainer.title')}
          </h1>
          <Mascot
            emotion={result ? (result.score >= 90 ? 'proud' : result.score >= 70 ? 'excited' : 'encouraging') : 'happy'}
            size="medium"
          />
        </div>

        {!selectedText ? (
          // Выбор текста
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">{t('trainer.chooseText')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((difficulty) => (
                    <div key={difficulty}>
                      <h3 className="text-xl font-semibold mb-3 text-gray-800">
                        {getDifficultyLabel(difficulty)}
                      </h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {textsByDifficulty[difficulty].map((text: ReadingText) => (
                          <Card
                            key={text.id}
                            className="cursor-pointer hover:shadow-xl transition-shadow"
                            onClick={() => handleTextSelect(text)}
                          >
                            <CardContent className="pt-6">
                              <h4 className="font-bold text-lg mb-2">{text.title}</h4>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                                {text.content.substring(0, 100)}...
                              </p>
                              <p className="text-xs text-gray-500">
                                {text.wordCount} {t('trainer.words')}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : !result ? (
          // Фаза записи
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{selectedText.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                    <p className="text-lg leading-relaxed text-gray-800">
                      {selectedText.content}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => speakText(selectedText.content)}
                      variant="secondary"
                      size="md"
                    >
                      {t('trainer.listenToText')}
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedText(null);
                        setResult(null);
                      }}
                      variant="default"
                      size="md"
                    >
                      {t('trainer.chooseDifferent')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Recorder
              onRecordingComplete={handleRecordingComplete}
              isProcessing={isProcessing}
            />
          </div>
        ) : (
          // Фаза результатов
          <div className="space-y-6">
            <ScoreCard
              score={result.score}
              wer={result.wer}
              substitutions={result.substitutions}
              insertions={result.insertions}
              deletions={result.deletions}
              difficulty={selectedText.difficulty}
              xpGained={calculateXP(result.score, selectedText.difficulty)}
            />

            <TranscriptDiff
              reference={selectedText.content}
              transcript={result.transcript}
              errors={result.errors}
            />

            <div className="flex justify-center gap-4">
              <Button
                onClick={() => {
                  setSelectedText(null);
                  setResult(null);
                  setAudioBuffer(null);
                }}
                variant="primary"
                size="lg"
              >
                {t('trainer.tryAnother')}
              </Button>
              <Button
                onClick={() => router.push('/profile')}
                variant="secondary"
                size="lg"
              >
                {t('trainer.viewProfile')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
