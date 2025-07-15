import { CHAIN } from "@/constants/chains";
import isMobile from "@/lib/isMobile";

export interface ChainItem {
  id: number; // 链id
  type: string; // 链类型
  name: string; // 链名称
  logo: string; // 链logo
}

// 钱包类型
export type WalletType =
  | "rainbow"
  | "tronlink"
  | "okxWallet"
  | "phantom"
  | "metamask";

export const WalletType = {
  rainbow: "rainbow",
  tronlink: "tronlink",
  okxWallet: "okxWallet",
  phantom: "phantom",
  metamask: "metamask",
} as const;

export interface WalletItem {
  title: string; // 钱包名称
  type: WalletType; // 钱包类型
  logo: string; // 钱包logo
  url?: string; // 钱包下载地址
}

export const WalletLogo: Record<string, string> = {
  rainbow:
    "https://framerusercontent.com/images/Hml6PtJwt03gwFtTRYmbpo7EarY.png",
  okxWallet: "https://www.okx.com/cdn/assets/imgs/254/EF6F431DA7FFBCA5.ico",
  metamask: "https://metamask.io/favicons/default/favicon.svg",
  phantom: "https://phantom.com/favicon/favicon-32x32.png",
  tronlink:
    "https://docs.tronlink.org/~gitbook/image?url=https%3A%2F%2F1639117838-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FDolSJpJ5tqTIRP95VixZ%252Ficon%252FQKFuV95h0xxl1ii2YYYS%252Fabout_logo.png%3Falt%3Dmedia%26token%3D942d8e33-7fc9-4a69-b6a7-602cb105d8bf&width=32&dpr=1&quality=100&sign=580c28e2&sv=2",
};

export const walletListMobile: WalletItem[] = [
  {
    title: "OKX",
    type: WalletType.okxWallet,
    logo: WalletLogo.okxWallet,
  },
  {
    title: "MetaMask",
    type: WalletType.metamask,
    logo: WalletLogo.metamask,
  },
  {
    title: "Phantom",
    type: WalletType.phantom,
    logo: WalletLogo.phantom,
  },
  {
    title: "TronLink",
    type: WalletType.tronlink,
    logo: WalletLogo.tronlink,
  },
];

// 钱包列表
export const walletList: WalletItem[] = [
  {
    title: "Rainbow",
    type: WalletType.rainbow,
    logo: WalletLogo.rainbow,
  },
  {
    title: "Phantom",
    type: WalletType.phantom,
    logo: WalletLogo.phantom,
  },
  {
    title: "OKX Wallet",
    type: WalletType.okxWallet,
    logo: WalletLogo.okxWallet,
  },
  {
    title: "TronLink",
    type: WalletType.tronlink,
    logo: WalletLogo.tronlink,
  },
];

// EVM链列表
export const EVM_CHAIN_LIST = Object.values(CHAIN)
  .filter((chain) => chain.type === "evm")
  .map((chain) => ({
    id: chain.id,
    type: chain.brief,
    name: chain.name,
    logo: chain.logoUrl,
  }));

// 手机端 okx 支持的链
const MOBIL_OKX_CHAIN_LIST = EVM_CHAIN_LIST.filter(
  (chain) =>
    chain.id !== CHAIN.BSC_TESTNET?.id &&
    chain.id !== CHAIN.BNB?.id &&
    chain.id !== CHAIN.EDU_CHAIN?.id
);

// 钱包支持的链
export const supportChainList: Record<WalletType, ChainItem[]> = {
  [WalletType.rainbow]: EVM_CHAIN_LIST,
  [WalletType.metamask]: EVM_CHAIN_LIST,
  [WalletType.tronlink]: [
    {
      id: CHAIN.TRON.id,
      type: CHAIN.TRON.brief,
      name: CHAIN.TRON.name,
      logo: CHAIN.TRON.logoUrl,
    },
  ],
  [WalletType.okxWallet]: isMobile()
    ? MOBIL_OKX_CHAIN_LIST
    : [
        {
          id: CHAIN.SOLANA.id,
          type: CHAIN.SOLANA.brief,
          name: CHAIN.SOLANA.name,
          logo: CHAIN.SOLANA.logoUrl,
        },
        import.meta.env.MODE === "development"
          ? {
              id: CHAIN.SONIC_SVM_TESTNET.id,
              type: CHAIN.SONIC_SVM_TESTNET.brief,
              name: CHAIN.SONIC_SVM_TESTNET.name,
              logo: CHAIN.SONIC_SVM_TESTNET.logoUrl,
            }
          : {
              id: CHAIN.SONIC_SVM.id,
              type: CHAIN.SONIC_SVM.brief,
              name: CHAIN.SONIC_SVM.name,
              logo: CHAIN.SONIC_SVM.logoUrl,
            },
      ],
  [WalletType.phantom]: [
    {
      id: CHAIN.SOLANA.id,
      type: CHAIN.SOLANA.brief,
      name: CHAIN.SOLANA.name,
      logo: CHAIN.SOLANA.logoUrl,
    },
  ],
};
