import { create } from "zustand";
import { CHAIN } from "@/constants/chains";
import { formatUnits } from "viem";
import { getSolBalance } from "@/lib/okxSolana";
import { getTrxBalance } from "@/lib/okxTron";
import { getEvmBalance } from "@/lib/okxEvm";
import { isEvmChain } from "@/lib/tools";
export interface Balance {
  origin: bigint;
  value: string;
}

interface BalanceState {
  balance: Balance;
  isLoading: boolean;
  fetchBalance: (chain: any, address: string) => Promise<void>;
  reloadBalancee: (chain: any, address: string) => Promise<void>;
}

export const useBalanceStore = create<BalanceState>((set) => ({
  balance: {
    origin: BigInt(0),
    value: "0",
  },
  isLoading: false,
  fetchBalance: async (chain: any, address: string) => {
    if (!chain?.brief || !address) {
      set({
        balance: {
          origin: BigInt(0),
          value: "0",
        },
      });
      return;
    }

    await fetchBalanceLogic(set, chain, address);
  },
  reloadBalancee: async (chain: any, address: string) => {
    if (!chain?.brief || !address) {
      set({
        balance: {
          origin: BigInt(0),
          value: "0",
        },
      });
      return;
    }
    console.log(67, chain, address);

    await fetchBalanceLogic(set, chain, address);
  },
}));

// 抽取共用的余额获取逻辑
const fetchBalanceLogic = async (set: any, chain: any, address: string) => {
  set({ isLoading: true });
  console.log("Fetching balance for chain:", chain.brief, "address:", address);

  try {
    let balance: any = null;

    // EVM链的统一处理
    if (isEvmChain(chain.brief)) {
      balance = await getEvmBalance(chain.brief, address);
      set({
        balance: {
          origin: balance,
          value: formatUnits(balance, chain.decimals),
        },
      });
      return;
    }

    // 非EVM链的处理
    switch (chain.brief) {
      case CHAIN.SOLANA.brief:
      case CHAIN.SONIC_SVM.brief:
      case CHAIN.SONIC_SVM_TESTNET.brief:
        balance = await getSolBalance(address);
        break;
      case CHAIN.TRON.brief:
        balance = await getTrxBalance(address);
        break;
      default:
        throw new Error(`Unsupported chain: ${chain.brief}`);
    }
    console.log("balance--------", chain, address, balance);

    set({
      balance: {
        origin: balance,
        value: formatUnits(balance, chain.decimals),
      },
    });
  } catch (err) {
    set({
      balance: {
        origin: BigInt(0),
        value: "0",
      },
    });
    console.error(`Error fetching ${chain.brief} balance:`, err);
  } finally {
    set({ isLoading: false });
  }
};
