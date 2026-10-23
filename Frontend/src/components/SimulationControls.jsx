
import { useState, useRef, useEffect } from "react";

export default function SimulationControls({
    route,
    realPosition,
    onSimPositionChange,
    onNavigationStateChange,
}) {
    const [isSimulating, setIsSimulating] = useState(false);
    const [message, setMessage] = useState("Simulator ready");

    const simIndexRef = useRef(0);
    const simTimerRef = useRef(null);
    const currentSimPosRef = useRef(null);

    const routeCoords =
        route?.features?.[0]?.geometry?.coordinates;

    const hasRoute =
        Array.isArray(routeCoords) && routeCoords.length >= 2;

    function stopTimer() {
        if (simTimerRef.current) {
            clearInterval(simTimerRef.current);
            simTimerRef.current = null;
        }
    }

    useEffect(() => {
        return () => stopTimer();
    }, []);

    function updatePosition(pos) {
        currentSimPosRef.current = pos;
        onSimPositionChange?.(pos);
    }

    function startSimulation() {
        if (!hasRoute) {
            setMessage("Pehle Find Route dabao; valid route nahi mila.");
            return;
        }

        stopTimer();
        simIndexRef.current = 0;
        setIsSimulating(true);
        onNavigationStateChange?.(true);
        setMessage("Simulation running...");

        const moveNext = () => {
            const index = simIndexRef.current;

            if (index >= routeCoords.length) {
                stopTimer();
                setIsSimulating(false);
                setMessage("Route simulation complete.");
                return;
            }

            const [lng, lat] = routeCoords[index];
            updatePosition([lat, lng]);
            simIndexRef.current += 1;
        };

        moveNext();
        simTimerRef.current = setInterval(moveNext, 800);
    }

    function pauseSimulation() {
        stopTimer();
        setIsSimulating(false);
        setMessage("Simulation paused.");
    }

    function simulateWrongTurn() {
        if (!hasRoute) {
            setMessage("Wrong-road test ke liye pehle route calculate karo.");
            return;
        }

        stopTimer();
        setIsSimulating(false);
        onNavigationStateChange?.(true);

        const basePos =
            currentSimPosRef.current ||
            (simIndexRef.current > 0
                ? [
                      routeCoords[
                          Math.min(
                              simIndexRef.current - 1,
                              routeCoords.length - 1
                          )
                      ][1],
                      routeCoords[
                          Math.min(
                              simIndexRef.current - 1,
                              routeCoords.length - 1
                          )
                      ][0],
                  ]
                : [routeCoords[0][1], routeCoords[0][0]]);

        const wrongPos = [
            basePos[0] + 0.0005,
            basePos[1] + 0.0005,
        ];

        updatePosition(wrongPos);
        setMessage("Wrong-road position set. Checking reroute...");
    }

    function resetSimulation() {
        stopTimer();
        simIndexRef.current = 0;
        setIsSimulating(false);
        currentSimPosRef.current = null;
        onSimPositionChange?.(null);
        onNavigationStateChange?.(false);
        setMessage("Simulator reset.");
    }

    const buttonStyle = {
        padding: "12px 16px",
        border: "none",
        borderRadius: "7px",
        color: "white",
        fontWeight: "bold",
        cursor: "pointer",
        fontSize: "14px",
    };

    return (
        <div
            style={{
                display: "block",
                width: "100%",
                padding: "16px",
                boxSizing: "border-box",
                background: "#ffffff",
                border: "3px solid #2563eb",
                borderRadius: "12px",
                marginTop: "16px",
                position: "relative",
                zIndex: 1000,
            }}
        >
            <h3 style={{ margin: "0 0 12px", color: "#111827" }}>
                Navigation Simulator
            </h3>

            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                }}
            >
                <button
                    type="button"
                    onClick={startSimulation}
                    disabled={isSimulating}
                    style={{
                        ...buttonStyle,
                        background: isSimulating ? "#9ca3af" : "#16a34a",
                    }}
                >
                    ▶ Start Simulate Ride
                </button>

                <button
                    type="button"
                    onClick={pauseSimulation}
                    style={{ ...buttonStyle, background: "#dc2626" }}
                >
                    ⏸ Pause Ride
                </button>

                <button
                    type="button"
                    onClick={simulateWrongTurn}
                    style={{ ...buttonStyle, background: "#7c3aed" }}
                >
                    🔀 Test Wrong Road
                </button>

                <button
                    type="button"
                    onClick={resetSimulation}
                    style={{ ...buttonStyle, background: "#475569" }}
                >
                    🔄 Reset
                </button>
            </div>

            <p style={{ marginBottom: 0, color: "#374151" }}>
                Status: {message}
            </p>

            {!hasRoute && (
                <p style={{ color: "#b45309", marginBottom: 0 }}>
                    Route calculate karo; tab ride simulation chalegi.
                    Buttons abhi bhi visible rehne chahiye.
                </p>
            )}
        </div>
    );
}
