// migrations/1_initial_migration.js
/* global artifacts */
const Migrations = artifacts.require("Migrations");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
};


