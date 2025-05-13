"use client"

import { useRouter } from "next/navigation"
import TokenTransactionsComponent from "./TokenTransactions/index"

interface TokenTransactionsProps {
  tokenAddress: string
  chain: string
  darkMode: boolean
}

export default function TokenTransactions({ 
  tokenAddress, 
  chain,
  darkMode 
}: TokenTransactionsProps) {
  return (
    <TokenTransactionsComponent 
      tokenAddress={tokenAddress}
      chain={chain}
      darkMode={darkMode}
    />
  );
} 