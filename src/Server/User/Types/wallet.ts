export interface IUpdateUserWallet {
  userId: string;
  type: Currencies;
  amount: number;
}

export type Currencies = 'soft_currency' | 'hard_currency';
