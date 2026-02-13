/// SEAL access control policy for SuiPatron
///
/// Validates that a caller has a valid AccessPass for the creator
/// identified in the SEAL identity bytes.
///
/// SEAL Identity Format (MVP — flat access):
///   Bytes [0..32] = CreatorProfile object ID
///   Total: 32 bytes
///
/// All content for a creator shares the same SEAL identity.
/// Any valid AccessPass for that creator can decrypt all content.
module suipatron::seal_policy {
    use suipatron::suipatron::{Self, AccessPass};

    // ======== Error Codes ========
    const ENoAccess: u64 = 0;

    // ======== SEAL Access Control ========

    /// Core validation logic — public for testability
    ///
    /// Checks:
    /// 1. caller == access_pass.supporter (proves NFT ownership)
    /// 2. access_pass.creator_profile_id == parsed creator ID from SEAL identity
    public fun check_seal_access(
        id: vector<u8>,
        access_pass: &AccessPass,
        caller: address,
    ): bool {
        // Verify caller owns this AccessPass
        if (suipatron::access_pass_supporter(access_pass) != caller) {
            return false
        };

        // Parse creator_profile_id from SEAL identity bytes (32 bytes)
        let creator_profile_id = object::id_from_bytes(id);

        // Verify AccessPass is for the correct creator
        suipatron::access_pass_creator_profile_id(access_pass) == creator_profile_id
    }

    /// SEAL protocol entry point
    ///
    /// Called by SEAL key servers to validate decryption requests.
    /// Must be named `seal_approve` with `id: vector<u8>` as first param.
    entry fun seal_approve(
        id: vector<u8>,
        access_pass: &AccessPass,
        ctx: &TxContext,
    ) {
        assert!(check_seal_access(id, access_pass, ctx.sender()), ENoAccess);
    }
}
