'use client'

import { useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useBalance, useWriteContract, useWatchContractEvent, useAccount, useReadContract } from 'wagmi'
import { parseEther, formatUnits, type Address } from 'viem'
import { CONTRACT_ADDRESS, abi } from './contractConfig'

export default function Home() {
  const [guess, setGuess] = useState('')
  const [won, setWon] = useState(false)
  const [wrong, setWrong] = useState(false)
  const [newSecret, setNewSecret] = useState('')

  const { address } = useAccount()

  const { data: balanceData } = useBalance({ address: CONTRACT_ADDRESS, query: { refetchInterval: 3000 } })
  const pot = balanceData ? formatUnits(balanceData.value, balanceData.decimals) : null

  // Read the owner address directly from the contract
  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'owner',
  })

  const isOwner = Boolean(address && owner && address.toLowerCase() === (owner as Address).toLowerCase())
  console.log('connected address:', address)
  console.log('contract owner:', owner)

  const { writeContract } = useWriteContract()

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi,
    eventName: 'CorrectGuess',
    onLogs: () => setWon(true),
  })

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi,
    eventName: 'WrongGuess',
    onLogs: () => {
      setWrong(true)
      setTimeout(() => setWrong(false), 3000)
    },
  })

  function handleGuess(e: React.SyntheticEvent) {
    e.preventDefault()
    setWrong(false)
    writeContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'guess',
      args: [BigInt(guess)],
      value: parseEther('0.001'),
    })
  }

  function handleSetNumber(e: React.SyntheticEvent) {
    e.preventDefault()
    writeContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'setNumber',
      args: [BigInt(newSecret)],
    })
    setNewSecret('')
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      <header className="flex justify-end px-8 py-6">
        <ConnectButton />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-10 px-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-5xl font-bold tracking-tight">Number Guess</h1>
          <p className="text-zinc-400 text-lg">Guess the secret number and win the pot</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-12 py-6 flex flex-col items-center gap-1">
          <span className="text-zinc-500 text-sm uppercase tracking-widest">Current Pot</span>
          <span className="text-4xl font-bold text-white">
            {pot !== null ? `${pot} ETH` : '—'}
          </span>
        </div>

        {!address ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-zinc-400">Connect your wallet to play</p>
            <ConnectButton />
          </div>
        ) : won ? (
          <div className="flex flex-col items-center gap-2">
            <span className="text-6xl">🎉</span>
            <p className="text-3xl font-bold text-emerald-400">Congrats! You got it!</p>
            <p className="text-zinc-400">The pot has been sent to your wallet.</p>
          </div>
        ) : (
          <form onSubmit={handleGuess} className="flex flex-col items-center gap-4 w-full max-w-xs">
            <input
              type="number"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Your guess"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-4 text-xl text-center text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-400 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="submit"
              className="w-full bg-white text-black rounded-xl py-4 text-lg font-semibold hover:bg-zinc-200 active:scale-95 transition-all"
            >
              Guess
            </button>
            {wrong && (
              <p className="text-red-400 text-sm">Wrong guess — try again.</p>
            )}
          </form>
        )}

        {isOwner && (
          <div className="w-full max-w-xs border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500 text-xs uppercase tracking-widest">Owner Panel</span>
              <span className="text-zinc-400 text-sm">Set a new secret number to start a round</span>
            </div>
            <form onSubmit={handleSetNumber} className="flex flex-col gap-3">
              <input
                type="number"
                value={newSecret}
                onChange={(e) => setNewSecret(e.target.value)}
                placeholder="New secret number"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-4 text-lg text-center text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-400 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="submit"
                className="w-full bg-zinc-700 text-white rounded-xl py-3 text-base font-semibold hover:bg-zinc-600 active:scale-95 transition-all"
              >
                Set Number
              </button>
            </form>
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-zinc-700 text-sm">
        Deployed on Sepolia
      </footer>
    </div>
  )
}
