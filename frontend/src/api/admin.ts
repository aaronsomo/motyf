import { request, request_post } from 'api';
import {
  RoyaltyPaid,
  User,
  TransferFields,
  AllTrade,
  AdminDividend,
  AdminDividendRegion,
  AdminSongDividend,
  CapTableEntry,
} from 'types';

type allUsersType = {
  users: User[];
};

export async function allUsers(): Promise<User[]> {
  const url = new URL(`/api/admin/users`, window.location.origin);
  const { users } = await request<allUsersType>(url.toString());
  return users;
}

export async function requestManualKYC(partyId: string) {
  let url = new URL(`/api/admin/request-documents/${partyId}`, window.location.origin);
  return await request(url.toString());
}

export async function approveKYC(partyId: string) {
  let url = new URL(`/api/admin/approve/${partyId}`, window.location.origin);
  return await request(url.toString());
}

type getTradesType = {
  trades: AllTrade[];
};

export async function getTrades({ offeringId }: { offeringId: number }) {
  let url = new URL(`/api/admin/trades/${offeringId}`, window.location.origin);
  const { trades } = await request<getTradesType>(url.toString());
  return trades;
}

type transactionReturn = {
  transaction: string;
};

type MintFields = {
  tradeId: string;
};

export async function mintTo(params: MintFields) {
  let url = new URL(`/api/admin/mint`, window.location.origin);
  return await request_post<transactionReturn>(url.toString(), params);
}

export async function transfer(params: TransferFields) {
  let url = new URL(`/api/admin/transfer`, window.location.origin);
  return await request_post<transactionReturn>(url.toString(), params);
}

type deployType = {
  offeringId: number;
};

export async function deploy(params: deployType) {
  let url = new URL(`/api/admin/deploy`, window.location.origin);
  return await request_post<transactionReturn>(url.toString(), params);
}

type getDividendsType = {
  payouts: AdminDividend[];
  regions: AdminDividendRegion;
  songs: AdminSongDividend[];
};

export async function getDividends({ offeringId }: { offeringId: number }) {
  let url = new URL(`/api/admin/offering-stats/${offeringId}`, window.location.origin);
  return await request<getDividendsType>(url.toString());
}

type saveDividendHistoryType = {
  payouts: AdminDividend[];
  offeringId: number;
};

type saveDividendRegionType = {
  regions: AdminDividendRegion;
  offeringId: number;
};

type saveDividendSongsType = {
  songs: AdminSongDividend[];
  offeringId: number;
};

export async function saveDividendHistory(params: saveDividendHistoryType) {
  let url = new URL(`/api/admin/save-dividend-history`, window.location.origin);
  return await request_post(url.toString(), params);
}

export async function saveDividendRegion(params: saveDividendRegionType) {
  let url = new URL(`/api/admin/save-dividend-region`, window.location.origin);
  return await request_post(url.toString(), params);
}

export async function saveDividendSongs(params: saveDividendSongsType) {
  let url = new URL(`/api/admin/save-dividend-songs`, window.location.origin);
  return await request_post(url.toString(), params);
}

type getCapTableType = {
  offeringId: number;
  date: string;
};

type getCapTableReturn = {
  capTable: CapTableEntry[];
};

export async function getCapTable(params: getCapTableType) {
  let url = new URL(`/api/admin/cap-table`, window.location.origin);
  return await request_post<getCapTableReturn>(url.toString(), params);
}

type payRoyaltiesType = {
  offeringId: number;
  date: string;
  payout: number;
};

export async function payRoyalties(params: payRoyaltiesType) {
  let url = new URL(`/api/admin/pay-royalties`, window.location.origin);
  return await request_post(url.toString(), params);
}

type getRoyaltiesType = {
  payouts: RoyaltyPaid[];
};

export async function getRoyalties({ offeringId }: { offeringId: number }) {
  let url = new URL(`/api/admin/get-royalties/${offeringId}`, window.location.origin);
  return await request<getRoyaltiesType>(url.toString());
}
