import { request, request_post } from 'api';
import {
  PartyRequiredFields,
  PartyOptionalFields,
  AccountOptionalFields,
  AccountRequiredFields,
  SuitabilityFields,
  FundingSource,
} from 'types';

type postPartyFields = PartyRequiredFields & PartyOptionalFields;

export async function upsertParty(params: postPartyFields) {
  let url = new URL(`/api/kyc/upsert-party`, window.location.origin);
  return await request_post(url.toString(), params);
}

type getPartyType = {
  party: PartyRequiredFields & PartyOptionalFields;
};

export async function getParty() {
  let url = new URL('api/kyc/get-party', window.location.origin);
  return await request<getPartyType>(url.toString());
}

type getOnboardingStatusType = {
  onboardingStatus: string;
};

type getKYCType = {
  KYCStatus: string;
  AMLStatus: string;
};

export async function getOnboardingStatus() {
  let url = new URL('api/kyc/get-onboarding-status', window.location.origin);
  return await request<getOnboardingStatusType>(url.toString());
}

export async function requestKYCStatus() {
  let url = new URL('api/kyc/perform-kyc', window.location.origin);
  return await request<getKYCType>(url.toString());
}

export async function uploadKYC({ KYCFile }: { KYCFile: FormData }) {
  let url = new URL(`/api/kyc/upload-kyc`, window.location.origin);
  return fetch(url.toString(), {
    method: 'POST',
    body: KYCFile,
  });
}

type postAccountFields = AccountRequiredFields & AccountOptionalFields;

export async function upsertAccount(params: postAccountFields) {
  let url = new URL(`/api/kyc/upsert-account`, window.location.origin);
  return await request_post(url.toString(), params);
}

type getAccountType = {
  account: AccountRequiredFields & AccountOptionalFields;
};

export async function getAccount() {
  let url = new URL('api/kyc/get-account', window.location.origin);
  return await request<getAccountType>(url.toString());
}

export async function upsertSuitability(params: SuitabilityFields) {
  let url = new URL(`/api/kyc/upsert-suitability`, window.location.origin);
  return await request_post(url.toString(), params);
}

type getSuitabilityType = {
  suitability: SuitabilityFields;
};

export async function getSuitability() {
  let url = new URL(`/api/kyc/get-suitability`, window.location.origin);
  return await request<getSuitabilityType>(url.toString());
}

type postWalletType = {
  wallet: string;
  signature: string;
};

export async function addWallet(params: postWalletType) {
  let url = new URL(`/api/kyc/add-wallet`, window.location.origin);
  return await request_post(url.toString(), params);
}

type creditCardLink = {
  url: string;
};

export async function getCreditCardLink() {
  let url = new URL(`/api/kyc/link-credit-card`, window.location.origin);
  return await request<creditCardLink>(url.toString());
}

export async function getBankAccountLink() {
  let url = new URL(`/api/kyc/link-bank-account`, window.location.origin);
  return await request<creditCardLink>(url.toString());
}

type dwollaCheck = {
  balance: number;
  currency: string;
  fundingSources: FundingSource[];
};

export async function getDwollaStatus() {
  let url = new URL(`/api/kyc/check-secondary-wallet`, window.location.origin);
  return await request<dwollaCheck>(url.toString());
}

type addBankAccountType = {
  routingNumber: string;
  accountNumber: string;
  bankAccountType: string;
  name: string;
};

export async function addBankAccount(params: addBankAccountType) {
  let url = new URL(`/api/kyc/add-bank-account`, window.location.origin);
  return await request_post(url.toString(), params);
}

type requestVerifyBankType = {
  id: string;
};

export async function requestVerifyBankAccount(params: requestVerifyBankType) {
  let url = new URL(`/api/kyc/request-verify-bank-account`, window.location.origin);
  return await request_post(url.toString(), params);
}

type verifyBankType = {
  id: string;
  amount1: number;
  amount2: number;
};

export async function verifyBankAccount(params: verifyBankType) {
  let url = new URL(`/api/kyc/verify-bank-account`, window.location.origin);
  return await request_post(url.toString(), params);
}

type transferWalletType = {
  id: string;
  amount: number;
};

export async function transferToWallet(params: transferWalletType) {
  let url = new URL(`/api/kyc/transfer-to-wallet`, window.location.origin);
  return await request_post(url.toString(), params);
}

type dwollaBalance = {
  balance: number;
  currency: string;
};

export async function getDwollaBalance() {
  let url = new URL(`/api/kyc/balance`, window.location.origin);
  return await request<dwollaBalance>(url.toString());
}

type removeDwollaFundingSourceType = {
  fundingSourceId: string;
};

export async function removeDwollaFundingSource(params: removeDwollaFundingSourceType) {
  let url = new URL(`/api/kyc/remove-dwolla-funding-source`, window.location.origin);
  return await request_post(url.toString(), params);
}
