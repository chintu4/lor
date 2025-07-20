import {useState} from "react";

function GetDetails ({state}){
  // For test compliance: show contract connection status
  // (status text only in RequestLetter for test compliance)
  
  const [id,setId]=useState("");
  const [details,setDetails]=useState(null);
  

const handleGetDetails = async () => {
  if (!state || !state.contract) {
    alert("Contract not connected");
    return;
  }
  try {
    const details = await state.contract.getStudentDetails(id);
    console.log("Here are the Details:", details);
    setDetails(details); // This will show details in your UI
  } catch (err) {
    alert("Error fetching details: " + err.message);
  }
};
 
  // Show a user-friendly message if not connected
  if (!state || !state.contract) {
    return (
      <div data-testid="get-details">
        <div className="not-connected-message">
          <h2 className="result-title">🔍 Get Recommendation Details</h2>
          <div style={{color: '#e53e3e', marginTop: '20px', fontWeight: 500}}>
            Contract not initialized. Please make sure your wallet is connected and the contract address is set.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="get-details">
      <h2 className="result-title">🔍 Get Recommendation Details</h2>
      <div className="form-group">
        <label className="form-label" htmlFor="recommendation-id-input">Recommendation ID</label>
        <input
          id="recommendation-id-input"
          type="text"
          className="form-input"
          placeholder="Enter recommendation ID to view details"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
      </div>
      <button className="btn btn-info" onClick={handleGetDetails}>
        Get Details
      </button>

      {details && (
        <div className="result-card">
          <h3 className="result-title">📋 Recommendation Details</h3>
          <div className="result-item">
            <span className="result-label">👤 Student Name:</span>
            <span className="result-value">{details[0]}</span>
          </div>
          <div className="result-item">
            <span className="result-label">🏫 University:</span>
            <span className="result-value">{details[1]}</span>
          </div>
          <div className="result-item">
            <span className="result-label">📚 Program:</span>
            <span className="result-value">{details[2]}</span>
          </div>
          <div className="result-item">
            <span className="result-label">📋 Status:</span>
            <span className={details[3] ? "status-approved" : "status-pending"}>
              {details[3] ? "✅ Approved" : "⏳ Pending Approval"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}


export default GetDetails;
