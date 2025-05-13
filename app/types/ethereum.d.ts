import { InjectedProviderFlags } from './wallet-types';

// 为window对象添加ethereum属性
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      isPhantom?: boolean;
      _isStub?: boolean;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      request: <T = any>(args: { 
        method: string; 
        params?: any | {
          type: string;
          options: {
            address: string;
            symbol: string;
            decimals: number;
            image?: string;
          }
        }
      }) => Promise<T>;
      // 其他可能的属性
      selectedAddress?: string;
      chainId?: string;
      networkVersion?: string;
      isConnected?: () => boolean;
      providers?: any[];
    };
  }
} 