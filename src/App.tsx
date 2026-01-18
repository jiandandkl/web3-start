import { useState } from "react";
import SelectChain from "@/components/SelectChain";
import SelectWallet from "@/components/SelectWallet";
import { useWalletStore } from "@/store/wallet";
import Interaction from "@/components/Interaction";

export default function Home() {
  const [showSelectChain, setShowSelectChain] = useState(false);
  const { address } = useWalletStore();


  return (
    <div className="grid w-screen grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex w-full flex-col gap-[32px] row-start-2 justify-center items-center sm:items-start">
        {address ? (
          <Interaction />
        ) : showSelectChain ? (
          <SelectChain
            setShowSelectChain={setShowSelectChain}
            onClose={() => setShowSelectChain(false)}
          />
        ) : (
          <SelectWallet setShowSelectChain={setShowSelectChain} />
        )}
      </main>
    </div>
  );
}
