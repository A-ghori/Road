const Result = () => {
  return (
    <div className="container mt-5">
      <div className="glass p-4 shadow">
        <h3 className="fw-bold mb-3">AI Analysis Result</h3>

        <p>
          🚨 <strong>Road Condition:</strong> Severe Damage Detected
        </p>

        <p>
          🧠 <strong>AI Explanation:</strong>  
          The uploaded image shows visible cracks and potholes which
          can cause accidents during rainfall. Immediate repair is
          recommended.
        </p>

        <p>
          📍 <strong>Priority:</strong> High  
        </p>

        <button className="btn btn-success mt-3">
          Send to Authority
        </button>
      </div>
    </div>
  );
};

export default Result;
