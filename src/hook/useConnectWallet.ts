"use client";

import { useRef, useState } from "react";
import TronWeb from "tronweb";
import { CHAIN } from "@/constants/chains";
import { useWalletState, useWalletStore } from "@/store/wallet";
// import { useFetchUserInfo } from './useFetchUserInfo';
import { useUserStore } from "@/store/user";
import { injected, useConnect, useSwitchChain } from "wagmi";
import { signMessage } from "wagmi/actions";
import { config, mobileConfig } from "@/constants/wagmiConfig";
import { WalletType } from "@/components/types";
import { metaMask } from "wagmi/connectors";
import { isEvmChain } from "@/lib/tools";
import isMobile from "@/lib/isMobile";
// import { OKXUniversalConnectUI, THEME } from "@okxconnect/ui";
import { addToast } from "@heroui/react";

export const useConnectWallet = () => {
  const providerRef = useRef<any>(null);
  const addressRef = useRef<string>("");
  const [loading, setLoading] = useState(false);
  const [isOpenDownloadWallet, setIsOpenDownloadWallet] = useState(false);
  const { setProvider, setChain, setLastChain, setIsConnected, setAddress } =
    useWalletStore();
  const { provider, address, chain, lastChain } = useWalletState();
  // const { setBearerToken } = useUserStore();
  const walletType = useUserStore.getState().walletType;
  const tronWeb = new TronWeb({
    fullHost: "https://api.trongrid.io",
  });
  const { connectAsync } = useConnect();
  const { switchChain } = useSwitchChain();

  // todo 有点问题
  // 初始化 OKX Universal Provider
  // useEffect(() => {
  //   async function init() {
  //     const universalUi = await OKXUniversalConnectUI.init({
  //       dappMetaData: {
  //         icon: "https://static.okx.com/cdn/assets/imgs/247/58E63FEA47A2B7D7.png",
  //         name: "start-web3",
  //       },
  //       actionsConfiguration: {
  //         returnStrategy: "back",
  //         modals: "all",
  //         tmaReturnUrl: "back",
  //       },
  //       language: "en_US",
  //       uiPreferences: {
  //         theme: THEME.LIGHT,
  //       },
  //     });

  //     providerRef.current = universalUi;
  //     setProvider(universalUi);
  //   }

  //   if (!providerRef.current) {
  //     init();
  //   }
  // }, []);

  /**
   * 等待获取插件钱包
   * @returns
   */
  const getOkxWalletRef = async () => {
    function _waiting(): Promise<any> {
      const duration = 100;
      return new Promise<void>((resolve, reject) => {
        let count = 0;
        const timer = setInterval(() => {
          if (window?.okxwallet) {
            resolve();
            clearInterval(timer);
          }
          count++;
          // 2秒内还获取不到okx，则
          const sec = (2 * 1000) / duration;
          if (count > sec) {
            reject();
            clearInterval(timer);
          }
        }, duration);
      });
    }

    await _waiting().catch((err) => console.log(err));

    providerRef.current = window?.okxwallet;

    if (!provider) {
      setProvider(window?.okxwallet);
    }
  };

  /**
   * 连接钱包
   * @param chainType 钱包类型 sol、tron、sui、evm
   */
  const connectWallet = async (chainType: string = CHAIN.SOLANA.brief) => {
    if (isMobile()) {
      // const { signature, timestamp } = await connectMobileWalletWithOkx(
      //   chainType
      // );
      // 3. 拿到钱包的签名去后端登录
      await handleVerifySignMessageWithLogin();
    } else {
      // EVM链的统一处理
      if (isEvmChain(chainType)) {
        setLastChain(CHAIN[chainType.toUpperCase()]);
        await connectEvmWallet(chainType);
        return;
      }

      // 非EVM链的处理
      switch (chainType) {
        case CHAIN.SOLANA.brief:
          setLastChain(CHAIN.SOLANA);
          await connectSolanaWallet(CHAIN.SOLANA.brief);
          break;
        case CHAIN.SONIC_SVM.brief:
          setLastChain(CHAIN.SONIC_SVM);
          await connectSolanaWallet(CHAIN.SONIC_SVM.brief);
          break;
        case CHAIN.SONIC_SVM_TESTNET.brief:
          setLastChain(CHAIN.SONIC_SVM_TESTNET);
          await connectSolanaWallet(CHAIN.SONIC_SVM_TESTNET.brief);
          break;
        case CHAIN.SUI.brief:
          setLastChain(CHAIN.SUI);
          await connectSuiWallet();
          break;
        case CHAIN.TRON.brief:
          setLastChain(CHAIN.TRON);
          await connectTronWallet();
          break;
      }
    }
  };

  /**
   * 连接移动端钱包 OKX
   * @param chainType 钱包类型 sol、tron、sui
   */
  const connectMobileWalletWithOkx = async (chainType: string) => {
    //  okxui 一直保存连接状态，但是 beartoken，username 又没有所以这里断开
    if (provider.connected()) {
      await provider.disconnect();
    }

    const timestamp = Date.now();
    const params = `Start web3! \n\nClick to sign in; this request will not trigger a blockchain transaction or incur any gas fees.\n\nTimestamp: ${timestamp}`;
    const curChain = CHAIN[chainType.toUpperCase()];
    setLastChain(CHAIN[chainType.toUpperCase()]);
    const namespaces: any = {};
    const signChainId = `eip155:${curChain.id}`;

    switch (chainType) {
      case CHAIN.SOLANA.name:
        namespaces.solana = {
          chains: ["solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"],
        };
        break;
      case CHAIN.SUI.name:
        namespaces.sui = {
          chains: ["sui:mainnet"],
        };
        break;
      default:
        namespaces.eip155 = {
          chains: [`eip155:${curChain.id}`],
          rpcMap: {
            [curChain.id]: curChain.rpcUrls,
          },
        };

        break;
    }

    const session = await provider.openModalAndSign(
      {
        namespaces,
        sessionConfig: {
          redirect: "back",
        },
      },
      [
        {
          method: "personal_sign",
          chainId: signChainId,
          params: [params],
        },
      ]
    );

    addressRef.current = session.namespaces.eip155.accounts[0]?.split(":")[2];
    const signature = session.signResponse?.[0]?.result;
    return {
      signature,
      timestamp,
      address: addressRef.current,
    };
  };

  /**
   * 连接Sui钱包
   */
  const connectSuiWallet = async () => {
    subscribeSuiWallet();
    provider.sui.features["standard:connect"]
      .connect()
      .then((res: any) => {
        console.log("window.okxwallet.sui", res.accounts[0].address);
        addressRef.current = res.accounts[0].address;
        handleSignMessage(res.accounts[0].address, CHAIN.SUI.brief);
      })
      .catch((err: any) => {
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          console.log("user rejected the connection request.");
        } else {
          console.error(err);
        }
      });
  };

  /**
   * 监听Sui钱包连接
   */
  const subscribeSuiWallet = async () => {
    const provider = window.okxwallet.sui;
    provider.features["standard:events"].on("connect", () =>
      setIsConnected(true)
    );

    provider.features["standard:events"].on(
      "accountChanged",
      (publicKey: any) => {
        if (publicKey) {
          console.log(`Switched to account ${publicKey.toBase58()}`);
        }
      }
    );

    provider.features["standard:events"].on("disconnect", () => {
      // disconnect();
    });
  };

  /**
   * 连接Solana钱包
   * @param chainType 钱包类型 sol、sonic、sonic_testnet
   */
  const connectSolanaWallet = async (chainType: string) => {
    const walletType = useUserStore.getState().walletType;
    let provider = window.okxwallet;
    if (walletType === WalletType.phantom) {
      provider = window.phantom;
    }

    provider.solana
      .connect()
      .then((res: any) => {
        console.log("connectSolanaWallet res", res, walletType);
        addressRef.current = res.publicKey.toBase58();
        handleSignMessage(res.publicKey.toBase58(), chainType);
      })
      .catch((error: any) => {
        console.error("connectSolanaWallet error:", error);
        setChain(chain);
        addToast({
          title: error?.message || "User rejected the request.",
          color: "danger",
        });
      });
  };

  /**
   * 连接Evm钱包
   * @param chainType 钱包类型 evm
   * @param needSign 是否需要签名
   */
  const connectEvmWallet = async (chainType: string, needSign = true) => {
    const walletType = useUserStore.getState().walletType;

    // 统一处理 provider 选择
    const getProvider = () => {
      switch (walletType) {
        case WalletType.metamask:
          return metaMask();
        default:
          return injected();
      }
    };

    // 统一处理连接成功回调
    const handleConnectSuccess = async (address: string) => {
      addressRef.current = address;
      setIsConnected(true);
      if (needSign) {
        await handleSignMessage(address, chainType);
      }
    };

    // 统一处理错误
    const handleConnectError = (error: any) => {
      if (error?.message?.includes("Connector already connected.")) {
        addToast({ title: "Wallet already connected." });
      } else {
        setChain(chain);
        addToast({ title: "User rejected the request.", color: "danger" });
      }
    };

    // 统一的连接逻辑
    try {
      const provider = getProvider();
      const { accounts } = await connectAsync({
        connector: provider,
        chainId: CHAIN[chainType.toUpperCase()].id,
      });
      await handleConnectSuccess(accounts[0]);
    } catch (error) {
      handleConnectError(error);
    }
  };

  /**
   * 连接Tron钱包
   */
  const connectTronWallet = async () => {
    const currentProvider = window?.tronLink;
    // const currentProvider = provider?.tronLink;
    console.log("window.tronLink---", window, window?.tron);
    subscribeTronWallet();
    window?.tron
      .request({
        method: "eth_requestAccounts",
      })
      .then((res: any) => {
        console.log("eth_requestAccounts---", res);

        addressRef.current = currentProvider.tronWeb.defaultAddress.base58;
        handleSignMessage(
          currentProvider.tronWeb.defaultAddress.base58,
          CHAIN.TRON.brief
        );
      })
      .catch((error: any) => {
        console.error("connect tron link wallet error:", error);
        setChain(chain);
        addToast({
          title: error?.message || "User rejected the request.",
          color: "danger",
        });
      });
  };

  /**
   * 监听Tron钱包连接
   */
  const subscribeTronWallet = async () => {
    window.addEventListener("message", function (e) {
      if (e.data.message && e.data.message.action == "connect") {
        setIsConnected(true);
        console.log("got connect event", e.data);
      }
    });

    window.addEventListener("message", function (e) {
      if (e.data.message && e.data.message.action == "disconnect") {
        console.log("got disconnect event", e.data);
        // disconnect();
      }
    });

    window.addEventListener("message", function (e) {
      if (
        e.data.message &&
        e.data.message.action === "accountsChanged" &&
        walletType === WalletType.tronlink
      ) {
        console.log("got accountsChanged event", walletType, e.data);
      }
    });
  };

  /**
   * 签名数据
   * @param address 地址
   * @param accountType 钱包类型 sol、tron、sui
   */
  const handleSignMessage = async (address: string, chainType: string) => {
    try {
      addressRef.current = address;
      // 获取后端签名
      const signature = await signatureMessageHandler(chainType, "test");
      console.log(486, signature, chainType);

      // 拿到签名请求后端接口去登录
      await handleVerifySignMessageWithLogin();
    } catch (error: any) {
      console.error("获取签名数据失败", lastChain, chain, error);
      // throw error;
      // 切换回原来的链
      if (chain.id) {
        switchChain(
          { chainId: chain.id },
          {
            onSuccess: (data) => {
              console.log(220, data);
            },
          }
        );
        setChain(chain);
      }
      if (
        error.message.includes("User denied request signature") ||
        error.message.includes("User rejected the request")
      ) {
        addToast({
          title: "User rejected the request",
          color: "danger",
        });
      }
    }
  };

  /**
   * 获取钱包的签名消息
   * @param chainType 链名
   * @param messageToSign 消息
   * @returns 签名
   */
  const signatureMessageHandler = async (
    chainType: string,
    messageToSign: string
  ) => {
    // EVM链的统一处理
    if (isEvmChain(chainType)) {
      const signature = await signMessage(isMobile() ? mobileConfig : config, {
        message: messageToSign,
        account:
          (addressRef.current as `0x${string}`) || (address as `0x${string}`),
      });
      return signature;
    }

    // 非EVM链的处理
    switch (chainType) {
      case CHAIN.TRON.brief:
        const currentProvider = window?.tron?.tronWeb;
        // const currentProvider = provider?.tronLink?.tronWeb;
        const hexMessage = tronWeb.toHex(messageToSign);
        const signedString = await currentProvider?.trx?.sign(hexMessage);
        return signedString;
      case CHAIN.SOLANA.brief:
      case CHAIN.SONIC_SVM.brief:
      case CHAIN.SONIC_SVM_TESTNET.brief: {
        // solana 签名
        let provider = window.okxwallet;
        if (walletType === WalletType.phantom) {
          provider = window.phantom;
        }
        const encodedMessage = new TextEncoder().encode(messageToSign);
        const signResult = await provider?.solana?.signMessage(encodedMessage);
        const signedMessageBase64 = btoa(
          Array.from(new Uint8Array(signResult?.signature))
            .map((byte) => String.fromCharCode(byte))
            .join("")
        );
        return signedMessageBase64;
      }
      case CHAIN.SUI.brief: {
        // sui 签名
        // const provider = window.okxwallet.sui;
        const encodedMessage = new TextEncoder().encode(messageToSign);
        const { signature } = await provider.sui?.features[
          "sui:signMessage"
        ].signMessage({ message: encodedMessage });
        console.log("sui 签名", signature);
        return signature;
      }
      default:
        return "";
    }
  };

  /**
   * 验证签名并登录
   * @param chainType 钱包类型
   * @param signature 签名
   * @param signTimestamp 签名时间戳
   */
  const handleVerifySignMessageWithLogin = async () => {
    try {
      const currentLastChain = useWalletStore.getState().lastChain;
      console.log(505, addressRef.current);

      setChain(currentLastChain);
      setAddress(addressRef.current);
      setIsConnected(true);
    } catch (error) {
      console.error("验证签名失败:", error);
      throw error;
    }
  };

  return {
    loading,
    isOpenDownloadWallet,
    setLoading,
    connectWallet,
    getOkxWalletRef,
    setIsOpenDownloadWallet,
    handleSignMessage,
    connectEvmWallet,
    connectMobileWalletWithOkx,
  };
};
