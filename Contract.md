合约文档
### Module: easyLocking::admin

#### Structures
- **Config**
  - `id`: sui::object::UID - 唯一标识符。
  - `streamflow_fee`: u64 - 流费费用。
  - `treasury`: address - 金库地址。
  - `withdrawor`: address - 提款人地址。
  - `tx_fee`: u64 - 交易费。
  - `version`: u64 - 版本号。

- **AdminCap**
  - `id`: sui::object::UID - 管理员能力的唯一标识符。

- **AddressValue**
  - `address`: address - 存储的地址值。

- **AdminTransfered**
  - `new_address`: address - 新管理员地址。
  - `old_address`: address - 旧管理员地址。

- **FeeManagerChanged**
  - `new_address`: address - 新费用管理地址。
  - `old_address`: address - 旧费用管理地址。

- **TreasuryChanged**
  - `new_address`: address - 新金库地址。
  - `old_address`: address - 旧金库地址。

- **WithdraworChanged**
  - `new_address`: address - 新提款人地址。
  - `old_address`: address - 旧提款人地址。

- **StreamflowFeeChanged**
  - `new_fee`: u64 - 新流费。
  - `old_fee`: u64 - 旧流费。

- **TxFeeChanged**
  - `new_fee`: u64 - 新交易费。
  - `old_fee`: u64 - 旧交易费。

#### Functions
- **change_fee_manager**
  - `arg0`: &AdminCap - 管理员能力。
  - `arg1`: &mut Config - 配置结构体的可变引用。
  - `arg2`: address - 新的费用管理地址。
  - **限制条件**: 需要管理员能力。

- **change_streamflow_fee**
  - `arg0`: &AdminCap - 管理员能力。
  - `arg1`: &mut Config - 配置结构体的可变引用。
  - `arg2`: u64 - 新的流费。
  - **限制条件**: 需要管理员能力。

- **change_streamflow_fee_as_manager**
  - `arg0`: &mut Config - 配置结构体的可变引用。
  - `arg1`: u64 - 新的流费。
  - `arg2`: &mut sui::tx_context::TxContext - 交易上下文。
  - **限制条件**: 调用者必须是费用管理。

- **change_treasury**
  - `arg0`: &AdminCap - 管理员能力。
  - `arg1`: &mut Config - 配置结构体的可变引用。
  - `arg2`: address - 新的金库地址。
  - **限制条件**: 需要管理员能力。

- **change_tx_fee**
  - `arg0`: &mut Config - 配置结构体的可变引用。
  - `arg1`: u64 - 新的交易费。
  - `arg2`: &mut sui::tx_context::TxContext - 交易上下文。
  - **限制条件**: 调用者必须是提款人。

- **change_withdrawor**
  - `arg0`: &AdminCap - 管理员能力。
  - `arg1`: &mut Config - 配置结构体的可变引用。
  - `arg2`: address - 新的提款人地址。
  - **限制条件**: 需要管理员能力。

- **get_fee_manager**
  - `arg0`: &Config - 配置结构体的引用。
  - **返回**: address - 费用管理的地址。

- **get_streamflow_fee**
  - `arg0`: &Config - 配置结构体的引用。
  - **返回**: u64 - 当前流费。

- **get_treasury**
  - `arg0`: &Config - 配置结构体的引用。
  - **返回**: address - 金库地址。

- **get_tx_fee**
  - `arg0`: &Config - 配置结构体的引用。
  - **返回**: u64 - 交易费。

- **get_withdrawor**
  - `arg0`: &Config - 配置结构体的引用。
  - **返回**: address - 提款人地址。

- **init**
  - `arg0`: &mut sui::tx_context::TxContext - 交易上下文。
  - **描述**: 初始化管理员配置和管理员能力。

- **transfer_admin**
  - `arg0`: AdminCap - 管理员能力。
  - `arg1`: address - 新管理员地址。
  - `arg2`: &mut sui::tx_context::TxContext - 交易上下文。
  - **描述**: 转移管理员能力。

- **update_address_value**
  - `arg0`: &mut AddressValue - 地址值结构体的可变引用。
  - `arg1`: address - 新的地址值。
  - **描述**: 更新地址值。

- **write_streamflow_fee_to_config**
  - `arg0`: &mut Config - 配置结构体的可变引用。
  - `arg1`: u64 - 新的流费。
  - **限制条件**: 流费必须小于或等于10000。

### Module: easyLocking::fee_manager

#### Structures
- **FeeValue**
  - `streamflow_fee`: u64 - 流费费用。
  - `partner_fee`: u64 - 合作伙伴费用。

- **FeeTable**
  - `id`: sui::object::UID - 唯一标识符。
  - `values`: sui::table::Table<address, FeeValue> - 地址到费用值的映射表。
  - `version`: u64 - 版本号。

- **FeesWritten**
  - `wallet_address`: address - 钱包地址。
  - `streamflow_fee`: u64 - 流费费用。
  - `partner_fee`: u64 - 合作伙伴费用。

- **FeesRemoved**
  - `wallet_address`: address - 钱包地址。

#### Functions
- **get_streamflow_fee**
  - `arg0`: &FeeTable - 费用表结构体的引用。
  - `arg1`: &easyLocking::admin::Config - 配置结构体的引用。
  - `arg2`: address - 地址。
  - **返回**: u64 - 流费。

- **fees_remove**
  - `arg0`: &easyLocking::admin::AdminCap - 管理员能力。
  - `arg1`: &mut FeeTable - 费用表结构体的可变引用。
  - `arg2`: address - 要移除的钱包地址。
  - **限制条件**: 需要管理员能力。

- **fees_remove_as_manager**
  - `arg0`: &easyLocking::admin::Config - 配置结构体的引用。
  - `arg1`: &mut FeeTable - 费用表结构体的可变引用。
  - `arg2`: address - 要移除的钱包地址。
  - `arg3`: &mut sui::tx_context::TxContext - 交易上下文。
  - **限制条件**: 调用者必须是费用管理。

- **fees_write**
  - `arg0`: &easyLocking::admin::AdminCap - 管理员能力。
  - `arg1`: &mut FeeTable - 费用表结构体的可变引用。
  - `arg2`: address - 钱包地址。
  - `arg3`: u64 - 流费。
  - `arg4`: u64 - 合作伙伴费用。
  - **限制条件**: 需要管理员能力。

- **fees_write_as_manager**
  - `arg0`: &easyLocking::admin::Config - 配置结构体的引用。
  - `arg1`: &mut FeeTable - 费用表结构体的可变引用。
  - `arg2`: address - 钱包地址。
  - `arg3`: u64 - 流费。
  - `arg4`: u64 - 合作伙伴费用。
  - `arg5`: &mut sui::tx_context::TxContext - 交易上下文。
  - **限制条件**: 调用者必须是费用管理。

- **get_fees**
  - `arg0`: &FeeTable - 费用表结构体的引用。
  - `arg1`: &easyLocking::admin::Config - 配置结构体的引用。
  - `arg2`: address - 地址。
  - **返回**: FeeValue - 费用值。

- **get_partner_fee**
  - `arg0`: &FeeTable - 费用表结构体的引用。
  - `arg1`: &easyLocking::admin::Config - 配置结构体的引用。
  - `arg2`: address - 地址。
  - **返回**: u64 - 合作伙伴费用。

- **init**
  - `arg0`: &mut sui::tx_context::TxContext - 交易上下文。
  - **描述**: 初始化费用表。

- **remove_from_fee_table**
  - `arg0`: &mut FeeTable - 费用表结构体的可变引用。
  - `arg1`: address - 要移除的钱包地址。
  - **描述**: 从费用表中移除一个钱包地址。

- **write_to_fee_table**
  - `arg0`: &mut FeeTable - 费用表结构体的可变引用。
  - `arg1`: address - 钱包地址。
  - `arg2`: u64 - 流费。
  - `arg3`: u64 - 合作伙伴费用。
  - **限制条件**: 流费和合作伙伴费用必须小于或等于10000。

以上是`easyLocking::fee_manager`模块的接口文档



### Module: easyLocking::protocol

#### Structures
- **FeesData**
  - `streamflow_fee_percentage`: u64 - 流费百分比。
  - `streamflow_fee`: u64 - 流费。
  - `streamflow_fee_withdrawn`: u64 - 已提取的流费。
  - `partner_fee_percentage`: u64 - 合作伙伴费百分比。
  - `partner_fee`: u64 - 合作伙伴费。
  - `partner_fee_withdrawn`: u64 - 已提取的合作伙伴费。

- **ContractMeta**
  - `cancelable_by_sender`: bool - 发送者是否可以取消合约。
  - `cancelable_by_recipient`: bool - 接收者是否可以取消合约。
  - `transferable_by_sender`: bool - 发送者是否可以转移合约。
  - `transferable_by_recipient`: bool - 接收者是否可以转移合约。
  - `can_topup`: bool - 是否可以充值。
  - `pausable`: bool - 是否可以暂停。
  - `can_update_rate`: bool - 是否可以更新费率。
  - `automatic_withdrawal`: bool - 是否自动提款。
  - `withdrawal_frequency`: u64 - 提款频率。
  - `contract_name`: vector<u8> - 合约名称。

- **Contract<phantom T0>**
  - `id`: sui::object::UID - 唯一标识符。
  - `balance`: sui::balance::Balance<T0> - 合约余额。
  - `meta`: ContractMeta - 合约元数据。
  - `amount`: u64 - 总金额。
  - `period`: u64 - 周期。
  - `amount_per_period`: u64 - 每个周期的金额。
  - `start`: u64 - 开始时间。
  - `end`: u64 - 结束时间。
  - `cliff_amount`: u64 - 悬崖金额。
  - `withdrawn`: u64 - 已提取金额。
  - `last_withdrawn_at`: u64 - 上次提款时间。
  - `created`: u64 - 创建时间。
  - `canceled_at`: u64 - 取消时间。
  - `recipient`: address - 接收者地址。
  - `sender`: address - 发送者地址。
  - `partner`: address - 合作伙伴地址。
  - `fees`: FeesData - 费用数据。
  - `closed`: bool - 是否关闭。
  - `current_pause_start`: u64 - 当前暂停开始时间。
  - `pause_cumulative`: u64 - 累计暂停时间。
  - `last_rate_change_time`: u64 - 上次费率变更时间。
  - `funds_unlocked_at_last_rate_change`: u64 - 上次费率变更时解锁的资金。
  - `version`: u64 - 版本号。

- **ContractCreated**
  - `address`: address - 创建合约的地址。

- **ContractWithdrawn**
  - `address`: address - 提款合约的地址。
  - `amount`: u64 - 提款金额。
  - `streamflow_amount`: u64 - 流费金额。
  - `partner_amount`: u64 - 合作伙伴金额。

#### Functions
- **transfer**
  - `arg0`: &mut Contract<T0> - 合约结构体的可变引用。
  - `arg1`: address - 新接收者地址。
  - `arg2`: &mut sui::tx_context::TxContext - 交易上下文。
  - **描述**: 转移合约的接收者。

- **sender<T0>**
  - `arg0`: &Contract<T0> - 合约结构体的引用。
  - **返回**: address - 合约的发送者地址。

- **amount<T0>**
  - `arg0`: &Contract<T0> - 合约结构体的引用。
  - **返回**: u64 - 合约的总金额。

- **amount_per_period<T0>**
  - `arg0`: &Contract<T0> - 合约结构体的引用。
  - **返回**: u64 - 每个周期的金额。

- **assert_cancel<T0>**
  - `arg0`: &Contract<T0> - 合约结构体的引用。
  - `arg1`: address - 尝试取消合约的地址。
  - **限制条件**: 检查是否可以取消合约。

- **assert_pause<T0>**
  - `arg0`: &Contract<T0> - 合约结构体的引用。
  - `arg1`: address - 尝试暂停合约的地址。
  - **限制条件**: 检查是否可以暂停合约。

- **assert_topup<T0>**
  - `arg0`: &Contract<T0> - 合约结构体的引用。
  - **限制条件**: 检查是否可以充值。

- **assert_transfer<T0>**
  - `arg0`: &Contract<T0> - 合约结构体的引用。
  - `arg1`: address - 尝试转移合约的地址。
  - **限制条件**: 检查是否可以转移合约。

- **assert_unpause<T0>**
  - `arg0`: &Contract<T0> - 合约结构体的引用。
  - `arg1`: address - 尝试取消暂停合约的地址。
  - **限制条件**: 检查是否可以取消暂停合约。

- **automatic_withdrawal<T0>**
  - `arg0`: &Contract<T0> - 合约结构体的引用。
  - **返回**: bool - 是否自动提款。

- **balance_value<T0>**
  - `arg0`: &Contract<T0> - 合约结构体的引用。
  - **返回**: u64 - 合约余额的价值。

- **calculate_available<T0>**
  - `arg0`: u64 - 当前时间戳。
  - `arg1`: u64 - 总金额。
  - `arg2`: u64 - 已提取金额。
  - `arg3`: &Contract<T0> - 合约结构体的引用。
  - `arg4`: u64 - 百分比。
  - **返回**: u64 - 可提取的金额。

- **calculate_current_pause_length<T0>**
  - `arg0`: &Contract<T0> - 合约结构体的引用。
  - `arg1`: u64 - 当前时间戳。
  - **返回**: u64 - 当前暂停的长度。

- **calculate_end**
  - `arg0`: u64 - 总金额。
  - `arg1`: u64 - 悬崖金额。
  - `arg2`: u64 - 上次解锁的资金。
  - `arg3`: u64 - 周期。
  - `arg4`: u64 - 开始时间。
  - `arg5`: u64 - 上次费率变更时间。
  - `arg6`: u64 - 累计暂停时间。
  - `arg7`: u64 - 每个周期的金额。
  - **返回**: u64 - 结束时间。

- **calculate_fee_amount**
  - `arg0`: u64 - 金额。
  - `arg1`: u64 - 百分比。
  - **返回**: u64 - 费用金额。

- **calculate_last_unlock_time<T0>**
  - `arg0`: u64 - 当前时间戳。
  - `arg1`: &Contract<T0> - 合约结构体的引用。
  - **返回**: u64 - 上次解锁时间。

- **calculate_withdrawal_fees**
  - `arg0`: u64 - 开始时间。
  - `arg1`: u64 - 结束时间。
  - `arg2`: u64 - 提款频率。
  - `arg3`: u64 - 交易费。
  - **返回**: u64 - 提款费用。

- **cancel<T0>**
  - `arg0`: &mut Contract<T0> - 合约结构体的可变引用。
  - `arg1`: &easyLocking::admin::Config - 配置结构体的引用。
  - `arg2`: &sui::clock::Clock - 时钟模块的引用。
  - `arg3`: &mut sui::tx_context::TxContext - 交易上下文。
  - **描述**: 取消合约。

- **canceled_at<T0>**
  - `arg0`: &Contract<T0> - 合约结构体的引用。
  - **返回**: u64 - 取消时间。

- **closed<T0>**
  - `arg0`: &Contract<T0> - 合约结构体的引用。
  - **返回**: bool - 是否关闭。

- **create<T0>**
  - `arg0`: &easyLocking::admin::Config - 配置结构体的引用。
  - `arg1`: &easyLocking::fee_manager::FeeTable - 费用表结构体的引用。
  - `arg2`: &sui::clock::Clock - 时钟模块的引用。
  - `arg3`: &mut sui::coin::Coin<T0> - 代币类型为T0的可变Coin。
  - `arg4`: &mut sui::coin::Coin<sui::sui::SUI> - SUI类型的可变Coin。
  - `arg5`: u64 - 合约总金额。
  - `arg6`: u64 - 周期。
  - `arg7`: u64 - 每个周期的金额。
  - `arg8`: u64 - 开始时间。
  - `arg9`: u64 - 悬崖金额。
  - `arg10`: bool - 是否可以由发送者取消。
  - `arg11`: bool - 是否可以由接收者取消。
  - `arg12`: bool - 是否可以由发送者转移。
  - `arg13`: bool - 是否可以由接收者转移。
  - `arg14`: bool - 是否可以充值。
  - `arg15`: bool - 是否可以暂停。
  - `arg16`: bool - 是否可以更新费率。
  - `arg17`: bool - 是否自动提款。
  - `arg18`: u64 - 提款频率。
  - `arg19`: vector<u8> - 合约名称。
  - `arg20`: address - 接收者地址。
  - `arg21`: address - 合作伙伴地址。
  - `arg22`: &mut sui::tx_context::TxContext - 交易上下文。
  - **描述**: 创建一个新的合约。

- **deposit_net<T0>**
  - `arg0`: &mut Contract<T0> - 合约结构体的可变引用。
  - `arg1`: u64 - 存款金额。
  - **描述**: 向合约存入金额。

- **end<T0>**
  - `arg0`: &Contract<T0> - 合约结构体的引用。
  - **返回**: u64 - 合约结束时间。

- **partner<T0>**
  - `arg0`: &Contract<T0> - 合约结构体的引用。
  - **返回**: address - 合作伙伴地址。

- **partner_fee<T0>**
  - `arg0`: &Contract<T0> - 合约结构体的引用。
  - **返回**: u64 - 合作伙伴费用。

- **pause<T0>**
  - `arg0`: &mut Contract<T0> - 合约结构体的可变引用。
  - `arg1`: &sui::clock::Clock - 时钟模块的引用。
  - `arg2`: &mut sui::tx_context::TxContext - 交易上下文。
  - **描述**: 暂停合约。

- **pause_cumulative<T0>**
  - `arg0`: &Contract<T0> - 合约结构体的引用。
  - **返回**: u64 - 累计暂停时间。

- **recipient<T0>**
  - `arg0`: &Contract<T0> - 合约结构体的引用。
  - **返回**: address - 接收者地址。

- **start<T0>**
  - `arg0`: &Contract<T0> - 合约结构体的引用。
  - **返回**: u64 - 合约开始时间。

- **streamflow_fee<T0>**
  - `arg0`: &Contract<T0> - 合约结构体的引用。
  - **返回**: u64 - 流费。

- **topup<T0>**
  - `arg0`: &mut Contract<T0> - 合约结构体的可变引用。
  - `arg1`: &easyLocking::admin::Config - 配置结构体的引用。
  - `arg2`: &mut sui::coin::Coin<T0> - 代币类型为T0的可变Coin。
  - `arg3`: &mut sui::coin::Coin<sui::sui::SUI> - SUI类型的可变Coin。
  - `arg4`: u64 - 充值金额。
  - `arg5`: &mut sui::tx_context::TxContext - 交易上下文。
  - **描述**: 为合约充值。

- **unpause<T0>**
  - `arg0`: &mut Contract<T0> - 合约结构体的可变引用。
  - `arg1`: &sui::clock::Clock - 时钟模块的引用。
  - `arg2`: &mut sui::tx_context::TxContext - 交易上下文。
  - **描述**: 取消暂停合约。

- **validate_contract_params**
  - `arg0`: u64 - 总金额。
  - `arg1`: u64 - 周期。
  - `arg2`: u64 - 每个周期的金额。
  - `arg3`: u64 - 开始时间。
  - `arg4`: u64 - 悬崖金额。
  - `arg5`: u64 - 提款频率。
  - `arg6`: u64 - 创建时间。
  - **限制条件**: 验证合约参数的有效性。

- **withdraw<T0>**
  - `arg0`: &mut Contract<T0> - 合约结构体的可变引用。
  - `arg1`: &easyLocking::admin::Config - 配置结构体的引用。
  - `arg2`: &sui::clock::Clock - 时钟模块的引用。
  - `arg3`: u64 - 提款金额。
  - `arg4`: &mut sui::tx_context::TxContext - 交易上下文。
  - **描述**: 从合约中提款。

- **withdraw_by_amount<T0>**
  - `arg0`: &mut Contract<T0> - 合约结构体的可变引用。
  - `arg1`: &easyLocking::admin::Config - 配置结构体的引用。
  - `arg2`: u64 - 当前时间戳。
  - `arg3`: Option<u64> - 提款金额选项。
  - `arg4`: &mut sui::tx_context::TxContext - 交易上下文。
  - **描述**: 根据金额提款。

- **withdrawal_frequency<T0>**
  - `arg0`: &Contract<T0> - 合约结构体的引用。
  - **返回**: u64 - 提款频率。

以上是`easyLocking::protocol`模块的接口文档

### Module: easyLocking::strmt

#### Structures
- **STRMT**
  - `dummy_field`: bool - 一个占位字段，用于创建结构体。

#### Functions
- **init**
  - `arg0`: STRMT - STRMT结构体实例。
  - `arg1`: &mut sui::tx_context::TxContext - 交易上下文。
  - **描述**: 初始化STRMT货币。创建货币，冻结CoinMetadata对象，铸造并转移一定数量的货币给指定地址，并转移TreasuryCap。

### Module: easyLocking::utils

#### Functions
- **ceil_div**
  - `arg0`: u64 - 被除数。
  - `arg1`: u64 - 除数。
  - **返回**: u64 - 向上取整的除法结果。

- **timestamp_seconds**
  - `arg0`: &0x2::clock::Clock - 时钟模块的引用。
  - **返回**: u64 - 以秒为单位的时间戳。

以上是`easyLocking::strmt`和`easyLocking::utils`模块的接口文档。



