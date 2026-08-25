export type ContactType = 'customer' | 'supplier' | 'both';
export type ContactStatus = 'active' | 'inactive';

export interface AddressInfo {
  address: string;
  address2?: string;
  postCode: string;
  city: string;
  province: string;
  country: string;
}

export interface Contact {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  status: ContactStatus;
  type: ContactType;
  lat?: string;
  lon?: string;
  primaryAddress: AddressInfo;
  billingAddress: AddressInfo;
  shippingAddress: AddressInfo;
  sameAsAddressShipping?: boolean;
  hasOpeningBalance: boolean;
  openingBalance?: number;
  openingBalanceType?: 'debit' | 'credit';
  assignedRecoveryPerson?: string;
  assignedSalePerson?: string;
  amount?: number;
  website?: string;
  ntn?: string;
  strn?: string;
  fbrRegistrationNo?: string;
  fbrRegistrationStatus?: string;
  code?: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
  nationalId?: string;
  notes?: string;
  payables: number;
  receivables: number;
  createdOn: string;
}

export const INITIAL_CONTACTS: Contact[] = [];

