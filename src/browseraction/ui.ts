export interface UIDef {
  txtArea: HTMLTextAreaElement;
  lazyLoadCheckbox: HTMLInputElement;
  openSequence: HTMLSelectElement;
  preserveCheckbox: HTMLInputElement;
  ignoreDuplicatesCheckbox: HTMLInputElement;
  openButton: HTMLInputElement;
  extractButton: HTMLInputElement;
  tabCount: HTMLSpanElement;
  tabIgnoreCount: HTMLSpanElement;
}

export function getUIDef(): UIDef {
  return {
    txtArea: document.getElementById('urls') as HTMLTextAreaElement,
    lazyLoadCheckbox: document.getElementById('lazyLoad') as HTMLInputElement,
    openSequence: document.getElementById('opening-sequence') as HTMLSelectElement,
    preserveCheckbox: document.getElementById('preserve') as HTMLInputElement,
    ignoreDuplicatesCheckbox: document.getElementById('ignoreDuplicates') as HTMLInputElement,
    openButton: document.getElementById('open') as HTMLInputElement,
    extractButton: document.getElementById('extract') as HTMLInputElement,
    tabCount: document.getElementById('tabcount-label') as HTMLSpanElement,
    tabIgnoreCount: document.getElementById('tabcount-ignored') as HTMLSpanElement
  };
}
