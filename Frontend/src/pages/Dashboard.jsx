import React, { useState, useEffect } from "react";

/* 🔹 Bootstrap */
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Alert,
  ProgressBar,
  Form,
  Spinner,
  Toast,
  ToastContainer,
} from "react-bootstrap";

/* 🔹 Charts */
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

/* 🔹 CSV */
import { CSVLink } from "react-csv";

/* 🔹 Map */
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

/* 🔹 Leaflet icons */
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/* 🔥 Register chart.js */
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

/* 🔧 Fix leaflet marker icon */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const Dashboard = () => {
  const [roads, setRoads] = useState([
    { id: 1, name: "NH-16 Kolkata", status: "Clear", condition: 92, lat: 22.6, lng: 88.4 },
    { id: 2, name: "Sector-V Salt Lake", status: "Moderate Traffic", condition: 65, lat: 22.58, lng: 88.42 },
    { id: 3, name: "Howrah Bridge", status: "Heavy Traffic", condition: 38, lat: 22.585, lng: 88.346 },
  ]);

  const [alerts] = useState([
    { id: 1, type: "warning", message: "Road maintenance near Sector-V." },
    { id: 2, type: "danger", message: "Accident on Howrah Bridge." },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoading(true);
      setTimeout(() => {
        setRoads((prev) =>
          prev.map((r) => ({
            ...r,
            condition: Math.min(
              100,
              Math.max(0, r.condition + Math.floor(Math.random() * 10 - 5))
            ),
          }))
        );
        setShowToast(true);
        setLoading(false);
      }, 800);
    }, 25000);

    return () => clearInterval(interval);
  }, []);

  const statusColor = (status) =>
    status === "Clear"
      ? "success"
      : status === "Moderate Traffic"
      ? "warning"
      : "danger";

  const filteredRoads = roads.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterStatus === "All" || r.status === filterStatus)
  );

  const chartData = {
    labels: roads.map((r) => r.name),
    datasets: [
      {
        data: roads.map((r) => r.condition),
        backgroundColor: "rgba(59,130,246,0.7)",
      },
    ],
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4 text-center">
        <Col>
          <h2 className="fw-bold">Smart City Road Monitoring</h2>
          <p className="text-muted">AI-assisted infrastructure dashboard</p>
          <CSVLink
            data={roads}
            filename="road_conditions.csv"
            className="btn btn-outline-secondary btn-sm"
          >
            Export CSV
          </CSVLink>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>Active Alerts</Card.Header>
            <Card.Body>
              {alerts.map((a) => (
                <Alert key={a.id} variant={a.type}>
                  {a.message}
                </Alert>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>Condition Trends</Card.Header>
            <Card.Body style={{ height: 300 }}>
              <Bar data={chartData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>Road Conditions</Card.Header>
            <Card.Body>
              <Form.Control
                placeholder="Search road..."
                className="mb-2"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Form.Select
                className="mb-3"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option>All</option>
                <option>Clear</option>
                <option>Moderate Traffic</option>
                <option>Heavy Traffic</option>
              </Form.Select>

              {loading ? (
                <Spinner />
              ) : (
                filteredRoads.map((road) => (
                  <div key={road.id} className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>{road.name}</span>
                      <Badge bg={statusColor(road.status)}>
                        {road.status}
                      </Badge>
                    </div>
                    <ProgressBar now={road.condition} label={`${road.condition}%`} />
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>Live City Map</Card.Header>
            <Card.Body style={{ padding: 0 }}>
              <MapContainer
                center={[22.5726, 88.3639]}
                zoom={12}
                style={{ height: 350 }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {roads.map((road) => (
                  <Marker key={road.id} position={[road.lat, road.lng]}>
                    <Popup>
                      <strong>{road.name}</strong>
                      <br />
                      {road.status} – {road.condition}%
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <ToastContainer position="top-end">
        <Toast show={showToast} autohide delay={2500} onClose={() => setShowToast(false)}>
          <Toast.Body>Road data updated</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default Dashboard;
