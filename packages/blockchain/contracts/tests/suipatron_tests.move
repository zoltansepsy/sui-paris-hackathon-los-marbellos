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

    // ======== Test Addresses ========
    const ADMIN: address = @0xAD;
    const CREATOR: address = @0xC1;
    const CREATOR_2: address = @0xC2;
    const SUPPORTER: address = @0x51;

    // ======== Test Values ========
    const DEFAULT_PRICE: u64 = 5_000_000_000; // 5 SUI

    // ======== Helpers ========

    fun init_platform(scenario: &mut ts::Scenario) {
        ts::next_tx(scenario, ADMIN);
        suipatron::init_for_testing(ts::ctx(scenario));
    }

    /// Creates a profile and returns its ID (captured before sharing)
    fun create_test_profile(
        scenario: &mut ts::Scenario,
        creator: address,
        name: vector<u8>,
        price: u64,
    ): ID {
        ts::next_tx(scenario, creator);
        let mut platform = ts::take_shared<Platform>(scenario);
        let clock = clock::create_for_testing(ts::ctx(scenario));

        suipatron::create_profile(
            &mut platform,
            string::utf8(name),
            string::utf8(b"Test bio"),
            price,
            &clock,
            ts::ctx(scenario),
        );

        clock::destroy_for_testing(clock);
        ts::return_shared(platform);

        // Get the profile ID from the most recent created shared object
        ts::next_tx(scenario, creator);
        let profile = ts::take_shared<CreatorProfile>(scenario);
        let profile_id = object::id(&profile);
        ts::return_shared(profile);
        profile_id
    }

    fun mint_sui(amount: u64, scenario: &mut ts::Scenario): coin::Coin<SUI> {
        coin::mint_for_testing<SUI>(amount, ts::ctx(scenario))
    }

    // ======== Category 1: Initialization ========

    #[test]
    fun test_init_creates_platform_and_admin_cap() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let platform = ts::take_shared<Platform>(&scenario);
            assert!(suipatron::platform_total_creators(&platform) == 0);
            assert!(suipatron::platform_total_access_passes(&platform) == 0);
            ts::return_shared(platform);
        };

        ts::next_tx(&mut scenario, ADMIN);
        {
            let cap = ts::take_from_sender<AdminCap>(&scenario);
            ts::return_to_sender(&scenario, cap);
        };

        ts::end(scenario);
    }

    // ======== Category 2: Profile Creation ========

    #[test]
    fun test_create_profile() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);

        ts::next_tx(&mut scenario, CREATOR);
        {
            let profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            assert!(suipatron::profile_owner(&profile) == CREATOR);
            assert!(suipatron::profile_price(&profile) == DEFAULT_PRICE);
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

    // ======== Category 3: Profile Update ========

    #[test]
    fun test_update_profile_name_and_price() {
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
                option::some(10_000_000_000),
                &clock,
            );

            assert!(suipatron::profile_name(&profile) == string::utf8(b"Alice Updated"));
            assert!(suipatron::profile_price(&profile) == 10_000_000_000);

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

        // Creator 2 tries to update Creator 1's profile with Creator 2's cap
        ts::next_tx(&mut scenario, CREATOR_2);
        {
            // Explicitly take Creator 1's profile by ID
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
                option::none(),
                &clock,
            );

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(profile);
        };

        ts::end(scenario);
    }

    // ======== Category 4: Content Publishing ========

    #[test]
    fun test_publish_content() {
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

        // Creator 2 tries to publish on Creator 1's profile
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
                &clock,
                ts::ctx(&mut scenario),
            );

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(profile);
        };

        ts::end(scenario);
    }

    // ======== Category 5: Access Purchase ========

    #[test]
    fun test_purchase_access() {
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
            let payment = mint_sui(1_000_000_000, &mut scenario); // 1 SUI < 5 SUI

            suipatron::purchase_access(
                &mut platform,
                &mut profile,
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

    // ======== Category 6: Withdrawal ========

    #[test]
    fun test_withdraw_earnings() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);

        // Supporter purchases access
        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(DEFAULT_PRICE, &mut scenario);

            suipatron::purchase_access(
                &mut platform, &mut profile, payment, &clock,
                ts::ctx(&mut scenario),
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        // Creator withdraws
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

        // Supporter purchases access to Creator 1
        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_a_id);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(DEFAULT_PRICE, &mut scenario);

            suipatron::purchase_access(
                &mut platform, &mut profile, payment, &clock,
                ts::ctx(&mut scenario),
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        // Creator 2 tries to withdraw from Creator 1's profile
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

    // ======== Category 7: SEAL Policy ========

    #[test]
    fun test_seal_approve_valid() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);

        // Purchase access
        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(DEFAULT_PRICE, &mut scenario);

            suipatron::purchase_access(
                &mut platform, &mut profile, payment, &clock,
                ts::ctx(&mut scenario),
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        // Test seal access
        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let pass = ts::take_from_sender<AccessPass>(&scenario);
            let seal_id = object::id_to_bytes(&profile_id);

            assert!(seal_policy::check_seal_access(seal_id, &pass, SUPPORTER));

            ts::return_to_sender(&scenario, pass);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_seal_approve_wrong_creator_fails() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let _profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);

        // Purchase access
        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared<CreatorProfile>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(DEFAULT_PRICE, &mut scenario);

            suipatron::purchase_access(
                &mut platform, &mut profile, payment, &clock,
                ts::ctx(&mut scenario),
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        // Test with wrong creator ID (32 bytes, but wrong)
        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let pass = ts::take_from_sender<AccessPass>(&scenario);
            let fake_id = vector[
                0u8, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 1,
            ];

            assert!(!seal_policy::check_seal_access(fake_id, &pass, SUPPORTER));

            ts::return_to_sender(&scenario, pass);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_seal_approve_wrong_sender_fails() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);
        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);

        // Purchase access
        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(DEFAULT_PRICE, &mut scenario);

            suipatron::purchase_access(
                &mut platform, &mut profile, payment, &clock,
                ts::ctx(&mut scenario),
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        // Test with wrong caller
        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let pass = ts::take_from_sender<AccessPass>(&scenario);
            let seal_id = object::id_to_bytes(&profile_id);

            assert!(!seal_policy::check_seal_access(seal_id, &pass, @0xBAD));

            ts::return_to_sender(&scenario, pass);
        };

        ts::end(scenario);
    }

    // ======== Category 8: Full Flow ========

    #[test]
    fun test_full_flow_end_to_end() {
        let mut scenario = ts::begin(ADMIN);
        init_platform(&mut scenario);

        // 1. Creator creates profile
        let profile_id = create_test_profile(&mut scenario, CREATOR, b"Alice", DEFAULT_PRICE);

        // 2. Creator publishes content
        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let cap = ts::take_from_sender<CreatorCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            suipatron::publish_content(
                &mut profile, &cap,
                string::utf8(b"Exclusive Art"),
                string::utf8(b"My best work"),
                string::utf8(b"walrus_blob_abc"),
                string::utf8(b"image"),
                &clock,
                ts::ctx(&mut scenario),
            );

            assert!(suipatron::profile_content_count(&profile) == 1);

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(profile);
        };

        // 3. Supporter purchases access
        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = mint_sui(DEFAULT_PRICE, &mut scenario);

            suipatron::purchase_access(
                &mut platform, &mut profile, payment, &clock,
                ts::ctx(&mut scenario),
            );

            assert!(suipatron::profile_balance(&profile) == DEFAULT_PRICE);
            assert!(suipatron::profile_total_supporters(&profile) == 1);

            clock::destroy_for_testing(clock);
            ts::return_shared(profile);
            ts::return_shared(platform);
        };

        // 4. Verify SEAL access works
        ts::next_tx(&mut scenario, SUPPORTER);
        {
            let pass = ts::take_from_sender<AccessPass>(&scenario);
            let seal_id = object::id_to_bytes(&profile_id);
            assert!(seal_policy::check_seal_access(seal_id, &pass, SUPPORTER));
            ts::return_to_sender(&scenario, pass);
        };

        // 5. Creator withdraws earnings
        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut profile = ts::take_shared_by_id<CreatorProfile>(&scenario, profile_id);
            let cap = ts::take_from_sender<CreatorCap>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            suipatron::withdraw_earnings(
                &mut profile, &cap, &clock,
                ts::ctx(&mut scenario),
            );

            assert!(suipatron::profile_balance(&profile) == 0);

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, cap);
            ts::return_shared(profile);
        };

        // 6. Verify final platform state
        ts::next_tx(&mut scenario, ADMIN);
        {
            let platform = ts::take_shared<Platform>(&scenario);
            assert!(suipatron::platform_total_creators(&platform) == 1);
            assert!(suipatron::platform_total_access_passes(&platform) == 1);
            ts::return_shared(platform);
        };

        ts::end(scenario);
    }
}
