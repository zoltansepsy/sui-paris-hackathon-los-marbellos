import { getJsonRpcFullnodeUrl as getFullnodeUrl } from "@mysten/sui/jsonRpc";
import { createNetworkConfig } from "@mysten/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      network: "devnet",
      url: getFullnodeUrl("devnet"),
      variables: {
        packageId: "",
        platformId: "",
      },
    },
    testnet: {
      network: "testnet",
      url: getFullnodeUrl("testnet"),
      variables: {
        packageId:
          "0xf3a74f8992ff0304f55aa951f1340885e3aa0018c7118670fa6d6041216c923f",
        platformId:
          "0x694eb35d412e068c043c54791e7d705e7c7698a48aec2053ad794180680d3961",
      },
    },
    mainnet: {
      network: "mainnet",
      url: getFullnodeUrl("mainnet"),
      variables: {
        packageId: "",
        platformId: "",
      },
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };
