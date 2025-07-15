// app/providers.tsx
"use client";
import { WagmiProvider } from "wagmi";
import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import isMobile from "@/lib/isMobile";
import { config, mobileConfig } from "@/constants/wagmiConfig";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={isMobile() ? mobileConfig : config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <HeroUIProvider>
            <ToastProvider />
            {children}
          </HeroUIProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
