import {useState} from "react";

function ApproveLetter ({state}){
  
  const [id,setId]=useState("");
  
  // Define the allowed account address here
  const allowedAccount = "0x..."; // Replace with actual allowed account address

  const handleApprove=async()=>{

try{
const account = await state.signer.getAddress();
console.log(account)
if (account !== allowedAccount){
  alert("you are not allowed to approve recommendation")
  return;
}
  await state.contract.approveRecommendation(id);
  alert("Recommendation approved successfully!");

}catch(error){

  console.error(error);
  alert("Error approving Recommendation");

}
  }
  return (
    <div data-testid="approve-letter">
      ApproveLetter Component
      <h2 className="result-title">✅ Approve Letter of Recommendation</h2>
      
      <div className="form-group">
        <label className="form-label" htmlFor="approve-recommendation-id">Recommendation ID</label>
        <input 
          id="approve-recommendation-id"
          type="text" 
          className="form-input"
          placeholder="Enter recommendation ID to approve" 
          value={id} 
          onChange={(e)=>setId(e.target.value)} 
        />
      </div>
      
      <button className="btn btn-success" onClick={handleApprove}>
        Approve Recommendation
      </button>
      
      <div style={{marginTop: '20px', padding: '15px', backgroundColor: '#f7fafc', borderRadius: '12px'}}>
        <p style={{margin: '0 0 10px 0', fontWeight: '600', color: '#4a5568'}}>
          👨‍🏫 Administrator Access Required
        </p>
        <p style={{margin: '0', fontSize: '0.9rem', color: '#718096'}}>
          Only authorized accounts can approve recommendations
        </p>
      </div>
    </div>
  );
}


export default ApproveLetter;
