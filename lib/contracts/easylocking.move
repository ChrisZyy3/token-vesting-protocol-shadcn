
module easyLocking::admin {

    public struct Config has key {
        id: sui::object::UID,
        streamflow_fee: u64,
        treasury: address,
        withdrawor: address,
        tx_fee: u64,
        version: u64,
    }

    public struct AdminCap has key {
        id: sui::object::UID,
    }

    public struct AddressValue has store {
        address: address,
    }

    public struct AdminTransfered has copy, drop {
        new_address: address,
        old_address: address,
    }

    public struct FeeManagerChanged has copy, drop {
        new_address: address,
        old_address: address,
    }

    public struct TreasuryChanged has copy, drop {
        new_address: address,
        old_address: address,
    }

    public struct WithdraworChanged has copy, drop {
        new_address: address,
        old_address: address,
    }

    public struct StreamflowFeeChanged has copy, drop {
        new_fee: u64,
        old_fee: u64,
    }

    public struct TxFeeChanged has copy, drop {
        new_fee: u64,
        old_fee: u64,
    }

    public entry fun change_fee_manager(arg0: &AdminCap, arg1: &mut Config, arg2: address) {
        if (sui::dynamic_field::exists_<vector<u8>>(&arg1.id, b"fee_manager")) {
            let v0 = sui::dynamic_field::borrow_mut<vector<u8>, AddressValue>(&mut arg1.id, b"fee_manager");
            let v1 = FeeManagerChanged{
                new_address : arg2,
                old_address : v0.address,
            };
            sui::event::emit<FeeManagerChanged>(v1);
            update_address_value(v0, arg2);
        } else {
            let v2 = FeeManagerChanged{
                new_address : arg2,
                old_address : @0x0,
            };
            sui::event::emit<FeeManagerChanged>(v2);
            let v3 = AddressValue{address: arg2};
            sui::dynamic_field::add<vector<u8>, AddressValue>(&mut arg1.id, b"fee_manager", v3);
        };
    }

    public entry fun change_streamflow_fee(arg0: &AdminCap, arg1: &mut Config, arg2: u64) {
        write_streamflow_fee_to_config(arg1, arg2);
    }

    public entry fun change_streamflow_fee_as_manager(arg0: &mut Config, arg1: u64, arg2: &mut sui::tx_context::TxContext) {
        assert!(sui::tx_context::sender(arg2) == get_fee_manager(arg0), 2);
        write_streamflow_fee_to_config(arg0, arg1);
    }

    public entry fun change_treasury(arg0: &AdminCap, arg1: &mut Config, arg2: address) {
        let v0 = TreasuryChanged{
            new_address : arg2,
            old_address : arg1.treasury,
        };
        sui::event::emit<TreasuryChanged>(v0);
        arg1.treasury = arg2;
    }

    public entry fun change_tx_fee(arg0: &mut Config, arg1: u64, arg2: &mut sui::tx_context::TxContext) {
        assert!(sui::tx_context::sender(arg2) == arg0.withdrawor, 1);
        let v0 = TxFeeChanged{
            new_fee : arg1,
            old_fee : arg0.tx_fee,
        };
        sui::event::emit<TxFeeChanged>(v0);
        arg0.tx_fee = arg1;
    }

    public entry fun change_withdrawor(arg0: &AdminCap, arg1: &mut Config, arg2: address) {
        let v0 = WithdraworChanged{
            new_address : arg2,
            old_address : arg1.withdrawor,
        };
        sui::event::emit<WithdraworChanged>(v0);
        arg1.withdrawor = arg2;
    }

    public fun get_fee_manager(arg0: &Config) : address {
        sui::dynamic_field::borrow<vector<u8>, AddressValue>(&arg0.id, b"fee_manager").address
    }

    public fun get_streamflow_fee(arg0: &Config) : u64 {
        arg0.streamflow_fee
    }

    public fun get_treasury(arg0: &Config) : address {
        arg0.treasury
    }

    public fun get_tx_fee(arg0: &Config) : u64 {
        arg0.tx_fee
    }

    public fun get_withdrawor(arg0: &Config) : address {
        arg0.withdrawor
    }

    fun init(arg0: &mut sui::tx_context::TxContext) {
        let v0 = sui::tx_context::sender(arg0);
        let v1 = Config{
            id             : sui::object::new(arg0),
            streamflow_fee : 25,
            treasury       : v0,
            withdrawor     : v0,
            tx_fee         : 5000000,
            version        : 1,
        };
        sui::transfer::share_object<Config>(v1);
        let v2 = AdminCap{id: sui::object::new(arg0)};
        sui::transfer::transfer<AdminCap>(v2, v0);
    }

    public entry fun transfer_admin(arg0: AdminCap, arg1: address, arg2: &mut sui::tx_context::TxContext) {
        let v0 = AdminTransfered{
            new_address : arg1,
            old_address : sui::tx_context::sender(arg2),
        };
        sui::event::emit<AdminTransfered>(v0);
        sui::transfer::transfer<AdminCap>(arg0, arg1);
    }

    fun update_address_value(arg0: &mut AddressValue, arg1: address) {
        arg0.address = arg1;
    }

    fun write_streamflow_fee_to_config(arg0: &mut Config, arg1: u64) {
        assert!(arg1 <= 10000, 1);
        let v0 = StreamflowFeeChanged{
            new_fee : arg1,
            old_fee : arg0.streamflow_fee,
        };
        sui::event::emit<StreamflowFeeChanged>(v0);
        arg0.streamflow_fee = arg1;
    }

    // decompiled from Move bytecode v6
}

module easyLocking::fee_manager {
    public struct FeeValue has copy, drop, store {
        streamflow_fee: u64,
        partner_fee: u64,
    }

    public struct FeeTable has key {
        id: sui::object::UID,
        values: sui::table::Table<address, FeeValue>,
        version: u64,
    }

    public struct FeesWritten has copy, drop {
        wallet_address: address,
        streamflow_fee: u64,
        partner_fee: u64,
    }

    public struct FeesRemoved has copy, drop {
        wallet_address: address,
    }

    public fun get_streamflow_fee(arg0: &FeeTable, arg1: &easyLocking::admin::Config, arg2: address) : u64 {
        let v0 = get_fees(arg0, arg1, arg2);
        v0.streamflow_fee
    }

    public entry fun fees_remove(arg0: &easyLocking::admin::AdminCap, arg1: &mut FeeTable, arg2: address) {
        remove_from_fee_table(arg1, arg2);
    }

    public entry fun fees_remove_as_manager(arg0: &easyLocking::admin::Config, arg1: &mut FeeTable, arg2: address, arg3: &mut sui::tx_context::TxContext) {
        assert!(sui::tx_context::sender(arg3) == easyLocking::admin::get_fee_manager(arg0), 2);
        remove_from_fee_table(arg1, arg2);
    }

    public entry fun fees_write(arg0: &easyLocking::admin::AdminCap, arg1: &mut FeeTable, arg2: address, arg3: u64, arg4: u64) {
        write_to_fee_table(arg1, arg2, arg3, arg4);
    }

    public entry fun fees_write_as_manager(arg0: &easyLocking::admin::Config, arg1: &mut FeeTable, arg2: address, arg3: u64, arg4: u64, arg5: &mut sui::tx_context::TxContext) {
        assert!(sui::tx_context::sender(arg5) == easyLocking::admin::get_fee_manager(arg0), 2);
        write_to_fee_table(arg1, arg2, arg3, arg4);
    }

    public fun get_fees(arg0: &FeeTable, arg1: &easyLocking::admin::Config, arg2: address) : FeeValue {
        if (sui::table::contains<address, FeeValue>(&arg0.values, arg2)) {
            *sui::table::borrow<address, FeeValue>(&arg0.values, arg2)
        } else {
            FeeValue{streamflow_fee: easyLocking::admin::get_streamflow_fee(arg1), partner_fee: 0}
        }
    }

    public fun get_partner_fee(arg0: &FeeTable, arg1: &easyLocking::admin::Config, arg2: address) : u64 {
        let v0 = get_fees(arg0, arg1, arg2);
        v0.partner_fee
    }

    fun init(arg0: &mut sui::tx_context::TxContext) {
        let v0 = FeeTable{
            id      : sui::object::new(arg0),
            values  : sui::table::new<address, FeeValue>(arg0),
            version : 1,
        };
        sui::transfer::share_object<FeeTable>(v0);
    }

    fun remove_from_fee_table(arg0: &mut FeeTable, arg1: address) {
        if (sui::table::contains<address, FeeValue>(&arg0.values, arg1)) {
            let v0 = FeesRemoved{wallet_address: arg1};
            sui::event::emit<FeesRemoved>(v0);
            sui::table::remove<address, FeeValue>(&mut arg0.values, arg1);
        };
    }

    fun write_to_fee_table(arg0: &mut FeeTable, arg1: address, arg2: u64, arg3: u64) {
        assert!(arg2 <= 10000, 1);
        assert!(arg3 <= 10000, 1);
        let v0 = FeesWritten{
            wallet_address : arg1,
            streamflow_fee : arg2,
            partner_fee    : arg3,
        };
        sui::event::emit<FeesWritten>(v0);
        remove_from_fee_table(arg0, arg1);
        let v1 = FeeValue{
            streamflow_fee : arg2,
            partner_fee    : arg3,
        };
        sui::table::add<address, FeeValue>(&mut arg0.values, arg1, v1);
    }

    // decompiled from Move bytecode v6
}

module easyLocking::protocol {
    use easyLocking::utils;
    public struct FeesData has store {
        streamflow_fee_percentage: u64,
        streamflow_fee: u64,
        streamflow_fee_withdrawn: u64,
        partner_fee_percentage: u64,
        partner_fee: u64,
        partner_fee_withdrawn: u64,
    }

    public struct ContractMeta has store {
        cancelable_by_sender: bool,
        cancelable_by_recipient: bool,
        transferable_by_sender: bool,
        transferable_by_recipient: bool,
        can_topup: bool,
        pausable: bool,
        can_update_rate: bool,
        automatic_withdrawal: bool,
        withdrawal_frequency: u64,
        contract_name: vector<u8>,
    }

    public struct Contract<phantom T0> has key {
        id: sui::object::UID,
        balance: sui::balance::Balance<T0>,
        meta: ContractMeta,
        amount: u64,
        period: u64,
        amount_per_period: u64,
        start: u64,
        end: u64,
        cliff_amount: u64,
        withdrawn: u64,
        last_withdrawn_at: u64,
        created: u64,
        canceled_at: u64,
        recipient: address,
        sender: address,
        partner: address,
        fees: FeesData,
        closed: bool,
        current_pause_start: u64,
        pause_cumulative: u64,
        last_rate_change_time: u64,
        funds_unlocked_at_last_rate_change: u64,
        version: u64,
    }

    public struct ContractCreated has copy, drop {
        address: address,
    }

    public struct ContractWithdrawn has copy, drop {
        address: address,
        amount: u64,
        streamflow_amount: u64,
        partner_amount: u64,
    }



    // public entry fun update<T0>(arg0: &mut Contract<T0>, arg1: &easyLocking::admin::Config, arg2: &sui::clock::Clock, arg3: &mut sui::coin::Coin<sui::sui::SUI>, arg4: bool, arg5: u64, arg6: u64, arg7: &mut sui::tx_context::TxContext) {
    //     let v0 = sui::tx_context::sender(arg7);
    //     assert!(!arg0.closed, 5);
    //     assert!(v0 == arg0.sender || v0 == arg0.recipient, 3);
    //
    //     let opt_arg5=option::some(arg5);
    //     if (arg4 == true && !arg0.meta.automatic_withdrawal) {
    //         let v1 = 0x1::option::destroy_with_default<u64>(opt_arg5, arg0.meta.withdrawal_frequency);
    //         let v2 = v1;
    //         assert!(v1 == 0 || v1 >= arg0.period, 4);
    //         if (v1 == 0) {
    //             v2 = arg0.period;
    //         };
    //         if (v2 < 30) {
    //             v2 = sui::math::max(30, arg0.period);
    //         };
    //         arg0.meta.automatic_withdrawal = true;
    //         arg0.meta.withdrawal_frequency = v2;
    //         let v3 = calculate_withdrawal_fees(arg0.start, arg0.end, v2, easyLocking::admin::get_tx_fee(arg1));
    //         assert!(sui::coin::value<sui::sui::SUI>(arg3) >= v3, 13);
    //         sui::transfer::public_transfer<sui::coin::Coin<sui::sui::SUI>>(sui::coin::split<sui::sui::SUI>(arg3, v3, arg7), easyLocking::admin::get_withdrawor(arg1));
    //     };
    //     if (&arg6) {
    //         let opt_arg6=option::some(arg6);
    //         let v4 = 0x1::option::destroy_some<u64>(opt_arg6);
    //         assert!(arg0.meta.can_update_rate, 3);
    //         assert!(v4 > 0, 6);
    //         let v5 = easyLocking::utils::timestamp_seconds(arg2);
    //         let v6 = calculate_available<T0>(v5, arg0.amount, arg0.withdrawn, arg0, 10000) + arg0.withdrawn;
    //         assert!(v4 <= arg0.amount - v6, 6);
    //         if (v6 > 0) {
    //             arg0.funds_unlocked_at_last_rate_change = v6 - arg0.cliff_amount;
    //             arg0.last_rate_change_time = calculate_last_unlock_time<T0>(v5, arg0);
    //         };
    //         let v7 = arg0.end;
    //         arg0.amount_per_period = v4;
    //         arg0.end = calculate_end(arg0.amount, arg0.cliff_amount, arg0.funds_unlocked_at_last_rate_change, arg0.period, arg0.start, arg0.last_rate_change_time, arg0.pause_cumulative, arg0.amount_per_period);
    //         if (v7 < arg0.end && arg0.meta.automatic_withdrawal) {
    //             let v8 = calculate_withdrawal_fees(v7, arg0.end, arg0.meta.withdrawal_frequency, easyLocking::admin::get_tx_fee(arg1));
    //             assert!(sui::coin::value<sui::sui::SUI>(arg3) >= v8, 13);
    //             sui::transfer::public_transfer<sui::coin::Coin<sui::sui::SUI>>(sui::coin::split<sui::sui::SUI>(arg3, v8, arg7), easyLocking::admin::get_withdrawor(arg1));
    //         };
    //     };
    // }

    public entry fun transfer<T0>(arg0: &mut Contract<T0>, arg1: address, arg2: &mut sui::tx_context::TxContext) {
        assert_transfer<T0>(arg0, sui::tx_context::sender(arg2));
        arg0.recipient = arg1;
    }

    public fun sender<T0>(arg0: &Contract<T0>) : address {
        arg0.sender
    }

    public fun amount<T0>(arg0: &Contract<T0>) : u64 {
        arg0.amount
    }

    public fun amount_per_period<T0>(arg0: &Contract<T0>) : u64 {
        arg0.amount_per_period
    }

    fun assert_cancel<T0>(arg0: &Contract<T0>, arg1: address) {
        assert!(!arg0.closed, 5);
        if (arg0.meta.cancelable_by_sender && arg1 == arg0.sender) {
            return
        };
        assert!(arg0.meta.cancelable_by_recipient && arg1 == arg0.recipient, 3);
    }

    fun assert_pause<T0>(arg0: &Contract<T0>, arg1: address) {
        assert!(!arg0.closed, 5);
        assert!(arg0.meta.pausable && arg1 == arg0.sender, 3);
        assert!(arg0.current_pause_start == 0, 15);
    }

    fun assert_topup<T0>(arg0: &Contract<T0>) {
        assert!(!arg0.closed, 5);
        assert!(arg0.meta.can_topup, 3);
    }

    fun assert_transfer<T0>(arg0: &Contract<T0>, arg1: address) {
        assert!(!arg0.closed, 5);
        if (arg0.meta.transferable_by_sender && arg1 == arg0.sender) {
            return
        };
        assert!(arg0.meta.transferable_by_recipient && arg1 == arg0.recipient, 3);
    }

    fun assert_unpause<T0>(arg0: &Contract<T0>, arg1: address) {
        assert!(!arg0.closed, 5);
        assert!(arg1 == arg0.sender, 3);
        assert!(arg0.current_pause_start > 0, 16);
    }

    public fun automatic_withdrawal<T0>(arg0: &Contract<T0>) : bool {
        arg0.meta.automatic_withdrawal
    }

    public fun balance_value<T0>(arg0: &Contract<T0>) : u64 {
        sui::balance::value<T0>(&arg0.balance)
    }

    fun calculate_available<T0>(arg0: u64, arg1: u64, arg2: u64, arg3: &Contract<T0>, arg4: u64) : u64 {
        if (arg3.current_pause_start != 0 && arg3.current_pause_start < arg3.start) {
            return 0
        };
        if (arg0 < arg3.start || arg1 == arg2 || arg1 == 0) {
            return 0
        };
        if (arg3.current_pause_start == 0 && arg0 >= arg3.end) {
            return arg1 - arg2
        };
        let v0 = if (arg3.current_pause_start == 0) {
            arg3.pause_cumulative
        } else {
            arg0 + arg3.pause_cumulative - arg3.current_pause_start
        };
        calculate_fee_amount(arg3.funds_unlocked_at_last_rate_change + (arg0 - sui::math::max(arg3.start, arg3.last_rate_change_time) - v0) / arg3.period * arg3.amount_per_period, arg4) + calculate_fee_amount(arg3.cliff_amount, arg4) - arg2
    }

    fun calculate_current_pause_length<T0>(arg0: &Contract<T0>, arg1: u64) : u64 {
        let mut v0 = arg1 - arg0.current_pause_start;
        if (arg0.current_pause_start <= arg0.start && arg1 >= arg0.start) {
            v0 = arg1 - arg0.start;
        };
        v0
    }

    fun calculate_end(arg0: u64, arg1: u64, arg2: u64, arg3: u64, arg4: u64, arg5: u64, arg6: u64, arg7: u64) : u64 {
        sui::math::max(arg4, arg5) + easyLocking::utils::ceil_div(arg0 - arg1 - arg2, arg7) * arg3 + arg6
    }

    fun calculate_fee_amount(arg0: u64, arg1: u64) : u64 {
        if (arg1 == 10000) {
            return arg0
        };
        arg0 * arg1 / 10000
    }

    fun calculate_last_unlock_time<T0>(arg0: u64, arg1: &Contract<T0>) : u64 {
        let mut v0 = arg1.pause_cumulative;
        if (arg1.current_pause_start > 0) {
            v0 = arg0 + arg1.pause_cumulative - arg1.current_pause_start;
        };
        let v1 = sui::math::max(arg1.start, arg1.last_rate_change_time);
        v1 + (arg0 - v1 - v0) / arg1.period * arg1.period
    }

    public fun calculate_withdrawal_fees(arg0: u64, arg1: u64, arg2: u64, arg3: u64) : u64 {
        if (arg2 == 0 || arg1 == 0 || arg0 > arg1) {
            return 0
        };
        arg3 * easyLocking::utils::ceil_div(arg1 - arg0, arg2)
    }

    public entry fun cancel<T0>(arg0: &mut Contract<T0>, arg1: &easyLocking::admin::Config, arg2: &sui::clock::Clock, arg3: &mut sui::tx_context::TxContext) {
        assert_cancel<T0>(arg0, sui::tx_context::sender(arg3));
        let v0 = easyLocking::utils::timestamp_seconds(arg2);
        assert!(v0 < arg0.end, 5);
        arg0.canceled_at = v0;
        arg0.closed = true;
        withdraw_by_amount<T0>(arg0, arg1, v0, 0x1::option::none<u64>(), arg3);
        let v1 = sui::balance::value<T0>(&arg0.balance);
        if (v1 > 0) {
            sui::transfer::public_transfer<sui::coin::Coin<T0>>(sui::coin::take<T0>(&mut arg0.balance, v1, arg3), arg0.sender);
        };
    }

    public fun canceled_at<T0>(arg0: &Contract<T0>) : u64 {
        arg0.canceled_at
    }

    public fun closed<T0>(arg0: &Contract<T0>) : bool {
        arg0.closed
    }

    public entry fun create<T0>(arg0: &easyLocking::admin::Config, arg1: &easyLocking::fee_manager::FeeTable, arg2: &sui::clock::Clock, arg3: &mut sui::coin::Coin<T0>, arg4: &mut sui::coin::Coin<sui::sui::SUI>, arg5: u64, arg6: u64, arg7: u64, arg8: u64, arg9: u64, arg10: bool, arg11: bool, arg12: bool, arg13: bool, arg14: bool, arg15: bool, arg16: bool, arg17: bool, arg18: u64, arg19: vector<u8>, arg20: address, arg21: address, arg22: &mut sui::tx_context::TxContext) {
        let v0 = easyLocking::utils::timestamp_seconds(arg2);
        let mut modified_arg18 = arg18;
        if (arg8 == 0) {
            modified_arg18 = v0;
        };
        if (arg18 < 30 && arg18 != 0) {
            modified_arg18 = 30;
        };
        validate_contract_params(arg5, arg6, arg7, modified_arg18, arg8, arg9, v0);
        let v1 = calculate_end(arg5, arg9, 0, arg6, arg8, 0, 0, arg7);
        let v2 = easyLocking::fee_manager::get_streamflow_fee(arg1, arg0, arg21);
        let v3 = easyLocking::fee_manager::get_partner_fee(arg1, arg0, arg21);
        let v4 = calculate_fee_amount(arg5, v2);
        let v5 = calculate_fee_amount(arg5, v3);
        let v6 = arg5 + v4 + v5;
        assert!(sui::coin::value<T0>(arg3) >= v6, 14);
        let v7 = ContractMeta{
            cancelable_by_sender      : arg10,
            cancelable_by_recipient   : arg11,
            transferable_by_sender    : arg12,
            transferable_by_recipient : arg13,
            can_topup                 : arg14,
            pausable                  : arg15,
            can_update_rate           : arg16,
            automatic_withdrawal      : arg17,
            withdrawal_frequency      : modified_arg18,
            contract_name             : arg19,
        };
        let v8 = FeesData{
            streamflow_fee_percentage : v2,
            streamflow_fee            : v4,
            streamflow_fee_withdrawn  : 0,
            partner_fee_percentage    : v3,
            partner_fee               : v5,
            partner_fee_withdrawn     : 0,
        };
        let v9 = Contract<T0>{
            id                                 : sui::object::new(arg22),
            balance                            : sui::coin::into_balance<T0>(sui::coin::split<T0>(arg3, v6, arg22)),
            meta                               : v7,
            amount                             : arg5,
            period                             : arg6,
            amount_per_period                  : arg7,
            start                              : arg8,
            end                                : v1,
            cliff_amount                       : arg9,
            withdrawn                          : 0,
            last_withdrawn_at                  : 0,
            created                            : v0,
            canceled_at                        : 0,
            recipient                          : arg20,
            sender                             : sui::tx_context::sender(arg22),
            partner                            : arg21,
            fees                               : v8,
            closed                             : false,
            current_pause_start                : 0,
            pause_cumulative                   : 0,
            last_rate_change_time              : 0,
            funds_unlocked_at_last_rate_change : 0,
            version                            : 1,
        };
        if (arg17 && arg18 > 0) {
            let v10 = calculate_withdrawal_fees(arg8, v1, arg18, easyLocking::admin::get_tx_fee(arg0));
            assert!(sui::coin::value<sui::sui::SUI>(arg4) >= v10, 13);
            sui::transfer::public_transfer<sui::coin::Coin<sui::sui::SUI>>(sui::coin::split<sui::sui::SUI>(arg4, v10, arg22), easyLocking::admin::get_withdrawor(arg0));
        };
        let v11 = ContractCreated{address: sui::object::uid_to_address(&v9.id)};
        sui::event::emit<ContractCreated>(v11);
        sui::transfer::share_object<Contract<T0>>(v9);
    }

    fun deposit_net<T0>(arg0: &mut Contract<T0>, arg1: u64) {
        arg0.fees.streamflow_fee = arg0.fees.streamflow_fee + calculate_fee_amount(arg1, arg0.fees.streamflow_fee_percentage);
        arg0.fees.partner_fee = arg0.fees.partner_fee + calculate_fee_amount(arg1, arg0.fees.partner_fee_percentage);
        arg0.amount = arg0.amount + arg1;
        arg0.end = calculate_end(arg0.amount, arg0.cliff_amount, arg0.funds_unlocked_at_last_rate_change, arg0.period, arg0.start, arg0.last_rate_change_time, arg0.pause_cumulative, arg0.amount_per_period);
    }

    public fun end<T0>(arg0: &Contract<T0>) : u64 {
        arg0.end
    }

    public fun partner<T0>(arg0: &Contract<T0>) : address {
        arg0.partner
    }

    public fun partner_fee<T0>(arg0: &Contract<T0>) : u64 {
        arg0.fees.partner_fee
    }

    public entry fun pause<T0>(arg0: &mut Contract<T0>, arg1: &sui::clock::Clock, arg2: &mut sui::tx_context::TxContext) {
        assert_pause<T0>(arg0, sui::tx_context::sender(arg2));
        let v0 = easyLocking::utils::timestamp_seconds(arg1);
        assert!(v0 < arg0.end, 5);
        arg0.current_pause_start = v0;
    }

    public fun pause_cumulative<T0>(arg0: &Contract<T0>) : u64 {
        arg0.pause_cumulative
    }

    public fun recipient<T0>(arg0: &Contract<T0>) : address {
        arg0.recipient
    }

    public fun start<T0>(arg0: &Contract<T0>) : u64 {
        arg0.start
    }

    public fun streamflow_fee<T0>(arg0: &Contract<T0>) : u64 {
        arg0.fees.streamflow_fee
    }

    public entry fun topup<T0>(arg0: &mut Contract<T0>, arg1: &easyLocking::admin::Config, arg2: &mut sui::coin::Coin<T0>, arg3: &mut sui::coin::Coin<sui::sui::SUI>, arg4: u64, arg5: &mut sui::tx_context::TxContext) {
        assert_topup<T0>(arg0);
        assert!(arg4 > 0, 2);
        deposit_net<T0>(arg0, arg4);
        let v0 = arg4 + calculate_fee_amount(arg4, arg0.fees.streamflow_fee_percentage) + calculate_fee_amount(arg4, arg0.fees.partner_fee_percentage);
        assert!(sui::coin::value<T0>(arg2) >= v0, 14);
        sui::balance::join<T0>(&mut arg0.balance, sui::coin::into_balance<T0>(sui::coin::split<T0>(arg2, v0, arg5)));
        if (arg0.meta.automatic_withdrawal && arg0.meta.withdrawal_frequency > 0) {
            let v1 = calculate_withdrawal_fees(arg0.end, arg0.end, arg0.meta.withdrawal_frequency, easyLocking::admin::get_tx_fee(arg1));
            if (v1 > 0) {
                assert!(sui::coin::value<sui::sui::SUI>(arg3) >= v1, 13);
                sui::transfer::public_transfer<sui::coin::Coin<sui::sui::SUI>>(sui::coin::split<sui::sui::SUI>(arg3, v1, arg5), easyLocking::admin::get_withdrawor(arg1));
            };
        };
    }

    public entry fun unpause<T0>(arg0: &mut Contract<T0>, arg1: &sui::clock::Clock, arg2: &mut sui::tx_context::TxContext) {
        assert_unpause<T0>(arg0, sui::tx_context::sender(arg2));
        let v0 = easyLocking::utils::timestamp_seconds(arg1);
        let v1 = calculate_current_pause_length<T0>(arg0, v0);
        if (arg0.current_pause_start >= arg0.start || v0 >= arg0.start) {
            arg0.end = arg0.end + v1;
        };
        if (v0 >= arg0.start) {
            arg0.pause_cumulative = arg0.pause_cumulative + v1;
        };
        if (arg0.current_pause_start <= arg0.start && v0 >= arg0.start) {
            arg0.start = v0;
            arg0.pause_cumulative = 0;
        };
        arg0.current_pause_start = 0;
    }

    fun validate_contract_params(arg0: u64, arg1: u64, arg2: u64, arg3: u64, arg4: u64, arg5: u64, arg6: u64) {
        assert!(arg2 <= arg0, 6);
        assert!(arg2 > 0, 6);
        if (arg5 > 0) {
            assert!(arg5 <= arg0, 9);
        };
        assert!(arg1 > 0, 10);
        assert!(arg3 == 0 || arg3 >= arg1, 4);
        assert!(arg6 <= arg4, 11);
        assert!(arg4 < arg6 + 2207520000, 11);
    }

    public entry fun withdraw<T0>(arg0: &mut Contract<T0>, arg1: &easyLocking::admin::Config, arg2: &sui::clock::Clock, arg3: u64, arg4: &mut sui::tx_context::TxContext) {
        assert!(!arg0.closed, 5);
        let v0 = easyLocking::utils::timestamp_seconds(arg2);
        if (!arg0.meta.automatic_withdrawal && arg0.end > v0) {
            assert!(sui::tx_context::sender(arg4) == arg0.recipient, 3);
        };
        withdraw_by_amount<T0>(arg0, arg1, v0, 0x1::option::some<u64>(arg3), arg4);
        if (arg0.withdrawn == arg0.amount) {
            arg0.closed = true;
        };
    }

    fun withdraw_by_amount<T0>(arg0: &mut Contract<T0>, arg1: &easyLocking::admin::Config, arg2: u64, arg3: 0x1::option::Option<u64>, arg4: &mut sui::tx_context::TxContext) {
        let v0 = calculate_available<T0>(arg2, arg0.amount, arg0.withdrawn, arg0, 10000);
        let v1 = calculate_available<T0>(arg2, arg0.fees.streamflow_fee, arg0.fees.streamflow_fee_withdrawn, arg0, arg0.fees.streamflow_fee_percentage);
        let v2 = calculate_available<T0>(arg2, arg0.fees.partner_fee, arg0.fees.partner_fee_withdrawn, arg0, arg0.fees.partner_fee_percentage);
        let mut v3 = v0;
        if (0x1::option::is_some<u64>(&arg3) && arg3 != 0x1::option::some<u64>(18446744073709551615)) {
            let v4 = 0x1::option::destroy_some<u64>(arg3);
            v3 = v4;
            assert!(v0 >= v4, 2);
        };
        if (v3 > 0) {
            arg0.withdrawn = arg0.withdrawn + v3;
            arg0.last_withdrawn_at = arg2;
            sui::transfer::public_transfer<sui::coin::Coin<T0>>(sui::coin::take<T0>(&mut arg0.balance, v3, arg4), arg0.recipient);
        };
        if (v1 > 0) {
            arg0.fees.streamflow_fee_withdrawn = arg0.fees.streamflow_fee_withdrawn + v1;
            sui::transfer::public_transfer<sui::coin::Coin<T0>>(sui::coin::take<T0>(&mut arg0.balance, v1, arg4), easyLocking::admin::get_treasury(arg1));
        };
        if (v2 > 0) {
            arg0.fees.partner_fee_withdrawn = arg0.fees.partner_fee_withdrawn + v2;
            sui::transfer::public_transfer<sui::coin::Coin<T0>>(sui::coin::take<T0>(&mut arg0.balance, v2, arg4), arg0.partner);
        };
        let v5 = ContractWithdrawn{
            address           : sui::object::uid_to_address(&arg0.id),
            amount            : v3,
            streamflow_amount : v1,
            partner_amount    : v2,
        };
        sui::event::emit<ContractWithdrawn>(v5);
    }

    public fun withdrawal_frequency<T0>(arg0: &Contract<T0>) : u64 {
        arg0.meta.withdrawal_frequency
    }

    // decompiled from Move bytecode v6
}
module easyLocking::strmt {
    public struct STRMT has drop {
        dummy_field: bool,
    }

    fun init(arg0: STRMT, arg1: &mut sui::tx_context::TxContext) {
        let (v0, v1) = 0x2::coin::create_currency<STRMT>(arg0, 6, b"STRMT", b"Streamflow", b"", 0x1::option::none<0x2::url::Url>(), arg1);
        let mut v2 = v0;
        0x2::transfer::public_freeze_object<0x2::coin::CoinMetadata<STRMT>>(v1);
        0x2::coin::mint_and_transfer<STRMT>(&mut v2, 1000000000000, 0x2::tx_context::sender(arg1), arg1);
        0x2::transfer::public_transfer<0x2::coin::TreasuryCap<STRMT>>(v2, 0x2::tx_context::sender(arg1));
    }

    // decompiled from Move bytecode v6
}

module easyLocking::utils {
    public fun ceil_div(arg0: u64, arg1: u64) : u64 {
        if (arg0 == 0) {
            return 0
        };
        (arg0 - 1) / arg1 + 1
    }

    public fun timestamp_seconds(arg0: &0x2::clock::Clock) : u64 {
        0x2::clock::timestamp_ms(arg0) / 1000
    }

    // decompiled from Move bytecode v6
}



