import React, {  useMemo } from "react";
import './bufferFill'
import {
  ConnectionProvider,
  WalletProvider,
} from "wallet-adapter-react-xnft";
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
  PhantomWalletAdapter,
} from "@solana/wallet-adapter-phantom";

export const DEFAULT_ENDPOINT =
  "https://rpc.helius.xyz/?api-key=6b1ccd35-ba2d-472a-8f54-9ac2c3c40b8b" || "https://solana-mainnet.g.alchemy.com/v2/WM_Gl7ktiws7icLQVxLP5iVHNQTv8RNk";

  const network = 'mainnet-beta'

// Default styles that can be overridden by your app

export const Wallet = ({ children }) => {
  const endpoint = window.xnft?.connection.rpcEndpoint;

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
  // Only the wallets you configure here will be compiled into your application, and only the dependencies
  // of wallets that your users connect to will be loaded
  // Only the wallets you configure here will be compiled into your application
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
     
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect ><WalletModalProvider>
        {children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
