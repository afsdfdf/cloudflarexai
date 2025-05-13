/**
 * 钱包提供商标志接口
 */
export interface InjectedProviderFlags {
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isPhantom?: boolean;
  isTrust?: boolean;
  isTokenPocket?: boolean;
  isImToken?: boolean;
}

/**
 * 基础区块链信息
 */
export interface Chain {
  id: string;
  name: string;
  icon?: string;
  rpcUrl: string;
  blockExplorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

/**
 * 钱包连接状态
 */
export interface WalletConnectionState {
  isConnected: boolean;
  account: string | null;
  chainId: string | null;
  balance: string;
  isConnecting: boolean;
  hasWallet: boolean;
}

/**
 * 钱包连接错误
 */
export type WalletError = 
  | 'NO_WALLET'        // 没有检测到钱包
  | 'USER_REJECTED'    // 用户拒绝连接
  | 'UNSUPPORTED_CHAIN' // 不支持的区块链
  | 'UNKNOWN'          // 未知错误 