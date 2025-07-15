"use client";

import type { Chain } from "@/constants/chains";
import { create } from "zustand";
import { createJSONStorage } from "zustand/middleware";
import { persist } from "zustand/middleware";

type State = {
  id: string;
  username: string;
  avatarUrl: string;
  backgroundUrl: string;
  accounts: UserAccount[] | [];
  walletType: string;
  bearerToken: string;
};

type Actions = {
  setUserInfo: (userInfo: UserInfo) => void;
  resetUser: () => void;
  setWalletType: (walletType: string) => void;
  setBearerToken: (bearerToken: string) => void;
};

interface UserAccount {
  accountId: string;
  accountType: string;
  accountInfo: string;
  userId: string;
  createdAt: string;
}

interface UserInfo {
  id: string;
  username: string;
  avatarUrl: string;
  backgroundUrl: string;
  invitationCode: string;
}

const initialState: State = {
  id: "",
  username: "",
  avatarUrl: "",
  backgroundUrl: "",
  accounts: [],
  bearerToken: "",
  walletType: "okxWallet",
};

// 用户状态管理
export const useUserStore = create<State & Actions>()(
  persist<State & Actions>(
    (set) => ({
      ...initialState,
      setUserInfo: (userInfo: UserInfo) => {
        set({ ...userInfo });
      },
      setAccounts: (accounts: UserAccount[]) => {
        set({ accounts });
      },
      setWalletType: (walletType: string) => {
        set({ walletType });
      },
      setBearerToken: (bearerToken: string) => {
        set({ bearerToken });
      },
      resetUser: () => {
        set(initialState);
        sessionStorage.clear();
      },
    }),
    {
      name: "start-web3-user-storage",
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

export const useUserInfoState = () => useUserStore((state) => state);
