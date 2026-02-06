/**
 * Normalize path.
 *
 * Заменяет любые повторяющиеся слеши на один.
 * Удаляет пробельные символы в начале и конце.
 * Удаляет слеш в конце строки.
 * Гарантирует слеш в начале строки (по умолчанию).
 *
 * @param value
 * @param noStartingSlash
 */
export function normalizePath(value: string, noStartingSlash?: boolean): string;
