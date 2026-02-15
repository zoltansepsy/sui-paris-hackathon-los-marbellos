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
          "0xf2aec530fb4dbdfee6691616b8ac9785d764d5e0593a40403d0ca66e875a7815",
        platformId:
          "0xd18c375597b687699392f82602eb78e8709ade1efab4419389f6abbc2de80abd",
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
