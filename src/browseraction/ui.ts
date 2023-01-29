interface UIInput {
  textareaInput: HTMLTextAreaElement;
  checkboxSave: HTMLInputElement;
}

interface UIOpen {
  buttonExecute: HTMLButtonElement;
  selectSequence: HTMLSelectElement;
  checkboxLazyLoad: HTMLInputElement;
  checkboxIgnoreDuplicates: HTMLInputElement;
}

interface UIExtract {
  buttonExecute: HTMLButtonElement;
  selectMethod: HTMLSelectElement;
}

interface UILabels {
  textTabCount: HTMLSpanElement;
  textTabIgnoreCount: HTMLSpanElement;
}

export interface UIMain {
  input: UIInput;
  open: UIOpen;
  extract: UIExtract;
  dynamicLabels: UILabels;
}

const getEl = (id: string) => document.getElementById(id);

export function getUIMain(): UIMain {
  const uiMain: UIMain = {
    input: {
      textareaInput: getEl('urls') as HTMLTextAreaElement,
      checkboxSave: getEl('preserve') as HTMLInputElement
    },
    open: {
      buttonExecute: getEl('open') as HTMLButtonElement,
      selectSequence: getEl('opening-sequence') as HTMLSelectElement,
      checkboxLazyLoad: getEl('lazy-load') as HTMLInputElement,
      checkboxIgnoreDuplicates: getEl('ignore-duplicates') as HTMLInputElement,
    },
    extract: {
      buttonExecute: getEl('extract') as HTMLButtonElement,
      selectMethod: getEl('extract-method') as HTMLSelectElement
    },
    dynamicLabels : {
      textTabCount: getEl('tabcount-label') as HTMLSpanElement,
      textTabIgnoreCount: getEl('tabcount-ignored') as HTMLSpanElement
    }
  };
  return uiMain;
}
