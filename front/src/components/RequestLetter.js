
import { useState } from "react";

const RequestLetter = ({ state }) => {
  // Show contract connection status
  const contractStatus = state && state.contract ? "Connected" : "Not Connected";
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [email, setEmail] = useState("");
  const [id, setId] = useState("");

  // Debug state changes
  console.log("RequestLetter component - Current state:", state);

  const handleRequest = async () => {
    if (!name.trim() || !course.trim() || !email.trim()) {
      alert("Please fill in all fields");
      return;
    }
    if (!state || !state.contract) {
      alert("Contract not initialized. Please make sure your wallet is connected and the contract address is set.");
      return;
    }
    const { contract } = state;
    try {
      // Add student
      const txAdd = await contract.addStudent(name, course, email);
      await txAdd.wait();
      // Get new studentId (assuming studentCount is a public variable)
      const studentCount = await contract.studentCount();
      const studentId = studentCount - 1;
      // Request recommendation for studentId
      const txReq = await contract.requestRecommendation(studentId);
      await txReq.wait();
      setId(studentId.toString());
      alert("Recommendation requested successfully!");
    } catch (error) {
      if (error.code === 4001) {
        alert("Transaction rejected by user");
      } else if (error.code === -32603) {
        alert("Internal JSON-RPC error. Check your contract address and network.");
      } else if (error.message && error.message.includes("insufficient funds")) {
        alert("Insufficient funds for gas fees");
      } else if (error.message && error.message.includes("execution reverted")) {
        alert("Transaction failed: " + (error.reason || "Contract execution reverted"));
      } else {
        alert("Error requesting recommendation: " + (error.message || error));
      }
    }
  };

  return (
    <div className="request-letter-container">
      <div style={{ marginBottom: "8px" }}>
        <strong>Contract Status:</strong> {contractStatus}
      </div>
      <h2 className="result-title">📝 Request Letter of Recommendation</h2>
      <div className="form-group">
        <label className="form-label" htmlFor="student-name-input">Student Name</label>
        <input
          id="student-name-input"
          type="text"
          className="form-input"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="course-input">Course</label>
        <input
          id="course-input"
          type="text"
          className="form-input"
          placeholder="Enter course name"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="email-input">Email</label>
        <input
          id="email-input"
          type="email"
          className="form-input"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button className="btn btn-primary" onClick={handleRequest}>
        Request Recommendation
      </button>
      {id !== "" && (
        <div className="recommendation-id" style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px" }}>
          🎉 Recommendation ID: {id}
          <button
            title="Copy ID"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontSize: "1.2em"
            }}
            onClick={() => {
              navigator.clipboard.writeText(id);
              alert("Recommendation ID copied to clipboard!");
            }}
            aria-label="Copy Recommendation ID"
          >
            📋
          </button>
        </div>
      )}
    </div>
  );
};

export default RequestLetter;
