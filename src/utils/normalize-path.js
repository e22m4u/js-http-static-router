/**
 * Normalize path.
 *
 * Заменяет любые повторяющиеся слеши на один.
 * Удаляет пробельные символы в начале и конце.
 * Удаляет слеш в конце строки.
 * Гарантирует слеш в начале строки (по умолчанию).
 *
 * @param {string} value
 * @param {boolean} [noStartingSlash]
 * @returns {string}
 */
export function normalizePath(value, noStartingSlash = false) {
  if (typeof value !== 'string') {
    return '/';
  }
  const res = value
    .trim()
    .replace(/\/+/g, '/')
    .replace(/(^\/|\/$)/g, '');
  return noStartingSlash ? res : '/' + res;
}
