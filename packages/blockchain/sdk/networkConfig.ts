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
          "0xf1584d9ac12e8a33937c22996284b38d3b5b262fe84a77b50c2da920eb472ba9",
        platformId:
          "0xe766ee75db9f4dbbdd57045f6b5aaf4fb7bcdf587b653f08ae82534cb27c7c84",
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
