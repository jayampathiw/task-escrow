import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { ethers } from "ethers";
import TaskEscrowABI from "../contracts/TaskEscrow.json";

interface Web3ContextType {
  account: string | null;
  provider:
    | ethers.providers.Web3Provider
    | ethers.providers.JsonRpcProvider
    | null;
  signer: ethers.Signer | null;
  contract: ethers.Contract | null;
  connectWallet: () => Promise<void>;
  isConnected: boolean;
  chainId: number | null;
  loading: boolean;
  error: string | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

interface Web3ProviderProps {
  children: ReactNode;
}

// Extending the window to add ethereum property
interface EthereumWindow extends Window {
  ethereum?: any;
}

declare const window: EthereumWindow;

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const contractAddress = "0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab";

  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        if (window.ethereum) {
          const web3Provider = new ethers.providers.Web3Provider(
            window.ethereum,
            "any"
          );
          setProvider(web3Provider);

          // Get network
          const network = await web3Provider.getNetwork();
          setChainId(network.chainId);

          // Initialize contract
          const taskEscrowContract = new ethers.Contract(
            contractAddress,
            TaskEscrowABI.abi,
            web3Provider
          );
          setContract(taskEscrowContract);

          // Check if already connected
          const accounts = await web3Provider.listAccounts();
          if (accounts.length > 0) {
            const signerInstance = web3Provider.getSigner();
            setAccount(accounts[0]);
            setSigner(signerInstance);
            setIsConnected(true);
          }

          // Setup event listeners
          window.ethereum.on("accountsChanged", handleAccountsChanged);
          window.ethereum.on("chainChanged", handleChainChanged);
        } else {
          setError(
            "MetaMask is not installed. Please install MetaMask to use this application."
          );
        }
      } catch (err) {
        console.error("Error initializing web3", err);
        setError(
          "Failed to initialize web3. Please refresh the page and try again."
        );
      } finally {
        setLoading(false);
      }
    };

    initializeWeb3();

    return () => {
      // Remove event listeners on cleanup
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User has disconnected all accounts
      setAccount(null);
      setSigner(null);
      setIsConnected(false);
    } else {
      setAccount(accounts[0]);
      if (provider) {
        const signerInstance = provider.getSigner();
        setSigner(signerInstance);
        setIsConnected(true);
      }
    }
  };

  const handleChainChanged = (chainIdHex: string) => {
    window.location.reload();
  };

  const connectWallet = async () => {
    if (!provider) {
      setError("Web3 provider not initialized.");
      return;
    }

    try {
      setLoading(true);
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await web3Provider.listAccounts();
      const signerInstance = web3Provider.getSigner();

      setAccount(accounts[0]);
      setSigner(signerInstance);
      setIsConnected(true);
      setLoading(false);
    } catch (err) {
      console.error("Error connecting wallet", err);
      setError("Failed to connect wallet. Please try again.");
      setLoading(false);
    }
  };

  const value = {
    account,
    provider,
    signer,
    contract,
    connectWallet,
    isConnected,
    chainId,
    loading,
    error,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};
