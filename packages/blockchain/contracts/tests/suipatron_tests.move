#[test_only]
module suipatron::suipatron_tests {
    use sui::test_scenario::{Self as ts};
    use sui::clock;
    use sui::coin;
    use sui::sui::SUI;
    use std::string;
    use suipatron::suipatron::{
        Self,
        Platform,
        AdminCap,
        CreatorProfile,
        CreatorCap,
        AccessPass,
    };
    use suipatron::seal_policy;
    use suipatron::registry::{Self, Registry};

    // ======== Test Addresses ========
    const ADMIN: address = @0xAD;
    const CREATOR: address = @0xC1;
    const CREATOR_2: address = @0xC2;
    const SUPPORTER: address = @0x51;
    #[allow(unused_const)]
    const SUPPORTER_2: address = @0x52;

    // ======== Test Values ========
    const DEFAULT_PRICE: u64 = 5_000_000_000; // 5 SUI
    const TIER_1_PRICE: u64 = 1_000_000_000;  // 1 SUI
    const TIER_2_PRICE: u64 = 5_000_000_000;  // 5 SUI
    const TIER_3_PRICE: u64 = 10_000_000_000; // 10 SUI
    const THIRTY_DAYS_MS: u64 = 2_592_000_000; // 30 days in ms
    const FEE_250_BPS: u64 = 250; // 2.5%

    // ======== Helpers ========

    fun init_platform(scenario: &mut ts::Scenario) {
        ts::next_tx(scenario, ADMIN);
        suipatron::init_for_testing(ts::ctx(scenario));
    }

    fun init_registry(scenario: &mut ts::Scenario) {
        ts::next_tx(scenario, ADMIN);
        registry::init_for_testing(ts::ctx(scenario));
    }

    /// Creates a profile with a single permanent tier and returns its ID
    fun create_test_profile(
        scenario: &mut ts::Scenario,
        creator: address,
        name: vector<u8>,
        tier_price: u64,
    ): ID {
        ts::next_tx(scenario, creator);
        let mut platform = ts::take_shared<Platform>(scenario);
        let clock = clock::create_for_testing(ts::ctx(scenario));

        suipatron::create_profile(
            &mut platform,
            string::utf8(name),
            string::utf8(b"Test bio"),
            string::utf8(b"Basic"),
            string::utf8(b"Basic access tier"),
            tier_price,
            1u64,
            option::none(),
            &clock,
            ts::ctx(scenario),
        );

        clock::destroy_for_testing(clock);
        ts::return_shared(platform);

        ts::next_tx(scenario, creator);
        let profile = ts::take_shared<CreatorProfile>(scenario);
        let profile_id = object::id(&profile);
        ts::return_shared(profile);
        profile_id
    }

    /// Creates a profile with a subscription tier and returns its ID
    fun create_subscription_profile(
        scenario: &mut ts::Scenario,
        creator: address,
        name: vector<u8>,
        tier_price: u64,
        duration_ms: u64,
    ): ID {
        ts::next_tx(scenario, creator);
        let mut platform = ts::take_shared<Platform>(scenario);
        let clock = clock::create_for_testing(ts::ctx(scenario));

        suipatron::create_profile(
            &mut platform,
            string::utf8(name),
            string::utf8(b"Test bio"),
            string::utf8(b"Monthly"),
            string::utf8(b"Monthly subscription"),
            tier_price,
            1u64,
            option::some(duration_ms),
            &clock,
            ts::ctx(scenario),
        );

        clock::destroy_for_testing(clock);
        ts::return_shared(platform);

        ts::next_tx(scenario, creator);
        let profile = ts::take_shared<CreatorProfile>(scenario);
        let profile_id = object::id(&profile);
        ts::return_shared(profile);
        profile_id
    }

    fun mint_sui(amount: u64, scenario: &mut ts::Scenario): coin::Coin<SUI> {
        coin::mint_for_testing<SUI>(amount, ts::ctx(scenario))
    }

    /// Build a 40-byte SEAL identity from profile ID and min_tier_level
    fun build_seal_identity(profile_id: &ID, min_tier_level: u64): vector<u8> {
        let mut seal_id = object::id_to_bytes(profile_id);
        // Append tier_level as little-endian u64
        let mut i = 0u64;
        while (i < 8) {
            vector::push_back(&mut seal_id, (((min_tier_level >> ((i * 8) as u8)) & 0xFF) as u8));
            i = i + 1;
        };
        seal_id
    }

    // ================================================================
    // Category 1: Initialization
    // ================================================================

    #[test]
    fun test_init_creates_platform_and_admin_cap() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let platform = ts::take_shared<Platform>(&scenario);
            assert!(suipatron::platform_total_creators(&platform) == 0);
            assert!(suipatron::platform_total_access_passes(&platform) == 0);
            assert!(suipatron::platform_fee_bps(&platform) == 0);
            assert!(suipatron::platform_treasury_balance(&platform) == 0);
            ts::return_shared(platform);
        };

        ts::next_tx(&mut scenario, ADMIN);
        {
            let cap = ts::take_from_sender<AdminCap>(&scenario);
            ts::return_to_sender(&scenario, cap);
        };

        ts::end(scenario);
    }

    // ================================================================
    // Category 2: Profile Creation (with tiers)
    // ================================================================

    #[test]
    fun test_create_profile_with_tier() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);

        ts::next_tx(&mut scenario, CREATOR);
        {
            let profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            assert!(suipatron::profile_owner(&profile) == CREATOR);
            assert!(suipatron::profile_tier_count(&profile) == 1);
            assert!(suipatron::profile_content_count(&profile) == 0);
            assert!(suipatron::profile_total_supporters(&profile) == 0);
            assert!(suipatron::profile_balance(&profile) == 0);
            assert!(suipatron::profile_name(&profile) == string::utf8(b"Alice"));
            ts::return_shared(profile);
        };

        ts::next_tx(&mut scenario, CREATOR);
        {
            let cap = ts::take_from_sender<CreatorCap>(&scenario);
            ts::return_to_sender(&scenario, cap);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_create_profile_increments_total_creators() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);
        create_test_profile(&mut scenario, CREATOR_2, b"Bob", DEFAULT_PRICE);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let platform = ts::take_shared<Platform>(&scenario);
            assert!(suipatron::platform_total_creators(&platform) == 2);
            ts::return_shared(platform);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_create_profile_zero_tier_level_fails() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);

        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            suipatron::create_profile(
                &mut platform,
                string::utf8(b"Bad"),
                string::utf8(b"Bio"),
                string::utf8(b"Tier"),
                string::utf8(b"Desc"),
                DEFAULT_PRICE,
                0u64, // tier_level 0 is invalid
                option::none(),
                &clock,
                ts::ctx(&mut scenario),
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(platform);
        };

        ts::end(scenario);
    }

    // ================================================================
    // Category 3: Profile Update
    // ================================================================

    #[test]
    fun test_update_profile_name() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);

        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let cap = ts::take_from_sender<CreatorCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            suipatron::update_profile(
                &mut profile,
                &cap,
                option::some(string::utf8(b"Alice Updated")),
                option::none(),
                option::none(),
                option::none(),
                &clock,
            );

            assert!(suipatron::profile_name(&profile) == string::utf8(b"Alice Updated"));

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(profile);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_update_profile_wrong_cap_fails() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_a_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);
        create_test_profile(&mut scenario, CREATOR_2, b"Bob", DEFAULT_PRICE);

        ts::next_tx(&mut scenario, CREATOR_2);
        {
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_a_id);
            let cap = ts::take_from_sender<CreatorCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            suipatron::update_profile(
                &mut profile,
                &cap,
                option::some(string::utf8(b"Hacked")),
                option::none(),
                option::none(),
                option::none(),
                &clock,
            );

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(profile);
        };

        ts::end(scenario);
    }

    // ================================================================
    // Category 4: Add Tier
    // ================================================================

    #[test]
    fun test_add_tier() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", TIER_1_PRICE);

        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let cap = ts::take_from_sender<CreatorCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            suipatron::add_tier(
                &mut profile,
                &cap,
                string::utf8(b"Silver"),
                string::utf8(b"Silver access"),
                TIER_2_PRICE,
                2u64,
                option::none(),
                &clock,
            );

            assert!(suipatron::profile_tier_count(&profile) == 2);

            suipatron::add_tier(
                &mut profile,
                &cap,
                string::utf8(b"Gold"),
                string::utf8(b"Gold access"),
                TIER_3_PRICE,
                3u64,
                option::none(),
                &clock,
            );

            assert!(suipatron::profile_tier_count(&profile) == 3);

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(profile);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_add_tier_duplicate_level_fails() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", TIER_1_PRICE);

        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let cap = ts::take_from_sender<CreatorCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            // Profile already has tier_level 1 from creation
            suipatron::add_tier(
                &mut profile,
                &cap,
                string::utf8(b"Duplicate"),
                string::utf8(b"Same level"),
                TIER_2_PRICE,
                1u64, // duplicate!
                option::none(),
                &clock,
            );

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(profile);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_add_tier_wrong_cap_fails() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_a_id = create_test_profile(&mut scenario, CREATOR, b"Alice", TIER_1_PRICE);
        create_test_profile(&mut scenario, CREATOR_2, b"Bob", TIER_1_PRICE);

        ts::next_tx(&mut scenario, CREATOR_2);
        {
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_a_id);
            let cap = ts::take_from_sender<CreatorCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            suipatron::add_tier(
                &mut profile,
                &cap,
                string::utf8(b"Hacked Tier"),
                string::utf8(b"Bad"),
                TIER_2_PRICE,
                2u64,
                option::none(),
                &clock,
            );

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(profile);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_add_subscription_tier() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", TIER_1_PRICE);

        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let cap = ts::take_from_sender<CreatorCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            suipatron::add_tier(
                &mut profile,
                &cap,
                string::utf8(b"Monthly Pro"),
                string::utf8(b"Monthly pro subscription"),
                TIER_2_PRICE,
                2u64,
                option::some(THIRTY_DAYS_MS),
                &clock,
            );

            assert!(suipatron::profile_tier_count(&profile) == 2);

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(profile);
        };

        ts::end(scenario);
    }

    // ================================================================
    // Category 5: Content Publishing
    // ================================================================

    #[test]
    fun test_publish_content_with_tier_level() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);

        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let cap = ts::take_from_sender<CreatorCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            suipatron::publish_content(
                &mut profile,
                &cap,
                string::utf8(b"My First Post"),
                string::utf8(b"Exclusive artwork"),
                string::utf8(b"walrus_blob_id_123"),
                string::utf8(b"image"),
                1u64, // min_tier_level
                &clock,
                ts::ctx(&mut scenario),
            );

            assert!(suipatron::profile_content_count(&profile) == 1);

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(profile);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_publish_multiple_content() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);

        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let cap = ts::take_from_sender<CreatorCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            let mut i = 0u64;
            while (i < 3u64) {
                suipatron::publish_content(
                    &mut profile,
                    &cap,
                    string::utf8(b"Post"),
                    string::utf8(b"Description"),
                    string::utf8(b"blob_id"),
                    string::utf8(b"text"),
                    1u64,
                    &clock,
                    ts::ctx(&mut scenario),
                );
                i = i + 1;
            };

            assert!(suipatron::profile_content_count(&profile) == 3);

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(profile);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_publish_content_wrong_cap_fails() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_a_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);
        create_test_profile(&mut scenario, CREATOR_2, b"Bob", DEFAULT_PRICE);

        ts::next_tx(&mut scenario, CREATOR_2);
        {
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_a_id);
            let cap = ts::take_from_sender<CreatorCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            suipatron::publish_content(
                &mut profile,
                &cap,
                string::utf8(b"Hacked Post"),
                string::utf8(b"Bad"),
                string::utf8(b"bad_blob"),
                string::utf8(b"text"),
                1u64,
                &clock,
                ts::ctx(&mut scenario),
            );

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(profile);
        };

        ts::end(scenario);
    }

    // ================================================================
    // Category 6: Access Purchase (with tiers)
    // ================================================================

    #[test]
    fun test_purchase_access_tier() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);

        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(DEFAULT_PRICE, &mut scenario);

            suipatron::purchase_access(
                &mut platform,
                &mut profile,
                0u64, // tier_index
                payment,
                &clock,
                ts::ctx(&mut scenario),
            );

            assert!(suipatron::profile_balance(&profile) == DEFAULT_PRICE);
            assert!(suipatron::profile_total_supporters(&profile) == 1);
            assert!(suipatron::platform_total_access_passes(&platform) == 1);

            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let pass = ts::take_from_sender<AccessPass>(&scenario);
            assert!(suipatron::access_pass_supporter(&pass) == SUPPORTER);
            assert!(suipatron::access_pass_amount_paid(&pass) == DEFAULT_PRICE);
            assert!(suipatron::access_pass_tier_level(&pass) == 1);
            assert!(option::is_none(&suipatron::access_pass_expires_at(&pass)));
            ts::return_to_sender(&scenario, pass);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_purchase_access_overpayment() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);

        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let overpayment = 10_000_000_000u64;
            let payment = mint_sui(overpayment, &mut scenario);

            suipatron::purchase_access(
                &mut platform,
                &mut profile,
                0u64,
                payment,
                &clock,
                ts::ctx(&mut scenario),
            );

            assert!(suipatron::profile_balance(&profile) == overpayment);

            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_purchase_access_insufficient_payment_fails() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);

        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(1_000_000_000, &mut scenario);

            suipatron::purchase_access(
                &mut platform,
                &mut profile,
                0u64,
                payment,
                &clock,
                ts::ctx(&mut scenario),
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_purchase_access_invalid_tier_index_fails() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);

        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(DEFAULT_PRICE, &mut scenario);

            suipatron::purchase_access(
                &mut platform,
                &mut profile,
                5u64, // out of bounds
                payment,
                &clock,
                ts::ctx(&mut scenario),
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_purchase_subscription_access() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_id = create_subscription_profile(
            &mut scenario, CREATOR, b"Alice", DEFAULT_PRICE, THIRTY_DAYS_MS,
        );

        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(DEFAULT_PRICE, &mut scenario);

            suipatron::purchase_access(
                &mut platform,
                &mut profile,
                0u64,
                payment,
                &clock,
                ts::ctx(&mut scenario),
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let pass = ts::take_from_sender<AccessPass>(&scenario);
            assert!(suipatron::access_pass_tier_level(&pass) == 1);
            let expires_at = suipatron::access_pass_expires_at(&pass);
            assert!(option::is_some(&expires_at));
            // Clock was at 0, so expires_at = 0 + THIRTY_DAYS_MS
            assert!(*option::borrow(&expires_at) == THIRTY_DAYS_MS);
            ts::return_to_sender(&scenario, pass);
        };

        ts::end(scenario);
    }

    // ================================================================
    // Category 7: Withdrawal
    // ================================================================

    #[test]
    fun test_withdraw_earnings() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);

        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(DEFAULT_PRICE, &mut scenario);

            suipatron::purchase_access(
                &mut platform, &mut profile, 0u64, payment, &clock,
                ts::ctx(&mut scenario),
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let cap = ts::take_from_sender<CreatorCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            assert!(suipatron::profile_balance(&profile) == DEFAULT_PRICE);

            suipatron::withdraw_earnings(
                &mut profile, &cap, &clock,
                ts::ctx(&mut scenario),
            );

            assert!(suipatron::profile_balance(&profile) == 0);

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(profile);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_withdraw_zero_balance_fails() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);

        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let cap = ts::take_from_sender<CreatorCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            suipatron::withdraw_earnings(
                &mut profile, &cap, &clock,
                ts::ctx(&mut scenario),
            );

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(profile);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_withdraw_wrong_cap_fails() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_a_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);
        create_test_profile(&mut scenario, CREATOR_2, b"Bob", DEFAULT_PRICE);

        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_a_id);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(DEFAULT_PRICE, &mut scenario);

            suipatron::purchase_access(
                &mut platform, &mut profile, 0u64, payment, &clock,
                ts::ctx(&mut scenario),
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        ts::next_tx(&mut scenario, CREATOR_2);
        {
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_a_id);
            let cap = ts::take_from_sender<CreatorCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            suipatron::withdraw_earnings(
                &mut profile, &cap, &clock,
                ts::ctx(&mut scenario),
            );

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(profile);
        };

        ts::end(scenario);
    }

    // ================================================================
    // Category 8: Platform Fees
    // ================================================================

    #[test]
    fun test_set_platform_fee() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let cap = ts::take_from_sender<AdminCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            assert!(suipatron::platform_fee_bps(&platform) == 0);

            suipatron::set_platform_fee(&mut platform, &cap, FEE_250_BPS, &clock);

            assert!(suipatron::platform_fee_bps(&platform) == FEE_250_BPS);

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(platform);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_set_platform_fee_too_high_fails() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let cap = ts::take_from_sender<AdminCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            suipatron::set_platform_fee(&mut platform, &cap, 10001, &clock); // > 100%

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(platform);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_purchase_with_platform_fee() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);

        // Set 10% fee (1000 bps)
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let cap = ts::take_from_sender<AdminCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            suipatron::set_platform_fee(&mut platform, &cap, 1000, &clock);

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(platform);
        };

        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);

        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(DEFAULT_PRICE, &mut scenario);

            suipatron::purchase_access(
                &mut platform, &mut profile, 0u64, payment, &clock,
                ts::ctx(&mut scenario),
            );

            // 10% of 5 SUI = 0.5 SUI
            let expected_fee = DEFAULT_PRICE / 10;
            let expected_creator = DEFAULT_PRICE - expected_fee;

            assert!(suipatron::profile_balance(&profile) == expected_creator);
            assert!(suipatron::platform_treasury_balance(&platform) == expected_fee);

            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_withdraw_platform_fees() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);

        // Set 10% fee
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let cap = ts::take_from_sender<AdminCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            suipatron::set_platform_fee(&mut platform, &cap, 1000, &clock);
            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(platform);
        };

        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);

        // Purchase to generate fees
        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(DEFAULT_PRICE, &mut scenario);
            suipatron::purchase_access(
                &mut platform, &mut profile, 0u64, payment, &clock,
                ts::ctx(&mut scenario),
            );
            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        // Admin withdraws platform fees
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let cap = ts::take_from_sender<AdminCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            let expected_fee = DEFAULT_PRICE / 10;
            assert!(suipatron::platform_treasury_balance(&platform) == expected_fee);

            suipatron::withdraw_platform_fees(&mut platform, &cap, &clock, ts::ctx(&mut scenario));

            assert!(suipatron::platform_treasury_balance(&platform) == 0);

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(platform);
        };

        ts::end(scenario);
    }

    // ================================================================
    // Category 9: Tips
    // ================================================================

    #[test]
    fun test_tip_no_fee() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);

        let tip_amount = 2_000_000_000u64; // 2 SUI

        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(tip_amount, &mut scenario);

            suipatron::tip(&mut platform, &mut profile, payment, &clock, ts::ctx(&mut scenario));

            // No fee, so creator gets full amount
            assert!(suipatron::profile_balance(&profile) == tip_amount);
            assert!(suipatron::platform_treasury_balance(&platform) == 0);

            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_tip_with_platform_fee() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);

        // Set 5% fee
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let cap = ts::take_from_sender<AdminCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            suipatron::set_platform_fee(&mut platform, &cap, 500, &clock);
            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(platform);
        };

        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);

        let tip_amount = 10_000_000_000u64; // 10 SUI

        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(tip_amount, &mut scenario);

            suipatron::tip(&mut platform, &mut profile, payment, &clock, ts::ctx(&mut scenario));

            // 5% of 10 SUI = 0.5 SUI
            let expected_fee = tip_amount * 500 / 10000;
            assert!(suipatron::profile_balance(&profile) == tip_amount - expected_fee);
            assert!(suipatron::platform_treasury_balance(&platform) == expected_fee);

            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_tip_zero_amount_fails() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);

        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(0, &mut scenario);

            suipatron::tip(&mut platform, &mut profile, payment, &clock, ts::ctx(&mut scenario));

            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        ts::end(scenario);
    }

    // ================================================================
    // Category 10: Subscription Renewal
    // ================================================================

    #[test]
    fun test_renew_subscription_before_expiry() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_id = create_subscription_profile(
            &mut scenario, CREATOR, b"Alice", DEFAULT_PRICE, THIRTY_DAYS_MS,
        );

        // Purchase subscription at time 0
        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(DEFAULT_PRICE, &mut scenario);

            suipatron::purchase_access(
                &mut platform, &mut profile, 0u64, payment, &clock,
                ts::ctx(&mut scenario),
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        // Renew at day 15 (before expiry)
        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let mut pass = ts::take_from_sender<AccessPass>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let half_month = THIRTY_DAYS_MS / 2;
            clock::set_for_testing(&mut clock, half_month);

            let payment = mint_sui(DEFAULT_PRICE, &mut scenario);

            suipatron::renew_subscription(
                &mut platform, &mut profile, &mut pass, payment, &clock,
                ts::ctx(&mut scenario),
            );

            // Should extend from current expiry (30 days), not from now (15 days)
            let expires_at = suipatron::access_pass_expires_at(&pass);
            assert!(*option::borrow(&expires_at) == THIRTY_DAYS_MS + THIRTY_DAYS_MS); // 60 days

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, pass);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_renew_subscription_after_expiry() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_id = create_subscription_profile(
            &mut scenario, CREATOR, b"Alice", DEFAULT_PRICE, THIRTY_DAYS_MS,
        );

        // Purchase subscription at time 0
        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(DEFAULT_PRICE, &mut scenario);

            suipatron::purchase_access(
                &mut platform, &mut profile, 0u64, payment, &clock,
                ts::ctx(&mut scenario),
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        // Renew at day 45 (after expiry at day 30)
        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let mut pass = ts::take_from_sender<AccessPass>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let day_45 = THIRTY_DAYS_MS + THIRTY_DAYS_MS / 2;
            clock::set_for_testing(&mut clock, day_45);

            let payment = mint_sui(DEFAULT_PRICE, &mut scenario);

            suipatron::renew_subscription(
                &mut platform, &mut profile, &mut pass, payment, &clock,
                ts::ctx(&mut scenario),
            );

            // Should extend from now (day 45), not from expired expiry (day 30)
            let expires_at = suipatron::access_pass_expires_at(&pass);
            assert!(*option::borrow(&expires_at) == day_45 + THIRTY_DAYS_MS);

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, pass);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_renew_permanent_pass_fails() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);

        // Purchase permanent pass
        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(DEFAULT_PRICE, &mut scenario);

            suipatron::purchase_access(
                &mut platform, &mut profile, 0u64, payment, &clock,
                ts::ctx(&mut scenario),
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        // Try to renew permanent pass — should fail
        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let mut pass = ts::take_from_sender<AccessPass>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(DEFAULT_PRICE, &mut scenario);

            suipatron::renew_subscription(
                &mut platform, &mut profile, &mut pass, payment, &clock,
                ts::ctx(&mut scenario),
            );

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, pass);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_renew_wrong_creator_fails() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_a_id = create_subscription_profile(
            &mut scenario, CREATOR, b"Alice", DEFAULT_PRICE, THIRTY_DAYS_MS,
        );
        let profile_b_id = create_subscription_profile(
            &mut scenario, CREATOR_2, b"Bob", DEFAULT_PRICE, THIRTY_DAYS_MS,
        );

        // Purchase subscription to Alice
        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_a_id);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(DEFAULT_PRICE, &mut scenario);

            suipatron::purchase_access(
                &mut platform, &mut profile, 0u64, payment, &clock,
                ts::ctx(&mut scenario),
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        // Try to renew against Bob's profile — should fail
        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_b_id);
            let mut pass = ts::take_from_sender<AccessPass>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(DEFAULT_PRICE, &mut scenario);

            suipatron::renew_subscription(
                &mut platform, &mut profile, &mut pass, payment, &clock,
                ts::ctx(&mut scenario),
            );

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, pass);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        ts::end(scenario);
    }

    // ================================================================
    // Category 11: SEAL Policy (40-byte identity + tiers + expiry)
    // ================================================================

    #[test]
    fun test_seal_approve_valid_40byte() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);

        // Purchase tier 1 access
        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(DEFAULT_PRICE, &mut scenario);

            suipatron::purchase_access(
                &mut platform, &mut profile, 0u64, payment, &clock,
                ts::ctx(&mut scenario),
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let pass = ts::take_from_sender<AccessPass>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let seal_id = build_seal_identity(&profile_id, 1);

            assert!(seal_policy::check_seal_access(seal_id, &pass, SUPPORTER, &clock));

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, pass);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_seal_higher_tier_unlocks_lower_content() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", TIER_1_PRICE);

        // Add tier 2
        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let cap = ts::take_from_sender<CreatorCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            suipatron::add_tier(
                &mut profile, &cap,
                string::utf8(b"Silver"), string::utf8(b"Silver"),
                TIER_2_PRICE, 2u64, option::none(), &clock,
            );

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(profile);
        };

        // Purchase tier 2 (index 1)
        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(TIER_2_PRICE, &mut scenario);

            suipatron::purchase_access(
                &mut platform, &mut profile, 1u64, payment, &clock,
                ts::ctx(&mut scenario),
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let pass = ts::take_from_sender<AccessPass>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            assert!(suipatron::access_pass_tier_level(&pass) == 2);

            // Tier 2 pass should access tier 1 content
            let seal_id_tier1 = build_seal_identity(&profile_id, 1);
            assert!(seal_policy::check_seal_access(seal_id_tier1, &pass, SUPPORTER, &clock));

            // Tier 2 pass should access tier 2 content
            let seal_id_tier2 = build_seal_identity(&profile_id, 2);
            assert!(seal_policy::check_seal_access(seal_id_tier2, &pass, SUPPORTER, &clock));

            // Tier 2 pass should NOT access tier 3 content
            let seal_id_tier3 = build_seal_identity(&profile_id, 3);
            assert!(!seal_policy::check_seal_access(seal_id_tier3, &pass, SUPPORTER, &clock));

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, pass);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_seal_wrong_creator_fails() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let _profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);

        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared<CreatorProfile>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(DEFAULT_PRICE, &mut scenario);

            suipatron::purchase_access(
                &mut platform, &mut profile, 0u64, payment, &clock,
                ts::ctx(&mut scenario),
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let pass = ts::take_from_sender<AccessPass>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let fake_id = vector[
                0u8, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 1,
                // min_tier_level = 1 (LE u64)
                1, 0, 0, 0, 0, 0, 0, 0,
            ];

            assert!(!seal_policy::check_seal_access(fake_id, &pass, SUPPORTER, &clock));

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, pass);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_seal_wrong_sender_fails() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);

        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(DEFAULT_PRICE, &mut scenario);

            suipatron::purchase_access(
                &mut platform, &mut profile, 0u64, payment, &clock,
                ts::ctx(&mut scenario),
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let pass = ts::take_from_sender<AccessPass>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let seal_id = build_seal_identity(&profile_id, 1);

            assert!(!seal_policy::check_seal_access(seal_id, &pass, @0xBAD, &clock));

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, pass);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_seal_expired_subscription_fails() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_id = create_subscription_profile(
            &mut scenario, CREATOR, b"Alice", DEFAULT_PRICE, THIRTY_DAYS_MS,
        );

        // Purchase subscription at time 0
        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(DEFAULT_PRICE, &mut scenario);

            suipatron::purchase_access(
                &mut platform, &mut profile, 0u64, payment, &clock,
                ts::ctx(&mut scenario),
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        // Check at day 31 (expired)
        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let pass = ts::take_from_sender<AccessPass>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            clock::set_for_testing(&mut clock, THIRTY_DAYS_MS + 1_000); // Past expiry

            let seal_id = build_seal_identity(&profile_id, 1);
            assert!(!seal_policy::check_seal_access(seal_id, &pass, SUPPORTER, &clock));

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, pass);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_seal_active_subscription_passes() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_id = create_subscription_profile(
            &mut scenario, CREATOR, b"Alice", DEFAULT_PRICE, THIRTY_DAYS_MS,
        );

        // Purchase subscription at time 0
        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(DEFAULT_PRICE, &mut scenario);

            suipatron::purchase_access(
                &mut platform, &mut profile, 0u64, payment, &clock,
                ts::ctx(&mut scenario),
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        // Check at day 15 (still active)
        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let pass = ts::take_from_sender<AccessPass>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            clock::set_for_testing(&mut clock, THIRTY_DAYS_MS / 2);

            let seal_id = build_seal_identity(&profile_id, 1);
            assert!(seal_policy::check_seal_access(seal_id, &pass, SUPPORTER, &clock));

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, pass);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_seal_invalid_identity_length_fails() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let _profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);

        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared<CreatorProfile>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(DEFAULT_PRICE, &mut scenario);

            suipatron::purchase_access(
                &mut platform, &mut profile, 0u64, payment, &clock,
                ts::ctx(&mut scenario),
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let pass = ts::take_from_sender<AccessPass>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            // 32 bytes (old format) — should be rejected
            let short_id = vector[
                0u8, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 1,
            ];
            assert!(!seal_policy::check_seal_access(short_id, &pass, SUPPORTER, &clock));

            // 48 bytes — too long, should be rejected
            let long_id = vector[
                0u8, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 1,
                1, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0,
            ];
            assert!(!seal_policy::check_seal_access(long_id, &pass, SUPPORTER, &clock));

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, pass);
        };

        ts::end(scenario);
    }

    // ================================================================
    // Category 12: Registry
    // ================================================================

    #[test]
    fun test_register_and_lookup_handle() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        init_registry(&mut scenario);
        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);

        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut reg = ts::take_shared<Registry>(&scenario);
            let profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let cap = ts::take_from_sender<CreatorCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            registry::register_handle(
                &mut reg, &profile, &cap,
                string::utf8(b"alice"),
                &clock,
            );

            assert!(registry::registry_total_handles(&reg) == 1);

            // Lookup
            let result = registry::lookup_handle(&reg, string::utf8(b"alice"));
            assert!(option::is_some(&result));
            assert!(*option::borrow(&result) == profile_id);

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(profile);
            ts::return_shared(reg);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_register_duplicate_handle_fails() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        init_registry(&mut scenario);
        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);
        let profile_b_id = create_test_profile(&mut scenario, CREATOR_2, b"Bob", DEFAULT_PRICE);

        // Creator registers "alice"
        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut reg = ts::take_shared<Registry>(&scenario);
            let profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let cap = ts::take_from_sender<CreatorCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            registry::register_handle(
                &mut reg, &profile, &cap,
                string::utf8(b"alice"),
                &clock,
            );

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(profile);
            ts::return_shared(reg);
        };

        // Creator 2 tries to register "alice" — should fail
        ts::next_tx(&mut scenario, CREATOR_2);
        {
            let mut reg = ts::take_shared<Registry>(&scenario);
            let profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_b_id);
            let cap = ts::take_from_sender<CreatorCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            registry::register_handle(
                &mut reg, &profile, &cap,
                string::utf8(b"alice"),
                &clock,
            );

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(profile);
            ts::return_shared(reg);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_lookup_nonexistent_handle() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        init_registry(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let reg = ts::take_shared<Registry>(&scenario);

            let result = registry::lookup_handle(&reg, string::utf8(b"nobody"));
            assert!(option::is_none(&result));

            ts::return_shared(reg);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure]
    fun test_register_handle_wrong_cap_fails() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        init_registry(&mut scenario);
        let profile_a_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);
        create_test_profile(&mut scenario, CREATOR_2, b"Bob", DEFAULT_PRICE);

        // Creator 2 tries to register handle for Creator 1's profile
        ts::next_tx(&mut scenario, CREATOR_2);
        {
            let mut reg = ts::take_shared<Registry>(&scenario);
            let profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_a_id);
            let cap = ts::take_from_sender<CreatorCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            registry::register_handle(
                &mut reg, &profile, &cap,
                string::utf8(b"stolen"),
                &clock,
            );

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(profile);
            ts::return_shared(reg);
        };

        ts::end(scenario);
    }

    // ================================================================
    // Category 13: Full Flow (End-to-End)
    // ================================================================

    #[test]
    fun test_full_flow_tiered_access() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        init_registry(&mut scenario);

        // 1. Creator creates profile with tier 1
        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", TIER_1_PRICE);

        // 2. Creator adds tier 2
        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let cap = ts::take_from_sender<CreatorCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            suipatron::add_tier(
                &mut profile, &cap,
                string::utf8(b"Gold"), string::utf8(b"Gold access"),
                TIER_3_PRICE, 3u64, option::none(), &clock,
            );

            // 3. Publish tier 1 and tier 3 content
            suipatron::publish_content(
                &mut profile, &cap,
                string::utf8(b"Basic Art"), string::utf8(b"For everyone"),
                string::utf8(b"blob_basic"), string::utf8(b"image"),
                1u64, &clock, ts::ctx(&mut scenario),
            );

            suipatron::publish_content(
                &mut profile, &cap,
                string::utf8(b"Gold Art"), string::utf8(b"Premium content"),
                string::utf8(b"blob_gold"), string::utf8(b"image"),
                3u64, &clock, ts::ctx(&mut scenario),
            );

            assert!(suipatron::profile_content_count(&profile) == 2);

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(profile);
        };

        // 4. Register handle
        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut reg = ts::take_shared<Registry>(&scenario);
            let profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let cap = ts::take_from_sender<CreatorCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            registry::register_handle(
                &mut reg, &profile, &cap,
                string::utf8(b"alice"),
                &clock,
            );

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(profile);
            ts::return_shared(reg);
        };

        // 5. Supporter purchases tier 1 access (index 0)
        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(TIER_1_PRICE, &mut scenario);

            suipatron::purchase_access(
                &mut platform, &mut profile, 0u64, payment, &clock,
                ts::ctx(&mut scenario),
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        // 6. Verify SEAL access: tier 1 content ok, tier 3 content blocked
        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let pass = ts::take_from_sender<AccessPass>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            let seal_id_tier1 = build_seal_identity(&profile_id, 1);
            assert!(seal_policy::check_seal_access(seal_id_tier1, &pass, SUPPORTER, &clock));

            let seal_id_tier3 = build_seal_identity(&profile_id, 3);
            assert!(!seal_policy::check_seal_access(seal_id_tier3, &pass, SUPPORTER, &clock));

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, pass);
        };

        // 7. Creator withdraws
        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let cap = ts::take_from_sender<CreatorCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            suipatron::withdraw_earnings(
                &mut profile, &cap, &clock, ts::ctx(&mut scenario),
            );

            assert!(suipatron::profile_balance(&profile) == 0);

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(profile);
        };

        // 8. Verify registry lookup
        ts::next_tx(&mut scenario, ADMIN);
        {
            let reg = ts::take_shared<Registry>(&scenario);
            let result = registry::lookup_handle(&reg, string::utf8(b"alice"));
            assert!(*option::borrow(&result) == profile_id);
            ts::return_shared(reg);
        };

        // 9. Verify final platform state
        ts::next_tx(&mut scenario, ADMIN);
        {
            let platform = ts::take_shared<Platform>(&scenario);
            assert!(suipatron::platform_total_creators(&platform) == 1);
            assert!(suipatron::platform_total_access_passes(&platform) == 1);
            ts::return_shared(platform);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_full_flow_tips_and_fees() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);

        // Set 5% fee
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let cap = ts::take_from_sender<AdminCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            suipatron::set_platform_fee(&mut platform, &cap, 500, &clock);
            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(platform);
        };

        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);
        let tip_amount = 2_000_000_000u64;

        // Purchase + tip
        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            let payment = mint_sui(DEFAULT_PRICE, &mut scenario);
            suipatron::purchase_access(
                &mut platform, &mut profile, 0u64, payment, &clock,
                ts::ctx(&mut scenario),
            );

            let tip = mint_sui(tip_amount, &mut scenario);
            suipatron::tip(&mut platform, &mut profile, tip, &clock, ts::ctx(&mut scenario));

            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        // Creator withdraws earnings (purchase + tip minus fees)
        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let cap = ts::take_from_sender<CreatorCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            let purchase_fee = DEFAULT_PRICE * 500 / 10000;
            let tip_fee = tip_amount * 500 / 10000;
            let expected_balance = (DEFAULT_PRICE - purchase_fee) + (tip_amount - tip_fee);
            assert!(suipatron::profile_balance(&profile) == expected_balance);

            suipatron::withdraw_earnings(
                &mut profile, &cap, &clock, ts::ctx(&mut scenario),
            );
            assert!(suipatron::profile_balance(&profile) == 0);

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(profile);
        };

        // Admin withdraws platform fees
        ts::next_tx(&mut scenario, ADMIN);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let cap = ts::take_from_sender<AdminCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            let total_fees = (DEFAULT_PRICE * 500 / 10000) + (tip_amount * 500 / 10000);
            assert!(suipatron::platform_treasury_balance(&platform) == total_fees);

            suipatron::withdraw_platform_fees(
                &mut platform, &cap, &clock, ts::ctx(&mut scenario),
            );
            assert!(suipatron::platform_treasury_balance(&platform) == 0);

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(platform);
        };

        ts::end(scenario);
    }
}
