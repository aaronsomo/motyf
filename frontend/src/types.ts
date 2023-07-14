export type Offering = {
  issuerId: number;
  offeringId: number;
  issueName: string;
  issueType: string;
  targetAmount: number;
  minAmount: number;
  maxAmount: number;
  unitPrice: number;
  totalShares: number;
  remainingShares: number;
  startDate: Date;
  endDate: Date;
  offeringStatus: string;
  offeringText: string;
  stampingText: string;
  createdDate?: Date;
  createdIPAddress?: string;
  escrowAccountNumber?: number;
  field1?: string;
  field2?: string;
  field3?: string;
  contractAddress?: string;
  secondaryId?: string;
  social?: string;
  website?: string;
  discord?: string;
};

export type User = {
  emailAddress: string;
  firstName: string;
  lastName: string;
  kycStatus: string;
  amlStatus: string;
  partyId: string;
  requestId?: string;
  accountId?: string;
  wallet?: string;
  partyUrl: string;
  accountUrl: string;
  uploads: number;
  suitabilitySubmitted: boolean;
  onboardingStatus: string;
};

export type Document = {
  documentTitle: string;
  documentId: number;
  documentFileReferenceCode: number;
  documentName: string;
  url: string;
  createdDate: Date;
  templateName?: string;
};

export type PartyRequiredFields = {
  domicile: string;
  firstName: string;
  lastName: string;
  dob: string;
  primCountry: string;
  primAddress1: string;
  primCity: string;
  primState: string;
  primZip: string;
  emailAddress: string;
};

export type PartyOptionalFields = {
  middleInitial?: string;
  socialSecurityNumber?: string;
  primAddress2?: string;
  emailAddress2?: string;
  phone?: string;
  phone2?: string;
  occupation?: string;
  associatedPerson?: string;
  empCountry?: string;
  empAddress1?: string;
  empAddress2?: string;
  empCity?: string;
  empState?: string;
  empZip?: string;
  empName?: string;
  currentAnnIncome?: string;
  avgAnnIncome?: string;
  currentHouseholdIncome?: string;
  avgHouseholdIncome?: string;
  householdNetworth?: string;
  empStatus?: string;
  invest_to?: string;
};

export type AccountRequiredFields = {
  streetAddress1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export type AccountOptionalFields = {
  streetAddress2?: string;
  email?: string;
  phone?: string;
  taxID?: string;
};

export type SuitabilityFields = {
  riskProfile?: string;
  investmentExperience?: string;
  privOffExperience?: string;
  pctPrivSecurities?: string;
  pctIlliquidSecurities?: string;
  pctLiquidSecurities?: string;
  pctRealEstate?: string;
  timeHorizon?: string;
  education?: string;
  financialAdvisor?: string;
  investmentObjective?: string;
};

export type TransferFields = {
  from: string;
  to: string;
  token: number;
  offeringId: number;
};

export type Trade = {
  offeringId: string;
  orderId: string;
  totalAmount: string;
  totalShares: string;
  esignStatus: string;
  transactionType: string;
  orderStatus: string;
  trade_createdDate?: string;
  transactionstatus?: string;
  fundStatus?: string;
  tokenId: string;
  contractAddress: string;
  issueName: string;
};

export type AllTrade = {
  accountId: string;
  orderId: string;
  orderStatus: string;
  totalAmount: string;
  totalShares: string;
  transactionType: string;
  unitPrice: string;
  email: string;
  userId: string;
  minted: string;
  linkedWallet: string;
  tokenId: string;
  contractAddress: string;
};

export type SecondaryOrder = {
  security_name: string;
  Action: string;
  number_shares: number;
  share_per_price: string;
  total_amount: string;
};

export type SecondaryOrderStatus = {
  orderId: string;
  price: number;
  NFT: number;
  executed: boolean;
  contractAddress: string;
  issueName: string;
};

export type Token = {
  contractAddress: string;
  NFT: number;
  price: number;
  offeringId: number;
  owner?: boolean;
  name: string;
  liked?: boolean;
  orderNumber?: number;
  offer?: number;
  expiry: Date;
};

export type SecondaryListing = {
  NFT: number;
  price: number;
  orderId: number;
};

export type FundingSource = {
  type: string;
  accountType: string;
  name: string;
  bankName: string;
  verified: boolean;
  id: string;
};

export type GraphSeries = {
  value: number;
  name: string;
};

export type OfferingStats = {
  payouts: number[];
  fillers: number[];
  quarters: string[];
  floor: number;
  volume: number;
  royalties: number;
  owners: number;
  regions: GraphSeries[];
  songs: GraphSeries[];
};

export type AdminDividend = {
  id?: number;
  year: number;
  quarter: number;
  amount: number;
  dirty?: boolean;
  deleted?: boolean;
};

export type AdminDividendRegion = {
  id?: number;
  domestic: number;
  international: number;
};

export type AdminSongDividend = {
  id?: number;
  song: string;
  amount: number;
  dirty?: boolean;
  deleted?: boolean;
};

export type CapTableEntry = {
  username: string;
  party: string;
  shares: number;
};

export type RoyaltyPaid = {
  amount: number;
  date: string;
  executed: boolean;
};

export type Offer = {
  amount: number;
  myOffer: boolean;
  id: number;
  NFT: number;
  offeringId: number;
};

export type Notification = {
  message: string;
  url: string;
  isRead: boolean;
  id: number;
};
