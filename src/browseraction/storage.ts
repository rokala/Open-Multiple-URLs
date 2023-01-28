import browser from 'webextension-polyfill';

export enum StorageKey {
  urlList = 'txt',
  lazyload = 'lazyload',
  openSequence = 'openSequence',
  ignoreDuplicates = 'ignore-duplicates',
  preserve = 'preserve',
  extractMethod = 'extractMethod'
}

export interface StoredOptions {
  [StorageKey.urlList]: string;
  [StorageKey.lazyload]: boolean;
  [StorageKey.openSequence]: number;
  [StorageKey.ignoreDuplicates]: boolean;
  [StorageKey.preserve]: boolean;
  [StorageKey.extractMethod]: number;
}

export async function getStoredOptions(): Promise<StoredOptions> {
  const txtVal = await browser.storage.local.get(StorageKey.urlList);
  const lazyloadVal = await browser.storage.local.get(StorageKey.lazyload);
  const openSequenceVal = await browser.storage.local.get(StorageKey.openSequence);
  const ignoreDuplicatesVal = await browser.storage.local.get(StorageKey.ignoreDuplicates);
  const preserveVal = await browser.storage.local.get(StorageKey.preserve);
  const extractMethod = await browser.storage.local.get(StorageKey.extractMethod);

  return {
    txt: txtVal?.txt || '',
    lazyload: lazyloadVal?.lazyload || false,
    openSequence: openSequenceVal?.openSequence || 0,
    ignoreDuplicates: ignoreDuplicatesVal?.ignoreDuplicates || false,
    preserve: txtVal?.txt || preserveVal?.preserve || false,
    extractMethod: extractMethod?.extractMethod || 0,
  };
}

export async function storeValue<T>(key: StorageKey, value: T): Promise<void> {
  await browser.storage.local.set({ [key]: value });
}
