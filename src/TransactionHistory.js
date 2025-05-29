// src/TransactionHistory.js
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import ProductMarketplace from './abis/ProductMarketplace.json';

function TransactionHistory({ account }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      const web3 = new Web3(window.ethereum);
      const networkId = await web3.eth.net.getId();
      const networkData = ProductMarketplace.networks[networkId];
      if (networkData) {
        const contract = new web3.eth.Contract(ProductMarketplace.abi, networkData.address);
        const count = await contract.methods.productCount().call();
        const allProducts = [];

        for (let i = 1; i <= count; i++) {
          const product = await contract.methods.products(i).call();
          if (product.seller === account || product.owner === account) {
            allProducts.push(product);
          }
        }

        setProducts(allProducts);
        setLoading(false);
      }
    };

    if (account) {
      loadHistory();
    }
  }, [account]);

  return (
    <div className="transaction-history">
      <h2>🧾 Transaction History</h2>
      {loading ? <p>Loading history...</p> : (
        <div className="transaction-list">
          {products.length === 0 ? (
            <p>No transactions yet.</p>
          ) : (
            products.map(product => (
              <div key={product.id} className="transaction-card">
                <h3>{product.title}</h3>
                <p>{product.description}</p>
                <p><strong>{Web3.utils.fromWei(product.price, 'ether')} ETH</strong></p>
                <p>Seller: {product.seller}</p>
                <p>Buyer: {product.isSold ? product.owner : 'Not sold yet'}</p>
                <p className={`transaction-status ${product.isSold ? 'sold' : 'available'}`}>
                  Status: {product.isSold ? 'Sold' : 'Available'}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default TransactionHistory;
