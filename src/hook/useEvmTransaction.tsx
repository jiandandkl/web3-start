"use client";
import { usePublicClient, useWriteContract } from "wagmi";
import { useWalletStore } from "@/store/wallet";
import EvmVoteAbi from "@/contracts/abi/EvmVote.json";
import { parseUnits, zeroAddress } from "viem";
import { CHAIN, type Chain } from "@/constants/chains";
import Erc20TokenAbi from "@/contracts/abi/Erc20Token.json";
import { useState } from "react";
import isMobile from "@/lib/isMobile";
import { WalletType } from "@/components/types";
import { useUserStore } from "@/store/user";
import { encodeFunctionData } from "viem";

interface BaseContractInfo {
  tokenAddress: string; // 投票token地址
  tokenAmount: string; // 投票token数量
  smartContractAddress: string; // 投票合约地址
}

interface Signature {
  expireTimestamp: number; // 投票过期时间
  signature: string; // 投票签名
}

interface EvmVotePlaceProps extends BaseContractInfo, Signature {
  voteId: string; // 投票id
}

interface EvmCreateVotePoolProps extends BaseContractInfo {
  poolId: string; // 投票池id
}

interface EvmWithdrawProps extends BaseContractInfo, Signature {
  claimId: string; // 领取id
}

interface ContractParams {
  abi: any;
  address: `0x${string}`;
  functionName: string;
  args: any[];
  chainId: number;
  account: `0x${string}`;
  value?: bigint;
  gas?: bigint;
  maxFeePerGas?: bigint;
}

const useEvmTransaction = () => {
  const chainId = useWalletStore.getState().chain?.id;
  const publicClient = usePublicClient({
    chainId: chainId,
  });
  const address = useWalletStore.getState().address;
  const provider = useWalletStore.getState().provider;
  const { writeContractAsync } = useWriteContract();
  const [allowance, setAllowance] = useState<bigint>(BigInt(0));
  const [balance, setBalance] = useState<bigint>(BigInt(0));

  /**
   * 获取evm余额
   */
  const getEvmBalance = async () => {
    const balance = await publicClient?.getBalance({
      address: address as `0x${string}`,
    });
    console.log("evm balance", balance);

    return balance;
  };

  /**
   * 获取 token 的 allowance
   * @param tokenAddress 代币地址
   * @param contractAddress 合约地址
   */
  const getTokenAllowance = async (
    tokenAddress: string,
    contractAddress: string
  ) => {
    if (!address) return;
    try {
      // 获取 allowance
      const allowanceValue = await publicClient?.readContract({
        address: tokenAddress as `0x${string}`,
        abi: Erc20TokenAbi,
        functionName: "allowance",
        args: [address as `0x${string}`, contractAddress as `0x${string}`],
      });
      setAllowance(allowanceValue as bigint);
      console.log("token allowance", allowanceValue);

      // 获取 balance
      const balanceValue = await publicClient?.readContract({
        address: tokenAddress as `0x${string}`,
        abi: Erc20TokenAbi,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      });
      setBalance(balanceValue as bigint);
      console.log("token balance", balanceValue);
      return { allowance: allowanceValue, balance: balanceValue };
    } catch (err) {
      console.error("Error fetching allowance:", err);
    }
  };

  /**
   * evm 授权
   * @param chainId 链id
   * @param tokenAddress 代币地址
   * @param amount 授权数量
   * @param toContractAddress 授权合约地址
   * @returns
   */
  const evmApprove = async (
    chainId: number,
    tokenAddress: string,
    toContractAddress: string,
    amount: bigint
  ) => {
    const contractParams: ContractParams = {
      abi: Erc20TokenAbi,
      address: tokenAddress as `0x${string}`,
      functionName: "approve",
      args: [toContractAddress, amount],
      chainId: chainId,
      account: address as `0x${string}`,
    };
    const walletType = useUserStore.getState().walletType;
    if (isMobile() && walletType === WalletType.okxWallet) {
      const withdrawUsdcData = encodeFunctionData({
        abi: Erc20TokenAbi,
        functionName: "approve",
        args: [toContractAddress, `0x${amount.toString(16)}`],
      });

      const data = {
        method: "eth_sendTransaction",
        params: [
          {
            to: tokenAddress as `0x${string}`,
            from: address,
            value: "0x0",
            data: withdrawUsdcData,
          },
        ],
      };

      const personalSignResult = await provider.request(
        data,
        `eip155:${chainId}`
      );

      return personalSignResult;
    } else {
      // 发送交易
      const result = await writeContractAsync(contractParams);
      return result;
    }
  };

  /**
   * evm 投票
   * @param chain 链
   * @param params 投票参数
   * @returns
   */
  const evmVotePlace = async (chain: Chain, params: EvmVotePlaceProps) => {
    let okxValue: any = params.tokenAmount;
    console.log(170, params.tokenAddress, zeroAddress);

    // 如果投票token为零地址代表主链币，则设置value为token数量
    if (params.tokenAddress === zeroAddress) {
      okxValue = parseUnits(params.tokenAmount, 0).toString();
    }
    const walletType = useUserStore.getState().walletType;
    // 如果是移动端并且 okx

    if (isMobile() && walletType === WalletType.okxWallet) {
      const withdrawUsdcData = encodeFunctionData({
        abi: EvmVoteAbi,
        functionName: "placeVote",
        args: [
          [
            params.voteId,
            params.tokenAddress,
            params.tokenAmount,
            params.expireTimestamp,
            params.signature,
          ],
        ],
      });

      const data = {
        method: "eth_sendTransaction",
        params: [
          {
            to: params.smartContractAddress as `0x${string}`,
            from: address,
            value: BigInt(okxValue).toString(16),
            data: withdrawUsdcData,
          },
        ],
      };

      const personalSignResult = await provider.request(
        data,
        `eip155:${chain.id}`
      );

      return personalSignResult;
    } else if (chain.id) {
      const contractParams: ContractParams = {
        abi: EvmVoteAbi,
        address: params.smartContractAddress as `0x${string}`,
        functionName: "placeVote",
        args: [
          [
            params.voteId,
            params.tokenAddress,
            params.tokenAmount,
            params.expireTimestamp,
            params.signature,
          ],
        ],
        chainId: chain.id,
        account: address as `0x${string}`,
      };
      // 如果投票token为零地址代表主链币，则设置value为token数量
      if (params.tokenAddress === zeroAddress) {
        contractParams.value = parseUnits(params.tokenAmount, 0);
      }
      console.log(233, chain, CHAIN.PHAROS_TESTNET);

      // 发送交易
      const result = await writeContractAsync(contractParams);
      return result;
    }
  };

  /**
   * evm 创建投票池
   * @param chain 链
   * @param params 投票参数
   * @returns
   */
  const evmCreateVotePool = async (
    chain: Chain,
    params: EvmCreateVotePoolProps
  ) => {
    if (chain.id) {
      const contractParams: ContractParams = {
        abi: EvmVoteAbi,
        address: params.smartContractAddress as `0x${string}`,
        functionName: "createPool",
        args: [
          [params.poolId, params.tokenAddress, params.tokenAmount, "", ""],
        ],
        chainId: chain.id,
        account: address as `0x${string}`,
      };
      // 如果投票token为零地址代表主链币，则设置value为token数量
      if (params.tokenAddress === zeroAddress) {
        contractParams.value = parseUnits(params.tokenAmount, 0);
      }
      // 发送交易
      const result = await writeContractAsync(contractParams);
      return result;
    }
  };

  /**
   * evm 提现
   * @param chain 链
   * @param params 投票参数
   * @returns
   */
  const evmWithdrawVote = async (chain: Chain, params: EvmWithdrawProps) => {
    const walletType = useUserStore.getState().walletType;
    if (isMobile() && walletType === WalletType.okxWallet) {
      const contractParams = {
        abi: EvmVoteAbi,
        functionName: "withdraw",
        args: [
          [
            params.claimId,
            params.tokenAddress,
            params.tokenAmount,
            params.expireTimestamp,
            params.signature,
          ],
        ],
      };
      const withdrawUsdcData = encodeFunctionData(contractParams);

      const data = {
        method: "eth_sendTransaction",
        params: [
          {
            to: params.smartContractAddress as `0x${string}`,
            from: address,
            value: "0x0",
            data: withdrawUsdcData,
          },
        ],
      };

      const personalSignResult = await provider.request(
        data,
        `eip155:${chain.id}`
      );

      return personalSignResult;
    } else if (chain.id) {
      const contractParams: ContractParams = {
        abi: EvmVoteAbi,
        address: params.smartContractAddress as `0x${string}`,
        functionName: "withdraw",
        args: [
          [
            params.claimId,
            params.tokenAddress,
            params.tokenAmount,
            params.expireTimestamp,
            params.signature,
          ],
        ],
        chainId: chain.id,
        account: address as `0x${string}`,
      };

      // 发送交易
      const result = await writeContractAsync(contractParams);
      return result;
    }
  };

  return {
    allowance,
    balance,
    getEvmBalance,
    getTokenAllowance,
    evmApprove,
    evmVotePlace,
    evmCreateVotePool,
    evmWithdrawVote,
  };
};

export default useEvmTransaction;
