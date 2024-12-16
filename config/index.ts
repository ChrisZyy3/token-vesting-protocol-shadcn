import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";

type Network = "mainnet" | "testnet" | "devnet" | "localnet";

const network = (process.env.NEXT_PUBLIC_NETWORK as Network) || "testnet";

const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
    testnet: {
        url: getFullnodeUrl("testnet")
    },
    mainnet: {
        url: getFullnodeUrl("mainnet")
    },
    devnet: {
        url: getFullnodeUrl("devnet")
    },
    localnet: {
        url: getFullnodeUrl("localnet")
    },
});

// 创建全局 SuiClient 实例
const suiClient = new SuiClient({ url: networkConfig[network].url });

const packageId = "0xb46f3d0bf51270c56063a1b447efa7d040223c58671cf75d4421f880f94164c8"; // testnet elp
// const packageId = "0xbfa8e349b633c5aa3131fe14f266b1430eee15e54f515380688116c37f4876ea"; // testnet counter
export { useNetworkVariable, useNetworkVariables, networkConfig, network, suiClient, packageId };