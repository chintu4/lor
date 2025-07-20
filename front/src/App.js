import {useState,useEffect} from "react"
import {ethers} from "ethers";
import './App.css';
import RequestLetter from "./components/RequestLetter.js";
import ApproveLetter from "./components/ApproveLetter.js";
import GetDetails from "./components/GetDetails.js";
import abi from "./contracts/LOR.json";

function App() {
  const[state,setState]=useState({
    provider:null,
    signer:null,
    contract:null
  })
  
  const[connectionStatus, setConnectionStatus] = useState("Connecting...");
  const[walletAddress, setWalletAddress] = useState("");
  const[isConnecting, setIsConnecting] = useState(false);
  const[hasTriedConnection, setHasTriedConnection] = useState(false);

  useEffect(()=>{
    const connectWallet = async () => {
      // Prevent multiple simultaneous connection attempts
      if (isConnecting || hasTriedConnection) {
        console.log("[DEBUG] Connection already in progress or completed. isConnecting:", isConnecting, "hasTriedConnection:", hasTriedConnection);
        return;
      }

      console.log("[DEBUG] Starting wallet/contract connection attempt...");
      console.log("[DEBUG] Current state before connection:", state);
      setIsConnecting(true);
      setHasTriedConnection(true);

      const contractAddress = "0x87CD91d9BE41D41341c067359BFf7666f384598E"; // Replace with your actual deployed contract address
      const contractABI = abi.abi; // Use the ABI from the imported JSON file

      setConnectionStatus("Checking contract address...");
      console.log("[DEBUG] Checking contract address:", contractAddress);
      console.log("[DEBUG] ABI loaded:", contractABI);

      // Validate contract address
      if (!contractAddress || contractAddress === "") {
        console.warn("[ERROR] Contract address not set. Please deploy your contract and update the address.");
        setConnectionStatus("❌ Contract address not configured");
        setIsConnecting(false);
        console.log("[DEBUG] Aborting connection due to missing contract address.");
        return;
      }

      console.log("[DEBUG] Using contract address:", contractAddress);
      console.log("[DEBUG] Using contract ABI:", contractABI);
      console.log("[DEBUG] Proceeding to wallet/contract connection...");

      try {
        console.log("[DEBUG] Entering main connection try block.");
        const { ethereum } = window;
        if (!ethereum) {
          console.error("[ERROR] window.ethereum not found. MetaMask not installed.");
          alert("Please install Metamask");
          setConnectionStatus("❌ MetaMask not found");
          setIsConnecting(false);
          console.log("[DEBUG] Aborting connection due to missing MetaMask.");
          return;
        }
        // Always request accounts to match dapp best practices and test expectations
        let accounts;
        console.log("[DEBUG] About to request accounts from MetaMask...");
        try {
          console.log("[DEBUG] Requesting accounts from MetaMask...");
          accounts = await ethereum.request({ method: 'eth_requestAccounts' });
          console.log("[DEBUG] Accounts received:", accounts);
        } catch (accountError) {
          console.error("[ERROR] Failed to request accounts:", accountError);
          if (accountError.code === 4001) {
            alert("Failed to connect wallet: User rejected request");
            setConnectionStatus("❌ User rejected connection");
            setIsConnecting(false);
            console.log("[DEBUG] Aborting connection due to user rejection.");
            return;
          } else if (accountError.message && accountError.message.includes('already pending')) {
            alert("Failed to connect wallet: User rejected request");
            setConnectionStatus("⏳ Connection request already pending");
            setIsConnecting(false);
            console.log("[DEBUG] Aborting connection due to already pending request.");
            return;
          }
          console.log("[DEBUG] Throwing accountError to outer catch.");
          throw accountError;
        }
        // Check if user is on the correct network (optional)
        console.log("[DEBUG] Requesting chainId from MetaMask...");
        const chainId = await ethereum.request({ method: 'eth_chainId' });
        // Log chainId exactly as test expects
        console.log("Current chain ID:", chainId);

        console.log("Connected account:", accounts[0]);
        setWalletAddress(accounts[0]);
        setConnectionStatus("Wallet connected, initializing contract...");
        console.log("[DEBUG] Wallet address set:", accounts[0]);
        console.log("[DEBUG] Connection status:", connectionStatus);

        let provider, signer, contract;
        try {
          console.log("[DEBUG] Creating ethers provider and signer...");
          provider = new ethers.BrowserProvider(window.ethereum);
          signer = await provider.getSigner();
          console.log("[DEBUG] Provider and signer created.");
        } catch (providerError) {
          console.error("[ERROR] Wallet connection error (provider creation):", providerError);
          setConnectionStatus("❌ Connection failed: Provider creation failed");
          setIsConnecting(false);
          alert("Failed to connect wallet: Provider creation failed");
          console.log("[DEBUG] Aborting connection due to provider creation failure.");
          return;
        }

        contract = new ethers.Contract(contractAddress, contractABI, signer);
        console.log("[DEBUG] Contract instance created.");

        // Test contract connection
        try {
          setConnectionStatus("Verifying contract...");
          console.log("[DEBUG] Verifying contract at address:", contractAddress);
          const contractCode = await provider.getCode(contractAddress);
          console.log("[DEBUG] Contract code at address:", contractCode);
          if (contractCode === '0x') {
            console.error("[ERROR] No contract found at the specified address:", contractAddress);
            alert("No contract found at the specified address. Please check your deployment and network.");
            throw new Error("No contract found at the specified address");
          }
          console.log("[DEBUG] Contract successfully connected.");
          setConnectionStatus("✅ Contract connected successfully");
        } catch (contractError) {
          console.error("[ERROR] Contract connection error:", contractError);
          setConnectionStatus("❌ Contract verification failed");
          setIsConnecting(false);
          alert("Failed to connect to contract. Please check the contract address and network.");
          console.log("[DEBUG] Aborting connection due to contract verification failure.");
          return;
        }

        setState({ provider, signer, contract });
        setConnectionStatus("✅ Connected successfully");
        console.log("[DEBUG] State updated with contract:", contract);
        console.log("[DEBUG] Full state:", { provider, signer, contract });

        // Verify state was set correctly
        setTimeout(() => {
          console.log("[DEBUG] State verification after setState:", state);
        }, 100);
      } catch (error) {
        console.error("[ERROR] Wallet connection error (outer catch):", error);
        setConnectionStatus("❌ Connection failed: " + (error && error.message ? error.message : error));
        setIsConnecting(false);
        console.log("[DEBUG] Aborting connection due to outer catch error.");
      } finally {
        setIsConnecting(false);
        console.log("[DEBUG] Connection attempt finished. isConnecting:", isConnecting);
      }
    };
    
    // Only connect if not already connecting or connected
    if (!isConnecting && !state.contract) {
      connectWallet();
    }
  }, [isConnecting, state.contract, connectionStatus, hasTriedConnection, state]);
  
  // Manual retry function for when connection fails
  const retryConnection = async () => {
    setIsConnecting(false);
    setHasTriedConnection(false);
    setConnectionStatus("Retrying connection...");
    
    // Clear any existing state
    setState({
      provider: null,
      signer: null,
      contract: null
    });
    setWalletAddress("");
  };
  
  return (
    <div className="App">
      <div className="app-container">
        <div className="app-header">
          <h1 className="app-title">Letter of Recommendation System</h1>
          <p className="app-subtitle">Blockchain-powered academic recommendation management</p>
          
          {/* Connection Status Display */}
          <div style={{
            marginTop: '20px', 
            padding: '15px', 
            backgroundColor: connectionStatus.includes('✅') ? '#c6f6d5' : 
                           connectionStatus.includes('❌') ? '#fed7d7' : 
                           connectionStatus.includes('⏳') ? '#fef5e7' : '#e6fffa',
            borderRadius: '12px',
            border: `2px solid ${connectionStatus.includes('✅') ? '#68d391' : 
                                connectionStatus.includes('❌') ? '#fc8181' : 
                                connectionStatus.includes('⏳') ? '#f6ad55' : '#81e6d9'}`
          }}>
            <p style={{margin: '0 0 5px 0', fontWeight: '600'}}>🔗 Connection Status:</p>
            <p style={{margin: '0', fontSize: '0.9rem'}}>{connectionStatus}</p>
            {walletAddress && (
              <p style={{margin: '5px 0 0 0', fontSize: '0.8rem', color: '#4a5568'}}>
                Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </p>
            )}
            
            {/* Retry button for failed connections */}
            {(connectionStatus.includes('❌') || connectionStatus.includes('⏳')) && (
              <button 
                onClick={retryConnection}
                disabled={isConnecting}
                style={{
                  marginTop: '10px',
                  padding: '8px 16px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isConnecting ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  opacity: isConnecting ? 0.6 : 1
                }}
              >
                {isConnecting ? 'Connecting...' : 'Retry Connection'}
              </button>
            )}
          </div>
        </div>
        
        <div className="components-grid">
          <div className="component-card">
            <RequestLetter state={state}/>
          </div>
          
          <div className="component-card">
            <ApproveLetter state={state}/>
          </div>
          
          <div className="component-card">
            <GetDetails state={state}/>
          </div>
        </div>
      </div>
    </div>    
  );
}

export default App;
