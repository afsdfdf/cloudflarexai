export function EthereumProtectionScript() {
  // 这个脚本在页面加载时最早执行，保护window.ethereum免受后续修改
  const script = `
    (function() {
      try {
        // 保存原始的ethereum对象
        var originalEthereum = window.ethereum;
        
        // 创建一个默认的存根对象（如果ethereum不存在）
        if (!originalEthereum) {
          originalEthereum = {
            isPhantom: false,
            isCoinbaseWallet: false,
            isMetaMask: false,
            _isStub: true,
            request: function() { return Promise.reject('Ethereum provider not initialized'); }
          };
        }

        // 防止修改ethereum对象
        Object.defineProperty(window, 'ethereum', {
          configurable: false,
          enumerable: true,
          get: function() { return originalEthereum; },
          set: function() { return originalEthereum; }
        });

        // 捕获并忽略ethereum相关错误
        window.addEventListener('error', function(e) {
          if (e && e.message && (
            e.message.includes('ethereum') || 
            e.message.includes('Cannot redefine property')
          )) {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
          return true;
        }, true);

        // 捕获未处理的Promise拒绝
        window.addEventListener('unhandledrejection', function(e) {
          try {
            var errorMsg = String(e.reason || '');
            if (
              errorMsg.includes('ethereum') || 
              errorMsg.includes('Cannot redefine property') ||
              errorMsg.includes('[object Object]')
            ) {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }
          } catch (err) {}
          return true;
        }, true);

        // 不再使用console.log，避免潜在问题
      } catch(e) {
        // 忽略任何错误
      }
    })();
  `;

  return (
    <script 
      id="ethereum-protection-script" 
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
} 