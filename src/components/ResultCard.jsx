function ResultCard({ data }) {
  return (
    <div>
      <h3>Result</h3>
      <p>Potholes: {data?.potholes}</p>
      <p>Severity: {data?.severity}</p>
    </div>
  );
}

export default ResultCard;
