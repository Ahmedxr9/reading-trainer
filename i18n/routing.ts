import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['ru'],
  defaultLocale: 'ru',
  localePrefix: 'never', // Не показывать префикс /ru в URL
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);

