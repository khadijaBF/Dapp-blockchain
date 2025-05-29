import { getWeb3 } from './web3';
import ProductMarketplaceABI from './ProductMarketplace.json'; // Import the ABI

const contractAddress = "0x3F04A965c9e7F91A9b60b68591A8862B757831fc"; 
export const getContract = async () => {
  const web3 = await getWeb3();
  const contract = new web3.eth.Contract(ProductMarketplaceABI.abi, contractAddress);
  return contract;
};
