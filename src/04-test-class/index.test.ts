import { random } from 'lodash';
import {
  BankAccount,
  getBankAccount,
  TransferFailedError,
  SynchronizationFailedError,
  InsufficientFundsError,
} from '.';

jest.mock('lodash');

describe('BankAccount', () => {
  let account: BankAccount;

  beforeEach(() => {
    account = getBankAccount(100);
    (random as jest.Mock).mockClear();
  });

  test('should create account with initial balance', () => {
    expect(account.getBalance()).toBe(100);
  });

  test('should throw InsufficientFundsError error when withdrawing more than balance', () => {
    expect(() => account.withdraw(150)).toThrow(
      new InsufficientFundsError(100),
    );
  });

  test('should throw error when transferring more than balance', () => {
    const anotherAccount = getBankAccount(50);
    expect(() => account.transfer(150, anotherAccount)).toThrow(
      new InsufficientFundsError(100),
    );
  });

  test('should throw error when transferring to the same account', () => {
    expect(() => account.transfer(50, account)).toThrow(
      new TransferFailedError(),
    );
  });

  test('should deposit money', () => {
    account.deposit(50);
    expect(account.getBalance()).toBe(150);
  });

  test('should withdraw money', () => {
    account.withdraw(30);
    expect(account.getBalance()).toBe(70);
  });

  test('should transfer money', () => {
    const anotherAccount = getBankAccount(50);
    account.transfer(30, anotherAccount);
    expect(account.getBalance()).toBe(70);
    expect(anotherAccount.getBalance()).toBe(80);
  });

  test('fetchBalance should return number in case if request did not failed', async () => {
    (random as jest.Mock).mockImplementation((min, max, floating) => {
      if (min === 0 && max === 100 && floating === false) {
        return 75;
      }
      if (min === 0 && max === 1 && floating === false) {
        return 1;
      }
      return 0;
    });
    const balance = await account.fetchBalance();
    expect(typeof balance).toBe('number');
    expect(balance).toBe(75);
  });

  test('should set new balance if fetchBalance returned number', async () => {
    (random as jest.Mock).mockImplementation((min, max, floating) => {
      if (min === 0 && max === 100 && floating === false) {
        return 60;
      }
      if (min === 0 && max === 1 && floating === false) {
        return 1;
      }
      return 0;
    });
    await account.synchronizeBalance();
    expect(account.getBalance()).toBe(60);
  });

  test('should throw SynchronizationFailedError if fetchBalance returned null', async () => {
    (random as jest.Mock).mockReturnValue(0);
    await expect(account.synchronizeBalance()).rejects.toThrow(
      SynchronizationFailedError,
    );
  });
});
