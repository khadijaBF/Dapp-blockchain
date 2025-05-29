// MyProducts.js
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import ProductMarketplace from './abis/ProductMarketplace.json';

function MyProducts({ account }) {
  const [contract, setContract] = useState(null);
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMyProducts = async () => {
      const web3 = new Web3(window.ethereum);
      const networkId = await web3.eth.net.getId();
      const networkData = ProductMarketplace.networks[networkId];

      if (networkData) {
        const marketplace = new web3.eth.Contract(ProductMarketplace.abi, networkData.address);
        setContract(marketplace);

        const ownedIds = await marketplace.methods.getOwnedProducts(account).call();
        const myOwnedProducts = [];
        for (let i = 0; i < ownedIds.length; i++) {
          const product = await marketplace.methods.products(ownedIds[i]).call();
          myOwnedProducts.push(product);
        }
        setMyProducts(myOwnedProducts);
        setLoading(false);
      } else {
        alert("Smart contract not deployed to detected network.");
      }
    };

    if (account) {
      loadMyProducts();
    }
  }, [account]);

  return (
    <div className="app-container">
      <h2>📦 My Products</h2>
      {loading ? (
        <p>Loading...</p>
      ) : myProducts.length === 0 ? (
        <p>You don't own any products yet.</p>
      ) : (
        <div className="product-list">
          {myProducts.map(product => (
            <div key={product.id} className="product-card">
              <h3>{product.title}</h3>
              <p>{product.description}</p>
              <p><strong>{Web3.utils.fromWei(product.price, 'ether')} ETH</strong></p>
              <p>Seller: {product.seller}</p>
              <p>Owner: {product.owner}</p>
              <p>Status: {product.isSold ? 'Sold' : 'Available'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyProducts;
