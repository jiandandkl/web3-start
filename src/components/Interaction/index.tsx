"use client";
import { useUserInfoState } from "@/store/user";
import { useWalletState, useWalletStore } from "@/store/wallet";
import { WalletLogo } from "../types";
import { useBalanceStore } from "@/store/balance";
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { parseUnits } from "viem";
import { CHAIN } from "@/constants/chains";
// import useTronTransaction from "@/hook/useTronTransaction";
// import useEvmTransaction from "@/hook/useEvmTransaction";
import { useHandleTrade } from "@/hook/useHandleTrade";
import { addToast } from "@heroui/toast";
import Lottie from "react-lottie-player";
import happyWhaleJson from "@/assets/HappyWhale.json";

const Interaction = () => {
  const { walletType } = useUserInfoState();
  const { address, disconnect } = useWalletStore();
  const { balance, fetchBalance } = useBalanceStore();
  const { chain } = useWalletState();
  const { handleTradeFunc } = useHandleTrade();

  // 非主链币的话都需要获取授权和余额
  // const {
  //   allowance: tronTokenAllowance, // tron 代币授权额度
  //   balance: tronVoteTokenBalance, // tron vote代币余额
  //   getTokenAllowance, // 获取 tron 代币授权余额
  //   tronApprove, // 授权 tron 的代币给vote合约
  // } = useTronTransaction();

  // const {
  //   allowance: evmTokenAllowance, // evm 代币授权额度
  //   balance: evmVoteTokenBalance, // evm vote代币余额
  //   getTokenAllowance: getEvmTokenAllowance, // 获取 evm 代币授权余额
  //   evmApprove, // 授权 evm 的代币给vote合约
  // } = useEvmTransaction();

  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showTradeSuccess, setShowTradeSuccess] = useState(false);

  useEffect(() => {
    fetchBalance(chain, address);
  }, [address]);

  const handleDisconnect = () => {
    disconnect();
  };

  const handleTrade = async () => {
    if (!inputValue || Number(inputValue) <= 0) {
      addToast({
        title: "Please enter a valid amount",
        color: "danger",
      });
      return;
    }

    if (Number(inputValue) >= 1) {
      addToast({
        title: "Please enter a amount < 1",
        color: "danger",
      });
      return;
    }

    try {
      // 如果授权的额度小于trade数量，需要授权
      const voteTokenAmount = parseUnits(
        inputValue,
        CHAIN[chain.brief!.toUpperCase()]?.decimals ?? 18
      );

      // tron链的token授权
      if (
        chain.brief === CHAIN.TRON.brief &&
        balance.origin < voteTokenAmount
      ) {
        addToast({
          title: "Insufficient Balance",
          color: "danger",
        });
        return;
      }

      // 如果链是evm链，则批准evm代币给vote合约
      const evmChains = Object.values(CHAIN)
        .filter((chain) => chain.type === "evm")
        .map((chain) => chain.brief);
      if (evmChains.includes(chain.brief) && balance.origin < voteTokenAmount) {
        addToast({
          title: "Insufficient Balance",
          color: "danger",
        });
        return;
      }

      // 如果链是solana，则判断余额是否足够
      if (
        chain.brief === CHAIN.SOLANA.brief &&
        balance.origin < voteTokenAmount
      ) {
        // 余额不足
        addToast({
          title: "Insufficient Balance",
          color: "danger",
        });
        return;
      }

      // 如果Trx余额不足，则弹出提示
      const voteTronAmount = parseUnits(String(Number(inputValue) + 5), 6);
      if (chain.brief === CHAIN.TRON.brief && balance.origin < voteTronAmount) {
        addToast({
          title: "Insufficient Balance",
          color: "danger",
        });
        return;
      }

      setLoading(true);

      // 投票
      await handleTradeFunc({
        inputValue: Number(inputValue),
        address,
        voteToken: {
          // 这里默认是空的，表示使用主币，实际支持多种代币
          tokenAddress: "",
          chainType: chain.brief,
          tokenDecimals: CHAIN[chain.brief!.toUpperCase()]?.decimals,
        },
        mainTokenBalance: balance.origin,
      });

      setShowTradeSuccess(true);
      setTimeout(() => {
        setShowTradeSuccess(false);
      }, 2000);
    } catch (error: any) {
      console.log("placevote error", error);
      if (
        error.message.includes("User denied request signature") ||
        error.message.includes("User rejected the request")
      ) {
        // 用户拒绝签名
        addToast({
          title: "User rejected the request",
          color: "danger",
        });
      } else if (error?.name === "AxiosError") {
        // axios 错误 不做处理
      } else if (error.message.includes("Insufficient Balance")) {
        // 余额不足
        addToast({
          title: "Insufficient Balance",
          color: "danger",
        });
      } else {
        // 其他错误
        console.error("error", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto p-5 rounded-2xl border border-zinc-500 w-lg relative flex items-center flex-col">
      <div className="relative">
        <img
          src={WalletLogo?.[walletType]}
          alt="logo"
          className="w-16 h-16 rounded-full"
        />
        <img
          src={CHAIN[chain.brief!.toUpperCase()].logoUrl}
          className="w-5 h-5 absolute top-10 right-0"
          alt="chain-logo"
        />
      </div>
      <div className="flex justify-between w-72 mt-4">
        <div>
          {address ? `${address.slice(0, 6)}...${address.slice(-6)}` : ""}
        </div>
        <div>Balance: {Number(balance.value).toFixed(3)}</div>
      </div>
      <div className="flex justify-between w-72 mt-4">
        <input
          className="border rounded-md outline-none"
          placeholder="请输入金额"
          onChange={(e) => setInputValue(e.target.value)}
        />
        {loading ? (
          <AiOutlineLoading3Quarters className="animate-spin" />
        ) : (
          <button className="cursor-pointer" onClick={handleTrade}>
            Trade
          </button>
        )}
      </div>
      <button className="cursor-pointer mt-4" onClick={handleDisconnect}>
        Disconnect
      </button>
      {showTradeSuccess && (
        <Lottie
          animationData={happyWhaleJson}
          play
          loop={false}
          style={{ position: "absolute", top: "115px" }}
        />
      )}
    </div>
  );
};

export default Interaction;
