import React from "react";
import { useWeb3 } from "../contexts/Web3Context";

const Header: React.FC = () => {
  const { account, connectWallet, isConnected, loading } = useWeb3();

  return (
    <header className="bg-indigo-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Task Escrow</h1>

        <div className="flex items-center space-x-4">
          {isConnected ? (
            <div className="bg-indigo-700 px-4 py-2 rounded-full">
              <span className="font-medium">
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </span>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={loading}
              className="bg-white text-indigo-600 font-medium px-4 py-2 rounded-full hover:bg-indigo-100 transition-colors disabled:opacity-70"
            >
              {loading ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
