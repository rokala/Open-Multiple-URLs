import browser from 'webextension-polyfill';
import { loadSites } from './load';

jest.mock('webextension-polyfill', () => ({
  tabs: { create: jest.fn() },
  runtime: { getURL: (val: string) => val },
}));

const url1 = 'https://test.de';
const url2 = 'https://example.com';
const urlList = url1 + '\n' + url2;

describe('load tabs', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('load tabs in sequence', async () => {
    loadSites(urlList, false, 'chronological', false);

    expect(browser.tabs.create).toHaveBeenNthCalledWith(1, {
      url: url1,
      active: false,
    });
    expect(browser.tabs.create).toHaveBeenNthCalledWith(2, {
      url: url2,
      active: false,
    });
  });

  test('lazyload tabs in sequence', async () => {
    loadSites(urlList, true, 'chronological', false);

    expect(browser.tabs.create).toHaveBeenNthCalledWith(1, {
      url: 'lazyloading.html#' + url1,
      active: false,
    });
    expect(browser.tabs.create).toHaveBeenNthCalledWith(2, {
      url: 'lazyloading.html#' + url2,
      active: false,
    });
  });

  test('load tabs in random order', async () => {
    loadSites(urlList, false, 'random', false);

    expect(browser.tabs.create).toHaveBeenCalledWith({
      url: url1,
      active: false,
    });
    expect(browser.tabs.create).toHaveBeenCalledWith({
      url: url2,
      active: false,
    });
  });

  test('lazyload tabs in random order', async () => {
    loadSites(urlList, true, 'random', false);

    expect(browser.tabs.create).toHaveBeenCalledWith({
      url: 'lazyloading.html#' + url1,
      active: false,
    });
    expect(browser.tabs.create).toHaveBeenCalledWith({
      url: 'lazyloading.html#' + url2,
      active: false,
    });
  });

  test('load tabs in reverse order', async () => {
    loadSites(urlList, false, 'reverse', false);

    expect(browser.tabs.create).toHaveBeenCalledWith({
      url: url2,
      active: false,
    });
    expect(browser.tabs.create).toHaveBeenCalledWith({
      url: url1,
      active: false,
    });
  });

  test('lazyload tabs in reverse order', async () => {
    loadSites(urlList, true, 'reverse', false);

    expect(browser.tabs.create).toHaveBeenCalledWith({
      url: 'lazyloading.html#' + url2,
      active: false,
    });
    expect(browser.tabs.create).toHaveBeenCalledWith({
      url: 'lazyloading.html#' + url1,
      active: false,
    });
  });

  test('load tabs with duplicate URLs', async () => {
    loadSites(urlList + '\n' + urlList, false, 'chronological', true);

    expect(browser.tabs.create).toHaveBeenCalledTimes(2);
    expect(browser.tabs.create).toHaveBeenCalledWith({
      url: url1,
      active: false,
    });
    expect(browser.tabs.create).toHaveBeenCalledWith({
      url: url2,
      active: false,
    });
  });

  test('lazyload tabs with duplicate URLs', async () => {
    loadSites(urlList + '\n' + urlList, true, 'chronological', true);

    expect(browser.tabs.create).toHaveBeenCalledTimes(2);
    expect(browser.tabs.create).toHaveBeenCalledWith({
      url: 'lazyloading.html#' + url1,
      active: false,
    });
    expect(browser.tabs.create).toHaveBeenCalledWith({
      url: 'lazyloading.html#' + url2,
      active: false,
    });
  });

  test('prepend http protocol if no protocol given', async () => {
    loadSites('test.de', false, 'chronological', false);

    expect(browser.tabs.create).toHaveBeenNthCalledWith(1, {
      url: 'http://test.de',
      active: false,
    });
  });

  test('ignore lines containing only whitespace', async () => {
    loadSites(
      'http://test.de/f bar\n     \n' + url2 + '\n\n \t \n   ',
      false,
      'chronological',
      false
    );

    expect(browser.tabs.create).toHaveBeenCalledTimes(2);
    expect(browser.tabs.create).toHaveBeenCalledWith({
      url: 'http://test.de/f bar',
      active: false,
    });
    expect(browser.tabs.create).toHaveBeenCalledWith({
      url: url2,
      active: false,
    });
  });

  test('handle different protocols', async () => {
    loadSites(
      'test.de\nhttp://test.de\nhttps://test.de\nfile://test.de\nview-source://test.de',
      false,
      'chronological',
      false
    );

    expect(browser.tabs.create).toHaveBeenNthCalledWith(1, {
      url: 'http://test.de',
      active: false,
    });
    expect(browser.tabs.create).toHaveBeenNthCalledWith(2, {
      url: 'http://test.de',
      active: false,
    });
    expect(browser.tabs.create).toHaveBeenNthCalledWith(3, {
      url: 'https://test.de',
      active: false,
    });
    expect(browser.tabs.create).toHaveBeenNthCalledWith(4, {
      url: 'file://test.de',
      active: false,
    });
    expect(browser.tabs.create).toHaveBeenNthCalledWith(5, {
      url: 'view-source://test.de',
      active: false,
    });
  });
});
