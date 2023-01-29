import { extractURLs } from './extract';
import { loadSites } from './load';
import { splitLines } from './splitter';
import { getStoredOptions, StorageKey, storeValue } from './storage';
import { getUIMain, UIMain } from './ui';
import { debounce } from 'ts-debounce';
import { TLN } from './tln';

export {};

export const SAVE_URL_LIST_DEBOUNCE_TIME_MS = 100;
export const UPDATE_TAB_COUNT_DEBOUNCE_TIME_MS = 50;

const saveUrlList = async (ui: UIMain): Promise<void> => {
  if (ui.input.checkboxSave.checked) {
    await storeValue<string>(StorageKey.urlList, ui.input.textareaInput.value);
  }
  ui.open.buttonExecute.disabled = (ui.input.textareaInput.value === '');
  ui.extract.buttonExecute.disabled = (ui.input.textareaInput.value === '');
};
const debouncedSaveUrlList = debounce(
  saveUrlList,
  SAVE_URL_LIST_DEBOUNCE_TIME_MS
);

const updateTabCount = (ui: UIMain) => {
  let tabCount = 0;
  let tabIgnoreCount = 0;
  if (ui.input.textareaInput.value) {
    const lines = splitLines(ui.input.textareaInput.value);
    const linesUnique = lines.reduce((uniqueLines, line) => uniqueLines.includes(line) ? uniqueLines : [...uniqueLines, line], []);
    tabCount = ui.open.checkboxIgnoreDuplicates.checked ? linesUnique.length : lines.length;
    tabIgnoreCount = lines.length - linesUnique.length;
  }
  ui.dynamicLabels.textTabCount.textContent = String(tabCount);
  ui.dynamicLabels.textTabCount.style.setProperty('--tabcount-suffix', tabCount === 1 ? '" tab"' : '" tabs"');
  ui.dynamicLabels.textTabIgnoreCount.textContent = String(tabIgnoreCount);
};
const debouncedUpdateTabCount = debounce(
  updateTabCount,
  UPDATE_TAB_COUNT_DEBOUNCE_TIME_MS
);

const resolveButtonStatus = (ui) => {
  ui.open.buttonExecute.disabled = (ui.input.textareaInput.value === '');
  ui.extract.buttonExecute.disabled = (ui.input.textareaInput.value === '');
}

export const init = async (): Promise<void> => {
  const ui = getUIMain();

  // restore options
  const options = await getStoredOptions();
  ui.input.textareaInput.value = options.txt;
  ui.open.checkboxLazyLoad.checked = options.lazyload;
  ui.open.selectSequence.selectedIndex = options.openSequence;
  ui.open.checkboxIgnoreDuplicates.checked = options.ignoreDuplicates;
  ui.input.checkboxSave.checked = options.preserve;
  ui.extract.selectMethod.selectedIndex = options.extractMethod;
  resolveButtonStatus(ui);

  // add text input events
  ui.input.textareaInput.addEventListener('input', () => {
    resolveButtonStatus(ui);
    debouncedSaveUrlList(ui);
    debouncedUpdateTabCount(ui);
  });

  // add button events
  ui.open.buttonExecute.addEventListener('click', () => {
    saveUrlList(ui);
    loadSites(
      ui.input.textareaInput.value,
      ui.open.checkboxLazyLoad.checked,
      ui.open.selectSequence.options[ui.open.selectSequence.selectedIndex].value,
      ui.open.checkboxIgnoreDuplicates.checked,
    );
  });
  ui.extract.buttonExecute.addEventListener('click', () => {
    ui.input.textareaInput.value = extractURLs(ui.input.textareaInput.value, ui.extract.selectMethod.value);
    saveUrlList(ui);
    updateTabCount(ui);
    ui.input.textareaInput.dispatchEvent(new Event('input'));
  });

  // add options events
  ui.open.checkboxLazyLoad.addEventListener('change', (event) =>
    storeValue<boolean>(
      StorageKey.lazyload,
      (<HTMLInputElement>event.target).checked
    )
  );
  ui.open.selectSequence.addEventListener('change', (event) =>
    storeValue<number>(
      StorageKey.openSequence,
      (<HTMLSelectElement>event.target).selectedIndex
    )
  );
  ui.open.checkboxIgnoreDuplicates.addEventListener('change', (event) => {
    debouncedUpdateTabCount(ui);
    storeValue<boolean>(
      StorageKey.ignoreDuplicates,
      (<HTMLInputElement>event.target).checked
    );
  });
  ui.input.checkboxSave.addEventListener('change', (event) => {
    const isChecked = (<HTMLInputElement>event.target).checked;
    storeValue<boolean>(StorageKey.preserve, isChecked);
    storeValue<string>(StorageKey.urlList, isChecked ? ui.input.textareaInput.value : '');
  });
  ui.extract.selectMethod.addEventListener('change', (event) =>
    storeValue<number>(
      StorageKey.extractMethod,
      (<HTMLSelectElement>event.target).selectedIndex
    )
  );
  // update tabcount
  updateTabCount(ui);

  // select text in form field
  ui.input.textareaInput.select();

  TLN.appendLineNumbers('urls');
};

document.addEventListener('DOMContentLoaded', init);
