import {
  init,
  SAVE_URL_LIST_DEBOUNCE_TIME_MS,
  UPDATE_TAB_COUNT_DEBOUNCE_TIME_MS,
} from '..';
import { extractURLs } from '../extract';
import { loadSites } from '../load';
import { getStoredOptions, StorageKey, storeValue } from '../storage';
import { getUIMain } from '../ui';
import * as fs from 'fs';

const BODY_HTML = fs.readFileSync('./src/browseraction.html', 'utf-8');

let mockStore = {};
jest.mock('../load', () => ({
  ...jest.requireActual('../load'),
  loadSites: jest.fn()
}));
jest.mock('../extract');
jest.mock('webextension-polyfill', () => ({
  tabs: { create: jest.fn() },
  runtime: { getURL: (val: string) => val },
  storage: {
    local: {
      get: (key: string) => {
        return { [key]: mockStore[key] };
      },
      set: (val: any) => (mockStore = { ...mockStore, ...val }), // eslint-disable-line @typescript-eslint/no-explicit-any
    },
  },
}));

const sleep = async (timeInMs: number) => {
  await new Promise((r) => setTimeout(r, timeInMs));
};

describe('test browser action', () => {
  beforeEach(async () => {
    mockStore = {};
    document.body.innerHTML = BODY_HTML;
  });

  test('init and render elements', async () => {
    await init();

    const uiDef = getUIMain();
    expect(uiDef.input.textareaInput).toBeTruthy();
    expect(uiDef.open.checkboxLazyLoad).toBeTruthy();
    expect(uiDef.open.selectSequence).toBeTruthy();
    expect(uiDef.open.checkboxIgnoreDuplicates).toBeTruthy();
    expect(uiDef.input.checkboxSave).toBeTruthy();
    expect(uiDef.open.buttonExecute).toBeTruthy();
    expect(uiDef.extract.buttonExecute).toBeTruthy();
  });

  test('set default options', async () => {
    await init();

    const uiDef = getUIMain();
    expect(uiDef.input.textareaInput.value).toBe('');
    expect(uiDef.open.checkboxLazyLoad.checked).toBe(false);
    expect(uiDef.open.selectSequence.selectedIndex).toBe(0);
    expect(uiDef.open.checkboxIgnoreDuplicates.checked).toBe(false);
    expect(uiDef.input.checkboxSave.checked).toBe(false);
  });

  test('restore options', async () => {
    await init();

    let uiDef = getUIMain();
    uiDef.input.textareaInput.value = 'foobar';
    uiDef.input.textareaInput.dispatchEvent(new Event('input'));
    uiDef.open.checkboxLazyLoad.click();
    uiDef.open.selectSequence.selectedIndex = 1;
    uiDef.open.selectSequence.dispatchEvent(new Event('change'));
    uiDef.open.checkboxIgnoreDuplicates.click();
    uiDef.input.checkboxSave.click();

    uiDef = getUIMain();
    expect(uiDef.input.textareaInput.value).toBe('foobar');
    expect(uiDef.open.checkboxLazyLoad.checked).toBe(true);
    expect(uiDef.open.selectSequence.selectedIndex).toBe(1);
    expect(uiDef.open.checkboxIgnoreDuplicates.checked).toBe(true);
    expect(uiDef.input.checkboxSave.checked).toBe(true);

    document.body.innerHTML = BODY_HTML;

    uiDef = getUIMain();
    expect(uiDef.input.textareaInput.value).toBe('');
    expect(uiDef.open.checkboxLazyLoad.checked).toBe(false);
    expect(uiDef.open.selectSequence.selectedIndex).toBe(0);
    expect(uiDef.open.checkboxIgnoreDuplicates.checked).toBe(false);
    expect(uiDef.input.checkboxSave.checked).toBe(false);

    await init();

    uiDef = getUIMain();
    expect(uiDef.input.textareaInput.value).toBe('foobar');
    expect(uiDef.open.checkboxLazyLoad.checked).toBe(true);
    expect(uiDef.open.selectSequence.selectedIndex).toBe(1);
    expect(uiDef.open.checkboxIgnoreDuplicates.checked).toBe(true);
    expect(uiDef.input.checkboxSave.checked).toBe(true);
  });

  test('set preserve checked if text exists in storage', async () => {
    storeValue(StorageKey.urlList, 'https://test.de');
    storeValue(StorageKey.openSequence, 1);
    await init();

    const uiDef = getUIMain();
    expect(uiDef.input.textareaInput.value).toBe('https://test.de');
    expect(uiDef.open.checkboxLazyLoad.checked).toBe(false);
    expect(uiDef.open.selectSequence.selectedIndex).toBe(1);
    expect(uiDef.open.checkboxIgnoreDuplicates.checked).toBe(false);
    expect(uiDef.input.checkboxSave.checked).toBe(true);
  });

  test('store url list depending on option state', async () => {
    await init();

    const uiDef = getUIMain();

    uiDef.input.textareaInput.value = 'foobar';
    uiDef.input.textareaInput.dispatchEvent(new Event('input'));
    expect((await getStoredOptions()).txt).toBe('');

    uiDef.input.checkboxSave.click();
    expect((await getStoredOptions()).txt).toBe('foobar');

    uiDef.input.textareaInput.value = 'boofar';
    uiDef.input.textareaInput.dispatchEvent(new Event('input'));
    expect((await getStoredOptions()).txt).toBe('foobar');
    await sleep(SAVE_URL_LIST_DEBOUNCE_TIME_MS);
    expect((await getStoredOptions()).txt).toBe('boofar');

    uiDef.input.checkboxSave.click();
    expect((await getStoredOptions()).txt).toBe('');
  });

  test('store option status', async () => {
    await init();

    const uiDef = getUIMain();

    let options = await getStoredOptions();
    expect(options.txt).toBe('');
    expect(options.lazyload).toBe(false);
    expect(options.openSequence).toBe(0);
    expect(options.ignoreDuplicates).toBe(false);
    expect(options.preserve).toBe(false);

    uiDef.open.checkboxLazyLoad.click();
    uiDef.open.checkboxIgnoreDuplicates.click();
    uiDef.input.checkboxSave.click();
    uiDef.open.selectSequence.selectedIndex = 1;
    uiDef.open.selectSequence.dispatchEvent(new Event('change'));

    options = await getStoredOptions();
    expect(options.txt).toBe('');
    expect(options.lazyload).toBe(true);
    expect(options.openSequence).toBe(1);
    expect(options.ignoreDuplicates).toBe(true);
    expect(options.preserve).toBe(true);

    uiDef.open.checkboxLazyLoad.click();
    uiDef.open.checkboxIgnoreDuplicates.click();
    uiDef.input.checkboxSave.click();
    uiDef.open.selectSequence.selectedIndex = 0;
    uiDef.open.selectSequence.dispatchEvent(new Event('change'));

    options = await getStoredOptions();
    expect(options.txt).toBe('');
    expect(options.lazyload).toBe(false);
    expect(options.openSequence).toBe(0);
    expect(options.ignoreDuplicates).toBe(false);
    expect(options.preserve).toBe(false);
  });

  test('call open on button click', async () => {
    await init();

    const uiDef = getUIMain();
    uiDef.open.buttonExecute.click();

    expect(loadSites).toHaveBeenCalled();
  });

  test('call extract on button click', async () => {
    await init();
    const uiDef = getUIMain();
    uiDef.extract.buttonExecute.click();

    expect(extractURLs).toHaveBeenCalled();
  });

  test('display tab count', async () => {
    const uiDef = getUIMain();

    const hasTabCount = (numTabs: number) => {
      return uiDef.dynamicLabels.textTabCount.textContent === String(numTabs);
    };

    const setTextareaInput = (text: string) => {
      uiDef.input.textareaInput.value = text;
      uiDef.input.textareaInput.dispatchEvent(new Event('input'));
    };

    await init();

    expect(hasTabCount(0)).toBeTruthy();

    setTextareaInput('https://test.de');
    expect(hasTabCount(0)).toBeTruthy();
    await sleep(UPDATE_TAB_COUNT_DEBOUNCE_TIME_MS);
    expect(hasTabCount(1)).toBeTruthy();

    setTextareaInput('https://test.de\nhttps://spiegel.de');
    expect(hasTabCount(1)).toBeTruthy();
    await sleep(UPDATE_TAB_COUNT_DEBOUNCE_TIME_MS);
    expect(hasTabCount(2)).toBeTruthy();

    setTextareaInput('https://test.de\n\nhttps://spiegel.de\n    \nhttps://zeit.de\n\n   \n ');
    expect(hasTabCount(2)).toBeTruthy();
    await sleep(UPDATE_TAB_COUNT_DEBOUNCE_TIME_MS);
    expect(hasTabCount(3)).toBeTruthy();
  });
});
