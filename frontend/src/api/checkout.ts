import { request_post, request } from 'api';
import { Trade, SecondaryOrderStatus, Token, Offer } from 'types';

type buyOfferingType = {
  offeringId: number;
  paymentPreference: string;
  quantity: number;
};

type buyOfferingReturn = {
  status: string;
  tradeId: string;
};

export async function buyOffering(params: buyOfferingType) {
  let url = new URL(`/api/checkout/buy`, window.location.origin);
  return await request_post<buyOfferingReturn>(url.toString(), params);
}

type buySecondaryOfferingType = {
  offeringId: number;
  tokenId: number;
};

type buySecondaryOfferingReturn = {
  status: string;
  tradeId: string;
};

export async function buySecondaryOffering(params: buySecondaryOfferingType) {
  let url = new URL(`/api/checkout/secondary/buy`, window.location.origin);
  return await request_post<buySecondaryOfferingReturn>(url.toString(), params);
}

type sellSecondaryOfferingType = {
  price: number;
  offeringId: number;
  token: number;
  expiry: Date;
};

type sellSecondaryOfferingReturn = {
  status: string;
  tradeId: string;
};

export async function sellSecondaryOffering(params: sellSecondaryOfferingType) {
  let url = new URL(`/api/checkout/secondary/sell`, window.location.origin);
  return await request_post<sellSecondaryOfferingReturn>(url.toString(), params);
}

type offerSecondaryOfferingType = {
  price: number;
  offeringId: number;
  token: number;
};

export async function offerSecondaryOffering(params: offerSecondaryOfferingType) {
  let url = new URL(`/api/checkout/secondary/offer`, window.location.origin);
  return await request_post<sellSecondaryOfferingReturn>(url.toString(), params);
}

type getOffersType = {
  offers: Offer[];
};

type acceptSecondaryOfferType = {
  offerId: number;
  offeringId: number;
  tokenId: number;
};

export async function acceptSecondaryOffer(params: acceptSecondaryOfferType) {
  let url = new URL(`/api/checkout/secondary/accept`, window.location.origin);
  return await request_post<sellSecondaryOfferingReturn>(url.toString(), params);
}

export async function getOffers({ offeringId, tokenId }: { offeringId: number; tokenId: number }) {
  const url = new URL(`/api/checkout/offers/${offeringId}/${tokenId}`, window.location.origin);
  return await request<getOffersType>(url.toString());
}

type getTradesType = {
  trades: Trade[];
};

export async function getTrades() {
  const url = new URL(`/api/checkout/trades`, window.location.origin);
  return await request<getTradesType>(url.toString());
}

type getTradeType = {
  trade: Trade;
};

export async function getTrade({ tradeId }: { tradeId: number }) {
  const url = new URL(`/api/checkout/trade/${tradeId}`, window.location.origin);
  return await request<getTradeType>(url.toString());
}

type getOrderType = {
  order: SecondaryOrderStatus;
};

export async function getOrder({ orderId }: { orderId: number }) {
  const url = new URL(`/api/checkout/order/${orderId}`, window.location.origin);
  return await request<getOrderType>(url.toString());
}

type getOrdersType = {
  buys: SecondaryOrderStatus[];
  sells: SecondaryOrderStatus[];
};

export async function getOrders() {
  const url = new URL(`/api/checkout/orders`, window.location.origin);
  return await request<getOrdersType>(url.toString());
}

type getTokenType = {
  userTokens: Token[];
};

type allUserTokensType = {
  pendingTokens: Token[];
  offeredTokens: Token[];
  listedTokens: Token[];
  unlistedTokens: Token[];
};

export async function getAllUserTokens() {
  const url = new URL(`/api/checkout/tokens`, window.location.origin);
  return await request<allUserTokensType>(url.toString());
}

export async function getLikedUserTokens() {
  const url = new URL(`/api/checkout/tokens/liked`, window.location.origin);
  return await request<getTokenType>(url.toString());
}

export async function getListings() {
  const url = new URL(`/api/checkout/listings`, window.location.origin);
  return await request<getTokenType>(url.toString());
}

type getOneTokenType = {
  token: Token;
};

export async function getToken({ offeringId, tokenId }: { offeringId: number; tokenId: number }) {
  const url = new URL(`/api/checkout/token/${offeringId}/${tokenId}`, window.location.origin);
  return await request<getOneTokenType>(url.toString());
}

type resendDocumentsType = {
  offeringId: string;
  tradeId: string;
};

export async function getResendDocuments(params: resendDocumentsType) {
  const url = new URL('/api/checkout/resend', window.location.origin);
  return await request_post(url.toString(), params);
}
