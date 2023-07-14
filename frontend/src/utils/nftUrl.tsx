export const nftUrl = (contractAddress: string | number, token: string | number) => {
  return `https://mumbai.polygonscan.com/token/${contractAddress}?a=${token}`;
};

export const contractUrl = (contractAddress: string | number) => {
  return `https://mumbai.polygonscan.com/token/${contractAddress}`;
};
