import { readFileAsynchronously, doStuffByTimeout, doStuffByInterval } from '.';
import { join } from 'path';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
}));
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
}));
jest.mock('path', () => ({
  join: jest.fn(),
}));

describe('doStuffByTimeout', () => {
  let timeoutSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    timeoutSpy = jest.spyOn(globalThis, 'setTimeout');
  });

  afterEach(() => {
    jest.useRealTimers();
    timeoutSpy.mockRestore();
  });

  test('should set timeout with provided callback and timeout', () => {
    const callback = jest.fn();
    doStuffByTimeout(callback, 1000);

    expect(timeoutSpy).toHaveBeenCalledWith(callback, 1000);
  });

  test('should call callback only after timeout', () => {
    const callback = jest.fn();
    doStuffByTimeout(callback, 1000);
    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalled();
  });
});

describe('doStuffByInterval', () => {
  let intervalSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    intervalSpy = jest.spyOn(globalThis, 'setInterval');
  });

  afterEach(() => {
    jest.useRealTimers();
    intervalSpy.mockRestore();
  });

  test('should set interval with provided callback and interval', () => {
    const callback = jest.fn();
    doStuffByInterval(callback, 500);

    expect(intervalSpy).toHaveBeenCalledWith(callback, 500);
  });

  test('should call callback multiple times after multiple intervals', () => {
    const callback = jest.fn();
    doStuffByInterval(callback, 300);

    jest.advanceTimersByTime(900);

    expect(callback).toHaveBeenCalledTimes(3);
  });
});

describe('readFileAsynchronously', () => {
  const mockedExistsSync = existsSync as jest.Mock;
  const mockedReadFile = readFile as jest.Mock;
  const mockedJoin = join as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should call join with pathToFile', async () => {
    mockedExistsSync.mockReturnValue(false);
    mockedJoin.mockReturnValue('/mocked/path/file.txt');

    await readFileAsynchronously('file.txt');

    expect(mockedJoin).toHaveBeenCalledWith(__dirname, 'file.txt');
  });

  test('should return null if file does not exist', async () => {
    mockedJoin.mockReturnValue('/mocked/path/file.txt');
    mockedExistsSync.mockReturnValue(false);

    const result = await readFileAsynchronously('nonexistent.txt');

    expect(result).toBeNull();
  });

  test('should return file content if file exists', async () => {
    mockedJoin.mockReturnValue('/mocked/path/existing.txt');
    mockedExistsSync.mockReturnValue(true);
    mockedReadFile.mockResolvedValue(Buffer.from('Hello, world!'));

    const result = await readFileAsynchronously('existing.txt');

    expect(mockedReadFile).toHaveBeenCalledWith('/mocked/path/existing.txt');
    expect(result).toBe('Hello, world!');
  });
});
