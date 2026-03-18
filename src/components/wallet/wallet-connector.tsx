'use client';

import { useState } from 'react';

interface WalletConnectorProps {
  walletName?: string;
  publicKey?: string;
  isConnected?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onManage?: () => void;
}

export function WalletConnector({
  walletName = 'Phantom Wallet',
  publicKey = '7xkx...Zq1f9',
  isConnected = true,
  onConnect,
  onDisconnect,
  onManage,
}: WalletConnectorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 rounded-xl bg-[#16162a] border border-purple-500/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Phantom Logo placeholder */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-white">{walletName}</p>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`} />
              <span className="text-xs text-gray-400">
                {isConnected ? 'CONNECTED' : 'NOT CONNECTED'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {isConnected && (
        <>
          {/* Public Key */}
          <div className="mb-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Public Key</p>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[#252540]">
              <code className="flex-1 text-sm font-mono text-gray-300">{publicKey}</code>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-md hover:bg-purple-500/20 text-gray-400 hover:text-white transition-colors"
              >
                {copied ? (
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onManage}
              className="flex-1 py-2 rounded-lg bg-[#252540] text-gray-300 text-sm font-medium hover:bg-purple-500/20 hover:text-white transition-colors"
            >
              Manage
            </button>
            <button
              onClick={onDisconnect}
              className="flex-1 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </>
      )}

      {!isConnected && (
        <button
          onClick={onConnect}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:opacity-90 transition-opacity"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
