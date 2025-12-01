'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XPProgress } from '@/components/game/XPProgress';
import { Mascot } from '@/components/game/Mascot';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { UserProfile } from '@/types/user';
import { ReadingResult } from '@/types/results';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [results, setResults] = useState<ReadingResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!isSupabaseConfigured) {
        // Show demo message
        setUser({
          id: 'demo',
          email: 'demo@example.com',
          xp: 0,
          level: 1,
          streak: 0,
          createdAt: new Date().toISOString(),
          totalSessions: 0,
          averageScore: 0,
          badges: [],
        });
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      try {
        // Load user profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error loading profile:', profileError);
          // Create profile if it doesn't exist
          const { data: newProfile } = await supabase
            .from('user_profiles')
            .insert({
              id: session.user.id,
              email: session.user.email,
              xp: 0,
              level: 1,
              streak: 0,
            })
            .select()
            .single();
          
          if (newProfile) {
            setUser({
              ...newProfile,
              totalSessions: 0,
              averageScore: 0,
              badges: [],
            });
          }
        } else {
          // Load reading results
          const { data: readingResults, error: resultsError } = await supabase
            .from('reading_results')
            .select('*')
            .eq('user_id', session.user.id)
            .order('timestamp', { ascending: false })
            .limit(50);

          if (resultsError) {
            console.error('Error loading results:', resultsError);
          } else {
            setResults(readingResults || []);
          }

          // Calculate stats
          const totalSessions = readingResults?.length || 0;
          const averageScore = readingResults && readingResults.length > 0
            ? Math.round(readingResults.reduce((sum, r) => sum + r.score, 0) / readingResults.length)
            : 0;

          setUser({
            ...profile,
            totalSessions,
            averageScore,
            badges: [], // Can be calculated based on achievements
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Prepare chart data
  const chartData = results
    .slice()
    .reverse()
    .map((result, index) => ({
      session: index + 1,
      score: result.score,
      date: new Date(result.timestamp).toLocaleDateString(),
    }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl animate-spin">⏳</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            📊 Your Profile
          </h1>
          <Mascot emotion="proud" size="medium" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* User Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Your Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-lg">
                  <span className="font-semibold">Name:</span> {user.name || user.email}
                </p>
                {user.age && (
                  <p className="text-lg">
                    <span className="font-semibold">Age:</span> {user.age}
                  </p>
                )}
                <p className="text-lg">
                  <span className="font-semibold">Total Sessions:</span> {user.totalSessions}
                </p>
                <p className="text-lg">
                  <span className="font-semibold">Average Score:</span> {user.averageScore}/100
                </p>
                <p className="text-lg">
                  <span className="font-semibold">Current Streak:</span> {user.streak} days 🔥
                </p>
              </div>
            </CardContent>
          </Card>

          {/* XP Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <XPProgress
                currentXP={user.xp}
                level={user.level}
                xpForNextLevel={100}
              />
            </CardContent>
          </Card>
        </div>

        {/* Progress Chart */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Reading Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="session" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#667eea"
                    strokeWidth={3}
                    dot={{ fill: '#764ba2', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Recent Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Recent Reading Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.slice(0, 10).map((result) => (
                  <div
                    key={result.id}
                    className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-lg">Score: {result.score}/100</p>
                        <p className="text-sm text-gray-600">
                          {new Date(result.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          WER: {(result.wer * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500">
                          S:{result.substitutions} I:{result.insertions} D:{result.deletions}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button onClick={() => router.push('/trainer')} variant="primary" size="lg">
            Start Reading Practice
          </Button>
          <Button onClick={handleLogout} variant="secondary" size="lg">
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}


