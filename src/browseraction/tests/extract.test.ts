import { extractURLs } from '../extract';

jest.mock('url-knife');

test('extract urls', async () => {
  const extractMethods = ['url-knife', 'regex-alpha', 'regex-beta']
  const testInputText = 'https://test.de  \n  foo\nhttp://example.com bar  ';
  const expectedOutput = 'https://test.de\nhttp://example.com\n';
  extractMethods.forEach(method => {
    expect(extractURLs(testInputText, method)).toBe(expectedOutput);
  });
});
