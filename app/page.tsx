'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mascot } from '@/components/game/Mascot';

export default function Home() {
  const t = useTranslations();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
            {t('home.title')}
          </h1>
          <p className="text-2xl text-white/90 mb-8">
            {t('home.subtitle')}
          </p>
        </div>

        <Mascot emotion="happy" size="large" />

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{t('home.startTraining')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                {t('home.startTrainingDesc')}
              </p>
              <Link href="/trainer">
                <Button variant="primary" size="lg" className="w-full">
                  {t('home.startTraining')}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{t('home.viewProgress')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                {t('home.viewProgressDesc')}
              </p>
              <Link href="/profile">
                <Button variant="secondary" size="lg" className="w-full">
                  {t('home.viewProgress')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Link href="/auth/login">
            <Button variant="default" size="md">
              {t('home.loginSignUp')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
