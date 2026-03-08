/**
 * Parsed content type.
 */
export type ParsedContentType = {
  boundary: string | undefined;
  charset: string | undefined;
  mediaType: string | undefined;
};

/**
 * Parse content type.
 *
 * @param input
 */
export declare function parseContentType(input: string): ParsedContentType;
