function UploadBox({ onUpload }) {
  return (
    <div>
      <input type="file" onChange={(e) => onUpload(e.target.files[0])} />
      <button>Analyze</button>
    </div>
  );
}

export default UploadBox;
