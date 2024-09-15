const { ethers, getNamedAccounts, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");

const AMOUNT = ethers.parseEther("0.0001");

async function getWeth() {
    const { deployer } = await getNamedAccounts();
    const [deployerSigner] = await ethers.getSigners();
    console.log(deployerSigner);
    // To call the deposit function on the weth contract:
    // abi, contract address
    // 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
    // 0xfceb206e1a80527908521121358b5e26caabaa75
    var iWeth = await ethers.getContractAt(
        "IWeth",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        // deployer,
    );
    console.log({ iweth: iWeth });
    // Sending transaction
    const txResponse = await iWeth.deposit({
        value: AMOUNT,
    });
    await txResponse.wait(1);
    // console.log({"txResponse": txResponse});
    const wethBalance = await iWeth.balanceOf(deployer);
    console.log(`Got ${wethBalance.toString()} WETH`);
}

module.exports = { getWeth };
