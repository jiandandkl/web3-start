import { CHAIN } from "@/constants/chains";

/**
 * 格式化数字 todo 是否删除
 * @param numStr 数字字符串
 * @param decimal 小数位数
 * @returns
 */
export const formatNumber = (
  numStr: string | undefined,
  decimal: number = 4
): string => {
  if (!numStr) return "0";

  const num = parseFloat(numStr);

  // 处理非数字情况
  if (isNaN(num)) return "0";

  // 处理0
  if (num === 0) return "0";

  // 处理极小数值
  // const minValue = 1 / Math.pow(10, decimal);
  // if (num > 0 && num < minValue && decimal !== 2) {
  //   return `<${minValue}`;
  // }

  if (Math.abs(num) < 1) {
    const str = num.toFixed(20);
    const match = str.match(/^-?0\.0*[1-9]/);

    if (match) {
      const leadingZeros = match[0].length - 3; // 减去 "0." 和第一个非零数字

      if (leadingZeros > 0) {
        // 小数点后有前导零 (0.0..., 0.00...), 使用 0.0{x}YZ 格式
        const firstNonZeroIndex = str.indexOf(match[0].slice(-1));
        const twoDigits = str.substr(firstNonZeroIndex, 2);
        return `0.0{${leadingZeros}}${twoDigits}`;
      } else {
        // 小数点后没有前导零 (0.x...), 保留两位小数
        return parseFloat(num.toFixed(2)).toString();
      }
    } else {
      // 备选逻辑：如果正则没匹配上，也保留两位小数
      return parseFloat(num.toFixed(2)).toString();
    }
  }

  // 大于等于1百万，显示为m
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(decimal)}m`;
  }

  // 大于1000，小于1百万，使用千分位
  if (num >= 1000) {
    // 先处理小数位数
    const fixedNum = parseFloat(num.toFixed(decimal));
    return fixedNum.toLocaleString();
  }

  // 小于1000，处理小数位数后返回，去除末尾的0
  return parseFloat(num.toFixed(decimal)).toString();
};

/**
 * 获取链logo
 * @param chain
 * @returns
 */
export const getChainLogo = (chainType: string) => {
  chainType = (chainType ?? "").toUpperCase();

  if (!CHAIN[chainType]) {
    return CHAIN.SOLANA.logoUrl;
  }

  return CHAIN[chainType].logoUrl;
};

/**
 * 获取链的hash前缀
 * @param chainType
 * @returns
 */
export const getChainHashPrefix = (chainType: string) => {
  chainType = (chainType ?? "").toUpperCase();

  if (!CHAIN[chainType]) {
    return "https://solscan.io/tx/";
  }

  return CHAIN[chainType].hashPrefix;
};

/**
 * 获取链的symbol
 * @param chain
 * @returns
 */
export const getChainSymbol = (chainType: string) => {
  chainType = (chainType ?? "").toUpperCase();

  if (!CHAIN[chainType]) {
    return CHAIN.SOLANA.symbol;
  }

  return CHAIN[chainType].symbol;
};

/**
 * 判断是否为EVM链
 * @param chainType
 * @returns
 */
export const isEvmChain = (chainType: string) => {
  const evmChains = Object.values(CHAIN)
    .filter((chain) => chain.type === "evm")
    .map((chain) => chain.brief);

  return evmChains.includes(chainType);
};

/**
 * 判断是否为Android设备
 * @returns boolean
 */
export const isAndroid = (): boolean => {
  if (typeof window === "undefined") return false;

  const userAgent = window.navigator.userAgent.toLowerCase();
  return /android/.test(userAgent) || /linux/.test(userAgent);
};
