"use client";
import { CHAIN } from "@/constants/chains";
import { solanaTranction } from "@/lib/okxSolana";
import { parseUnits } from "viem";
import { SOLANA_VOTE_ADDR } from "@/contracts/address";
import useEvmTransaction from "./useEvmTransaction";
import useTronTransaction from "./useTronTransaction";
import useSolanaTransaction from "./useSolanaTransaction";
import { useUserInfoState } from "@/store/user";
import { isEvmChain } from "@/lib/tools";
import * as anchor from "@coral-xyz/anchor";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
interface tokenPair {
  tokenAddress: string;
  chainType: string;
  tokenDecimals?: number;
}

interface PlaceVoteProps {
  inputValue: number;
  address: string; // 用户地址
  voteToken: tokenPair; // vote token
  mainTokenBalance: bigint; // 主币余额
}

export const useHandleTrade = () => {
  const { evmVotePlace } = useEvmTransaction();
  const { tronVotePlace } = useTronTransaction();
  const { solanaPlaceVote, fetchTokenTransferData, sendTransaction } =
    useSolanaTransaction();
  const { walletType } = useUserInfoState();

  const handleTradeFunc = async ({
    inputValue,
    address,
    voteToken,
    mainTokenBalance,
  }: PlaceVoteProps): Promise<any> => {
    console.log(38, inputValue);

    try {
      const voteTokenAmount = parseUnits(
        String(inputValue),
        voteToken?.tokenDecimals ?? 18
      );
      console.log(45, mainTokenBalance, voteTokenAmount);

      // 余额不足
      if (voteToken.tokenAddress === "" && mainTokenBalance < voteTokenAmount) {
        throw new Error("Insufficient Balance");
      }

      // 模拟从后端拿的跟合约交互的数据
      const res: any = {
        voteId: "12345",
        smartContractParams: {
          voteId: "1111",
          // 默认主币的地址为零地址
          tokenAddress: "0x0000000000000000000000000000000000000000",
          tokenAmount: "3333",
          expireTimestamp: "4444",
          signature: "5555",
        },
      };

      let tx;
      // EVM链的统一处理
      if (isEvmChain(voteToken.chainType)) {
        tx = await evmVotePlace(
          CHAIN[voteToken.chainType.toUpperCase()] as any,
          res?.smartContractParams
        );
        return { tx, voteId: res?.voteId };
      }

      switch (voteToken.chainType) {
        case CHAIN.SOLANA.brief:
          const memo = JSON.stringify({
            action: "Vote",
            payload: { voteId: res?.voteId },
          });
          if (voteToken.tokenAddress === "") {
            tx = await solanaTranction(
              voteTokenAmount,
              memo,
              address,
              SOLANA_VOTE_ADDR,
              walletType
            );
          } else {
            const transaction = await fetchTokenTransferData(
              memo,
              voteTokenAmount,
              SOLANA_VOTE_ADDR,
              voteToken.tokenAddress
            );
            tx = await sendTransaction(transaction);
          }
          break;
        case CHAIN.SONIC_SVM.brief:
        case CHAIN.SONIC_SVM_TESTNET.brief:
          tx = await solanaPlaceVote({
            voteId: res?.voteId,
            tokenAmount: new anchor.BN(
              inputValue * anchor.web3.LAMPORTS_PER_SOL
            ),
            expireTimestamp: new anchor.BN(
              res.smartContractParams.expireTimestamp
            ),
            signature: bs58.decode(res.smartContractParams.signature),
            message: bs58.decode(res.smartContractParams.message),
            signer: res.smartContractParams.signer,
          });
          break;
        case CHAIN.TRON.brief:
          tx = await tronVotePlace(res?.smartContractParams);
          break;
        case CHAIN.SUI.brief:
          break;
        default:
          break;
      }
      return { tx, voteId: res?.voteId };
    } catch (error) {
      throw error;
    }
  };
  return {
    handleTradeFunc,
  };
};
