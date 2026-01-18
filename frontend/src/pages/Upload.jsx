import React, { useState } from 'react';
import { Container, Card, Button, Form, ProgressBar, Alert } from 'react-bootstrap';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setError('');

    // Simulate upload with progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          alert('Analysis complete! (Backend integration pending)');
          return 100;
        }
        return prev + 20;
      });
    }, 500);

    // Simulate error handling
    setTimeout(() => {
      if (Math.random() > 0.8) {
        setError('Upload failed. Please try again.');
        setUploading(false);
        clearInterval(interval);
      }
    }, 2000);
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card className="shadow-lg border-0 p-4 glass card-hover" style={{ width: '420px' }}>
        <h5 className="fw-bold text-center mb-2">Upload Road Image</h5>
        <p className="text-muted text-center small">AI will detect potholes & road damage</p>

        <Form.Group className="mb-3">
          <Form.Control
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            aria-label="Select road image file"
          />
        </Form.Group>

        {uploading && <ProgressBar now={progress} label={`${progress}%`} className="mb-3" />}
        {error && <Alert variant="danger">{error}</Alert>}

        <Button
          className="w-100"
          disabled={!file || uploading}
          onClick={handleUpload}
          aria-label="Upload and analyze image"
        >
          {uploading ? 'Analyzing...' : 'Analyze Road'}
        </Button>
      </Card>
    </Container>
  );
};

export default Upload;