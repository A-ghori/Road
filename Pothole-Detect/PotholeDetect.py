import cv2
from ultralytics import YOLO

# Loading the trained model
model = YOLO("runs/detect/train/weights/best.pt")

# Open webcam (0 = default camera)
capture = cv2.VideoCapture(0)

while True:
    isTrue, frame = capture.read()
    if not isTrue:
        break

    # Run YOLO and predict
    results = model(source=frame, conf=0.6)

    # Draw results on frame
    annotated_frame = results[0].plot()

    cv2.imshow("Pothole Live Detection", annotated_frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

capture.release()
cv2.destroyAllWindows()
