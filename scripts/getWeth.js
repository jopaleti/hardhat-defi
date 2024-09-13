const { getNamedAccounts } = require("hardhat");

async function getWeth() {
    const { deployer } = await getNamedAccounts()
    // To call the deposit function on the weth contract: abi, contract address
    
}

module.exports = {getWeth}