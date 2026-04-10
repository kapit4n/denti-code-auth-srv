/** Single source of truth for allowed UI languages. Add entries here and ship matching JSON on the frontend. */
export const SUPPORTED_LOCALE_CODES = ['en', 'es'] as const;

export type SupportedLocaleCode = (typeof SUPPORTED_LOCALE_CODES)[number];

export const SUPPORTED_LOCALES_PUBLIC: ReadonlyArray<{
  code: SupportedLocaleCode;
  label: string;
}> = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
];

export function isSupportedLocale(code: string): code is SupportedLocaleCode {
  return (SUPPORTED_LOCALE_CODES as readonly string[]).includes(code);
}
