/* global artifacts */
const ProductMarketplace = artifacts.require("ProductMarketplace");

module.exports = function (deployer) {
  deployer.deploy(ProductMarketplace);
};
