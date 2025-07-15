"use client";
import { useWalletStore } from "@/store/wallet";
import {
  encodeFunctionData,
  parseUnits,
  http,
  createPublicClient,
  custom,
  createWalletClient,
  type Chain,
} from "viem";
import { CHAIN, VIEM_CHAIN_TYPE } from "@/constants/chains";
// import { metisPublicClient } from '@/constants/client';
import EvmVoteAbi from "@/contracts/abi/EvmVote.json";
import { METIS_VOTE_CONTRACT } from "@/contracts/address";
// interface FetchErc20TokenBalanceProps {
//   address: string;
//   tokenAddress: string;
//   chain: string;
// }
// const fetchErc20TokenBalance = async ({
//   address,
//   tokenAddress,
//   chain,
// }: FetchErc20TokenBalanceProps) => {
//   let balance = 0;
//   // if (chain.toLowerCase() === 'metis' && address.indexOf('0x') > -1) {
//   //   const data: any = await metisPublicClient.readContract({
//   //     address: tokenAddress as `0x${string}`,
//   //     abi: ERC20_CONTRACT.abi,
//   //     functionName: 'balanceOf',
//   //     args: [address],
//   //   });

//   //   balance = Number(formatUnits(data, 18));
//   // }

//   return balance;
// };

const evmTranction = async (amount: string, fromAddress: string) => {
  const evmWallet = useWalletStore.getState().provider;
  const recipientAddress = "0x1e55947ec8d993777b03b83dc4f53c3befbde2f7"; // 接收地址

  const transData = encodeFunctionData({
    abi: METIS_VOTE_CONTRACT.abi,
    functionName: "transfer",
    args: [recipientAddress, parseUnits(String(amount), CHAIN.METIS.decimals)],
  });

  await evmWallet.request({
    method: "eth_sendTransaction",
    params: [
      {
        to: METIS_VOTE_CONTRACT.address,
        from: fromAddress,
        // value: '0x0',
        data: transData,
      },
    ],
  });
};

interface EvmVotePlaceProps {
  voteId: string; // 投票id
  senderAddress: string; // 投票者地址
  tokenAddress: string; // 投票token地址
  tokenAmount: string; // 投票token数量
  smartContractAddress: string; // 投票合约地址
  expireTimestamp: number; // 投票过期时间
  signature: string; // 投票签名
}

const getEvmBalance: (
  chainType: string,
  address: string
) => Promise<any> = async (chainType: string, address: string) => {
  // CHAIN_TYPE 定义在上面，新增链需要添加chain
  const publicClient = createPublicClient({
    chain: VIEM_CHAIN_TYPE[chainType as keyof typeof VIEM_CHAIN_TYPE],
    transport: http(),
  });
  const balance = await publicClient.getBalance({
    address: address as `0x${string}`,
  });
  console.log("balance....", balance);
  return balance;
};

/**
 * evm 投票
 * @param chain 链
 * @param params 投票参数
 * @returns
 */
const evmVotePlace = async (chain: Chain, params: EvmVotePlaceProps) => {
  const publicClient = createPublicClient({
    chain: chain,
    transport: http(),
  });
  // 模拟交易
  const { request } = await publicClient.simulateContract({
    address: params.smartContractAddress as `0x${string}`,
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
    value: parseUnits(params.tokenAmount, 0),
    account: params.senderAddress as `0x${string}`,
  });

  // 发送交易
  const walletClient = createWalletClient({
    chain: chain,
    transport: custom(window?.ethereum),
  });
  const result = await walletClient.writeContract(request);

  return result;
};

export { evmTranction, getEvmBalance, evmVotePlace };
