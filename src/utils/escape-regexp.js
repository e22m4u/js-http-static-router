/**
 * Экранирует специальные символы в строке
 * для использования в регулярном выражении.
 *
 * @param {*} input
 * @returns {string}
 */
export function escapeRegexp(input) {
  // $& означает всю совпавшую строку.
  return String(input).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
