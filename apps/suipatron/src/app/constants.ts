/**
 * SuiPatron Platform Constants
 *
 * Canonical configuration for SEAL key servers, Walrus storage,
 * and platform-wide settings.
 */

// ======== SEAL Key Servers (Testnet) ========
// Canonical server list — all parties must encrypt/decrypt with same servers.
// Source: https://seal-docs.wal.app/Pricing/#verified-key-servers
export const CANONICAL_SEAL_SERVERS_TESTNET = [
  "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75", // Mysten Testnet 1
  "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8", // Mysten Testnet 2
  "0x164ac3d2b3b8694b8181c13f671950004765c23f270321a45fdd04d40cccf0f2", // Studio Mirai
] as const;

export const SEAL_THRESHOLD = 2; // 2-of-3 threshold cryptography

// ======== Walrus Configuration ========
export const WALRUS_AGGREGATOR_URL_TESTNET =
  "https://aggregator.walrus-testnet.walrus.space/v1";
export const WALRUS_UPLOAD_RELAY_TESTNET =
  "https://upload-relay.testnet.walrus.space";
export const WALRUS_WASM_URL =
  "https://unpkg.com/@mysten/walrus-wasm@0.1.1/web/walrus_wasm_bg.wasm";
export const WALRUS_DEFAULT_EPOCHS = 5;
export const WALRUS_UPLOAD_RELAY_TIP = 1_000; // 1000 MIST per upload

// ======== SUI Constants ========
export const CLOCK_OBJECT_ID = "0x6";
export const MIST_PER_SUI = 1_000_000_000;

// ======== Content Types ========
export const SUPPORTED_CONTENT_TYPES = ["image", "text", "pdf"] as const;
export type ContentType = (typeof SUPPORTED_CONTENT_TYPES)[number];
