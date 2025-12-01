'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface RecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  isProcessing?: boolean;
}

/**
 * Audio recorder component using MediaRecorder API
 * Records user's voice for transcription
 */
export function Recorder({ onRecordingComplete, isProcessing = false }: RecorderProps) {
  const t = useTranslations();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Request microphone permission on mount
  useEffect(() => {
    async function requestPermission() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop immediately, we'll start recording later
        setHasPermission(true);
      } catch (error) {
        console.error('Microphone permission denied:', error);
        setHasPermission(false);
      }
    }
    requestPermission();
  }, []);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000, // Whisper works best with 16kHz
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      // Try to find a supported audio format
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ''; // Use browser default
          }
        }
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Ошибка начала записи:', error);
      alert(t('errors.recordingFailed'));
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (hasPermission === false) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-red-600 font-semibold">
            {t('errors.microphonePermission')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4">
          {isRecording ? (
            <>
              <div className="text-6xl animate-pulse">🎤</div>
              <div className="text-3xl font-bold text-red-600">
                {formatTime(recordingTime)}
              </div>
              <p className="text-lg text-gray-700">{t('trainer.recording')}</p>
              <Button
                onClick={stopRecording}
                variant="danger"
                size="lg"
                disabled={isProcessing}
              >
                {t('trainer.stopRecording')}
              </Button>
            </>
          ) : (
            <>
              <div className="text-6xl">🎙️</div>
              <p className="text-xl font-semibold text-gray-800">
                {t('trainer.readyToRecord')}
              </p>
              <p className="text-base text-gray-600 text-center">
                {t('trainer.clickToStart')}
              </p>
              <Button
                onClick={startRecording}
                variant="primary"
                size="lg"
                disabled={isProcessing || hasPermission === null}
              >
                {t('trainer.startRecording')}
              </Button>
            </>
          )}
          {isProcessing && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin text-4xl">⏳</div>
              <p className="mt-2 text-gray-600">{t('trainer.processing')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

