from flask import Flask, flash, g, redirect, render_template, request, session, url_for, send_from_directory
from werkzeug.security import check_password_hash, generate_password_hash
app = Flask(__name__, static_url_path='')

@app.route('/lib/<path:path>')
def send_js(path):
    return send_from_directory('static/lib', path)

@app.route('/data/<path:path>')
def send_data(path):
    return send_from_directory('static/data', path)

@app.route('/')
def hello():
    return 'Hello, World'

@app.route('/hello',  methods=['GET'])
def index():
    return 'Index Page'

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        error = None
        if not username:
            error = 'Username is required.'
        elif not password:
            error = 'Password is required'
        #flash(error)
        if error is None:
            return redirect(url_for('.login', username=username, password=generate_password_hash(password)))
    return render_template('register.html')
@app.route('/login', methods=['GET', 'POST'])
def login():
    usernameRedir = request.args['username']
    passwordRedir = request.args['password']
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        error = None

        if error is None:
            session.clear()
            session['user_id'] = user['id']
            return redirect(url_for('index'))

        #flash(error)

    return render_template('login.html', username=usernameRedir, password= passwordRedir)

@app.route('/game', methods=['GET', 'POST'])
def game():
    return render_template('game.html')
app.run()