import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
      variables: {
        // Add package IDs after deployment, e.g. packageId: "0x...",
      },
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        packageId:
          "0x470bfc45bf7dbc92bed9bf723ca7335b189332a909f5d1370622993600876666",
        platformId:
          "0xb9010ffc6672232da2a699d092bc6cd7ebf2afba02588527d5b608f7690cdb2c",
        registryId:
          "0x8effd5679d0bbd647b31cb7843b269b4f16c7714fa51712a043bc058a5aac5d8",
      },
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
      variables: {
        // Add package IDs after deployment, e.g. packageId: "0x...",
      },
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };
