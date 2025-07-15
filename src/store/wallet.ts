"use client";

import { create } from "zustand";
import type { Chain } from "@/constants/chains";
import { createJSONStorage, persist } from "zustand/middleware";

type State = {
  address: string;
  provider: any;
  chain: any;
  lastChain: object;
  isConnected: boolean;
};

type Actions = {
  setProvider: (provider: any) => void;
  setAddress: (address: string) => void;
  setChain: (chain: object | { id?: number }) => void;
  setLastChain: (chain: object | { id?: number }) => void;
  setIsConnected: (isConnected: boolean) => void;
  disconnect: () => void;
};

const initialState: State = {
  address: "",
  chain: {},
  lastChain: {},
  provider: null,
  isConnected: false,
};

export const useWalletStore = create<State & Actions>()(
  persist<State & Actions>(
    (set) => ({
      ...initialState,
      setAddress: (address: string) => set({ address }),
      setChain: (chain: object) => set({ chain }),
      setLastChain: (chain: object) => set({ lastChain: chain }),
      setProvider: (provider: any) => set({ provider }),
      setIsConnected: (isConnected: boolean) => set({ isConnected }),
      disconnect: () => {
        set({ ...initialState, provider: null });
        sessionStorage.clear();
      },
    }),
    {
      name: "start-web3-wallet-storage",
      storage: createJSONStorage(() => sessionStorage, {
        reviver: (key, value) => {
          // 处理 Chain 类型的反序列化
          if (key === "chain" && typeof value === "object") {
            return value as Chain;
          }
          return value;
        },
        replacer: (key, value) => {
          if (value instanceof Date) {
            return { type: "date", value: value.toISOString() };
          }
          if (key === "provider") {
            return undefined;
          }
          return value;
        },
      }),
    }
  ) as any
);

export const useWalletAddress = () => useWalletStore((state) => state.address);
export const useWalletState = () => useWalletStore((state) => state);
