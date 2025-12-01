import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ReadingResult } from '@/types/results';

/**
 * API Route: Сохранение результата чтения
 * Сохраняет результаты чтения в Supabase, поддерживает анонимное сохранение
 */
export async function POST(request: NextRequest) {
  try {
    const body: Omit<ReadingResult, 'id' | 'timestamp'> = await request.json();

    // Проверяем авторизацию пользователя
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    let userId: string;
    
    if (authError || !user) {
      // Анонимное сохранение - создаем временный ID
      userId = `anon_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    } else {
      userId = user.id;
      
      // Проверяем, что пользователь сохраняет только свои результаты
      if (user.id !== body.userId) {
        return NextResponse.json(
          { error: 'Запрещено', message: 'Нельзя сохранять результаты другого пользователя' },
          { status: 403 }
        );
      }
    }

    // Вставляем результат в базу данных
    const { data, error } = await supabase
      .from('reading_results')
      .insert({
        user_id: userId,
        text_id: body.textId,
        score: body.score,
        wer: body.wer,
        levenshtein_distance: body.levenshteinDistance,
        substitutions: body.substitutions,
        insertions: body.insertions,
        deletions: body.deletions,
        transcript: body.transcript,
        reference: body.reference,
      })
      .select()
      .single();

    if (error) {
      console.error('Ошибка сохранения результата:', error);
      return NextResponse.json(
        { error: 'Ошибка сохранения', message: 'Не удалось сохранить результат' },
        { status: 500 }
      );
    }

    // Если пользователь авторизован, обновляем его XP
    if (!authError && user) {
      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('xp, level')
          .eq('id', user.id)
          .single();

        if (profile) {
          // XP рассчитывается на клиенте, здесь просто обновляем
          // Клиент должен передать новое значение XP
        }
      } catch (profileError) {
        console.error('Ошибка обновления профиля:', profileError);
        // Не критично, результат уже сохранен
      }
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    console.error('Ошибка в API saveResult:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка', message: error.message || 'Произошла неизвестная ошибка' },
      { status: 500 }
    );
  }
}
