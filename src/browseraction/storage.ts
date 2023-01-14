import browser from 'webextension-polyfill';

export enum StorageKey {
  urlList = 'txt',
  lazyload = 'lazyload',
  orderSequence = 'orderSequence',
  ignoreDuplicates = 'ignoreDuplicates',
  preserve = 'preserve',
}

export interface StoredOptions {
  [StorageKey.urlList]: string;
  [StorageKey.lazyload]: boolean;
  [StorageKey.orderSequence]: number;
  [StorageKey.ignoreDuplicates]: boolean;
  [StorageKey.preserve]: boolean;
}

export async function getStoredOptions(): Promise<StoredOptions> {
  const txtVal = await browser.storage.local.get(StorageKey.urlList);
  const lazyloadVal = await browser.storage.local.get(StorageKey.lazyload);
  const orderSequenceVal = await browser.storage.local.get(StorageKey.orderSequence);
  const ignoreDuplicatesVal = await browser.storage.local.get(StorageKey.ignoreDuplicates);
  const preserveVal = await browser.storage.local.get(StorageKey.preserve);

  return {
    txt: txtVal?.txt || '',
    lazyload: lazyloadVal?.lazyload || false,
    orderSequence: orderSequenceVal?.orderSequence || 0,
    ignoreDuplicates: ignoreDuplicatesVal?.ignoreDuplicates || false,
    preserve: txtVal?.txt || preserveVal?.preserve || false,
  };
}

export async function storeValue<T>(key: StorageKey, value: T): Promise<void> {
  await browser.storage.local.set({ [key]: value });
}
