"use client";
import isMobile from "@/lib/isMobile";
import { walletList, walletListMobile, WalletType } from "@/components/types";
import { Button } from "@heroui/button";
// import { usePathname, useSearchParams } from "next/navigation";
import { useUserStore } from "@/store/user";

export default function SelectWallet({
  setShowSelectChain,
}: {
  setShowSelectChain: (show: boolean) => void;
}) {
  const isMobilePage = isMobile();
  // const pathname = usePathname();
  // const searchParams = useSearchParams();
  const { setWalletType } = useUserStore();
  /**
   * 连接钱包
   * @param chainType 钱包类型 sol、tron、sui、evm
   * @param type 钱包类型 okx、tronlink、rainbow
   */
  const handleConnect = async (type: string) => {
    setWalletType(type);

    // 如果是移动端，并且是metamask钱包，则打开metamask的app链接
    if (isMobilePage && type !== WalletType.okxWallet) {
      // 获取完整路径（包含查询参数）
      // const fullPath = searchParams.size
      //   ? `${pathname}?${searchParams.toString()}`
      //   : pathname;
      const isMetaMask = navigator.userAgent.toLowerCase().includes("metamask");
      const isPhantom = navigator.userAgent.toLowerCase().includes("phantom");
      if (!isMetaMask && type === WalletType.metamask) {
        const domain = "https://dashboard.reown.com";
        // import.meta.env.VITE__NODE_ENV === "development"
        //   ? `nextmate-svc.xyz${fullPath}`
        //   : `nextmate.ai${fullPath}`;
        window.open(`https://metamask.app.link/dapp/${domain}`);
        return;
      }

      if (!isPhantom && type === WalletType.phantom) {
        const domain =
          import.meta.env.VITE__NODE_ENV === "development"
            ? `https://nextmate-svc.xyz`
            : `https://nextmate.ai`;
        window.open(
          `https://phantom.app/ul/browse/${encodeURIComponent(
            domain
          )}?ref=${encodeURIComponent(domain)}`
        );
        return;
      }
    } else {
      setShowSelectChain(true);
    }
  };

  return (
    <div className="flex w-lg flex-col bg-[#131414] items-center justify-center gap-3 mx-auto p-5 rounded-2xl border border-zinc-500">
      {(isMobilePage ? walletListMobile : walletList).map((wallet) => (
        <Button
          key={wallet.title}
          variant="bordered"
          size="lg"
          className={`nextui-btn-style cursor-pointer flex h-16 w-full items-center justify-start gap-6 !rounded-[20px] border-white text-white`}
          onPress={() => handleConnect(wallet.type)}
        >
          <img src={wallet.logo} alt={wallet.title} className="h-6 w-6" />
          <div className={`text-xl font-medium leading-snug`}>
            {wallet.title}
          </div>
        </Button>
      ))}
    </div>
  );
}
