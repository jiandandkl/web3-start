"use client";
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";
import { useWalletStore } from "@/store/wallet";
import { useUserStore } from "@/store/user";
import { WalletType } from "@/components/types";

export interface AnchorWallet {
  publicKey: PublicKey;
  signTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T
  ): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(
    transactions: T[]
  ): Promise<T[]>;
}

export function useAnchorWallet(): AnchorWallet | undefined {
  const [provider, setProvider] = useState<any>(null);
  const walletType = useUserStore.getState().walletType;
  const address = useWalletStore.getState().address;
  const chain = useWalletStore.getState().chain;

  useEffect(() => {
    if (typeof window !== "undefined") {
      let solanaProvider = null;
      switch (walletType) {
        case WalletType.phantom:
          solanaProvider = window?.phantom?.solana;
          break;
        case WalletType.okxWallet:
          solanaProvider = window?.okxwallet?.solana;
          break;
        default:
          break;
      }
      setProvider(solanaProvider);
    }
  }, [walletType]);

  return useMemo(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!address || !provider || chain.type !== "sol") {
      return;
    }

    return {
      signTransaction: async <T extends Transaction | VersionedTransaction>(
        transaction: T
      ) => {
        const signedTransactions = await provider.signTransactions([
          transaction,
        ]);
        return signedTransactions[0];
      },
      signAllTransactions: async <T extends Transaction | VersionedTransaction>(
        transactions: T[]
      ) => {
        return await provider.signTransactions(transactions);
      },
      get publicKey() {
        try {
          return new PublicKey(address);
        } catch (error) {
          throw error;
        }
      },
    };
  }, [address, provider, chain]);
}
