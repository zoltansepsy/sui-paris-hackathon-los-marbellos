/// SuiPatron Core Module (Phase 2)
/// Decentralized creator support platform — tiered payments, encrypted content, on-chain access control
///
/// Core types: Platform (singleton), CreatorProfile (shared), Tier (value), Content (DOF),
///             AccessPass (owned NFT), CreatorCap, AdminCap
/// Patterns: OTW, Capability, Shared Objects, Dynamic Object Fields, Events, Version Tracking,
///           Coin Splitting (platform fees), Subscription Expiry
module suipatron::suipatron {
    use std::string::String;
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::event;
    use sui::clock::{Self, Clock};
    use sui::dynamic_object_field as dof;

    // ======== Version ========
    const VERSION: u64 = 2;

    // ======== Error Codes ========
    const EUnauthorized: u64 = 1;
    const EInsufficientPayment: u64 = 2;
    const EVersionMismatch: u64 = 3;
    const EAlreadyMigrated: u64 = 4;
    const ENotSubscriber: u64 = 5;
    const EWrongCreator: u64 = 6;
    const EZeroBalance: u64 = 7;
    #[allow(unused_const)]
    const ENoTiers: u64 = 8;
    const ETierIndexOutOfBounds: u64 = 9;
    const EDuplicateTierLevel: u64 = 10;
    const EZeroTip: u64 = 11;
    const EInvalidFeeBps: u64 = 12;
    #[allow(unused_const)]
    const EAccessPassExpired: u64 = 14;
    const EInvalidTierLevel: u64 = 15;

    // ======== OTW ========

    /// One-Time Witness — guarantees singleton Platform creation
    public struct SUIPATRON has drop {}

    // ======== Types ========

    /// Tier definition — stored in CreatorProfile.tiers vector
    /// store + copy + drop: value type, no UID needed
    public struct Tier has store, copy, drop {
        name: String,
        description: String,
        price: u64,
        tier_level: u64,
        duration_ms: Option<u64>,
    }

    /// Platform singleton — shared object, created once at package publish
    public struct Platform has key {
        id: UID,
        version: u64,
        admin: address,
        total_creators: u64,
        total_access_passes: u64,
        platform_fee_bps: u64,
        treasury: Balance<SUI>,
    }

    /// Admin capability — owned by the deployer
    public struct AdminCap has key, store {
        id: UID,
    }

    /// Creator profile — shared object with tiered access pricing
    /// Content items stored as dynamic object fields keyed by u64 index
    public struct CreatorProfile has key {
        id: UID,
        version: u64,
        owner: address,
        name: String,
        bio: String,
        avatar_blob_id: Option<String>,
        suins_name: Option<String>,
        tiers: vector<Tier>,
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
        min_tier_level: u64,
    }

    /// Creator capability — proves ownership of a specific CreatorProfile
    public struct CreatorCap has key, store {
        id: UID,
        creator_profile_id: ID,
    }

    /// Access pass NFT — proves supporter paid for access to a creator's content at a specific tier
    public struct AccessPass has key, store {
        id: UID,
        creator_profile_id: ID,
        purchased_at: u64,
        amount_paid: u64,
        supporter: address,
        tier_level: u64,
        expires_at: Option<u64>,
    }

    // ======== Events ========

    public struct ProfileCreated has copy, drop {
        profile_id: ID,
        owner: address,
        name: String,
        initial_tier_count: u64,
        timestamp: u64,
    }

    public struct ProfileUpdated has copy, drop {
        profile_id: ID,
        name: String,
        timestamp: u64,
    }

    public struct TierAdded has copy, drop {
        profile_id: ID,
        tier_name: String,
        tier_level: u64,
        price: u64,
        is_subscription: bool,
        timestamp: u64,
    }

    public struct ContentPublished has copy, drop {
        content_id: ID,
        profile_id: ID,
        blob_id: String,
        content_type: String,
        min_tier_level: u64,
        timestamp: u64,
    }

    public struct AccessPurchased has copy, drop {
        access_pass_id: ID,
        profile_id: ID,
        supporter: address,
        amount: u64,
        tier_level: u64,
        expires_at: Option<u64>,
        platform_fee: u64,
        timestamp: u64,
    }

    public struct EarningsWithdrawn has copy, drop {
        profile_id: ID,
        amount: u64,
        recipient: address,
        timestamp: u64,
    }

    public struct TipReceived has copy, drop {
        profile_id: ID,
        tipper: address,
        total_amount: u64,
        creator_amount: u64,
        platform_fee: u64,
        timestamp: u64,
    }

    public struct PlatformFeeUpdated has copy, drop {
        old_fee_bps: u64,
        new_fee_bps: u64,
        timestamp: u64,
    }

    public struct PlatformFeesWithdrawn has copy, drop {
        amount: u64,
        recipient: address,
        timestamp: u64,
    }

    public struct SubscriptionRenewed has copy, drop {
        access_pass_id: ID,
        profile_id: ID,
        supporter: address,
        new_expires_at: u64,
        amount_paid: u64,
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
            platform_fee_bps: 0,
            treasury: balance::zero(),
        };

        let admin_cap = AdminCap {
            id: object::new(ctx),
        };

        transfer::share_object(platform);
        transfer::transfer(admin_cap, ctx.sender());
    }

    // ======== Internal Helpers ========

    /// Find a tier by its tier_level in the vector
    fun find_tier_by_level(tiers: &vector<Tier>, level: u64): Tier {
        let len = vector::length(tiers);
        let mut i = 0u64;
        while (i < len) {
            let tier = *vector::borrow(tiers, i);
            if (tier.tier_level == level) {
                return tier
            };
            i = i + 1;
        };
        abort ETierIndexOutOfBounds
    }

    /// Calculate platform fee and return (creator_amount, platform_fee)
    fun calculate_fee_split(amount: u64, fee_bps: u64): (u64, u64) {
        let platform_fee = if (fee_bps > 0) {
            (amount * fee_bps) / 10000
        } else {
            0
        };
        (amount - platform_fee, platform_fee)
    }

    // ======== Entry Functions ========

    /// Create a new creator profile with an initial tier
    #[allow(lint(self_transfer))]
    public entry fun create_profile(
        platform: &mut Platform,
        name: String,
        bio: String,
        tier_name: String,
        tier_description: String,
        tier_price: u64,
        tier_level: u64,
        tier_duration_ms: Option<u64>,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        assert!(platform.version == VERSION, EVersionMismatch);
        assert!(tier_level > 0, EInvalidTierLevel);

        let sender = ctx.sender();
        let timestamp = clock::timestamp_ms(clock);

        let initial_tier = Tier {
            name: tier_name,
            description: tier_description,
            price: tier_price,
            tier_level,
            duration_ms: tier_duration_ms,
        };

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
            tiers: vector[initial_tier],
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
            initial_tier_count: 1,
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

        event::emit(ProfileUpdated {
            profile_id: object::id(profile),
            name: profile.name,
            timestamp,
        });
    }

    /// Add a new tier to a creator profile
    public fun add_tier(
        profile: &mut CreatorProfile,
        cap: &CreatorCap,
        name: String,
        description: String,
        price: u64,
        tier_level: u64,
        duration_ms: Option<u64>,
        clock: &Clock,
    ) {
        assert!(object::id(profile) == cap.creator_profile_id, EUnauthorized);
        assert!(profile.version == VERSION, EVersionMismatch);
        assert!(tier_level > 0, EInvalidTierLevel);

        // Check for duplicate tier_level
        let len = vector::length(&profile.tiers);
        let mut i = 0u64;
        while (i < len) {
            let existing = vector::borrow(&profile.tiers, i);
            assert!(existing.tier_level != tier_level, EDuplicateTierLevel);
            i = i + 1;
        };

        let tier = Tier {
            name,
            description,
            price,
            tier_level,
            duration_ms,
        };

        vector::push_back(&mut profile.tiers, tier);

        event::emit(TierAdded {
            profile_id: object::id(profile),
            tier_name: name,
            tier_level,
            price,
            is_subscription: option::is_some(&duration_ms),
            timestamp: clock::timestamp_ms(clock),
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
        min_tier_level: u64,
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
            min_tier_level,
        };

        let key = profile.content_count;
        dof::add(&mut profile.id, key, content);
        profile.content_count = profile.content_count + 1;

        event::emit(ContentPublished {
            content_id,
            profile_id: object::id(profile),
            blob_id,
            content_type,
            min_tier_level,
            timestamp,
        });
    }

    /// Purchase access to a creator's content at a specific tier
    #[allow(lint(self_transfer))]
    public entry fun purchase_access(
        platform: &mut Platform,
        profile: &mut CreatorProfile,
        tier_index: u64,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        assert!(platform.version == VERSION, EVersionMismatch);
        assert!(profile.version == VERSION, EVersionMismatch);
        assert!(tier_index < vector::length(&profile.tiers), ETierIndexOutOfBounds);

        let tier = *vector::borrow(&profile.tiers, tier_index);
        let payment_amount = coin::value(&payment);
        assert!(payment_amount >= tier.price, EInsufficientPayment);

        let sender = ctx.sender();
        let timestamp = clock::timestamp_ms(clock);

        // Fee split
        let (_creator_amount, platform_fee) = calculate_fee_split(payment_amount, platform.platform_fee_bps);

        let mut payment_balance = coin::into_balance(payment);

        if (platform_fee > 0) {
            let fee_balance = balance::split(&mut payment_balance, platform_fee);
            balance::join(&mut platform.treasury, fee_balance);
        };

        balance::join(&mut profile.balance, payment_balance);

        // Calculate expiry
        let expires_at = if (option::is_some(&tier.duration_ms)) {
            let duration = *option::borrow(&tier.duration_ms);
            option::some(timestamp + duration)
        } else {
            option::none()
        };

        let access_pass_uid = object::new(ctx);
        let access_pass_id = object::uid_to_inner(&access_pass_uid);

        let access_pass = AccessPass {
            id: access_pass_uid,
            creator_profile_id: object::id(profile),
            purchased_at: timestamp,
            amount_paid: payment_amount,
            supporter: sender,
            tier_level: tier.tier_level,
            expires_at,
        };

        profile.total_supporters = profile.total_supporters + 1;
        platform.total_access_passes = platform.total_access_passes + 1;

        event::emit(AccessPurchased {
            access_pass_id,
            profile_id: object::id(profile),
            supporter: sender,
            amount: payment_amount,
            tier_level: tier.tier_level,
            expires_at,
            platform_fee,
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

    /// Send a one-time tip to a creator. Platform fee is applied.
    public fun tip(
        platform: &mut Platform,
        profile: &mut CreatorProfile,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        assert!(platform.version == VERSION, EVersionMismatch);
        assert!(profile.version == VERSION, EVersionMismatch);

        let amount = coin::value(&payment);
        assert!(amount > 0, EZeroTip);

        let timestamp = clock::timestamp_ms(clock);

        let (creator_amount, platform_fee) = calculate_fee_split(amount, platform.platform_fee_bps);

        let mut payment_balance = coin::into_balance(payment);

        if (platform_fee > 0) {
            let fee_balance = balance::split(&mut payment_balance, platform_fee);
            balance::join(&mut platform.treasury, fee_balance);
        };

        balance::join(&mut profile.balance, payment_balance);

        event::emit(TipReceived {
            profile_id: object::id(profile),
            tipper: ctx.sender(),
            total_amount: amount,
            creator_amount,
            platform_fee,
            timestamp,
        });
    }

    /// Admin-only: set the platform fee in basis points (max 10000 = 100%)
    public fun set_platform_fee(
        platform: &mut Platform,
        _cap: &AdminCap,
        fee_bps: u64,
        clock: &Clock,
    ) {
        assert!(platform.version == VERSION, EVersionMismatch);
        assert!(fee_bps <= 10000, EInvalidFeeBps);

        let old_fee = platform.platform_fee_bps;
        platform.platform_fee_bps = fee_bps;

        event::emit(PlatformFeeUpdated {
            old_fee_bps: old_fee,
            new_fee_bps: fee_bps,
            timestamp: clock::timestamp_ms(clock),
        });
    }

    /// Admin-only: withdraw accumulated platform treasury
    public fun withdraw_platform_fees(
        platform: &mut Platform,
        _cap: &AdminCap,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        assert!(platform.version == VERSION, EVersionMismatch);

        let amount = balance::value(&platform.treasury);
        assert!(amount > 0, EZeroBalance);

        let recipient = platform.admin;
        let timestamp = clock::timestamp_ms(clock);

        let earnings = coin::take(&mut platform.treasury, amount, ctx);
        transfer::public_transfer(earnings, recipient);

        event::emit(PlatformFeesWithdrawn {
            amount,
            recipient,
            timestamp,
        });
    }

    /// Renew an expired (or about-to-expire) subscription AccessPass
    public fun renew_subscription(
        platform: &mut Platform,
        profile: &mut CreatorProfile,
        access_pass: &mut AccessPass,
        payment: Coin<SUI>,
        clock: &Clock,
        _ctx: &mut TxContext,
    ) {
        assert!(platform.version == VERSION, EVersionMismatch);
        assert!(profile.version == VERSION, EVersionMismatch);
        assert!(access_pass.creator_profile_id == object::id(profile), EWrongCreator);
        assert!(option::is_some(&access_pass.expires_at), ENotSubscriber);

        let timestamp = clock::timestamp_ms(clock);

        // Find the matching tier by tier_level
        let tier = find_tier_by_level(&profile.tiers, access_pass.tier_level);
        assert!(option::is_some(&tier.duration_ms), ENotSubscriber);

        let payment_amount = coin::value(&payment);
        assert!(payment_amount >= tier.price, EInsufficientPayment);

        // Fee split
        let (_creator_amount, platform_fee) = calculate_fee_split(payment_amount, platform.platform_fee_bps);

        let mut payment_balance = coin::into_balance(payment);

        if (platform_fee > 0) {
            let fee_balance = balance::split(&mut payment_balance, platform_fee);
            balance::join(&mut platform.treasury, fee_balance);
        };

        balance::join(&mut profile.balance, payment_balance);

        // Extend expiry from current expiry or now (whichever is later)
        let duration = *option::borrow(&tier.duration_ms);
        let current_expiry = *option::borrow(&access_pass.expires_at);
        let base_time = if (current_expiry > timestamp) {
            current_expiry
        } else {
            timestamp
        };
        let new_expires_at = base_time + duration;

        access_pass.expires_at = option::some(new_expires_at);
        access_pass.amount_paid = access_pass.amount_paid + payment_amount;

        event::emit(SubscriptionRenewed {
            access_pass_id: object::id(access_pass),
            profile_id: object::id(profile),
            supporter: access_pass.supporter,
            new_expires_at,
            amount_paid: payment_amount,
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

    public fun access_pass_tier_level(pass: &AccessPass): u64 {
        pass.tier_level
    }

    public fun access_pass_expires_at(pass: &AccessPass): Option<u64> {
        pass.expires_at
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

    public fun profile_tiers(profile: &CreatorProfile): &vector<Tier> {
        &profile.tiers
    }

    public fun profile_tier_count(profile: &CreatorProfile): u64 {
        vector::length(&profile.tiers)
    }

    public fun platform_total_creators(platform: &Platform): u64 {
        platform.total_creators
    }

    public fun platform_total_access_passes(platform: &Platform): u64 {
        platform.total_access_passes
    }

    public fun platform_fee_bps(platform: &Platform): u64 {
        platform.platform_fee_bps
    }

    public fun platform_treasury_balance(platform: &Platform): u64 {
        balance::value(&platform.treasury)
    }

    public fun cap_profile_id(cap: &CreatorCap): ID {
        cap.creator_profile_id
    }

    // Tier getters
    public fun tier_name(tier: &Tier): String { tier.name }
    public fun tier_price(tier: &Tier): u64 { tier.price }
    public fun tier_level(tier: &Tier): u64 { tier.tier_level }
    public fun tier_description(tier: &Tier): String { tier.description }
    public fun tier_duration_ms(tier: &Tier): Option<u64> { tier.duration_ms }

    // ======== Test Helpers ========

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(SUIPATRON {}, ctx)
    }
}
