#!/usr/bin/env node

/**
 * Direct blockchain query test
 * Tests if ProfileCreated events can be retrieved
 */

import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";

const PACKAGE_ID = "0xf1584d9ac12e8a33937c22996284b38d3b5b262fe84a77b50c2da920eb472ba9";
const NETWORK = "testnet";

async function testQuery() {
  console.log("🔍 Testing blockchain query...\n");
  console.log(`Network: ${NETWORK}`);
  console.log(`Package ID: ${PACKAGE_ID}\n`);

  const rpcUrl = getFullnodeUrl(NETWORK);
  console.log(`RPC URL: ${rpcUrl}\n`);

  const client = new SuiClient({ url: rpcUrl });

  try {
    // Test 1: Query ProfileCreated events
    console.log("📡 Querying ProfileCreated events...");
    const eventType = `${PACKAGE_ID}::suipatron::ProfileCreated`;
    console.log(`Event type: ${eventType}\n`);

    const events = await client.queryEvents({
      query: {
        MoveEventType: eventType,
      },
      order: "descending",
      limit: 50,
    });

    console.log(`✅ Found ${events.data.length} ProfileCreated events\n`);

    if (events.data.length === 0) {
      console.log("❌ No events found! This means:");
      console.log("   1. No profiles have been created yet, OR");
      console.log("   2. The package ID is incorrect, OR");
      console.log("   3. You're on the wrong network\n");
      return;
    }

    // Show event details
    console.log("📋 Event details:");
    events.data.forEach((event, index) => {
      console.log(`\nEvent ${index + 1}:`);
      console.log(`  Transaction: ${event.id.txDigest}`);
      console.log(`  Timestamp: ${event.timestampMs}`);
      console.log(`  Data:`, JSON.stringify(event.parsedJson, null, 2));
    });

    // Test 2: Fetch the profile objects
    console.log("\n📦 Fetching profile objects...");
    const profileIds = events.data.map((e) => e.parsedJson.profile_id);
    console.log(`Profile IDs: ${profileIds.join(", ")}\n`);

    const objects = await client.multiGetObjects({
      ids: profileIds,
      options: { showContent: true },
    });

    console.log(`✅ Fetched ${objects.length} profile objects\n`);

    objects.forEach((obj, index) => {
      if (obj.data) {
        const fields = obj.data.content?.fields;
        console.log(`\nProfile ${index + 1}:`);
        console.log(`  Object ID: ${obj.data.objectId}`);
        console.log(`  Name: ${fields?.name}`);
        console.log(`  Bio: ${fields?.bio}`);
        console.log(`  Price: ${fields?.price} MIST`);
        console.log(`  Balance: ${fields?.balance} MIST`);
        console.log(`  Content Count: ${fields?.content_count}`);
        console.log(`  Total Supporters: ${fields?.total_supporters}`);
      } else {
        console.log(`\n❌ Profile ${index + 1}: Failed to fetch`);
      }
    });

    console.log("\n\n✨ Test complete! If you see profiles above, the blockchain query works correctly.");
    console.log("   The issue may be in the frontend React code or browser.\n");
  } catch (error) {
    console.error("\n❌ Error querying blockchain:");
    console.error(error);
  }
}

testQuery();
