// Chain constants
import {
  mainnet,
  tron,
  bsc,
  avalanche,
  base,
  fantom,
  metis,
  optimism,
  polygon,
  flowTestnet,
  monadTestnet,
  hederaTestnet,
  zetachainAthensTestnet,
  bscTestnet,
} from "viem/chains";

export interface Chain {
  id: number; // chian id
  name: string; // 名称
  type: string; // account type(登录使用)
  brief: string; // 简称（chainType)
  symbol: string; // 主链币
  rpcUrls: string; // rpc
  decimals: number; // 精度
  hashPrefix: string; // 交易哈希前缀
  logoUrl: string; // logo
}

export const CHAIN: Record<string, Chain> = {
  BTC: {
    id: 0,
    name: "BTC",
    type: "btc",
    brief: "btc",
    symbol: "BTC",
    rpcUrls: "",
    decimals: 8,
    hashPrefix: "",
    logoUrl: "https://static.coinall.ltd/cdn/wallet/logo/BTC.png",
  },
  ETH: {
    id: 1,
    name: mainnet.name,
    type: "evm",
    brief: "eth",
    symbol: mainnet.nativeCurrency.symbol,
    rpcUrls: mainnet.rpcUrls.default.http[0],
    decimals: mainnet.nativeCurrency.decimals,
    hashPrefix: mainnet.blockExplorers.default.url + "/tx/",
    logoUrl: "https://static.coinall.ltd/cdn/wallet/logo/ETH-20220328.png",
  },
  BNB: {
    id: bsc.id,
    name: bsc.name,
    type: "evm",
    brief: "bnb",
    symbol: bsc.nativeCurrency.name,
    rpcUrls: bsc.rpcUrls.default.http[0],
    decimals: bsc.nativeCurrency.decimals,
    hashPrefix: bsc.blockExplorers.default.url + "/tx/",
    logoUrl: "https://static.coinall.ltd/cdn/wallet/logo/BNB-20220308.png",
  },
  AVAX: {
    id: avalanche.id,
    type: "avax",
    brief: "avax",
    name: avalanche.name,
    symbol: avalanche.nativeCurrency.symbol,
    rpcUrls: avalanche.rpcUrls.default.http[0],
    decimals: avalanche.nativeCurrency.decimals,
    hashPrefix: avalanche.blockExplorers.default.url + "/tx/",
    logoUrl: "https://static.coinall.ltd/cdn/wallet/logo/AVAX.png",
  },
  FANTOM: {
    id: fantom.id,
    type: "fantom",
    brief: "fantom",
    name: fantom.name,
    symbol: fantom.nativeCurrency.symbol,
    rpcUrls: fantom.rpcUrls.default.http[0],
    decimals: fantom.nativeCurrency.decimals,
    hashPrefix: fantom.blockExplorers.default.url + "/tx/",
    logoUrl: "https://static.coinall.ltd/cdn/wallet/logo/FTM-20220328.png",
  },
  METIS: {
    id: metis.id,
    type: "evm",
    brief: "metis",
    name: metis.name,
    symbol: metis.nativeCurrency.symbol,
    rpcUrls: metis.rpcUrls.default.http[0],
    decimals: metis.nativeCurrency.decimals,
    hashPrefix: metis.blockExplorers.default.url + "/tx/",
    logoUrl: "https://static.coinall.ltd/cdn/wallet/logo/metis.png",
  },
  OP: {
    id: optimism.id,
    type: "op",
    brief: "op",
    name: optimism.name,
    symbol: optimism.nativeCurrency.symbol,
    rpcUrls: optimism.rpcUrls.default.http[0],
    decimals: optimism.nativeCurrency.decimals,
    hashPrefix: optimism.blockExplorers.default.url + "/tx/",
    logoUrl: "https://static.coinall.ltd/cdn/wallet/logo/op_10000.png",
  },
  BASE: {
    id: base.id,
    type: "evm",
    brief: "base",
    name: base.name,
    symbol: base.nativeCurrency.symbol,
    rpcUrls: base.rpcUrls.default.http[0],
    decimals: base.nativeCurrency.decimals,
    hashPrefix: base.blockExplorers.default.url + "/tx/",
    logoUrl: "https://static.coinall.ltd/cdn/wallet/logo/base_20900.png",
  },
  TRON: {
    id: tron.id,
    name: tron.name,
    type: "tron",
    brief: "tron",
    symbol: tron.nativeCurrency.name,
    rpcUrls: tron.rpcUrls.default.http[0],
    decimals: tron.nativeCurrency.decimals,
    hashPrefix: tron.blockExplorers.default.url + "/#/transaction/",
    logoUrl: "https://static.coinall.ltd/cdn/wallet/logo/TRX.png",
  },
  SOLANA: {
    id: 501,
    type: "sol",
    brief: "solana",
    name: "Solana",
    symbol: "SOL",
    rpcUrls:
      "https://solana-mainnet.g.alchemy.com/v2/lIbo_PuXzTqCmQkRonEEDAsVIOSM3jAY",
    decimals: 9,
    hashPrefix: "https://solscan.io/tx/",
    logoUrl: "https://static.coinall.ltd/cdn/wallet/logo/SOL-20220525.png",
  },
  SONIC_SVM: {
    id: 502,
    type: "sol",
    brief: "sonic_svm",
    name: "Sonic",
    symbol: "SONIC",
    rpcUrls: "https://rpc.mainnet-alpha.sonic.game",
    decimals: 9,
    hashPrefix: "https://explorer.sonic.game/tx/",
    logoUrl:
      "https://cdn.prod.website-files.com/66459509d57ff3db9f95c06f/6645d2bdc859da0930a2f613_fav-32.png",
  },
  SONIC_SVM_TESTNET: {
    id: 503,
    type: "sol",
    brief: "sonic_svm_testnet",
    name: "Sonic Testnet",
    symbol: "SONIC",
    rpcUrls: "https://api.testnet.sonic.game",
    decimals: 9,
    hashPrefix: "https://explorer.sonic.game/tx/",
    logoUrl:
      "https://cdn.prod.website-files.com/66459509d57ff3db9f95c06f/6645d2bdc859da0930a2f613_fav-32.png",
  },
  SUI: {
    id: 784,
    type: "sui",
    brief: "sui",
    name: "Sui",
    symbol: "SUI",
    rpcUrls: "https://sui-rpc.publicnode.com",
    decimals: 9,
    hashPrefix: "https://suivision.xyz/txblock/",
    logoUrl: "https://static.coinall.ltd/cdn/wallet/logo/sui_17700.png",
  },
  POLYGON: {
    id: polygon.id,
    type: "evm",
    brief: "polygon",
    name: polygon.name,
    symbol: polygon.nativeCurrency.symbol,
    rpcUrls: polygon.rpcUrls.default.http[0],
    decimals: polygon.nativeCurrency.decimals,
    hashPrefix: polygon.blockExplorers.default.url + "/tx/",
    logoUrl:
      "https://cdn.prod.website-files.com/637359c81e22b715cec245ad/66273ffe068c26509a5a7c7c_Frame%20514542.png",
  },
  MONAD_TESTNET: {
    id: monadTestnet.id,
    type: "evm",
    brief: "monad_testnet",
    name: monadTestnet.name,
    symbol: monadTestnet.nativeCurrency.symbol,
    rpcUrls: monadTestnet.rpcUrls.default.http[0],
    decimals: monadTestnet.nativeCurrency.decimals,
    hashPrefix: monadTestnet.blockExplorers.default.url + "/tx/",
    logoUrl:
      "https://cdn.prod.website-files.com/667c57e6f9254a4b6d914440/667f1590ccceec3eee19ec7c_Favicon.png",
  },
  BSC_TESTNET: {
    id: bscTestnet.id,
    name: bscTestnet.name,
    type: "evm",
    brief: "bsc_testnet",
    symbol: bscTestnet.nativeCurrency.name,
    rpcUrls: bscTestnet.rpcUrls.default.http[0],
    decimals: bscTestnet.nativeCurrency.decimals,
    hashPrefix: bscTestnet.blockExplorers.default.url + "/tx/",
    logoUrl: "https://static.coinall.ltd/cdn/wallet/logo/BNB-20220308.png",
  },
};

export const CHAIN_LIST: Chain[] = Object.values(CHAIN);

// 根据chainId获取chainBrief
export function getChainBriefById(chainId: number): string {
  const chain = CHAIN_LIST.find((chain) => chain.id === chainId);
  return chain?.brief || "";
}

//  根据 chain brief 获取 viem 链类型
export const VIEM_CHAIN_TYPE = {
  eth: mainnet,
  bnb: {
    ...bsc,
    rpcUrls: {
      default: {
        http: ["https://bsc-rpc.publicnode.com"],
      },
    },
  },
  metis: {
    ...metis,
    rpcUrls: {
      default: {
        http: ["https://metis-pokt.nodies.app"],
      },
    },
  },
  base: base,
  monad_testnet: monadTestnet,
  polygon: polygon,
  flow_testnet: flowTestnet,
  hedera_testnet: hederaTestnet,
  zeta_testnet: zetachainAthensTestnet,
  bsc_testnet: bscTestnet,
};
