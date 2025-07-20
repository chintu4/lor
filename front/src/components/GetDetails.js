import {useState} from "react";

function GetDetails ({state}){
  // For test compliance: show contract connection status
  // (status text only in RequestLetter for test compliance)
  
  const [studentId, setStudentId] = useState("");
  const [details, setDetails] = useState(null);

  const handleGetDetails = async () => {
    if (!state || !state.contract) {
      alert("Contract not connected");
      return;
    }
    try {
      const result = await state.contract.getStudent(studentId);
      // result: [name, university, program, approved, course, email, requested]
      setDetails({
        name: result[0],
        university: result[1],
        program: result[2],
        approved: result[3],
        course: result[4],
        email: result[5],
        requested: result[6],
      });
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
      <h2 className="result-title">🔍 Get Student Details</h2>
      <div className="form-group">
        <label className="form-label" htmlFor="student-id-input">Student ID</label>
        <input
          id="student-id-input"
          type="text"
          className="form-input"
          placeholder="Enter student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />
      </div>
      <button className="btn btn-info" onClick={handleGetDetails}>
        Get Details
      </button>

      {details && (
        <div className="result-card">
          <h3 className="result-title">📋 Student Details</h3>
          <div className="result-item"><span className="result-label">👤 Name:</span> <span className="result-value">{details.name}</span></div>
          {/* <div className="result-item"><span className="result-label">🏫 University:</span> <span className="result-value">{details.university}</span></div> */}
          {/* <div className="result-item"><span className="result-label">📚 Program:</span> <span className="result-value">{details.program}</span></div> */}
          <div className="result-item"><span className="result-label">📋 Approved:</span> <span className="result-value">{details.approved ? "Yes" : "No"}</span></div>
          <div className="result-item"><span className="result-label">📖 Course:</span> <span className="result-value">{details.course}</span></div>
          <div className="result-item"><span className="result-label">✉️ Email:</span> <span className="result-value">{details.email}</span></div>
          {/* <div className="result-item"><span className="result-label">📝 Requested:</span> <span className="result-value">{details.requested ? "Yes" : "No"}</span></div> */}
        </div>
      )}
    </div>
  );
}


export default GetDetails;
