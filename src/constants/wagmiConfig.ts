import {
  metis,
  base,
  bscTestnet,
  bsc,
  mainnet,
  polygon,
  monadTestnet,
  flowTestnet,
  hederaTestnet,
} from "wagmi/chains";
import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { createConfig, http, createStorage, cookieStorage } from "wagmi";
import { metaMask, coinbaseWallet } from "wagmi/connectors";

const appName = "start-web3";
const projectId = import.meta.env.VITE__WAGMI_PROJECT_ID || "";

const { connectors } = getDefaultWallets({ appName, projectId });

export const config = createConfig({
  chains: [
    bsc,
    mainnet,
    metis,
    base,
    monadTestnet,
    polygon,
    flowTestnet,
    hederaTestnet,
    bscTestnet,
  ],
  connectors: [...connectors, coinbaseWallet()],
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [bsc.id]: http("https://bsc-rpc.publicnode.com"),
    [mainnet.id]: http(),
    [metis.id]: http(),
    [base.id]: http(),
    [monadTestnet.id]: http(),
    [polygon.id]: http(),
    [flowTestnet.id]: http(),
    [hederaTestnet.id]: http(),
    [bscTestnet.id]: http(),
  },
  // ssr: true, // If your dApp uses server side rendering (SSR)
  multiInjectedProviderDiscovery: true,
});

export const mobileConfig = createConfig({
  chains: [
    bsc,
    mainnet,
    metis,
    base,
    monadTestnet,
    polygon,
    flowTestnet,
    hederaTestnet,
    bscTestnet,
  ],
  connectors: [...connectors, metaMask(), coinbaseWallet()],
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [bsc.id]: http("https://bsc-rpc.publicnode.com"),
    [mainnet.id]: http(),
    [metis.id]: http(),
    [base.id]: http(),
    [monadTestnet.id]: http(),
    [polygon.id]: http(),
    [flowTestnet.id]: http(),
    [hederaTestnet.id]: http(),
    [bscTestnet.id]: http(),
  },
  ssr: true, // If your dApp uses server side rendering (SSR)
  multiInjectedProviderDiscovery: true,
});
