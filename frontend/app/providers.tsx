'use client'

import '@rainbow-me/rainbowkit/styles.css'
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { sepolia, hardhat } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

const config = getDefaultConfig({
  appName: 'Number Guessing Game',
  projectId: '91d3e3d0f1370638930132669cdbe397',
  chains: [sepolia, hardhat],
  ssr: false,
})

export default function Providers({ children }: { children: React.ReactNode }) {
  // QueryClient must be in state — creating it at module level causes SSR hydration issues
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
