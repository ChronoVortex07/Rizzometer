from flask import Flask, render_template
from flask_socketio import SocketIO
from flask_cors import CORS
import os
import cv2
import base64
import numpy as np
from PIL import Image
from ultralytics import YOLO

# os.chdir('/rizzometer')

from rizzometer_deploy import get_beauty_score, face_model, rizz_model

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins='*')

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    
@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')
    
@socketio.on('ping')
def handle_ping():
    print('Ping received')
    socketio.emit('pong')

@socketio.on('frame')
def handle_frame(data):
    print('Frame received')
    # Decode the received frame
    frame_data = base64.b64decode(data.split(',')[1])
    nparr = np.frombuffer(frame_data, np.uint8)
    frame = Image.fromarray(cv2.imdecode(nparr, cv2.IMREAD_COLOR))

    # Run YOLO on the frame
    results = get_beauty_score(frame, face_model, rizz_model, as_fraction=True)
    print(results)

    # Send back bounding boxes and labels
    socketio.emit('detection', results)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)