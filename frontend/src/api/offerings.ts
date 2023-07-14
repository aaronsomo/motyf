import { request } from 'api';
import { Offering, Document, OfferingStats } from 'types';

type allOfferingsType = {
  offerings: Offering[];
};

export async function allOfferings(): Promise<Offering[]> {
  const url = new URL(`/api/offerings/all`, window.location.origin);
  const { offerings } = await request<allOfferingsType>(url.toString());
  return offerings;
}

type getOfferingType = {
  offering: Offering;
};

export async function getOffering({ offeringId }: { offeringId: number }) {
  const url = new URL(`/api/offerings/${offeringId}`, window.location.origin);
  const { offering } = await request<getOfferingType>(url.toString());
  return offering;
}

export async function getLatestOffering() {
  const url = new URL(`/api/offerings/latest`, window.location.origin);
  const { offering } = await request<getOfferingType>(url.toString());
  return offering;
}

type getOfferingDocumentsType = {
  documents: Document[];
};

export async function getOfferingDocuments({ offeringId }: { offeringId: number }) {
  const url = new URL(`/api/offerings/documents/${offeringId}`, window.location.origin);
  const { documents } = await request<getOfferingDocumentsType>(url.toString());
  return documents;
}

type getOfferingStatsType = {
  offeringStats: OfferingStats;
};

export async function getOfferingStats({ offeringId }: { offeringId: number }) {
  const url = new URL(`/api/offerings/stats/${offeringId}`, window.location.origin);
  const { offeringStats } = await request<getOfferingStatsType>(url.toString());
  return offeringStats;
}

export async function likeToken({ offeringId, NFT }: { offeringId: number; NFT: number }) {
  const url = new URL(`/api/offerings/like/${offeringId}/${NFT}`, window.location.origin);
  return await request(url.toString());
}
