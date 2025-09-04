"use client"

import { ConnectButton } from "@mysten/dapp-kit"

export function WalletConnectButton() {
  return (
    <div className="App">
      <header className="App-header">
        <ConnectButton />
      </header>
    </div>
  )
}
