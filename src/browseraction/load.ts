import browser from 'webextension-polyfill';
import { splitLines } from './splitter';

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
  let j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

/**
 * Loads sites in new background tabs
 * @param text Text containing one URL per line
 * @param lazyloading Lazy-load tabs
 * @param random Open tabs in random order
 */
export function loadSites(
  text: string,
  lazyloading: boolean,
  openingSequence: string,
  ignoreDuplicates: boolean
): void {
  const urlschemes = ['http', 'https', 'file', 'view-source'];
  let urls = splitLines(text);

  switch (openingSequence) {
    case 'reverse':
      urls = urls.reverse();
      break;
    case 'random':
      urls = shuffle(urls);
      break;
    default:
      // Open tabs in chronological order, thus do nothing.
  }

  if (ignoreDuplicates) {
    urls = urls.reduce((uniqueUrls, url) => uniqueUrls.includes(url) ? uniqueUrls : [...uniqueUrls, url], []);
  }

  if (urls.length > 99 && !confirm(`You're about to open ${urls.length} tabs. Are you sure?`)) {
    // Abort tab open
    return;
  }

  for (let i = 0; i < urls.length; i++) {
    let theurl = urls[i].trim();
    if (theurl !== '') {
      if (urlschemes.indexOf(theurl.split(':')[0]) === -1) {
        theurl = 'http://' + theurl;
      }
      if (
        lazyloading &&
        theurl.split(':')[0] !== 'view-source' &&
        theurl.split(':')[0] !== 'file'
      ) {
        browser.tabs.create({
          url: browser.runtime.getURL('lazyloading.html#') + theurl,
          active: false,
        });
      } else {
        browser.tabs.create({
          url: theurl,
          active: false,
        });
      }
    }
  }
}
