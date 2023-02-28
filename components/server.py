import os
from flask import Flask, flash, request, redirect, url_for, g, jsonify, send_from_directory, request
from flask_cors import CORS
from werkzeug.utils import secure_filename
import sqlite3
import uuid

import torch
import numpy as np
import torchvision
import numpy as np 
import os

from PIL import Image
from torch import nn
from torchvision import transforms, models, datasets

device = "cuda" if torch.cuda.is_available() else "cpu"
torch.manual_seed(0)

labels_map = {
     0: "Кошка / Порода: Абиссинская",
     1: "Кошка / Порода: Бенгальская",
     2: "Кошка / Порода: Бирманская",
     3: "Кошка / Порода: Бомбей",
     4: "Кошка / порода: Британская короткошерстная",
     5: "Кошка / порода: Египетская мау",
     6: "Кошка / Порода: Мейн-кун",
     7: "Кошка / Порода: Персидская",
     8: "Кошка / Порода: Рэгдолл",
     9: "Кошка / Порода: Русская Голубая",
     10: "Кошка / Порода: Сиамская",
     11: "Кошка / Порода: Сфинкс",
     12: "Собака / Порода: Американский бульдог",
     13: "Собака / Порода: Американский питбультерьер",
     14: "Собака / Порода: Бассет-хаунд",
     15: "Собака / Порода: Бигль",
     16: "Собака / Порода: Боксер",
     17: "Собака / Порода: Чихуахуа",
     18: "Собака / Порода: Английский коке-спаниель",
     19: "Собака / Порода: Английский сеттер",
     20: "Собака / Порода: Немецкая короткошерстная",
     21: "Собака / Порода: Пиренейская горная собака",
     22: "Собака / Порода: Гаванец",
     23: "Собака / Порода: Японский хин",
     24: "Собака / Порода: Кеесхонд",
     25: "Собака / Порода: Леонбергер",
     26: "Собака / Порода: Цвергпинчер",
     27: "Собака / Порода: Ньюфаундленд",
     28: "Собака / Порода: Померанский шпиц",
     29: "Собака / Порода: Мопс",
     30: "Собака / Порода: Сенбернар",
     31: "Собака / Порода: Самоед",
     32: "Собака / Порода: Шотландский терьер",
     33: "Собака / Порода: Сиба-ину",
     34: "Собака / Порода: Стаффордширский бультерьер",
     35: "Собака / Порода: Пшеничный терьер",
     36: "Собака / Порода: Йоркширский терьер"
}

model = torch.hub.load('pytorch/vision:v0.10.0', 'resnet18', pretrained=True)
model.fc = nn.Sequential(torch.nn.Linear(512, 37), nn.Softmax())
model.load_state_dict(torch.load(r'C:\dev\pets_net_backend\resnet18_s2_700.pt'))
model = model.to(device)

model.eval()

DATABASE = './database.db'

UPLOAD_FOLDER = './images'
ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])

app = Flask(__name__)
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'
CORS(app)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# @app.route("/")
# def default():
#     return "Nothing in the main route"

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def allowed_file(filename):     
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/images', methods=['GET'])
def get_library():
    cur = get_db().cursor()
    library = cur.execute("SELECT * FROM library").fetchall()
    response = {'lib': []}
    for author, desc, img_name, breed, prob in library:
        row_obj = {'author': author, 'desc': desc, 'img_name': img_name, 'breed': breed, 'prob': prob}
        response['lib'].append(row_obj)
    return jsonify(response)

@app.route('/image/<path:path>', methods=['GET'])
def send_report(path):
    return send_from_directory('./images', path)

@app.route('/add', methods=['POST'])
def add_to_db():
    desc = request.get_json()['desc']
    author = request.get_json()['author']
    image_name = request.get_json()['image_name']

    image = Image.open('./img.jpg')
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Resize((224, 224)),
    ])

    img_tensor = transform(image).float().to(device)
    img_tensor = torch.unsqueeze(img_tensor, dim=0)
    output = model(img_tensor)
    prob, pred = torch.max(output, 1)
    predicted_breed = labels_map[pred[0].cpu().detach().numpy().item()]

    cur = get_db().cursor()
    cur.execute(f"INSERT INTO library VALUES (?, ?, ?, ?, ?)", (author, desc, image_name, predicted_breed, prob.item() * 100))
    get_db().commit()
    resp = jsonify(success=True)
    return resp

@app.route('/upload', methods=['POST'])
def upload_image():
    bytesOfImage = request.get_data()
    pic_name = uuid.uuid4()
    with open(f'./images/{pic_name}.jpeg', 'wb') as out:
        out.write(bytesOfImage)
    return f'{pic_name}.jpeg'    

# @app.route('/<path:path>')
# def static_file(path):
#     return app.send_static_file(path)

@app.route('/add', methods=['POST'])
def upload_file():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # if user does not select file, browser also
        # submit a empty part without filename
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))