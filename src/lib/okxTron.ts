import { parseUnits } from 'viem';
import TronWeb from 'tronweb';
import { ERC20_CONTRACT, TRON_VOTE_ADDR } from '@/contracts/address';
const getTronAccount = async () => {
  await window.okxwallet.tronLink.request({
    method: 'tron_requestAccounts',
  });
  if (window.okxwallet.tronLink.ready) {
    const tronWeb = window.okxwallet.tronLink.tronWeb;
    return tronWeb.defaultAddress.base58;
  }
};

/**
 * 获取 TRX 余额
 * @param address 地址
 * @returns 余额
 */
const getTrxBalance = async (address: string): Promise<bigint> => {
  const tronWeb = new TronWeb({
    fullHost: 'https://api.trongrid.io',
  });
  tronWeb.setAddress(address);
  return await tronWeb.trx.getBalance(address);
};

const getTronTokenBalance = async (
  address: string,
  tokenAddress: string,
  decimals: number,
): Promise<number> => {
  if (window.okxwallet.tronLink.ready) {
    const tronWeb = window.okxwallet.tronLink.tronWeb;
    try {
      const contract = tronWeb.contract(ERC20_CONTRACT.abi, tokenAddress);
      const balance = await contract.balanceOf(address).call();

      return Number(balance.toString()) / Math.pow(10, decimals);
    } catch (error) {
      console.error('Error getting SunDog balance:', error);
      return 0;
    }
  } else {
    console.error('TronLink is not ready');
    return 0;
  }
};

const tronTranction = async (
  amount: string,
  fromAddress: string,
  memo: string,
) => {
  const tronWeb = window.okxwallet.tronLink.tronWeb;

  console.log(20, typeof tronWeb.toHex(memo));

  const tx = await tronWeb.transactionBuilder.sendTrx(
    TRON_VOTE_ADDR,
    parseUnits(amount, 6),
    fromAddress,
    memo,
  ); // Step1
  const signedTx = await tronWeb.trx.sign(tx); // Step2
  await tronWeb.trx.sendRawTransaction(signedTx); // Step3

  // const tokenContractAddress = SUNDOG_ADDR; // SunDog token 的合约地址
  // try {
  // 	// 构建交易
  // 	const transaction = await tronWeb.transactionBuilder.triggerSmartContract(
  // 		tokenContractAddress,
  // 		'transfer(address,uint256)',
  // 		{},
  // 		[
  // 			{ type: 'address', value: toAddress },
  // 			{ type: 'uint256', value: parseUnits(amount, 18) },
  // 		],
  // 		// { feeLimit: 100000000, callValue: 0, shouldPollResponse: false },
  // 		fromAddress,
  // 	);
  // 	console.log(30, transaction);

  // 	// 签名交易
  // 	const signedTransaction = await tronWeb.trx.sign(transaction.transaction);
  // 	console.log(34, signedTransaction);

  // 	// 广播交易
  // 	const result = await tronWeb.trx.sendRawTransaction(signedTransaction);

  // 	console.log('Transaction sent successfully:', result);
  // } catch (error) {
  // 	console.error('Error sending token:', error);
  // }
};

export { getTronAccount, tronTranction, getTrxBalance, getTronTokenBalance };
