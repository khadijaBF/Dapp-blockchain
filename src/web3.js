import Web3 from 'web3';

// Check if the browser is using Ethereum (Metamask)
const web3 = new Web3(window.ethereum);

export const getWeb3 = async () => {
  // Request Metamask account access
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  return web3;
};
