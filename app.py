from flask import Flask, flash, g, redirect, render_template, request, session, url_for, send_from_directory
from werkzeug.security import check_password_hash, generate_password_hash
from flask import Flask, render_template, make_response
from flask_socketio import SocketIO
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import json
import datetime

app = Flask(__name__, static_url_path='')

app.secret_key = "super secret"

socketio = SocketIO(app)


cred = credentials.Certificate("./config/secrets/serviceAccountKey.json")
firebase_admin.initialize_app(cred, options={"databaseURL":"https://tetrix-1d1fc.firebaseio.com/"})

users = db.reference('users')

@socketio.on('keypress')
def handle_my_custom_event(json):
    print('received json: ' + str(json))

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')
@app.route('/lib/<path:path>')
def send_js(path):
    return send_from_directory('static/vendor', path)

@app.route('/data/<path:path>')
def send_data(path):
    return send_from_directory('static/data', path)

@app.route('/register', methods=('GET', 'POST'))
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        error = None
        if not username:
            error = 'Username is required.'
        elif not password:
            error = 'Password is required'
        users.push({
            "username": username,
            "password": generate_password_hash(password)
        })
        if error is None:
            return redirect(url_for('.login'))
        flash(error)
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        error = None
        logging_user = list(users.order_by_child('username').equal_to(username).get().items())
        print(logging_user[0][0])
        if error == None and check_password_hash(logging_user[0][1]['password'], password):
            session.clear()
            session['user'] = logging_user[0][0]
            return redirect('/game')
        flash(error)
    return render_template('login.html')

@app.route('/game', methods=['GET', 'POST'])
def game():
    return render_template('game.html')
if __name__ == '__main__':
    socketio.run(app)
    app.run()