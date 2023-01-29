export interface UIDef {
  txtArea: HTMLTextAreaElement;
  lazyLoadCheckbox: HTMLInputElement;
  openSequence: HTMLSelectElement;
  preserveCheckbox: HTMLInputElement;
  ignoreDuplicatesCheckbox: HTMLInputElement;
  openButton: HTMLButtonElement;
  extractButton: HTMLButtonElement;
  extractMethod: HTMLSelectElement;
  tabCount: HTMLSpanElement;
  tabIgnoreCount: HTMLSpanElement;
}

export function getUIDef(): UIDef {
  return {
    txtArea: document.getElementById('urls') as HTMLTextAreaElement,
    lazyLoadCheckbox: document.getElementById('lazy-load') as HTMLInputElement,
    openSequence: document.getElementById('opening-sequence') as HTMLSelectElement,
    preserveCheckbox: document.getElementById('preserve') as HTMLInputElement,
    ignoreDuplicatesCheckbox: document.getElementById('ignore-duplicates') as HTMLInputElement,
    openButton: document.getElementById('open') as HTMLButtonElement,
    extractButton: document.getElementById('extract') as HTMLButtonElement,
    extractMethod: document.getElementById('extract-method') as HTMLSelectElement,
    tabCount: document.getElementById('tabcount-label') as HTMLSpanElement,
    tabIgnoreCount: document.getElementById('tabcount-ignored') as HTMLSpanElement
  };
}
