import { extractURLs } from './extract';
import { loadSites, URL_LINE_SPLIT_REGEX } from './load';
import { getStoredOptions, StorageKey, storeValue } from './storage';
import { getUIDef, UIDef } from './ui';
import { debounce } from 'ts-debounce';

export {};

export const SAVE_URL_LIST_DEBOUNCE_TIME_MS = 100;
export const UPDATE_TAB_COUNT_DEBOUNCE_TIME_MS = 50;

const saveUrlList = async (ui: UIDef): Promise<void> => {
  if (ui.preserveCheckbox.checked) {
    await storeValue<string>(StorageKey.urlList, ui.txtArea.value);
  }
};
const debouncedSaveUrlList = debounce(
  saveUrlList,
  SAVE_URL_LIST_DEBOUNCE_TIME_MS
);

const updateTabCount = (ui: UIDef) => {
  let tabCount = '0';
  let tabCountIgnored = '0';
  if (ui.txtArea.value) {
    let lines = ui.txtArea.value
      .split(URL_LINE_SPLIT_REGEX)
      .filter((line) => line.trim() !== '')
      .map((line) => line.trim());
    if (ui.ignoreDuplicatesCheckbox.checked) {
      const tabCountOriginal = lines.length;
      lines = lines.reduce((uniqueLines, line) => uniqueLines.includes(line) ? uniqueLines : [...uniqueLines, line], []);
      tabCountIgnored = String(tabCountOriginal - lines.length);
    }
    if (lines.length <= 5000) {
      // limit for performance reasons
      tabCount = String(lines.length);
    } else {
      tabCount = '> 5000';
    }
  }

  ui.tabCountNumber.textContent = tabCount;
  ui.tabCountTabLabel.textContent = tabCount === '1' ? 'tab' : 'tabs';
  ui.tabCount.style.visibility = tabCount === '0' ? 'hidden' : 'visible';

  ui.tabCountIgnoredNumber.textContent = tabCountIgnored;
  ui.tabCountIgnored.style.visibility = tabCountIgnored === '0' ? 'hidden' : 'visible';
};
const debouncedUpdateTabCount = debounce(
  updateTabCount,
  UPDATE_TAB_COUNT_DEBOUNCE_TIME_MS
);

export const init = async (): Promise<void> => {
  const ui = getUIDef();

  // restore options
  const options = await getStoredOptions();
  ui.txtArea.value = options.txt;
  ui.lazyLoadCheckbox.checked = options.lazyload;

  ui.orderSequence.selectedIndex = options.orderSequence;
  ui.ignoreDuplicatesCheckbox.checked = options.ignoreDuplicates;
  ui.preserveCheckbox.checked = options.preserve;

  // add text input events
  ui.txtArea.addEventListener('input', () => {
    debouncedSaveUrlList(ui);
    debouncedUpdateTabCount(ui);
  });

  // add button events
  ui.openButton.addEventListener('click', () => {
    saveUrlList(ui);
    loadSites(
      ui.txtArea.value,
      ui.lazyLoadCheckbox.checked,
      ui.orderSequence.options[ui.orderSequence.selectedIndex].value,
      ui.ignoreDuplicatesCheckbox.checked,
    );
  });
  ui.extractButton.addEventListener('click', () => {
    ui.txtArea.value = extractURLs(ui.txtArea.value);
    saveUrlList(ui);
    updateTabCount(ui);
  });

  // add options events
  ui.lazyLoadCheckbox.addEventListener('change', (event) =>
    storeValue<boolean>(
      StorageKey.lazyload,
      (<HTMLInputElement>event.target).checked
    )
  );
  ui.orderSequence.addEventListener('change', (event) =>
    storeValue<number>(
      StorageKey.orderSequence,
      (<HTMLSelectElement>event.target).selectedIndex
    )
  );
  ui.ignoreDuplicatesCheckbox.addEventListener('change', (event) => {
    debouncedUpdateTabCount(ui);
    storeValue<boolean>(
      StorageKey.ignoreDuplicates,
      (<HTMLInputElement>event.target).checked
    );
  });
  ui.preserveCheckbox.addEventListener('change', (event) => {
    const isChecked = (<HTMLInputElement>event.target).checked;
    storeValue<boolean>(StorageKey.preserve, isChecked);
    storeValue<string>(StorageKey.urlList, isChecked ? ui.txtArea.value : '');
  });

  // update tabcount
  updateTabCount(ui);

  // select text in form field
  ui.txtArea.select();
};

document.addEventListener('DOMContentLoaded', init);
