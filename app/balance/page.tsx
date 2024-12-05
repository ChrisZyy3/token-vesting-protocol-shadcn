"use client"

import { useEffect, useState } from "react"
import {
  CategorizedObjects,
  calculateTotalBalance,
  formatBalance,
} from "@/utils/assetsHelpers"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { getUserProfile } from "../../lib/contracts"

export default function Home() {
  const account = useCurrentAccount()
  const [userObjects, setUserObjects] = useState<CategorizedObjects | null>(null)

  useEffect(() => {
    async function fetchUserProfile() {
      if (account?.address) {
        try {
          const profile = await getUserProfile(account.address)
          console.log('profile', profile);
          setUserObjects(profile)
        } catch (error) {
          console.error("Error fetching user profile:", error)
        }
      }
    }

    fetchUserProfile()
  }, [account])

  return (
    <div className="flex min-h-screen flex-col">
      {userObjects != null ? (
        <main className="flex grow flex-col items-center p-8">
          {userObjects && (
            <div className="w-full max-w-6xl">
              <h2 className="mb-4 text-2xl font-bold text-foreground">Your Assets</h2>

              <div className="flex gap-8">
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-semibold text-foreground">Coins</h3>
                  {Object.entries(userObjects.coins).map(([coinType, coins]) => {
                    const totalBalance = calculateTotalBalance(coins)
                    return (
                      <div
                        key={coinType}
                        className="mb-4 rounded-lg bg-card p-4 shadow-md transition-shadow hover:shadow-lg"
                      >
                        <h4 className="text-lg font-medium text-card-foreground">
                          {coinType.split("::").pop()}
                        </h4>
                        <p className="text-muted-foreground">Count: {coins.length}</p>
                        <p className="text-muted-foreground">
                          Total Balance: {formatBalance(totalBalance)}
                        </p>
                      </div>
                    )
                  })}
                </div>

                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-semibold text-foreground">
                    Other Objects
                  </h3>
                  <div className="h-[500px] overflow-y-auto pr-4">
                    {Object.entries(userObjects.objects).map(
                      ([objectType, objects]) => (
                        <div
                          key={objectType}
                          className="mb-4 rounded-lg bg-card p-4 shadow-md transition-shadow hover:shadow-lg"
                        >
                          <h4 className="text-lg font-medium text-card-foreground">
                            {objectType.split("::").pop()}
                          </h4>
                          <p className="text-muted-foreground">
                            Count: {objects.length}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {objectType.split("::").pop()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {objectType.split("::")[0]}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      ) : (
        <div className="flex grow flex-col items-center p-8">
          {/* <h1 className="mb-8 text-4xl font-bold text-foreground">
            Welcome to Nextjs Sui Dapp Template
          </h1> */}
          <h3 className="mb-8 text-2xl font-bold text-muted-foreground">
            Please connect your wallet to view your assets
          </h3>
        </div>
      )}

    </div>
  )
}
