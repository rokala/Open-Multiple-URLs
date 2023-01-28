import Pattern from 'url-knife';

export {};

/**
 * Extract URLs from text
 * @param text Text
 */
export function extractURLs(text: string, method: string): string {
  let urls: string[];
  switch (method) {
    case 'url-knife':
      urls = Pattern.TextArea.extractAllUrls(text, {
        'ip_v4': true,
        'ip_v6': true,
        'localhost': true,
        'intranet': false
      })
      .map(res => res.value.url);
      break;
    case 'regex-alpha':
      const regexAlpha = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()[\]{};:'".,<>?«»“”‘’]))/gi;
      urls = text.match(regexAlpha);
      break;
    case 'regex-beta':
      const regexBeta = /(\b(https?|ftp|file|chrome|about):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
      urls = text.match(regexBeta);
    default:
      throw new Error(`Unknown extraction method '${method}' selected.`);
  }
  return urls.join('\n');
}
