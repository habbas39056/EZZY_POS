export interface BankAccount {
  id: string;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  isActive: boolean;
  showOnInvoices: boolean;
  statementBalance: number;
  adwiselabsBalance: number;
  unreconciledBalance: number;
  unreconciledTransactionsCount: number;
  createdAt: string;
}

export interface BankTransaction {
  id: string;
  bankId: string;
  date: string;
  description: string;
  referenceNo?: string;
  spentAmount?: number;
  receivedAmount?: number;
  balance: number;
  isReconciled: boolean;
}

export const INITIAL_BANKS: BankAccount[] = [];
