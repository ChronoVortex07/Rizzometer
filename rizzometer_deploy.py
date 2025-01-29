import torch
import torch.nn as nn
import numpy as np
import torch.optim as optim
import matplotlib.pyplot as plt
import torchvision.transforms as transforms
from PIL import Image
from ultralytics import YOLO

face_model = YOLO('models/yolo10n_face.pt')

rizz_model = torch.hub.load('pytorch/vision:v0.9.0', 'resnet50')
num_ftrs = rizz_model.fc.in_features

rizz_model.fc = nn.Linear(num_ftrs, 1)
rizz_model.load_state_dict(torch.load('models/beauty_cnn.pth'))
rizz_model = rizz_model.to(torch.device("cuda" if torch.cuda.is_available() else "cpu"))

def get_beauty_score(img, face_model, rizz_model, as_fraction=False):
    #convert to RGB'
    img = img.convert('RGB')
    img = np.array(img)
    pred = face_model(img, verbose=False)
    if len(pred[0].boxes.xyxy) == 0:
        return None
    else:
        results = []
        for x1, y1, x2, y2 in pred[0].boxes.xyxy:
            new_img = img[int(y1):int(y2), int(x1):int(x2)]
            new_img = torch.tensor(new_img).permute(2, 0, 1).unsqueeze(0)
            # pad image to square
            if new_img.shape[2] > new_img.shape[3]:
                pad = (new_img.shape[2] - new_img.shape[3]) // 2
                new_img = torch.nn.functional.pad(new_img, (0, 0, pad, pad), value=255)
            else:
                pad = (new_img.shape[3] - new_img.shape[2]) // 2
                new_img = torch.nn.functional.pad(new_img, (pad, pad, 0, 0), value=255)
            # resize image to 224x224
            new_img = torch.nn.functional.interpolate(new_img, size=(224, 224), mode='bilinear') / 1.0
            #new_img = transforms.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225))(torch.tensor(new_img).float())
            
            # display image as plot
            #plt.imshow(new_img.permute(0, 2, 3, 1)[0])
            
            new_img = new_img.to(torch.device("cuda" if torch.cuda.is_available() else "cpu"))
            
            if as_fraction:
                results.append({
                    'box': {
                        'x1': float(x1 / img.shape[1]),
                        'y1': float(y1 / img.shape[0]),
                        'x2': float(x2 / img.shape[1]),
                        'y2': float(y2 / img.shape[0])
                    },
                    'score': rizz_model(new_img).tolist()[0][0]
                })
            else:
                results.append({
                    'box': {
                        'x1': x1.tolist(),
                        'y1': y1.tolist(),
                        'x2': x2.tolist(),
                        'y2': y2.tolist()
                    },
                    'score': rizz_model(new_img).tolist()[0][0]
                })
        return results

if __name__ == '__main__':
    import matplotlib.pyplot as plt
    import matplotlib.patches as patches
    from PIL import Image

    #img = Image.open(r"C:\Users\zedon\Pictures\Camera Roll\WIN_20250122_16_38_12_Pro.jpg")
    #img = Image.open('beauty_score.png')#f'{BASE_PATH}/images/images/CF437.jpg')
    img = Image.open(r"C:\Users\zedon\Downloads\WhatsApp Image 2025-01-16 at 17.59.58_dbcde9b2.jpg")
    fig, ax = plt.subplots()
    ax.imshow(img)
    results = get_beauty_score(img, face_model, rizz_model)
    for result in results:
        x1, y1, x2, y2 = result['box']['x1'], result['box']['y1'], result['box']['x2'], result['box']['y2']
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


