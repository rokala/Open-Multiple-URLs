const URL_LINE_SPLIT_REGEX = /\r\n?|\n/g;

/**
 * Split text in to lines
 * @param text Text
 */
export function splitLines(text: string): string[] {
  return text
    .split(URL_LINE_SPLIT_REGEX)
    .filter(line => line.trim() !== '')
    .map(line => line.trim());
}