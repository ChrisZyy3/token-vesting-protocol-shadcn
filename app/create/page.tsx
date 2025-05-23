'use client';

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { getUserProfile } from "../../lib/contracts";
import { calculateTotalBalance, formatBalance, CategorizedObjects } from "@/utils/assetsHelpers";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { packageId, suiClient } from "@/config";
import { Transaction } from "@mysten/sui/transactions"

function formatCoinType(coinType: string, maxLength: number = 10): string {
  if (coinType.length <= maxLength) return coinType;
  const start = coinType.slice(0, 4);
  const end = coinType.slice(-4);
  return `${start}...${end}`;
}

const formSchema = z.object({
  token: z.string({
    required_error: "Please select a token to lock",
  }),
  amount: z.string({
    required_error: "Please enter the amount to lock",
  }).refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Please enter a valid amount",
  }),
  lockDuration: z.enum(["3months", "6months", "1year", "2years"], {
    required_error: "Please select a lock duration",
  }),
});

function TokenDisplay({ coinType, coins, }: { coinType: string, coins: any[] }) {
  const totalBalance = calculateTotalBalance(coins);
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-2">
        <div className="size-5 shrink-0 rounded-full bg-blue-500" />
        <span className="truncate">{coinType.split("::").pop()}</span>
      </div>
      <span className="shrink-0 text-sm text-muted-foreground">
        {formatBalance(totalBalance)}
      </span>
    </div>
  );
}

export default function CreatePage() {
  const router = useRouter();
  const account = useCurrentAccount();
  const { toast } = useToast();
  const [userObjects, setUserObjects] = useState<CategorizedObjects | null>(null);
  const [selectedTokenBalance, setSelectedTokenBalance] = useState<string>("0");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: "",
      amount: "",
      lockDuration: "3months",
    },
  });

  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();

  useEffect(() => {
    async function fetchUserProfile() {
      if (account?.address) {
        try {
          const profile = await getUserProfile(account.address);
          setUserObjects(profile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    }

    fetchUserProfile();
  }, [account]);

  useEffect(() => {
    if (userObjects && Object.keys(userObjects.coins).length > 0) {
      const firstCoinType = Object.keys(userObjects.coins)[0];
      form.setValue("token", firstCoinType);
      updateSelectedTokenBalance(firstCoinType);
    }
  }, [userObjects, form]);

  const updateSelectedTokenBalance = (coinType: string) => {
    if (userObjects?.coins[coinType]) {
      const balance = calculateTotalBalance(userObjects.coins[coinType]);
      setSelectedTokenBalance(formatBalance(balance));
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // TODO: Implement token locking logic
    console.log('Form submitted with values:', values, account?.address);
    toast({
      title: "Lock Request Submitted",
      description: "Your tokens will be locked until the unlock date.",
    });
    // router.push("/dashboard"); 

    // 1. 获取表单数据
    let { amount, token, lockDuration } = values;

    // 2. 处理时间戳
    const now = Math.floor(Date.now() / 1000);
    const startTimestamp = new Date(now).getTime();
    const endTimestamp = startTimestamp + 60 * 1000; // 一分钟后

    amount = 1
    let FEE_PERCENTAGE = 100
    let SUI_PAYMENT = 1000000

    // 3. 构造交易
    const tx = new Transaction();
    tx.setGasBudget(1000000)
    amount = amount * 1000000000
    // let amount = (amount*1.01) * 1000000000
    console.warn(amount)
    // 4. 拆分出要锁定的token
    // const [coinToLock] = tx.splitCoins(tx.gas, [BigInt(amount)]);
    const amountToSplit = amount * 1.01
    const splitCoinsArr = tx.splitCoins(tx.gas, [amountToSplit, SUI_PAYMENT]);

    // 打印所有参数，便于调试
    console.log("锁仓参数：", {
      amount,
      token,
      lockDuration,
      account,
      startTimestamp,
      endTimestamp,
      // coinToLock,
      address: account?.address
    });
    // 获取当前钱包地址
    const walletAddress = account?.address;
    console.log("当前钱包地址：", walletAddress);

    // 拆分 tx.gas（默认Gas Coin）
    // 注意：拆分金额要用 BigInt，0.1 SUI = 0.1 * 1_000_000_000n = 100_000_000n 基础单位是9位小数

    // 拆分出 0.1 SUI

    // 0x0aaaaa28558f2c65c2ec0844e775fa7e8f4d2a376780ef1dc150dc5b7c44cf82 小号地址
    // 给目标地址转账拆分出来的0.1 SUI
    // tx.transferObjects([splitCoinsArr[0]], tx.pure.address('0x0aaaaa28558f2c65c2ec0844e775fa7e8f4d2a376780ef1dc150dc5b7c44cf82'));
    // 签名并执行交易
    // const result = await signAndExecute({ transaction: tx });

    // return;
    const callResponse = tx.moveCall({
      target: `${packageId}::protocol::create`,
      arguments: [
        tx.pure.u64(FEE_PERCENTAGE),                // 协议费用百分比
        tx.pure.u64(SUI_PAYMENT),                    // 交易费用
        tx.pure.u64(startTimestamp),       // 创建时间戳
        tx.object(splitCoinsArr[0]),             // 要锁定的代币
        tx.object(splitCoinsArr[1]),                      // SUI币
        tx.pure.u64(amount),        // 合约总金额
        tx.pure.u64(startTimestamp),       // 开始时间
        tx.pure.u64(endTimestamp),         // 结束时间
        tx.pure.address('0x0aaaaa28558f2c65c2ec0844e775fa7e8f4d2a376780ef1dc150dc5b7c44cf82'),  // 接收方地址（自己）
      ],
      typeArguments: ['0x2::sui::SUI']
      // arguments: [
      //   tx.object(
      //     "0xe57a675ddaffce44dc72f2930539309a40dbee09b2fe79141b65d4370b8dc3c8"
      //   ), // admin config
      //   tx.object(
      //     "0x63c5568308d688d9fe65ccecc9c9c922b645d6f5b31651e9374e22eeddfebb4b"
      //   ), // fee table
      //   tx.object.clock(), // Clock
      //   tx.object(coin1), // coin: Coin<T>
      //   tx.gas, // SUI
      //   tx.pure.u64(1000), // 总金额
      //   tx.pure.u64(3600), // 周期
      //   tx.object.clock(), // Clock
      //   tx.pure.vector("u8", encoder.encode(string)),
      //   tx.object(
      //     "0x19414683da3789f30477281c76a9eabf968539bd36007d39b228335d65299fb4"
      //   ),
      // ],
      // arguments: [
      //   tx.pure.u64(0), // fee
      //   tx.pure.u64(1111), // title
      //   // tx.gas, // coin: Coin<T>
      //   tx.object(coin1),
      //   tx.gas,
      //   tx.pure.u64(666), // start
      //   tx.pure.u64(20), // cliff
      //   tx.pure.u64(1734404413), // senderCancel
      //   tx.pure.vector("u8", encoder.encode(string)),
      //   tx.pure.address(
      //     "0x19414683da3789f30477281c76a9eabf968539bd36007d39b228335d65299fb4"
      //   ),
      // ],
      // arguments: [
      //   // // 按照合约接口文档，依次传入参数
      //   tx.pure.u64(10000), // arg0: 书协议费用合约比（假设10000）
      //   tx.pure.u64(0),     // arg1: 交易费用
      //   tx.pure.u64(startTimestamp),     // arg2: 创建时间戳
      //   tx.object(coin1),   // arg3: 要锁定的币
      //   tx.gas,   // arg4: SUI币（用于支付交易费）
      //   tx.pure.u64(666),  // arg5: 分配总金额
      //   tx.pure.u64(startTimestamp),     // arg6: 开始时间
      //   tx.pure.u64(startTimestamp),     // arg7: 解锁时间
      //   tx.pure.u64(startTimestamp),     // arg8: 结束时间
      //   tx.pure.address(account.address), // arg20: 接收方地址
      //   // tx.object(tx.txContext), // arg22: TxContext
      // ],
      // typeArguments: [],
    })
    console.warn('callresp',callResponse)
    // tx.mergeCoins()

    signAndExecute(
      {
        transaction: tx,
        option: {
          showEffects: true,
          showBalanceChanges: true,
          showInput: true,
        }
      },
      {
        onSuccess: async ({ digest }) => {
          toast({
            title: "Transaction Successful",
            description: "Your vesting contract has been created successfully.",
            variant: "default",
          })

          const response = await suiClient.waitForTransaction({
            digest: digest,
            options: {
              showEffects: true,
            },
          })
          console.log("effects", response)
          // router.push("/dashboard")
        },
        onError: (error) => {
          toast({
            title: "Transaction Failed",
            description:
              error.message ||
              "Failed to create vesting contract. Please try again.",
            variant: "destructive",
          })
          console.error("Error:", error)
        },
      }
    )
  }



  const getLockEndDate = (duration: string) => {
    const now = new Date();
    switch (duration) {
      case "3months":
        return new Date(now.setMonth(now.getMonth() + 3));
      case "6months":
        return new Date(now.setMonth(now.getMonth() + 6));
      case "1year":
        return new Date(now.setFullYear(now.getFullYear() + 1));
      case "2years":
        return new Date(now.setFullYear(now.getFullYear() + 2));
      default:
        return now;
    }
  };

  const handleCreateLock = () => {
    const values = form.getValues();
    console.log('Form Values:', values);
    if (!account?.address) return // 添加检查
    toast({
      title: "Transaction Submitted",
      description: "Your transaction is being processed...",
    })

    const tx = new Transaction()
    // tx.setGasBudget(1000000)

    // // 计算 unlock schedule 对应的数值
    // const unlockScheduleMap = {
    //   weekly: BigInt(7 * 24 * 60 * 60), // 7 days in seconds
    //   "bi-weekly": BigInt(14 * 24 * 60 * 60),
    //   monthly: BigInt(30 * 24 * 60 * 60),
    //   quarterly: BigInt(90 * 24 * 60 * 60),
    // }
    // // 计算 duration (转换为秒)
    // const durationInSeconds = BigInt(
    //   formData.vestingDuration.unit === "month"
    //     ? parseInt(formData.vestingDuration.value) * 30 * 24 * 60 * 60
    //     : parseInt(formData.vestingDuration.value) * 365 * 24 * 60 * 60
    // )

    // // 转换开始时间为 Unix timestamp
    // const startTimestamp = BigInt(
    //   Math.floor(formData.startDate.getTime() / 1000)
    // )
    // const [coin1] = tx.splitCoins(tx.gas, [100000])
    // console.log("coin1", coin1)
    // console.log("account.address", account.address)
    // const string = "account1"
    // const encoder = new TextEncoder()
    // const args = [
    //   [
    //     // 按照合约接口文档，依次传入参数
    //     tx.pure.u64(1), // arg0: 书协议费用合约比（假设10000）
    //     tx.pure.u64(2),     // arg1: 交易费用
    //     tx.pure.u64(new Date().getTime()),     // arg2: 创建时间戳
    //     tx.object(coin1),   // arg3: 要锁定的币
    //     tx.gas,   // arg4: SUI币（用于支付交易费）
    //     tx.pure.u64(666),  // arg5: 分配总金额
    //     tx.pure.u64(new Date().getTime()),     // arg6: 开始时间
    //     tx.pure.u64(new Date().getTime()),     // arg7: 解锁时间
    //     tx.pure.u64(new Date().getTime()),     // arg8: 结束时间
    //     tx.pure.address(account.address), // arg20: 接收方地址
    //     // tx.object(tx.txContext), // arg22: TxContext
    //     ]
    // ]
    // const args = [
    //   tx.object(
    //     "0xa0b1ae1097dced45ff5a01277f4de2eb21be7b7c08366683aae90078799d5b7f"
    //   ), // admin config
    //   tx.object(
    //     "0x664a0d0d39a8ecfb35cdca332a5c462f12f462fd5d1898665afdb418b825b80e"
    //   ), // fee table
    //   tx.object.clock(), // Clock
    //   tx.gas, // coin: Coin<T>
    //   tx.gas, // SUI
    //   tx.pure.u64(1000), // 总金额
    //   tx.pure.u64(3600), // 周期
    //   tx.pure.u64(15000000), //每个周期的金额
    //   tx.pure.u64(1734404413), // 开始时间
    //   tx.pure.u64(0), // 悬崖
    //   tx.pure.bool(false), // arg10: 是否可以由发送者取消
    //   tx.pure.bool(false), // arg11: 是否可以由接收者取消
    //   tx.pure.bool(false), // arg12: 是否可以由发送者转移
    //   tx.pure.bool(false), // arg13: 是否可以由接收者转移
    //   tx.pure.bool(false), // arg14: 是否可以充值
    //   tx.pure.bool(false), // arg15: 是否可以暂停
    //   tx.pure.bool(false), // arg16: 是否可以更新费率
    //   tx.pure.bool(false), // arg17: 是否自动提款
    //   tx.pure.u64(0), // arg18: 提款频率
    //   // tx.makeMoveVec({ type: 'u8', elements: ['account1'] }),
    //   tx.pure.vector("u8", encoder.encode(string)),
    //   tx.pure.address(
    //     "0x0aaaaa28558f2c65c2ec0844e775fa7e8f4d2a376780ef1dc150dc5b7c44cf82"
    //   ),
    //   tx.pure.address(account.address),
    // ]

    // tx.moveCall({
    //   target: `${packageId}::protocol::create`,
    //   // arguments: args,
    //   // arguments: [
    //   //   tx.object(
    //   //     "0xe57a675ddaffce44dc72f2930539309a40dbee09b2fe79141b65d4370b8dc3c8"
    //   //   ), // admin config
    //   //   tx.object(
    //   //     "0x63c5568308d688d9fe65ccecc9c9c922b645d6f5b31651e9374e22eeddfebb4b"
    //   //   ), // fee table
    //   //   tx.object.clock(), // Clock
    //   //   tx.object(coin1), // coin: Coin<T>
    //   //   tx.gas, // SUI
    //   //   tx.pure.u64(1000), // 总金额
    //   //   tx.pure.u64(3600), // 周期
    //   //   tx.object.clock(), // Clock
    //   //   tx.pure.vector("u8", encoder.encode(string)),
    //   //   tx.object(
    //   //     "0x19414683da3789f30477281c76a9eabf968539bd36007d39b228335d65299fb4"
    //   //   ),
    //   // ],
    //   // arguments: [
    //   //   tx.pure.u64(0), // fee
    //   //   tx.pure.u64(1111), // title
    //   //   // tx.gas, // coin: Coin<T>
    //   //   tx.object(coin1),
    //   //   tx.gas,
    //   //   tx.pure.u64(666), // start
    //   //   tx.pure.u64(20), // cliff
    //   //   tx.pure.u64(1734404413), // senderCancel
    //   //   tx.pure.vector("u8", encoder.encode(string)),
    //   //   tx.pure.address(
    //   //     "0x19414683da3789f30477281c76a9eabf968539bd36007d39b228335d65299fb4"
    //   //   ),
    //   // ],
    //   arguments:[
    //   // // 按照合约接口文档，依次传入参数
    //   tx.pure.u64(10000), // arg0: 书协议费用合约比（假设10000）
    //   tx.pure.u64(0),     // arg1: 交易费用
    //   tx.pure.u64(startTimestamp),     // arg2: 创建时间戳
    //   tx.object(coin1),   // arg3: 要锁定的币
    //   tx.gas,   // arg4: SUI币（用于支付交易费）
    //   tx.pure.u64(666),  // arg5: 分配总金额
    //   tx.pure.u64(startTimestamp),     // arg6: 开始时间
    //   tx.pure.u64(startTimestamp),     // arg7: 解锁时间
    //   tx.pure.u64(startTimestamp),     // arg8: 结束时间
    //   tx.pure.address(account.address), // arg20: 接收方地址
    //   // tx.object(tx.txContext), // arg22: TxContext
    //   ],
    //   typeArguments: ["0x2::sui::SUI"],
    // })

    // signAndExecute(
    //   {
    //     transaction: tx,
    //   },
    //   {
    //     onSuccess: async ({ digest }) => {
    //       toast({
    //         title: "Transaction Successful",
    //         description: "Your vesting contract has been created successfully.",
    //         variant: "default",
    //       })

    //       const { effects } = await suiClient.waitForTransaction({
    //         digest: digest,
    //         options: {
    //           showEffects: true,
    //         },
    //       })
    //       console.log("effects", effects)
    //       router.push("/dashboard")
    //     },
    //     onError: (error) => {
    //       toast({
    //         title: "Transaction Failed",
    //         description:
    //           error.message ||
    //           "Failed to create vesting contract. Please try again.",
    //         variant: "destructive",
    //       })
    //       console.error("Error:", error)
    //     },
    //   }
    // )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Lock Tokens</h1>
          <p className="text-sm text-muted-foreground">
            Select tokens to lock and choose a duration. Locked tokens cannot be traded until the unlock date.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="p-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Token</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          updateSelectedTokenBalance(value);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full border-input bg-background">
                            <SelectValue>
                              {userObjects?.coins[field.value] && (
                                <TokenDisplay
                                  coinType={field.value}
                                  coins={userObjects.coins[field.value]}
                                />
                              )}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {userObjects && Object.entries(userObjects.coins).map(([coinType, coins]) => (
                            <SelectItem key={coinType} value={coinType}>
                              <TokenDisplay coinType={coinType} coins={coins} />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lock Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter amount to lock"
                          className="border-input bg-background"
                          {...field}
                        />
                      </FormControl>
                      <div className="text-sm text-muted-foreground">
                        Available Balance: {selectedTokenBalance}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lockDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lock Duration</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full border-input bg-background">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="3months">3 Months</SelectItem>
                          <SelectItem value="6months">6 Months</SelectItem>
                          <SelectItem value="1year">1 Year</SelectItem>
                          <SelectItem value="2years">2 Years</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="text-sm text-muted-foreground">
                        Unlock Date: {format(getLockEndDate(field.value), "MMMM dd, yyyy")}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            <Button className="w-full" size="lg" onClick={handleCreateLock}>
              Confirm Lock
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}