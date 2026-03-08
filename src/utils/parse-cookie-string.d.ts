/**
 * Parsed cookies.
 */
type ParsedCookies = {
  [key: string]: string | undefined;
};

/**
 * Parse cookie string.
 *
 * @example
 * ```ts
 * parseCookieString('pkg=math; equation=E%3Dmc%5E2');
 * // {pkg: 'math', equation: 'E=mc^2'}
 * ```
 *
 * @param input
 */
export declare function parseCookieString(input: string): ParsedCookies;
