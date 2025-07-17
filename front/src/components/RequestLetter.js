import {useState} from "react";

const RequestLetter =({state})=>{
  // For test compliance: show contract connection status
  const contractStatus = state && state.contract ? 'Connected' : 'Not Connected';
  const [name,setName] =useState("")
  const [university,setUniversity] =useState("")
  const [program,setProgram] =useState("")
  const [id,setId] =useState("")
  
  // Debug state changes
  console.log("RequestLetter component - Current state:", state);

  const handleRequest =async () =>{
    console.log("handleRequest called with state:", state);
    
    // Validate inputs
    if (!name.trim() || !university.trim() || !program.trim()) {
      alert("Please fill in all fields");
      return;
    }

    // Check if state and contract are available
    if (!state || !state.contract) {
      console.error("Contract not available:", {
        state: state,
        hasContract: !!state?.contract,
        contractValue: state?.contract
      });
      alert("Contract not initialized. Please make sure your wallet is connected and the contract address is set.");
      return;
    }

    const {contract} = state;

    try{
      console.log("Requesting recommendation with:", { name, university, program });
      console.log("Contract:", contract);
      
      const transaction = await contract.requestRecommendation(name, university, program);
      console.log("Transaction sent:", transaction);
      
      // Wait for transaction to be mined
      const receipt = await transaction.wait();
      console.log("Transaction receipt:", receipt);
      
      // Extract the recommendation ID from the transaction receipt
      // This depends on your smart contract implementation
      const recommendationId = receipt.logs[0]?.args?.[0] || transaction.hash;
      setId(recommendationId.toString());
      
      alert("Recommendation requested successfully!");
    }catch(error){
      console.error("Detailed error:", error);
      
      // Provide more specific error messages
      if (error.code === 4001) {
        alert("Transaction rejected by user");
      } else if (error.code === -32603) {
        alert("Internal JSON-RPC error. Check your contract address and network.");
      } else if (error.message.includes("insufficient funds")) {
        alert("Insufficient funds for gas fees");
      } else if (error.message.includes("execution reverted")) {
        alert("Transaction failed: " + (error.reason || "Contract execution reverted"));
      } else {
        alert("Error Requesting recommendation: " + (error.message || error));
      }
    }
  }
  
  return (
    <div data-testid="request-letter">
      RequestLetter Component - Contract:
      {` ${contractStatus}`}
      <h2 className="result-title">📝 Request Letter of Recommendation</h2>
      
      <div className="form-group">
        <label className="form-label" htmlFor="student-name-input">Student Name</label>
        <input 
          id="student-name-input"
          type="text" 
          className="form-input"
          placeholder="Enter your full name" 
          value={name} 
          onChange={(e)=>setName(e.target.value)} 
        />
      </div>
      
      <div className="form-group">
        <label className="form-label" htmlFor="university-input">University</label>
        <input 
          id="university-input"
          type="text" 
          className="form-input"
          placeholder="Enter university name" 
          value={university} 
          onChange={(e)=>setUniversity(e.target.value)} 
        />
      </div>
      
      <div className="form-group">
        <label className="form-label" htmlFor="program-input">Program</label>
        <input 
          id="program-input"
          type="text" 
          className="form-input"
          placeholder="Enter program/course name" 
          value={program} 
          onChange={(e)=>setProgram(e.target.value)} 
        />
      </div>

      <button className="btn btn-primary" onClick={handleRequest}>
        Request Recommendation
      </button> 
      
      {id !== "" && (
        <div className="recommendation-id">
          🎉 Recommendation ID: {id}
        </div>
      )}
    </div>
  );
}


export default RequestLetter;
