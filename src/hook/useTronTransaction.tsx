"use client";
import { ERC20_CONTRACT } from "@/contracts/address";
import { useWalletStore } from "@/store/wallet";
import EVM_VOTE_ABI from "@/contracts/abi/EvmVote.json";
import { useState } from "react";
import TronWeb from "tronweb";
import { zeroAddress } from "viem";

interface BaseContractInfo {
  tokenAddress: string; // 投票token地址
  tokenAmount: string; // 投票token数量
  smartContractAddress: string; // 投票合约地址
}

interface Signature {
  expireTimestamp: number; // 投票过期时间
  signature: string; // 投票签名
}

interface TronVotePlaceProps extends BaseContractInfo, Signature {
  voteId: string; // 投票id
}

interface TronCreateVotePoolProps extends BaseContractInfo {
  poolId: string; // 投票池id
}

interface TronWithdrawProps extends BaseContractInfo, Signature {
  claimId: string; // 领取id
}

const useTronTransaction = () => {
  const [allowance, setAllowance] = useState<bigint>(BigInt(0));
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const wallet = useWalletStore((state: any) => state);
  const tronWeb = new TronWeb({
    fullHost: "https://api.trongrid.io",
    // fullHost: 'https://api.nileex.io/',
  });

  /**
   * 获取 Solana 余额
   * @param address 地址
   * @returns 余额
   */
  const getTrxBalance = async (address: string): Promise<bigint> => {
    tronWeb.setAddress(address);
    return await tronWeb.trx.getBalance(address);
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
    if (!wallet.address || !tokenAddress || !contractAddress) return;
    const currentAddress = useWalletStore.getState().address;
    tronWeb.setAddress(currentAddress);
    try {
      const contract = tronWeb.contract(ERC20_CONTRACT.abi, tokenAddress);
      // 获取 allowance
      const allowanceValue = await contract
        .allowance(wallet.address, contractAddress)
        .call();
      setAllowance(allowanceValue);

      // 获取用户余额
      const balanceValue = await contract.balanceOf(wallet.address).call();
      console.log(
        "token allowance-------",
        allowanceValue,
        "token balance---------",
        balanceValue
      );
      setBalance(balanceValue);
    } catch (err) {
      console.error("Error fetching allowance or balance:", err);
      // showToast('Failed to fetch allowance or balance', 'error');
    }
  };

  /**
   * 批准合约使用代币
   * @param tokenAddress 代币地址
   * @param contractAddress 合约地址
   * @param approveAmount 批准数量
   * @returns 交易结果
   */
  const tronApprove = async (
    tokenAddress: string,
    contractAddress: string,
    approveAmount: bigint
  ) => {
    const currentAddress = useWalletStore.getState().address;
    tronWeb.setAddress(currentAddress);
    const provider = window.tron;
    // const provider = wallet.provider?.tronLink;
    const instance = await provider.tronWeb.contract(
      ERC20_CONTRACT.abi,
      tokenAddress
    );
    const contractParams = {
      feeLimit: 100_000_000,
      shouldPollResponse: true,
      callValue: "0",
    };
    // 调用合约发送交易
    const result = await instance
      .approve(contractAddress, approveAmount)
      .send(contractParams);
    return result;
  };

  /**
   * 投票
   * @param params 投票参数
   * @returns 交易结果
   */
  const tronVotePlace = async (params: TronVotePlaceProps) => {
    const currentAddress = useWalletStore.getState().address;
    tronWeb.setAddress(currentAddress);
    const provider = window.tron;
    // const provider = wallet.provider?.tronLink;
    const instance = await provider.tronWeb.contract(
      EVM_VOTE_ABI,
      params.smartContractAddress
    );
    const contractParams = {
      feeLimit: 100_000_000,
      callValue: "0",
    };
    // 如果投票token为零地址代表主链币，则设置value为token数量
    if (params.tokenAddress === zeroAddress) {
      contractParams.callValue = params.tokenAmount;
    }
    // 调用合约发送交易
    const result = await instance
      .placeVote([
        params.voteId,
        params.tokenAddress,
        params.tokenAmount,
        params.expireTimestamp,
        params.signature,
      ])
      .send(contractParams);
    console.log("tronVotePlace result", result);
    return result;
  };

  /**
   * 创建投票池
   * @param params 投票参数
   * @returns 交易结果
   */
  const tronCreateVotePool = async (params: TronCreateVotePoolProps) => {
    const currentAddress = useWalletStore.getState().address;
    tronWeb.setAddress(currentAddress);
    const provider = window.tron;
    // const provider = wallet.provider?.tronLink;
    const instance = await provider.tronWeb.contract(
      EVM_VOTE_ABI,
      params.smartContractAddress
    );
    const contractParams = {
      feeLimit: 100_000_000,
      shouldPollResponse: true,
      callValue: "0",
    };
    // 如果投票token为零地址代表主链币，则设置value为token数量
    if (params.tokenAddress === zeroAddress) {
      contractParams.callValue = params.tokenAmount;
    }
    // 调用合约发送交易
    const result = await instance
      .createPool([
        params.poolId,
        params.tokenAddress,
        params.tokenAmount,
        0,
        "0x",
      ])
      .send(contractParams);
    return result;
  };

  /**
   * 提现
   * @param params 投票参数
   * @returns 交易结果
   */
  const tronWithdrawVote = async (params: TronWithdrawProps) => {
    const currentAddress = useWalletStore.getState().address;
    tronWeb.setAddress(currentAddress);
    const provider = window.tron;
    // const provider = wallet.provider?.tronLink;
    const instance = await provider.tronWeb.contract(
      EVM_VOTE_ABI,
      params.smartContractAddress
    );
    const contractParams = {
      feeLimit: 100_000_000,
      callValue: "0",
    };
    // 调用合约发送交易
    const result = await instance
      .withdraw([
        params.claimId,
        params.tokenAddress,
        params.tokenAmount,
        params.expireTimestamp,
        params.signature,
      ])
      .send(contractParams);
    return result;
  };

  return {
    allowance,
    balance,
    tronApprove,
    getTrxBalance,
    getTokenAllowance,
    tronVotePlace,
    tronCreateVotePool,
    tronWithdrawVote,
  };
};

export default useTronTransaction;
