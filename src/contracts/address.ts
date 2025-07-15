import Erc20Abi from "./abi/Erc20Token.json";
import EvmVoteAbi from "./abi/EvmVote.json";

// 正式合约：false、 测试合约：true
export const isDev = import.meta.env.VITE__NODE_ENV === "development";

export let contractObj: Record<string, string>;

if (isDev) {
  // 测试
  contractObj = {
    TRX_ZERO_ADDR: "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb", // trx zero address 判断TRX用，没有实际意义
    TRON_USDT_ADDR: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", // usdt 正式 (6 decimals)
    SUNDOG_ADDR: "TXL6rJbvmjD46zeN1JssfgxvSo99qC8MRT", // sundog 正式 (18 decimals)
    BASE_USDT_ADDR: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // base usdc 正式 (6 decimals)
    METIS_VOTE_ADDR: "0x92952209C1851A6990ADb67C12C23AC46095819f", // METIS 合约地址 （18 decimals）
    SOLANA_USDT_ADDR: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // solana usdt 正式 (6 decimals)
    SOLANA_USDC_ADDR: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // solana usdt 正式 (6 decimals)
    TRON_VOTE_ADDR: "TYcY9sm7ZV1UPFAGQBpUETWmvpquEkA7bH", // tron vote
    TRON_VAULT_ADDR: "TFVqhLhntccpVpVjfBGk4Hif6WwH1ArFgo", // tron vault
    BASE_VAULT_ADDR: "0x10e4F6f72dCe5478af42af77465e75AcA5f6fd88", // base vault
    SOLANA_VOTE_ADDR: "6hzSe1RkRTfHYLNM1GbwKSygdgaaSs6o3impt2GB8rjv", // solana vote
    SUI_VOTE_ADDR:
      "0x659317252b6288d76d32169b3121262c2bfa1b4aa2286da3ce2f655ee0d9af1c", // sui vote
    MOE_ADDR: "8xzoj8mVmXtBQm6d2euJGFPvQ2QsTV5R8cdexi2qpump", // moe
    HIPPO_ADDR:
      "0x8993129d72e733985f7f1a00396cbd055bad6f817fee36576ce483c8bbb8b87b::sudeng::SUDENG", // hippo
    BSC_USDT_ADDR: "0x163aC8C09D41a6Dc90EbF95dCb767D9aDb469f7e", // bsc usdt (18 decimals)
  };
} else {
  // 正式
  contractObj = {
    TRX_ZERO_ADDR: "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb", // trx zero address
    TRON_USDT_ADDR: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", // usdt 正式 (6 decimals)
    SUNDOG_ADDR: "TXL6rJbvmjD46zeN1JssfgxvSo99qC8MRT", // sundog 正式 (18 decimals)
    MOE_ADDR: "8xzoj8mVmXtBQm6d2euJGFPvQ2QsTV5R8cdexi2qpump", // moe
    BASE_USDT_ADDR: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // base usdc 正式 (6 decimals)
    METIS_VOTE_ADDR: "0x92952209C1851A6990ADb67C12C23AC46095819f", // METIS 合约地址 （18 decimals）
    SOLANA_USDT_ADDR: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // solana usdt 正式 (6 decimals)
    SOLANA_USDC_ADDR: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // solana usdt 正式 (6 decimals)
    TRON_VOTE_ADDR: "TGgnvYoYbWVeyaPGgaKUEGAbsj3LTnE8UB", // tron vote
    TRON_VAULT_ADDR: "THRdCmQJG3xAuzXL1L5eRzoXNFuNEjBimF", // tron vault
    BASE_VAULT_ADDR: "0xe7b4a8825aa737c24c392b8c10e455f776781991", // base vault
    SOLANA_VOTE_ADDR: "CiguB6rADxSkaZ32oz3Do3EpeLwYY6Xe5f4dxuqg8V17", // solana vote
    SUI_VOTE_ADDR:
      "0x6900942773ee3ef1acd2c4fab4a539b9372f0c94ae6c4dd1f8b054c900903627", // sui vote
    HIPPO_ADDR:
      "0x8993129d72e733985f7f1a00396cbd055bad6f817fee36576ce483c8bbb8b87b::sudeng::SUDENG", // hippo
    BSC_USDT_ADDR: "0x55d398326f99059fF775485246999027B3197955", // bsc usdt (6 decimals)
  };
}

export const {
  TRX_ZERO_ADDR,
  TRON_USDT_ADDR,
  MOE_ADDR,
  HIPPO_ADDR,
  SUNDOG_ADDR,
  BASE_USDT_ADDR,
  METIS_VOTE_ADDR,
  SOLANA_USDT_ADDR,
  SOLANA_USDC_ADDR,
  TRON_VOTE_ADDR,
  TRON_VAULT_ADDR,
  SUI_VOTE_ADDR,
  BASE_VAULT_ADDR,
  SOLANA_VOTE_ADDR,
  BSC_USDT_ADDR,
} = contractObj;

interface Contract {
  address: string;
  abi: any;
}

export const METIS_VOTE_CONTRACT: Contract = {
  address: METIS_VOTE_ADDR,
  abi: EvmVoteAbi,
};

export const ERC20_CONTRACT: Contract = {
  address: "0xdac17f958d2ee523a2206206994597c13d831ec7", // Eth USDT (6 decimals)
  abi: Erc20Abi,
};

export const SOLANA_USDC_CONTRACT: Contract = {
  address: SOLANA_USDC_ADDR,
  abi: Erc20Abi,
};
