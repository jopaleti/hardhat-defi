const { getWeth, AMOUNT } = require("./getWeth");
const { getNamedAccounts, ethers } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");

async function main() {
    // The protocol treats everything as ERC20
    await getWeth();
    // const { deployer } = await getNamedAccounts()
    const [account] = await ethers.getSigners();
    const deployer = account;
    // To interact with AAVE Protocol:
    // REQUIREMENT: abi, address

    // Lending Pool Address Provider: 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
    // Lending Pool: ^
    const lendingPool = await getLendingPool(deployer);
    console.log(`LendingPool address ${lendingPool.target}`);

    // Deposit
    const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    // Approve
    await approveErc20(wethTokenAddress, lendingPool.target, AMOUNT, deployer);
    console.log("Depositing...");
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0);
    console.log("Deposited!");
    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(
        lendingPool,
        deployer
    );
    const daiPrice = await getDaiPrice();
    const amountDaiToBorrow =
        availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toString());
    console.log(`You can borrow ${amountDaiToBorrow} DAI`);
    const amountDaiToBorrowWei = ethers.parseEther(
        amountDaiToBorrow.toString()
    );
    const daiTokenAddress = "0x6b175474e89094c44da98b954eedeac495271d0f";
    await borrowDai(
        daiTokenAddress,
        lendingPool,
        amountDaiToBorrowWei,
        deployer
    );
    await getBorrowUserData(lendingPool, deployer);
    await repay(amountDaiToBorrowWei, daiTokenAddress, lendingPool, deployer);
    await getBorrowUserData(lendingPool, deployer)
}

// Repay DAI
async function repay(amount, daiAddress, lendingPool, account) {
    await approveErc20(daiAddress, lendingPool.target, amount, account);
    const repayTx = await lendingPool.repay(daiAddress, amount, 2, account);
    await repayTx.wait(1);
    console.log("Repaid!");
}

async function borrowDai(daiAddress, lendingPool, amountDaiToBorrow, account) {
    const borrowTx = await lendingPool.borrow(
        daiAddress,
        amountDaiToBorrow,
        2,
        0,
        account
    );
    await borrowTx.wait(1);
    console.log(`You've borrowed!`);
}

async function getDaiPrice() {
    const daiEthPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        "0x773616E4d11A78F511299002da57A0a94577F1f4"
    );
    // Since we need only the second index of the return which is answer
    const price = (await daiEthPriceFeed.latestRoundData())[1];
    console.log(`Thhe DAI/ETH price is ${price.toString()}`);
    return price;
}

async function getBorrowUserData(lendingPool, account) {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
        await lendingPool.getUserAccountData(account);
    console.log(`You have ${totalCollateralETH} worth of the ETH deposited.`);
    console.log(`You have ${totalDebtETH} worth of ETH borrowed.`);
    console.log(`You can borrow ${availableBorrowsETH} worth of ETH.`);
    return { availableBorrowsETH, totalDebtETH };
}

async function getLendingPool(account) {
    const lendingPoolAddressProvider = await ethers.getContractAt(
        "@aave/protocol-v2/contracts/interfaces/ILendingPoolAddressesProvider.sol:ILendingPoolAddressesProvider",
        "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5"
        // networkConfig[network.config.chainId].lendingPoolAddressesProvider,
        // account
    );
    console.log(lendingPoolAddressProvider);
    const lendingPoolAddress =
        await lendingPoolAddressProvider.getLendingPool();
    const lendingPool = await ethers.getContractAt(
        "ILendingPool",
        lendingPoolAddress,
        account
    );
    return lendingPool;
}

async function approveErc20(
    erc20Address,
    spenderAddress,
    amountToSpend,
    account
) {
    const erc20Token = await ethers.getContractAt(
        "IERC20",
        erc20Address,
        account
    );
    const txResponse = await erc20Token.approve(spenderAddress, amountToSpend);
    await txResponse.wait(1);
    console.log({ txResponse: txResponse });
    console.log("Approved!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
