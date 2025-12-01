import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async () => {
  // Принудительно используем русский язык
  const locale = 'ru';

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});

