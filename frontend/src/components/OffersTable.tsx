import React from 'react';
import { Offer } from 'types';
import styled from 'styled-components';

interface Props {
  offers: Offer[];
  owner?: boolean;
}

export const OffersTable: React.FC<Props> = ({ offers, owner }) => {
  if (offers.length === 0) {
    return <></>;
  }

  return (
    <div>
      <h4>Current Offers</h4>
      <Table>
        <thead>
          <tr>
            <th>Amount</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => (
            <tr key={offer.amount}>
              <td>
                <div>${offer.amount}</div>
              </td>
              <td>
                {owner ? (
                  <a href={`/${offer.offeringId}/accept/${offer.NFT}/${offer.id}/`}>Accept Offer</a>
                ) : (
                  <b>{offer.myOffer ? 'Your Offer' : ''}</b>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

const Table = styled.table`
  margin-bottom: 50px;
  width: -webkit-fill-available;
`;
