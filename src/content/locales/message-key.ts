import type { IdMessages } from '@/content/locales/id';

/** Every product string is addressed by a stable semantic key, never by an Indonesian sentence. */
export type MessageKey = keyof IdMessages;

export type MessageParams = Readonly<Record<string, string | number>>;
