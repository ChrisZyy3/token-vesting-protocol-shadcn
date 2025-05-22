"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { packageId } from "@/config"
import { useCreateForm } from "@/contexts/CreateFormContext"
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit"
import { SuiClient } from "@mysten/sui/client"
import { bcs } from "@mysten/sui/dist/cjs/bcs"
import { Transaction } from "@mysten/sui/transactions"
import { addMonths, addYears } from "date-fns"

import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

function calculateEndDate(
  startDate: Date,
  duration: { value: string; unit: "month" | "year" }
) {
  const value = parseInt(duration.value)
  if (duration.unit === "month") {
    return addMonths(startDate, value)
  } else {
    return addYears(startDate, value)
  }
}

export default function Review() {
  const router = useRouter()
  const { formData, recipients } = useCreateForm()
  const suiClient = useSuiClient()
  const account = useCurrentAccount() // 添加这行
  const { toast } = useToast()

  const {
    mutate: signAndExecute,
    isSuccess,
    isPending,
  } = useSignAndExecuteTransaction()

  useEffect(() => {
    if (account?.address) {
    }
    if (!formData || !recipients) {
      router.push("/create")
    }
  }, [formData, recipients, router])

  if (!formData || !recipients) {
    return null
  }

  const handleCreateContract = () => {
    console.log("Contract Details:", {
      formData,
      recipients,
      recipientCount: recipients.recipients.length,
      totalAmount: recipients.totalVested,
      remainingBalance: recipients.remainingBalance,
    })
    // const tx = new Transaction()
    // const [coin1] = tx.splitCoins(tx.gas, [1000]);
    // // 将第一个代币转移到地址 1
    // tx.transferObjects([coin1], '0x0aaaaa28558f2c65c2ec0844e775fa7e8f4d2a376780ef1dc150dc5b7c44cf82');
    // signAndExecute({ transaction: tx },
    //   {
    //     onSuccess: async ({ digest }) => {
    //       console.log('digest', digest);
    //     }
    //   });
    toast({
      title: "Transaction Submitted",
      description: "Your transaction is being processed...",
    })
    create()
  }

  const create = () => {
    if (!account?.address) return // 添加检查

    const tx = new Transaction()
    tx.setGasBudget(100000000)
    // 准备 recipients 数组参数
    const recipientAddresses = recipients?.recipients.map(
      (r) => r.walletAddress
    )
    const recipientAmounts = recipients?.recipients.map((r) => r.amount)

    // 计算 unlock schedule 对应的数值
    const unlockScheduleMap = {
      weekly: BigInt(7 * 24 * 60 * 60), // 7 days in seconds
      "bi-weekly": BigInt(14 * 24 * 60 * 60),
      monthly: BigInt(30 * 24 * 60 * 60),
      quarterly: BigInt(90 * 24 * 60 * 60),
    }
    const unlockInterval =
      unlockScheduleMap[formData?.unlockSchedule || "weekly"]

    // 计算 duration (转换为秒)
    const durationInSeconds = BigInt(
      formData.vestingDuration.unit === "month"
        ? parseInt(formData.vestingDuration.value) * 30 * 24 * 60 * 60
        : parseInt(formData.vestingDuration.value) * 365 * 24 * 60 * 60
    )

    // 转换开始时间为 Unix timestamp
    const startTimestamp = BigInt(
      Math.floor(formData.startDate.getTime() / 1000)
    )
    const [coin1] = tx.splitCoins(tx.gas, [100000])
    console.log("coin1", coin1)
    console.log("account.address", account.address)
    const string = "account1"
    const encoder = new TextEncoder()
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

    tx.moveCall({
      target: `${packageId}::protocol::create`,
      // arguments: args,
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
      arguments:[
      // // 按照合约接口文档，依次传入参数
      tx.pure.u64(10000), // arg0: 书协议费用合约比（假设10000）
      tx.pure.u64(0),     // arg1: 交易费用
      tx.pure.u64(startTimestamp),     // arg2: 创建时间戳
      tx.object(coin1),   // arg3: 要锁定的币
      tx.gas,   // arg4: SUI币（用于支付交易费）
      tx.pure.u64(666),  // arg5: 分配总金额
      tx.pure.u64(startTimestamp),     // arg6: 开始时间
      tx.pure.u64(startTimestamp),     // arg7: 解锁时间
      tx.pure.u64(startTimestamp),     // arg8: 结束时间
      tx.pure.address(account.address), // arg20: 接收方地址
      // tx.object(tx.txContext), // arg22: TxContext
      ],
      typeArguments: ["0x2::sui::SUI"],
    })

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: async ({ digest }) => {
          toast({
            title: "Transaction Successful",
            description: "Your vesting contract has been created successfully.",
            variant: "default",
          })

          const { effects } = await suiClient.waitForTransaction({
            digest: digest,
            options: {
              showEffects: true,
            },
          })
          console.log("effects", effects)
          router.push("/dashboard")
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

  // 计算结束日期
  const endDate = calculateEndDate(formData.startDate, formData.vestingDuration)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">STEP 3</div>
          <h1 className="text-2xl font-semibold text-foreground">Review</h1>
        </div>

        {/* Contract Summary */}
        <Card className="space-y-6 p-6">
          <div>
            <h2 className="mb-4 text-lg font-medium">Contract Summary</h2>
            <dl className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <dt>Token:</dt>
                <dd className="flex items-center gap-2">
                  <span>{formData.token.split("::").pop()}</span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>To be Vested:</dt>
                <dd>{recipients.totalVested}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Remaining Balance:</dt>
                <dd>{recipients.remainingBalance}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Recipients:</dt>
                <dd>{recipients.recipients.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Duration:</dt>
                <dd>
                  {formData.vestingDuration.value}{" "}
                  {formData.vestingDuration.unit}(s)
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Unlock Schedule:</dt>
                <dd>{formData.unlockSchedule}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Start Date:</dt>
                <dd>{formData.startDate.toLocaleDateString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt>End Date:</dt>
                <dd>{endDate.toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-medium">Recipients</h2>
            <div className="space-y-4">
              {recipients.recipients.map((recipient, index) => (
                <div key={index} className="rounded-lg border p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span>{recipient.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Wallet Address
                      </span>
                      <span className="text-sm">{recipient.walletAddress}</span>
                    </div>
                    {recipient.contractTitle && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Contract Title
                        </span>
                        <span>{recipient.contractTitle}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.back()}
          >
            Previous Step
          </Button>
          <Button className="w-full" size="lg" onClick={handleCreateContract}>
            Create Contract
          </Button>
        </div>
      </div>
    </div>
  )
}
