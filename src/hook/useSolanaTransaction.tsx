"use client";
import { CHAIN } from "@/constants/chains";
import { useWalletStore } from "@/store/wallet";
import {
  SystemProgram,
  PublicKey,
  TransactionInstruction,
  Connection,
  TransactionMessage,
  VersionedTransaction,
  Ed25519Program,
  SYSVAR_INSTRUCTIONS_PUBKEY,
} from "@solana/web3.js";
import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction as createSplTransferInstruction,
  getAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { useUserStore } from "@/store/user";
import { WalletType } from "@/components/types";
import { useAnchorWallet } from "./useAnchorWallet";
import { useEffect, useMemo, useRef } from "react";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import SolVoteIdl from "@/contracts/abi/SolVote.json";
interface SolanaVotePlaceProps {
  voteId: string; // 投票id
  tokenAddress?: string; // 投票token地址
  tokenAmount: bigint; // 投票token数量
  smartContractAddress?: string; // 投票合约地址
  expireTimestamp: number; // 投票过期时间
  signature: any; // 投票签名
  message: any; // 投票消息
  signer: any; // 投票签名者
}

interface SolanaWithdrawVoteProps {
  claimId: string; // 领取id
  tokenAddress?: string; // 投票token地址
  tokenAmount: string; // 投票token数量
  smartContractAddress?: string; // 投票合约地址
  expireTimestamp: number; // 投票过期时间
  signature: any; // 投票签名
  message: any; // 投票消息
  signer: any; // 投票签名者
}

const useSolanaTransaction = () => {
  const address = useWalletStore.getState().address;
  const chain = useWalletStore.getState().chain;
  const anchorWallet = useAnchorWallet();
  const programRef = useRef<Program<any> | null>(null);

  const connection = useMemo(() => {
    switch (chain.brief) {
      case CHAIN.SOLANA.brief:
        return new Connection(CHAIN.SOLANA.rpcUrls, "confirmed");
      case CHAIN.SONIC_SVM.brief:
        return new Connection(CHAIN.SONIC_SVM.rpcUrls, "confirmed");
      case CHAIN.SONIC_SVM_TESTNET.brief:
        return new Connection(CHAIN.SONIC_SVM_TESTNET.rpcUrls, "confirmed");
      default:
        return new Connection(CHAIN.SOLANA.rpcUrls, "confirmed");
    }
  }, [chain]);

  const anchorProvider = useMemo(() => {
    if (!anchorWallet) {
      return null;
    }
    return new AnchorProvider(connection, anchorWallet, {
      preflightCommitment: "confirmed",
      commitment: "processed",
    });
  }, [anchorWallet, connection]);

  /**
   * 等待获取插件钱包
   * @returns
   */
  const getProgramRef = async () => {
    const programs = new Program(
      SolVoteIdl as any,
      anchorProvider as any
    ) as any;
    programRef.current = programs;
  };

  useEffect(() => {
    if (anchorProvider && address) {
      getProgramRef();
    }
  }, [anchorProvider, address]);

  /**
   * 获取 Solana 余额
   * @param address 地址
   * @returns 余额
   */
  const getSolBalance = async (address: string) => {
    const walletAddress = new PublicKey(address);
    return await connection.getBalance(walletAddress);
  };

  /**
   * 获取当前用户的USDC余额
   * @param tokenAddress 代币地址
   * @returns USDC余额
   */
  const getTokenBalance = async (tokenAddress: string) => {
    try {
      const connection = new Connection(
        `https://solana-mainnet.g.alchemy.com/v2/${
          import.meta.env.VITE__ALCHEMY_API_KEY
        }`,
        "confirmed"
      );

      // 使用提供的地址或默认当前钱包地址
      const targetAddress = address;
      if (!targetAddress) {
        return BigInt(0);
      }

      // 代币的Mint地址
      const tokenMint = new PublicKey(tokenAddress);

      // 获取关联代币账户地址
      const tokenAccountAddress = await getAssociatedTokenAddress(
        tokenMint,
        new PublicKey(targetAddress)
      );
      console.log(282, tokenAccountAddress);

      try {
        // 获取代币账户信息
        const tokenAccount = await getAccount(connection, tokenAccountAddress);
        return tokenAccount.amount;
      } catch (error: any) {
        console.error("fetchTokenBalance error:", error);
        return BigInt(0);
      }
    } catch (error) {
      console.error("fetchTokenBalance error:", error);
      return BigInt(0);
    }
  };

  /**
   * 获取转账带备注信息的数据
   * @param memo
   * @param amount
   * @param to
   * @returns
   */
  const fetchTransferWithMemoData = async (
    memo: string,
    amount: bigint,
    to: string
  ) => {
    try {
      const connection = new Connection(
        `https://solana-mainnet.g.alchemy.com/v2/${
          import.meta.env.VITE__ALCHEMY_API_KEY
        }`,
        "confirmed"
      );
      //转账指令
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: new PublicKey(address), //转出账户公钥
        toPubkey: new PublicKey(to), //转入账号公钥
        lamports: amount, //数量（10亿lamports = 1SOL）
      });
      // 备注指令
      const memoInstruction = new TransactionInstruction({
        keys: [
          {
            pubkey: new PublicKey(address),
            isSigner: true,
            isWritable: true,
          },
        ],
        data: Buffer.from(memo, "utf-8"),
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      });

      const { blockhash } = await connection.getLatestBlockhash();
      const messageV0 = new TransactionMessage({
        payerKey: new PublicKey(address),
        recentBlockhash: blockhash,
        instructions: [transferInstruction, memoInstruction], //把指令添加到指令数组
      }).compileToV0Message();

      //生成交易
      const transferTransaction = new VersionedTransaction(messageV0);

      console.log(331, transferTransaction);
      return transferTransaction;
    } catch (error) {
      console.log(332, error);
      return null;
    }
  };

  /**
   * 获取代币转账数据
   * @param memo 备注
   * @param amount 转账金额
   * @param to 接收地址
   * @param tokenAddress 代币地址
   * @returns
   */
  const fetchTokenTransferData = async (
    memo: string,
    amount: bigint,
    to: string,
    tokenAddress: string
  ) => {
    try {
      const connection = new Connection(
        `https://solana-mainnet.g.alchemy.com/v2/${
          import.meta.env.VITE__ALCHEMY_API_KEY
        }`,
        "confirmed"
      );
      console.log(361, memo, amount, to, tokenAddress);

      // 代币的Mint地址
      const usdcMint = new PublicKey(tokenAddress);

      // 获取发送方的代币账户
      const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        { publicKey: new PublicKey(address) } as any, // 使用当前钱包作为payer
        usdcMint,
        new PublicKey(address)
      );

      // 获取接收方的代币账户
      const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        { publicKey: new PublicKey(address) } as any, // 使用当前钱包作为payer
        usdcMint,
        new PublicKey(to)
      );

      // 创建 转账指令
      const transferInstruction = createSplTransferInstruction(
        fromTokenAccount.address, // 发送方代币账户
        toTokenAccount.address, // 接收方代币账户
        new PublicKey(address), // 所有者公钥
        amount // 转账金额
      );

      // 备注指令
      const memoInstruction = new TransactionInstruction({
        keys: [
          {
            pubkey: new PublicKey(address),
            isSigner: true,
            isWritable: true,
          },
        ],
        data: Buffer.from(memo, "utf-8"),
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      });

      // 获取最近区块信息
      const { blockhash } = await connection.getLatestBlockhash();

      // 创建交易消息
      const messageV0 = new TransactionMessage({
        payerKey: new PublicKey(address),
        recentBlockhash: blockhash,
        instructions: [transferInstruction, memoInstruction],
      }).compileToV0Message();

      // 生成交易
      const transferTransaction = new VersionedTransaction(messageV0);
      console.log("USDC交易创建成功:", transferTransaction);
      return transferTransaction;
    } catch (error) {
      console.log("USDC交易创建失败:", error);
      return null;
    }
  };

  /**
   * 获取转账数据
   * @param amount
   * @param to
   * @returns
   */
  const fetchTransferData = async (amount: any, to: string) => {
    try {
      const connection = new Connection(
        `https://solana-mainnet.g.alchemy.com/v2/${
          import.meta.env.VITE__ALCHEMY_API_KEY
        }`,
        "confirmed"
      );
      //生成转账指令
      const instruction = SystemProgram.transfer({
        fromPubkey: new PublicKey(address), //转出账户公钥
        toPubkey: new PublicKey(to), //转入账号公钥
        lamports: amount, //数量（10亿lamports = 1SOL）
      });

      //获取最近区块信息，交易里面需要
      const { blockhash } = await connection.getLatestBlockhash();
      const messageV0 = new TransactionMessage({
        payerKey: new PublicKey(address), //付gas费账户公钥
        recentBlockhash: blockhash,
        instructions: [instruction], //把指令添加到指令数组
      }).compileToV0Message();

      //生成交易
      const transferTransaction = new VersionedTransaction(messageV0);
      console.log(313, transferTransaction);
      return transferTransaction;
    } catch (error) {
      console.log(314, error);
      return null;
    }
  };

  // 辅助函数 - 创建Ed25519验证指令
  function createEd25519Instruction(
    pubkey: PublicKey,
    message: Buffer,
    signature: Uint8Array
  ): TransactionInstruction {
    // 创建Ed25519程序验证指令
    return Ed25519Program.createInstructionWithPublicKey({
      publicKey: pubkey.toBytes(),
      message: message,
      signature: signature,
    });
  }

  /**
   * 投票
   * @param params
   * @returns
   */
  const solanaPlaceVote = async (params: SolanaVotePlaceProps) => {
    try {
      const program: any = programRef.current;
      const [marketStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("market_state")],
        program?.programId
      );

      // 创建Ed25519验证指令
      const ed25519Ix = createEd25519Instruction(
        new PublicKey(params.signer),
        params.message,
        params.signature
      );

      // 创建投票指令
      const voteIx = await program.methods
        .placeVote(
          params.voteId,
          params.tokenAmount,
          params.expireTimestamp,
          params.signature
        )
        .accounts({
          marketState: marketStatePda,
          voter: new PublicKey(address),
          systemProgram: SystemProgram.programId,
          instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
        } as any)
        .instruction();

      const { blockhash } = await connection.getLatestBlockhash("confirmed");

      const messageV0 = new TransactionMessage({
        payerKey: new PublicKey(address),
        recentBlockhash: blockhash,
        instructions: [ed25519Ix, voteIx],
      }).compileToV0Message();

      const transaction = new VersionedTransaction(messageV0);

      const tx = await sendTransaction(transaction);
      return tx;
    } catch (error) {
      console.log(315, error);
      return null;
    }
  };

  /**
   * 领取投票
   * @param params
   * @returns
   */
  const solanaWithdrawVote = async (params: SolanaWithdrawVoteProps) => {
    try {
      const program: any = programRef.current;
      const [marketStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("market_state")],
        program?.programId
      );
      // 创建claim info PDA
      const [claimInfoPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("claim_info"), Buffer.from(params.claimId)],
        program?.programId
      );
      // 创建Ed25519验证指令
      const ed25519Ix = createEd25519Instruction(
        new PublicKey(params.signer),
        params.message,
        params.signature
      );

      // 创建提款指令
      const withdrawIx = await program.methods
        .withdraw(
          params.claimId,
          params.tokenAmount,
          params.expireTimestamp,
          params.signature
        )
        .accounts({
          marketState: marketStatePda,
          claimInfo: claimInfoPda,
          claimer: new PublicKey(address),
          systemProgram: SystemProgram.programId,
          instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
        } as any)
        .instruction();

      // 创建包含两个指令的交易
      const { blockhash } = await connection.getLatestBlockhash("confirmed");

      const messageV0 = new TransactionMessage({
        payerKey: new PublicKey(address),
        recentBlockhash: blockhash,
        instructions: [ed25519Ix, withdrawIx],
      }).compileToV0Message();

      const transaction = new VersionedTransaction(messageV0);

      const tx = await sendTransaction(transaction);
      return tx;
    } catch (error) {
      console.log(315, error);
      throw error;
    }
  };

  /**
   * 发送交易
   * @param transaction
   * @returns
   */
  const sendTransaction = async (transaction: any) => {
    if (typeof window === "undefined") {
      return null;
    }
    const walletType = useUserStore.getState().walletType;
    try {
      let solanaProvider;
      if (walletType === WalletType.phantom) {
        solanaProvider = window?.phantom?.solana;
      } else {
        solanaProvider = window?.okxwallet?.solana;
      }
      const signedTransaction = await solanaProvider.signTransaction(
        transaction
      );
      const tx = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );
      // const tx: any = await solanaProvider.signAndSendTransaction(transaction);
      return tx;
    } catch (error) {
      console.log(334, error);
      return null;
    }
  };

  return {
    getSolBalance,
    getTokenBalance,
    sendTransaction,
    fetchTransferData,
    fetchTokenTransferData,
    fetchTransferWithMemoData,
    solanaPlaceVote,
    solanaWithdrawVote,
  };
};

export default useSolanaTransaction;
