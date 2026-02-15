/// Creator Registry for SuiPatron
///
/// Provides a shared Registry object that maps unique String handles to
/// CreatorProfile IDs using Dynamic Fields. Creators register handles
/// via their CreatorCap for authorization.
///
/// Patterns: Shared Object, Dynamic Fields (DF — not DOF), String→ID mapping
module suipatron::registry {
    use std::string::String;
    use sui::dynamic_field as df;
    use sui::event;
    use sui::clock::{Self, Clock};
    use suipatron::suipatron::{Self, CreatorProfile, CreatorCap};

    // ======== Version ========
    const VERSION: u64 = 1;

    // ======== Error Codes ========
    const EHandleAlreadyTaken: u64 = 100;
    #[allow(unused_const)]
    const EHandleNotFound: u64 = 101;
    const EUnauthorized: u64 = 102;
    const EVersionMismatch: u64 = 103;

    // ======== Types ========

    /// Registry singleton — shared object for handle-to-profile lookups
    public struct Registry has key {
        id: UID,
        version: u64,
        total_handles: u64,
    }

    // ======== Events ========

    public struct HandleRegistered has copy, drop {
        registry_id: ID,
        handle: String,
        profile_id: ID,
        timestamp: u64,
    }

    // ======== Init ========

    /// Module initialization — creates the shared Registry singleton
    fun init(ctx: &mut TxContext) {
        let registry = Registry {
            id: object::new(ctx),
            version: VERSION,
            total_handles: 0,
        };
        transfer::share_object(registry);
    }

    // ======== Entry Functions ========

    /// Register a unique handle for a creator profile
    /// Only the creator (via CreatorCap) can register a handle for their profile
    public fun register_handle(
        registry: &mut Registry,
        profile: &CreatorProfile,
        cap: &CreatorCap,
        handle: String,
        clock: &Clock,
    ) {
        assert!(registry.version == VERSION, EVersionMismatch);
        assert!(object::id(profile) == suipatron::cap_profile_id(cap), EUnauthorized);
        assert!(!df::exists_(&registry.id, handle), EHandleAlreadyTaken);

        let profile_id = object::id(profile);
        df::add(&mut registry.id, handle, profile_id);
        registry.total_handles = registry.total_handles + 1;

        event::emit(HandleRegistered {
            registry_id: object::id(registry),
            handle,
            profile_id,
            timestamp: clock::timestamp_ms(clock),
        });
    }

    /// Look up a handle and return the profile ID (if it exists)
    public fun lookup_handle(registry: &Registry, handle: String): Option<ID> {
        if (df::exists_(&registry.id, handle)) {
            option::some(*df::borrow<String, ID>(&registry.id, handle))
        } else {
            option::none()
        }
    }

    // ======== Getter Functions ========

    public fun registry_total_handles(registry: &Registry): u64 {
        registry.total_handles
    }

    // ======== Test Helpers ========

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx)
    }
}
