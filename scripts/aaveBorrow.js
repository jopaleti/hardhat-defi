const { getWeth } = require("./getWeth")
const { getNamedAccounts, ethers } = require("hardhat")
const { networkConfig } = require("../helper-hardhat-config")

async function main() {
    // The protocol treats everything as ERC20
    await getWeth()
    // const { deployer } = await getNamedAccounts()
    const [account] = await ethers.getSigners();
    // To interact with AAVE Protocol:
    // REQUIREMENT: abi, address

    // Lending Pool Address Provider: 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
    // Lending Pool: ^
    const lendingPool = await getLendingPool(account)
    // const lendingPool = await getLendingPool(deployer)
    console.log(`LendingPool address ${lendingPool.target}`)
}

async function getLendingPool(account) {
    const lendingPoolAddressProvider = await ethers.getContractAt(
        "@aave/protocol-v2/contracts/interfaces/ILendingPoolAddressesProvider.sol:ILendingPoolAddressesProvider",
        "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        // networkConfig[network.config.chainId].lendingPoolAddressesProvider,
        // account
    )
    console.log(lendingPoolAddressProvider)
    const lendingPoolAddress = await lendingPoolAddressProvider.getLendingPool()
    const lendingPool = await ethers.getContractAt(
        "ILendingPool",
        lendingPoolAddress,
        account
    )
    console.log({"lendingPool": lendingPool})
    return lendingPool
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })