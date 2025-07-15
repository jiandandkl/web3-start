import {
  Connection,
  Transaction,
  PublicKey,
  TransactionInstruction,
  SystemProgram,
} from "@solana/web3.js";
import { SOLANA_VOTE_ADDR } from "@/contracts/address";
import { CHAIN } from "@/constants/chains";
import { AccountLayout, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useWalletStore } from "@/store/wallet";

const getSolanaAccount = async () => {
  const provider = window.okxwallet.solana;
  const resp = await provider.connect();
  return resp.publicKey.toString();
};

/**
 * 获取 Solana 余额
 * @param address 地址
 * @returns 余额
 */
const getSolBalance = async (address: string) => {
  const chain = useWalletStore.getState().chain;
  console.log(26, chain);

  const connection = new Connection(chain.rpcUrls, "confirmed");
  const walletAddress = new PublicKey(address);
  return await connection.getBalance(walletAddress);
};

async function getSolanaTokenBalance(
  publicKey: string,
  tokenAddress: string,
  decimals: number
): Promise<number> {
  const connection = new Connection(CHAIN.SOLANA.rpcUrls, "confirmed");
  const tokenAccounts = await connection.getTokenAccountsByOwner(
    new PublicKey(publicKey),
    {
      programId: TOKEN_PROGRAM_ID,
    }
  );
  let tokenBalance = 0;
  tokenAccounts.value.forEach((tokenAccount) => {
    const accountData = AccountLayout.decode(tokenAccount.account.data);

    if (accountData.mint.toString() === tokenAddress) {
      tokenBalance =
        Number(
          (BigInt(accountData.amount) * BigInt(100)) /
            BigInt(Math.pow(10, decimals || 0))
        ) / 100;
    }
  });
  return tokenBalance;
}

const solanaTranction = async (
  amount: bigint, // 数量
  memo: string, // 备注
  fromAddress: string, // 发送地址
  toAddress: string = SOLANA_VOTE_ADDR, // 接收地址
  walletType: string = "okx"
) => {
  // todo要先切到 Solana 网络
  let provider;
  if (walletType === "phantom") {
    provider = window.phantom.solana;
  } else {
    provider = window.okxwallet.solana;
  }
  const connection = new Connection(CHAIN.SOLANA.rpcUrls, "confirmed");

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: new PublicKey(fromAddress),
      toPubkey: new PublicKey(toAddress),
      lamports: amount,
    })
  );

  transaction.add(
    new TransactionInstruction({
      keys: [
        {
          pubkey: new PublicKey(fromAddress),
          isSigner: true,
          isWritable: true,
        },
      ],
      data: Buffer.from(memo, "utf-8"),
      programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
    })
  );

  // 获取最新的 blockhash
  const { blockhash } = await connection.getLatestBlockhash();

  transaction.recentBlockhash = blockhash;
  transaction.feePayer = new PublicKey(fromAddress);

  // 使用 OKX 钱包签名并发送交易
  // const { signature } = await provider.signAndSendTransaction(transaction);
  const signedTransaction = await provider.signTransaction(transaction);
  const signature = await connection.sendRawTransaction(
    signedTransaction.serialize()
  );

  console.log("Transaction sent with signature:", signature);
};

export {
  getSolanaAccount,
  solanaTranction,
  getSolBalance,
  getSolanaTokenBalance,
};
