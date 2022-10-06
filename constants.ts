export interface Token {
  chainId: number; // 101,
  address: string; // '8f9s1sUmzUbVZMoMh6bufMueYH1u4BJSM57RCEvuVmFp',
  symbol: string; // 'TRUE',
  name: string; // 'TrueSight',
  decimals: number; // 9,
  logoURI: string; // 'https://i.ibb.co/pKTWrwP/true.jpg',
  tags: string[]; // [ 'utility-token', 'capital-token' ]
}

export const swapToken = "So11111111111111111111111111111111111111112";  //sol
export const usdcToken = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB';  //usdc
export const basePrice = '33'; //for one coin
export const SOLANA_RPC_ENDPOINT= 'https://ssc-dao.genesysgo.net';

export const timeInterval = 5000; //in seconds

export const ENV = 'mainnet-beta';

export const discardWebhookId = '1027396047556841492';
export const discardWebhookToken = 'nOZU5WuzEsUUdvrzcqnGSO5PBt00dFbCvO2ESttzkcOrgbdHtYOgKNffH8ssWs0VMAqe';
