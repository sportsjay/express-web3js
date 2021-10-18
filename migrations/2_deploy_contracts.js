const MockToken = artifacts.require("MockToken");

module.exports = async function (deployer, network, accounts) {
  // Deploy Mock DAI Token
  await deployer.deploy(MockToken);
  const mockToken = await MockToken.deployed();

  // Transfer 100 Mock DAI tokens to investor
  await mockToken.transfer(accounts[1], "100000000000000000000");
};
