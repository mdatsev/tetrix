from flask import Flask, flash, g, redirect, render_template, request, session, url_for
from werkzeug.security import check_password_hash, generate_password_hash
app = Flask(__name__)
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
cred = credentials.Certificate("./config/secrets/serviceAccountKey.json")
firebase_admin.initialize_app(cred, options={"databaseURL":"https://tetrix-1d1fc.firebaseio.com/"})
users = db.reference('users')
@app.route('/')
def hello():
    return 'Hello, World'

@app.route('/hello',  methods=['GET'])
def index():
    return 'Index Page'

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
            "username":username,
            "password":generate_password_hash(password)
        })
        if error is None:
            return redirect(url_for('.login'))
    return render_template('register.html')
@app.route('/login', methods=('GET', 'POST'))
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        error = None
        if error == None and check_password_hash(list(users.order_by_child('username').equal_to(username).get().items())[0][1]['password'], password):
            return "Logged!"
        #flash(error)
    return render_template('login.html')