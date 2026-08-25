export interface JournalEntryItem {
  id: string;
  description: string;
  accountId: string;
  accountName: string;
  taxRate: number;
  debit: number;
  credit: number;
  netAmount: number;
}

export interface ManualJournal {
  id: string;
  journalId: string;
  narration: string;
  date: string;
  createdDate: string;
  isTaxInclusive: boolean;
  total: number;
  status: 'Posted' | 'Draft';
  items: JournalEntryItem[];
}

export const INITIAL_JOURNALS: ManualJournal[] = [];
