import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import ProductMarketplace from './abis/ProductMarketplace.json';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TransactionHistory from './TransactionHistory';
import MyProducts from './MyProducts'; // New page for My Products
import './App.css';

function App() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (account) {
      loadBlockchainData();
    }
  }, [account]);

  const loadBlockchainData = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);

      const networkId = await web3.eth.net.getId();
      const networkData = ProductMarketplace.networks[networkId];
      if (networkData) {
        const marketplace = new web3.eth.Contract(ProductMarketplace.abi, networkData.address);
        setContract(marketplace);

        const productCount = await marketplace.methods.productCount().call();
        const loadedProducts = [];
        for (let i = 1; i <= productCount; i++) {
          const product = await marketplace.methods.products(i).call();
          loadedProducts.push(product);
        }

        // Set all products, not just available ones
        setProducts(loadedProducts);
      } else {
        alert('Smart contract not deployed to detected network.');
      }
      setLoading(false);
    } else {
      alert('Ethereum wallet not found. Please install MetaMask.');
    }
  };

  const createProduct = async (e) => {
    e.preventDefault();
    const weiPrice = Web3.utils.toWei(price, 'ether');
    try {
      await contract.methods.createProduct(title, description, weiPrice).send({ from: account });
      window.location.reload();
    } catch (error) {
      console.error('Error creating product:', error);
      alert(`Transaction failed: ${error.message}`);
    }
  };

  const purchaseProduct = async (productId, priceWei) => {
    try {
      await contract.methods.purchaseProduct(productId).send({
        from: account,
        value: priceWei,
        gas: 300000,
      });
      window.location.reload();
    } catch (error) {
      console.error('Purchase error:', error);
      alert(`Transaction failed: ${error.message}`);
    }
  };

  const disconnect = () => {
    setAccount('');
    setContract(null);
    setLoading(true);
  };

  const connect = async () => {
    if (window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
    } else {
      alert('Please install MetaMask!');
    }
  };

  return (
    <Router>
      <div className="app-container">
        <header className="topbar">
          <h1> Decentralized Marketplace</h1>
          <nav>
            <Link to="/">Home</Link>
            {account && <Link to="/my-products">My Products</Link>}
            {account && <Link to="/history">Transaction History</Link>}
          </nav>
          {account ? (
            <div>
              <p>Connected account: {account}</p>
              <button onClick={disconnect} className="disconnect-button">Disconnect</button>
            </div>
          ) : (
            <button onClick={connect} className="connect-button">Connect</button>
          )}
        </header>

        <Routes>
          <Route path="/" element={
            <>
              {account && (
                <form onSubmit={createProduct} className="form-card">
                  <input
                    placeholder="Product Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                  />
                  <input
                    placeholder="Description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                  />
                  <input
                    placeholder="Price in ETH"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    required
                  />
                  <button type="submit">Add Product</button>
                </form>
              )}

              <div className="product-list">
                {loading ? <p>Loading...</p> : products.map(product => (
                  <div key={product.id} className="product-card">
                    <h3>{product.title}</h3>
                    <p>{product.description}</p>
                    <p><strong>{Web3.utils.fromWei(product.price, 'ether')} ETH</strong></p>
                    <p>Seller: {product.seller}</p>
                    {/* Status label with style change for sold items */}
                    <p style={{ color: product.isSold ? 'red' : 'green' }}>
                      Status: {product.isSold ? 'Sold' : 'Available'}
                    </p>
                    {/* Disable Buy button if sold */}
                    <button
                      onClick={() => purchaseProduct(product.id, product.price)}
                      disabled={product.isSold}
                      style={{
                        backgroundColor: product.isSold ? '#ccc' : '#28a745',
                        color: product.isSold ? '#666' : '#fff',
                        cursor: product.isSold ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {product.isSold ? 'Unavailable' : 'Buy'}
                    </button>
                  </div>
                ))}
              </div>
            </>
          } />
          <Route path="/my-products" element={<MyProducts account={account} contract={contract} />} />
          <Route path="/history" element={<TransactionHistory account={account} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
