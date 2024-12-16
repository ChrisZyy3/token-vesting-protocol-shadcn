'use client';

import { useEffect } from 'react';
import { useRouter } from "next/navigation"
import { useCreateForm } from "@/contexts/CreateFormContext"
import { addMonths, addYears } from "date-fns"

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Transaction } from '@mysten/sui/transactions';
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { packageId } from '@/config';
import { SuiClient } from '@mysten/sui/client';
import { useCurrentAccount } from "@mysten/dapp-kit"


function calculateEndDate(startDate: Date, duration: { value: string; unit: "month" | "year" }) {
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
  const suiClient = useSuiClient();
  const account = useCurrentAccount(); // 添加这行

  const {
    mutate: signAndExecute,
    isSuccess,
    isPending,
  } = useSignAndExecuteTransaction();


  useEffect(() => {
    if (!formData || !recipients) {
      router.push("/create")
    }
  }, [formData, recipients, router])

  if (!formData || !recipients) {
    return null
  }

  const handleCreateContract = () => {
    console.log('Contract Details:', {
      formData,
      recipients,
      recipientCount: recipients.recipients.length,
      totalAmount: recipients.totalVested,
      remainingBalance: recipients.remainingBalance
    })
    // const [coin1] = tx.splitCoins(tx.gas, [1000]);
    // 将第一个代币转移到地址 1
    // tx.transferObjects([coin1], '0x0aaaaa28558f2c65c2ec0844e775fa7e8f4d2a376780ef1dc150dc5b7c44cf82');
    // signAndExecute({ transaction: tx },
    //   {
    //     onSuccess: async ({ digest }) => {
    //       console.log('digest', digest);
    //     }
    //   });
    create()
  }

  const create = () => {
    if (!account?.address) return; // 添加检查

    const tx = new Transaction();

    // 准备 recipients 数组参数
    const recipientAddresses = recipients?.recipients.map(r => r.walletAddress);
    const recipientAmounts = recipients?.recipients.map(r => r.amount);

    // 计算 unlock schedule 对应的数值
    const unlockScheduleMap = {
      "weekly": BigInt(7 * 24 * 60 * 60), // 7 days in seconds
      "bi-weekly": BigInt(14 * 24 * 60 * 60),
      "monthly": BigInt(30 * 24 * 60 * 60),
      "quarterly": BigInt(90 * 24 * 60 * 60)
    };
    const unlockInterval = unlockScheduleMap[formData?.unlockSchedule || "weekly"];

    // 计算 duration (转换为秒)
    const durationInSeconds = BigInt(
      formData.vestingDuration.unit === "month"
        ? parseInt(formData.vestingDuration.value) * 30 * 24 * 60 * 60
        : parseInt(formData.vestingDuration.value) * 365 * 24 * 60 * 60
    );

    // 转换开始时间为 Unix timestamp
    const startTimestamp = BigInt(Math.floor(formData.startDate.getTime() / 1000));
    const [coin1] = tx.splitCoins(tx.gas, [10000]);
    console.log('coin1', coin1);
    console.log('account.address', account.address);

    const args = [
      tx.object('0xa0b1ae1097dced45ff5a01277f4de2eb21be7b7c08366683aae90078799d5b7f'), // admin config
      tx.object('0x664a0d0d39a8ecfb35cdca332a5c462f12f462fd5d1898665afdb418b825b80e'), // fee table
      tx.object.clock(), // Clock
      tx.object(coin1), // coin: Coin<T>
      tx.gas, // SUI
      tx.pure.u64(1000), // 总金额
      tx.pure.u64(3600), // 周期
      tx.pure.u64(15000000), //每个周期的金额
      tx.pure.u64(1734360300), // 开始时间
      tx.pure.u64(0), // 悬崖
      tx.pure.bool(false), // arg10: 是否可以由发送者取消
      tx.pure.bool(false), // arg11: 是否可以由接收者取消
      tx.pure.bool(false), // arg12: 是否可以由发送者转移
      tx.pure.bool(false), // arg13: 是否可以由接收者转移
      tx.pure.bool(false), // arg14: 是否可以充值
      tx.pure.bool(false), // arg15: 是否可以暂停
      tx.pure.bool(false), // arg16: 是否可以更新费率
      tx.pure.bool(false), // arg17: 是否自动提款
      tx.pure.u64(0), // arg18: 提款频率
      tx.makeMoveVec({ type: 'u8', elements: recipientAddresses }),
      tx.object('0x19414683da3789f30477281c76a9eabf968539bd36007d39b228335d65299fb4'),
      tx.pure.address(account.address),
    ];

    console.log('Transaction Arguments:', {
      adminConfig: args[0],
      feeTable: args[1],
      clock: args[2],
      coin: args[3],
      gas: args[4],
      totalAmount: args[5],
      period: args[6],
      amountPerPeriod: args[7],
      startTime: args[8],
      cliff: args[9],
      senderCancel: args[10],
      recipientCancel: args[11],
      senderTransfer: args[12],
      recipientTransfer: args[13],
      canTopup: args[14],
      canPause: args[15],
      canUpdateRate: args[16],
      autoWithdraw: args[17],
      withdrawFrequency: args[18],
      recipients: args[19],
      partner: args[20],
      sender: args[21],
    });

    tx.moveCall({
      target: `${packageId}::protocol::create`,
      arguments: args,
    });

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: async ({ digest }) => {
          const { effects } = await suiClient.waitForTransaction({
            digest: digest,
            options: {
              showEffects: true,
            },
          });
          console.log('effects', effects);
          // 成功后可以跳转到 dashboard 页面
          router.push('/dashboard');
        },
        onError: (error) => {
          console.error('Error:', error);
        },
      },
    );
  }


  // 计算结束日期
  const endDate = calculateEndDate(formData.startDate, formData.vestingDuration);

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
                <dd>{formData.vestingDuration.value} {formData.vestingDuration.unit}(s)</dd>
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
                      <span className="text-muted-foreground">Wallet Address</span>
                      <span className="text-sm">{recipient.walletAddress}</span>
                    </div>
                    {recipient.contractTitle && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Contract Title</span>
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
          <Button
            className="w-full"
            size="lg"
            onClick={handleCreateContract}
          >
            Create Contract
          </Button>
        </div>
      </div>
    </div>
  )
}

