import torch
import torch.nn as nn
import numpy as np
import torch.optim as optim
import matplotlib.pyplot as plt
import torchvision.transforms as transforms
from PIL import Image
from ultralytics import YOLO
from collections import defaultdict, deque
import statistics

face_model = YOLO('models/yolo10n_face.pt')

rizz_model = torch.hub.load('pytorch/vision:v0.9.0', 'resnet50')
num_ftrs = rizz_model.fc.in_features

rizz_model.fc = nn.Linear(num_ftrs, 1)
rizz_model.load_state_dict(torch.load('models/beauty_cnn_v3.pth'))
rizz_model = rizz_model.to(torch.device("cuda" if torch.cuda.is_available() else "cpu"))

# Dictionary to store the last 5 scores for each track_id
score_history = defaultdict(lambda: deque(maxlen=50))

def get_beauty_score(img, face_model, rizz_model, as_fraction=False):
    # Convert to RGB
    img = img.convert('RGB')
    img = np.array(img)
    height, width, _ = img.shape
    # Pad the original image to make it square
    if height > width:
        pad = (height - width) // 2
        img = np.pad(img, ((0, 0), (pad, pad), (0, 0)), mode='constant', constant_values=0)
    else:
        pad = (width - height) // 2
        img = np.pad(img, ((pad, pad), (0, 0), (0, 0)), mode='constant', constant_values=0)
    
    # Use YOLO's tracking function
    pred = face_model.track(img, verbose=False)
    
    if len(pred[0].boxes.xyxy) == 0:
        return None
    else:
        results = []
        for box, track_id in zip(pred[0].boxes.xyxy, pred[0].boxes.id):
            x1, y1, x2, y2 = int(box[0]), int(box[1]), int(box[2]), int(box[3])
            # Add 10% padding around the bounding box
            padding_x = int((x2 - x1) * 0.2)
            padding_y = int((y2 - y1) * 0.2)
            
            x1 = max(0, x1 - padding_x)
            y1 = max(0, y1 - padding_y)
            x2 = min(img.shape[1], x2 + padding_x)
            y2 = min(img.shape[0], y2 + padding_y)
            
            new_img = img[y1:y2, x1:x2] / 255.0
            new_img = torch.tensor(new_img).permute(2, 0, 1).unsqueeze(0).float()
            
            # Resize image to 128x128
            new_img = torch.nn.functional.interpolate(new_img, size=(128, 128), mode='bilinear')
            new_img = new_img.to(torch.device("cuda" if torch.cuda.is_available() else "cpu"))
            
            # Normalize image
            new_img = transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])(new_img)
            
            score = rizz_model(new_img).tolist()[0][0]
            score_history[track_id].append(score)
            median_score = statistics.median(score_history[track_id])
            
            if as_fraction:
                results.append({
                    'box': {
                        'x1': float(x1 / img.shape[1]),
                        'y1': float(y1 / img.shape[0]),
                        'x2': float(x2 / img.shape[1]),
                        'y2': float(y2 / img.shape[0])
                    },
                    'score': median_score
                })
            else:
                results.append({
                    'box': {
                        'x1': float(x1),
                        'y1': float(y1),
                        'x2': float(x2),
                        'y2': float(y2)
                    },
                    'score': median_score
                })
                
        return results

if __name__ == '__main__':
    import matplotlib.pyplot as plt
    import matplotlib.patches as patches
    from PIL import Image

    #img = Image.open(r"C:\Users\zedon\Pictures\Camera Roll\WIN_20250122_16_38_12_Pro.jpg")
    #img = Image.open('beauty_score.png')#f'{BASE_PATH}/images/images/CF437.jpg')
    img = Image.open(r"C:\Users\zedon\Downloads\save_4.jpg")
    fig, ax = plt.subplots()
    ax.imshow(img)
    results = get_beauty_score(img, face_model, rizz_model, as_fraction=True)
    print(results)
    for result in results:
        x1 = result['box']['x1'] * img.width
        y1 = result['box']['y1'] * img.height
        x2 = result['box']['x2'] * img.width
        y2 = result['box']['y2'] * img.height
        # Draw the rectangle
        rect = patches.Rectangle((x1, y1), x2 - x1, y2 - y1, linewidth=2, edgecolor='r', facecolor='none')
        ax.add_patch(rect)
        # Add text with background
        ax.text(
            x1, y1, f'{result["score"]:.2f}',
            color='white', fontsize=12,
            bbox=dict(facecolor='red', edgecolor='none',boxstyle='round,pad=0.0')  # Add background color
        )
    plt.show()


