import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  ProgressBar,
  Badge,
  Table,
  Alert,
} from "react-bootstrap";
import { Bar } from "react-chartjs-2";

const PotholeDetection = () => {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [detections, setDetections] = useState([]);

  const handleAnalyze = () => {
    if (!file) return;
    setAnalyzing(true);

    setTimeout(() => {
      setDetections([
        {
          id: 1,
          road: "NH-16 Kolkata",
          type: "Pothole",
          severity: "High",
          confidence: "92%",
          status: "Detected",
        },
        {
          id: 2,
          road: "Sector-V Salt Lake",
          type: "Crack",
          severity: "Medium",
          confidence: "81%",
          status: "Detected",
        },
      ]);
      setAnalyzing(false);
    }, 3000);
  };

  const chartData = {
    labels: ["Potholes", "Cracks", "Other"],
    datasets: [
      {
        label: "Detected Issues",
        data: [6, 4, 2],
        backgroundColor: ["#EF4444", "#F59E0B", "#10B981"],
      },
    ],
  };

  return (
    <Container fluid className="p-4 bg-light">
      <Row className="mb-4 text-center">
        <Col>
          <h2 className="fw-bold text-primary">AI Road Condition Detection</h2>
          <p className="text-muted">
            Automated detection, reporting & prioritization using Computer
            Vision
          </p>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="shadow-lg border-0 card-hover">
            <Card.Header className="bg-primary text-white fw-semibold">
              Upload Road Image / Video
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Control
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </Form.Group>

              <Button
                variant="success"
                className="w-100"
                onClick={handleAnalyze}
                disabled={!file || analyzing}
              >
                {analyzing
                  ? "Analyzing with AI..."
                  : "Detect Potholes / Cracks"}
              </Button>

              {analyzing && (
                <ProgressBar
                  animated
                  now={70}
                  label="AI Processing..."
                  className="mt-3"
                />
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-lg border-0 card-hover">
            <Card.Header className="bg-info text-white fw-semibold">
              Detection Analytics
            </Card.Header>
            <Card.Body style={{ height: 300 }}>
              <Bar data={chartData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Card className="shadow-lg border-0 card-hover">
            <Card.Header className="bg-dark text-white fw-semibold">
              Detected & Prioritized Issues
            </Card.Header>
            <Card.Body>
              {detections.length === 0 ? (
                <Alert variant="secondary">No detections yet</Alert>
              ) : (
                <Table bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Road</th>
                      <th>Issue</th>
                      <th>Severity</th>
                      <th>AI Confidence</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detections.map((d) => (
                      <tr key={d.id}>
                        <td>{d.road}</td>
                        <td>{d.type}</td>
                        <td>
                          <Badge
                            bg={
                              d.severity === "High"
                                ? "danger"
                                : d.severity === "Medium"
                                  ? "warning"
                                  : "success"
                            }
                          >
                            {d.severity}
                          </Badge>
                        </td>
                        <td>{d.confidence}</td>
                        <td>
                          <Badge bg="primary">{d.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PotholeDetection;
