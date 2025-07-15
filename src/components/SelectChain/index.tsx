"use client";
import { CHAIN } from "@/constants/chains";
import { useWalletStore } from "@/store/wallet";
import { Button } from "@heroui/button";
import { type ChainItem, supportChainList, WalletType } from "../types";
import { useConnectWallet } from "@/hook/useConnectWallet";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";
import { useEffect, useRef } from "react";
import { useUserInfoState } from "@/store/user";
import { TronLinkAdapter } from "@tronweb3/tronwallet-adapter-tronlink";
import isMobile from "@/lib/isMobile";
import { FaAngleLeft } from "react-icons/fa6";

const SelectChain = ({
  onClose,
  setShowSelectChain,
}: {
  onClose: () => void;
  setShowSelectChain: (show: boolean) => void;
}) => {
  const currentChainItem: any = useRef(null);
  const { walletType } = useUserInfoState();
  const { chain, setLastChain, setAddress } = useWalletStore();
  const { isConnected, chainId, address } = useAccount();
  const { disconnectAsync: disconnectWagmi } = useDisconnect();
  const { connectWallet, handleSignMessage } = useConnectWallet();
  const { openConnectModal } = useConnectModal();
  const { switchChain } = useSwitchChain();

  const isClickDisconnectRainbow = useRef(false);

  const chainList = supportChainList[walletType as WalletType];

  useEffect(() => {
    if (isConnected && address && isClickDisconnectRainbow.current) {
      // 如果当前链与上次链相同，则验证签名并登录
      if (chainId === currentChainItem.current?.id) {
        handleSignMessage(
          address as string,
          currentChainItem.current.type
        ).then(() => {
          setAddress(address as string);
        });
        onClose();
      } else {
        // 如果当前链与上次链不同，则切换链
        switchChain(
          { chainId: currentChainItem.current?.id },
          {
            onSuccess: () => {
              handleSignMessage(
                address as string,
                currentChainItem.current.type
              )
                .then(() => {
                  setAddress(address as string);
                })
                .finally(() => {
                  isClickDisconnectRainbow.current = false;
                  onClose();
                });
            },
            onError: (error) => {
              console.error("switchChain error", error);
              switchChain({ chainId: chain?.id || 1 });
            },
          }
        );
      }
    }
  }, [isConnected, address, isClickDisconnectRainbow.current]);

  useEffect(() => {
    if (isClickDisconnectRainbow.current) {
      openConnectModal?.();
    }
  }, [isClickDisconnectRainbow.current]);

  const returnWallect = () => {
    setShowSelectChain(false);
    // onClose();
  };

  const handleSwitchChain = async (chain: ChainItem) => {
    setLastChain(CHAIN[chain.type.toUpperCase() as keyof typeof CHAIN]);

    if (isMobile()) {
      connectWallet(chain.type).then(() => {
        onClose();
      });
    } else {
      switch (walletType) {
        case WalletType.okxWallet:
          connectWallet(chain.type).then(() => {
            onClose();
          });
          break;
        case WalletType.tronlink:
          const adapter = new TronLinkAdapter();
          adapter.connect().then(() => {
            handleSignMessage(adapter.address as string, CHAIN.TRON.brief)
              .then(() => {
                setAddress(adapter.address as string);
              })
              .finally(() => {
                onClose();
              });
          });
          break;
        case WalletType.rainbow:
          currentChainItem.current = chain;
          if (isConnected) {
            await disconnectWagmi();
            isClickDisconnectRainbow.current = true;
          } else {
            openConnectModal?.();
            isClickDisconnectRainbow.current = true;
          }
          break;
        case WalletType.phantom:
          connectWallet(chain.type).then(() => {
            onClose();
          });
          break;
        case WalletType.metamask:
          currentChainItem.current = chain;
          connectWallet(chain.type).then(() => {
            onClose();
          });
          break;
        default:
          break;
      }
    }
  };

  return (
    <div className="mx-auto p-5 rounded-2xl border border-zinc-500 w-lg relative">
      <FaAngleLeft
        onClick={returnWallect}
        className="absolute top-7 left-2 cursor-pointer"
      ></FaAngleLeft>
      <div className="text-center text-xl font-semibold">Select a chain</div>

      <div className="relative mt-8 max-h-[480px] w-full overflow-y-auto">
        {chainList.map((chain: any) => (
          <Button
            key={chain.name}
            variant="bordered"
            size="lg"
            className="nextui-btn-style cursor-pointer mb-4 flex h-16 w-full items-center justify-start gap-6 !rounded-[20px]"
            onPress={() => handleSwitchChain(chain)}
          >
            <div className="flex h-6 w-6 items-center justify-center">
              <img src={chain.logo} alt={chain.name} className="h-full" />
            </div>
            {chain.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SelectChain;
