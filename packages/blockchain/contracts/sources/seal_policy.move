/// SEAL access control policy for SuiPatron (Phase 2)
///
/// Validates that a caller has a valid AccessPass with sufficient tier level
/// for the creator identified in the SEAL identity bytes.
///
/// SEAL Identity Format (Phase 2 — tiered access):
///   Bytes [0..32]  = CreatorProfile object ID (32 bytes)
///   Bytes [32..40] = min_tier_level (8 bytes, little-endian u64)
///   Total: 40 bytes
///
/// Validation:
///   1. caller == access_pass.supporter (proves NFT ownership)
///   2. access_pass.creator_profile_id == parsed creator ID
///   3. access_pass.tier_level >= parsed min_tier_level
///   4. If access_pass.expires_at is Some, verify clock.timestamp_ms < expires_at
module suipatron::seal_policy {
    use suipatron::suipatron::{Self, AccessPass};
    use sui::clock::{Self, Clock};

    // ======== Error Codes ========
    const ENoAccess: u64 = 0;

    // ======== Internal Helpers ========

    /// Parse a little-endian u64 from 8 bytes in a vector starting at offset
    fun parse_u64_le(bytes: &vector<u8>, offset: u64): u64 {
        let mut result: u64 = 0;
        let mut i: u64 = 0;
        while (i < 8) {
            let byte_val = (*vector::borrow(bytes, offset + i) as u64);
            result = result | (byte_val << ((i * 8) as u8));
            i = i + 1;
        };
        result
    }

    // ======== SEAL Access Control ========

    /// Core validation logic — public for testability
    ///
    /// Checks:
    /// 1. caller == access_pass.supporter
    /// 2. creator_profile_id matches first 32 bytes of identity
    /// 3. access_pass.tier_level >= min_tier_level (from bytes 32-40)
    /// 4. If subscription: not expired (clock < expires_at)
    public fun check_seal_access(
        id: vector<u8>,
        access_pass: &AccessPass,
        caller: address,
        clock: &Clock,
    ): bool {
        // Must be exactly 40 bytes
        if (vector::length(&id) != 40) {
            return false
        };

        // 1. Verify caller owns this AccessPass
        if (suipatron::access_pass_supporter(access_pass) != caller) {
            return false
        };

        // 2. Parse creator_profile_id from first 32 bytes
        let mut creator_id_bytes = vector::empty<u8>();
        let mut i = 0u64;
        while (i < 32) {
            vector::push_back(&mut creator_id_bytes, *vector::borrow(&id, i));
            i = i + 1;
        };
        let creator_profile_id = object::id_from_bytes(creator_id_bytes);
        if (suipatron::access_pass_creator_profile_id(access_pass) != creator_profile_id) {
            return false
        };

        // 3. Parse min_tier_level from bytes [32..40] (little-endian u64)
        let min_tier_level = parse_u64_le(&id, 32);
        if (suipatron::access_pass_tier_level(access_pass) < min_tier_level) {
            return false
        };

        // 4. Check subscription expiry
        let expires_at = suipatron::access_pass_expires_at(access_pass);
        if (option::is_some(&expires_at)) {
            let expiry = *option::borrow(&expires_at);
            if (clock::timestamp_ms(clock) >= expiry) {
                return false
            };
        };

        true
    }

    /// SEAL protocol entry point
    ///
    /// Called by SEAL key servers to validate decryption requests.
    /// Must be named `seal_approve` with `id: vector<u8>` as first param.
    entry fun seal_approve(
        id: vector<u8>,
        access_pass: &AccessPass,
        clock: &Clock,
        ctx: &TxContext,
    ) {
        assert!(check_seal_access(id, access_pass, ctx.sender(), clock), ENoAccess);
    }
}
