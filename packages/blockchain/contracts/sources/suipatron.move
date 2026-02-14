/// SuiPatron Core Module
/// Decentralized creator support platform — one-time payments, encrypted content, on-chain access control
///
/// Core types: Platform (singleton), CreatorProfile (shared), Content (DOF), AccessPass (owned NFT)
/// Patterns: OTW, Capability, Shared Objects, Dynamic Object Fields, Events, Version Tracking
module suipatron::suipatron {
    use std::string::String;
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::event;
    use sui::clock::{Self, Clock};
    use sui::dynamic_object_field as dof;

    // ======== Version ========
    const VERSION: u64 = 1;

    // ======== Error Codes ========
    const EUnauthorized: u64 = 1;
    const EInsufficientPayment: u64 = 2;
    const EVersionMismatch: u64 = 3;
    const EAlreadyMigrated: u64 = 4;
    #[allow(unused_const)]
    const ENotSubscriber: u64 = 5;
    #[allow(unused_const)]
    const EWrongCreator: u64 = 6;
    const EZeroBalance: u64 = 7;

    // ======== OTW ========

    /// One-Time Witness — guarantees singleton Platform creation
    public struct SUIPATRON has drop {}

    // ======== Types ========

    /// Platform singleton — shared object, created once at package publish
    public struct Platform has key {
        id: UID,
        version: u64,
        admin: address,
        total_creators: u64,
        total_access_passes: u64,
    }

    /// Admin capability — owned by the deployer
    public struct AdminCap has key, store {
        id: UID,
    }

    /// Creator profile — shared object with flat access price
    /// Content items stored as dynamic object fields keyed by u64 index
    public struct CreatorProfile has key {
        id: UID,
        version: u64,
        owner: address,
        name: String,
        bio: String,
        avatar_blob_id: Option<String>,
        suins_name: Option<String>,
        price: u64,
        content_count: u64,
        total_supporters: u64,
        balance: Balance<SUI>,
    }

    /// Content item — stored as dynamic object field on CreatorProfile
    public struct Content has key, store {
        id: UID,
        title: String,
        description: String,
        blob_id: String,
        created_at: u64,
        content_type: String,
    }

    /// Creator capability — proves ownership of a specific CreatorProfile
    public struct CreatorCap has key, store {
        id: UID,
        creator_profile_id: ID,
    }

    /// Access pass NFT — proves supporter paid for access to a creator's content
    public struct AccessPass has key, store {
        id: UID,
        creator_profile_id: ID,
        purchased_at: u64,
        amount_paid: u64,
        supporter: address,
    }

    // ======== Events ========

    public struct ProfileCreated has copy, drop {
        profile_id: ID,
        owner: address,
        name: String,
        price: u64,
        timestamp: u64,
    }

    public struct ProfileUpdated has copy, drop {
        profile_id: ID,
        name: String,
        timestamp: u64,
    }

    public struct ContentPublished has copy, drop {
        content_id: ID,
        profile_id: ID,
        blob_id: String,
        content_type: String,
        timestamp: u64,
    }

    public struct AccessPurchased has copy, drop {
        access_pass_id: ID,
        profile_id: ID,
        supporter: address,
        amount: u64,
        timestamp: u64,
    }

    public struct EarningsWithdrawn has copy, drop {
        profile_id: ID,
        amount: u64,
        recipient: address,
        timestamp: u64,
    }

    // ======== Init ========

    /// Package initialization — creates Platform singleton + AdminCap
    fun init(_otw: SUIPATRON, ctx: &mut TxContext) {
        let platform = Platform {
            id: object::new(ctx),
            version: VERSION,
            admin: ctx.sender(),
            total_creators: 0,
            total_access_passes: 0,
        };

        let admin_cap = AdminCap {
            id: object::new(ctx),
        };

        transfer::share_object(platform);
        transfer::transfer(admin_cap, ctx.sender());
    }

    // ======== Entry Functions ========

    /// Create a new creator profile with a flat access price
    #[allow(lint(self_transfer))]
    public entry fun create_profile(
        platform: &mut Platform,
        name: String,
        bio: String,
        price: u64,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        assert!(platform.version == VERSION, EVersionMismatch);

        let sender = ctx.sender();
        let timestamp = clock::timestamp_ms(clock);

        let profile_uid = object::new(ctx);
        let profile_id = object::uid_to_inner(&profile_uid);

        let profile = CreatorProfile {
            id: profile_uid,
            version: VERSION,
            owner: sender,
            name,
            bio,
            avatar_blob_id: option::none(),
            suins_name: option::none(),
            price,
            content_count: 0,
            total_supporters: 0,
            balance: balance::zero(),
        };

        let cap = CreatorCap {
            id: object::new(ctx),
            creator_profile_id: profile_id,
        };

        platform.total_creators = platform.total_creators + 1;

        event::emit(ProfileCreated {
            profile_id,
            owner: sender,
            name,
            price,
            timestamp,
        });

        transfer::share_object(profile);
        transfer::transfer(cap, sender);
    }

    /// Update creator profile metadata (partial updates via Option params)
    public entry fun update_profile(
        profile: &mut CreatorProfile,
        cap: &CreatorCap,
        mut name: Option<String>,
        mut bio: Option<String>,
        mut avatar_blob_id: Option<String>,
        mut suins_name: Option<String>,
        mut price: Option<u64>,
        clock: &Clock,
    ) {
        assert!(object::id(profile) == cap.creator_profile_id, EUnauthorized);
        assert!(profile.version == VERSION, EVersionMismatch);

        let timestamp = clock::timestamp_ms(clock);

        if (option::is_some(&name)) {
            profile.name = option::extract(&mut name);
        };
        if (option::is_some(&bio)) {
            profile.bio = option::extract(&mut bio);
        };
        if (option::is_some(&avatar_blob_id)) {
            profile.avatar_blob_id = option::some(option::extract(&mut avatar_blob_id));
        };
        if (option::is_some(&suins_name)) {
            profile.suins_name = option::some(option::extract(&mut suins_name));
        };
        if (option::is_some(&price)) {
            profile.price = option::extract(&mut price);
        };

        event::emit(ProfileUpdated {
            profile_id: object::id(profile),
            name: profile.name,
            timestamp,
        });
    }

    /// Publish encrypted content as dynamic object field on CreatorProfile
    public entry fun publish_content(
        profile: &mut CreatorProfile,
        cap: &CreatorCap,
        title: String,
        description: String,
        blob_id: String,
        content_type: String,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        assert!(object::id(profile) == cap.creator_profile_id, EUnauthorized);
        assert!(profile.version == VERSION, EVersionMismatch);

        let timestamp = clock::timestamp_ms(clock);

        let content_uid = object::new(ctx);
        let content_id = object::uid_to_inner(&content_uid);

        let content = Content {
            id: content_uid,
            title,
            description,
            blob_id,
            created_at: timestamp,
            content_type,
        };

        let key = profile.content_count;
        dof::add(&mut profile.id, key, content);
        profile.content_count = profile.content_count + 1;

        event::emit(ContentPublished {
            content_id,
            profile_id: object::id(profile),
            blob_id,
            content_type,
            timestamp,
        });
    }

    /// Purchase access to a creator's content (one-time flat payment)
    #[allow(lint(self_transfer))]
    public entry fun purchase_access(
        platform: &mut Platform,
        profile: &mut CreatorProfile,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        assert!(platform.version == VERSION, EVersionMismatch);
        assert!(profile.version == VERSION, EVersionMismatch);

        let payment_amount = coin::value(&payment);
        assert!(payment_amount >= profile.price, EInsufficientPayment);

        let sender = ctx.sender();
        let timestamp = clock::timestamp_ms(clock);

        let payment_balance = coin::into_balance(payment);
        balance::join(&mut profile.balance, payment_balance);

        let access_pass_uid = object::new(ctx);
        let access_pass_id = object::uid_to_inner(&access_pass_uid);

        let access_pass = AccessPass {
            id: access_pass_uid,
            creator_profile_id: object::id(profile),
            purchased_at: timestamp,
            amount_paid: payment_amount,
            supporter: sender,
        };

        profile.total_supporters = profile.total_supporters + 1;
        platform.total_access_passes = platform.total_access_passes + 1;

        event::emit(AccessPurchased {
            access_pass_id,
            profile_id: object::id(profile),
            supporter: sender,
            amount: payment_amount,
            timestamp,
        });

        transfer::transfer(access_pass, sender);
    }

    /// Withdraw accumulated earnings from creator profile
    public entry fun withdraw_earnings(
        profile: &mut CreatorProfile,
        cap: &CreatorCap,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        assert!(object::id(profile) == cap.creator_profile_id, EUnauthorized);
        assert!(profile.version == VERSION, EVersionMismatch);

        let amount = balance::value(&profile.balance);
        assert!(amount > 0, EZeroBalance);

        let recipient = profile.owner;
        let timestamp = clock::timestamp_ms(clock);

        let earnings = coin::take(&mut profile.balance, amount, ctx);
        transfer::public_transfer(earnings, recipient);

        event::emit(EarningsWithdrawn {
            profile_id: object::id(profile),
            amount,
            recipient,
            timestamp,
        });
    }

    /// Migrate Platform version after package upgrade (admin only)
    public fun migrate(platform: &mut Platform, _cap: &AdminCap) {
        assert!(platform.version < VERSION, EAlreadyMigrated);
        platform.version = VERSION;
    }

    // ======== Getter Functions ========

    public fun access_pass_creator_profile_id(pass: &AccessPass): ID {
        pass.creator_profile_id
    }

    public fun access_pass_supporter(pass: &AccessPass): address {
        pass.supporter
    }

    public fun access_pass_purchased_at(pass: &AccessPass): u64 {
        pass.purchased_at
    }

    public fun access_pass_amount_paid(pass: &AccessPass): u64 {
        pass.amount_paid
    }

    public fun profile_price(profile: &CreatorProfile): u64 {
        profile.price
    }

    public fun profile_owner(profile: &CreatorProfile): address {
        profile.owner
    }

    public fun profile_content_count(profile: &CreatorProfile): u64 {
        profile.content_count
    }

    public fun profile_total_supporters(profile: &CreatorProfile): u64 {
        profile.total_supporters
    }

    public fun profile_balance(profile: &CreatorProfile): u64 {
        balance::value(&profile.balance)
    }

    public fun profile_name(profile: &CreatorProfile): String {
        profile.name
    }

    public fun platform_total_creators(platform: &Platform): u64 {
        platform.total_creators
    }

    public fun platform_total_access_passes(platform: &Platform): u64 {
        platform.total_access_passes
    }

    public fun cap_profile_id(cap: &CreatorCap): ID {
        cap.creator_profile_id
    }

    // ======== Test Helpers ========

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(SUIPATRON {}, ctx)
    }
}
