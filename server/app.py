# server/app.py

from datetime import datetime, timedelta
from flask import Flask,request, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager
from flask_jwt_extended import exceptions

app=Flask(__name__)
jwt=JWTManager(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todo.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["JWT_SECRET_KEY"] = "super-secret"

# Initialize extensions
db = SQLAlchemy(app)         
migrate = Migrate(app, db)    
CORS(app, supports_credentials=True)      
bcrypt=Bcrypt()



@jwt.invalid_token_loader
def invalid_token_callback(error_string):
    print("Invalid token:", error_string)
    return jsonify({"msg": "Invalid token"}), 422

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    print("Expired token")
    return jsonify({"msg": "Token expired"}), 401

# models
class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)

    todos = db.relationship('Todo', back_populates='user', lazy=True)

class Todo(db.Model):
    __tablename__ = "todos"

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(255), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    user = db.relationship('User', back_populates='todos')

@app.route('/')
def home():
    return "Hello, Flask!"

# ---------------- User Endpoints ---------------- #

# Create User
@app.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    new_user = User(username=username, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    access_token = create_access_token(identity=str(new_user.id), expires_delta=timedelta(hours=3))

    return jsonify({'id': new_user.id, 'username': new_user.username,'access_token': access_token}), 201

# Get all users
@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    result = [{'id': u.id, 'username': u.username} for u in users]
    return jsonify(result), 200

    

@app.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'error': 'Invalid username or password'}), 401

    if bcrypt.check_password_hash(user.password, password):
        access_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(hours=24)
        )
        # Password is correct
        return jsonify({
            'message': 'Login successful',
            'user': {'id': user.id, 'username': user.username, 'access_token':access_token}
        }), 200
    else:
        return jsonify({'error': 'Invalid username or password'}), 401
    
    
    
# Update user
@app.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    auth_user_id = int(get_jwt_identity())
    if auth_user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    user = User.query.get_or_404(auth_user_id)

    if 'username' in data:
        user.username = data['username']

    if 'password' in data:
        user.password = bcrypt.generate_password_hash(
            data['password']
        ).decode('utf-8')

    db.session.commit()
    return jsonify({
        'id': user.id,
        'username': user.username
    }), 200


# Delete user
@app.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    auth_user_id = int(get_jwt_identity())
    if auth_user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    user = User.query.get_or_404(auth_user_id)
    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User deleted"}), 200



# ---------------- Todo Endpoints ---------------- #

# Create todo
@app.route('/todos', methods=['POST'])
@jwt_required()
def create_todo():
    auth_user_id = int(get_jwt_identity())
    data = request.get_json()

    content = data.get('content')
    if not content:
        return jsonify({'error': 'Content is required'}), 400

    todo = Todo(content=content, user_id=auth_user_id)
    db.session.add(todo)
    db.session.commit()

    return jsonify({
        'id': todo.id,
        'content': todo.content,
        'completed': todo.completed,
        'user_id': todo.user_id
    }), 201


# Get all todos
# Get all todos for the logged-in user
@app.route('/todos', methods=['GET'])
@jwt_required()
def get_todos():
    auth_user_id = get_jwt_identity()
    todos = Todo.query.filter_by(user_id=auth_user_id).all()

    result = [{
        'id': t.id,
        'content': t.content,
        'completed': t.completed,
        'user_id': t.user_id,
        'created_at': t.created_at,
        'updated_at': t.updated_at
    } for t in todos]

    return jsonify(result), 200


# Update todo
@app.route('/todos/<int:todo_id>', methods=['PUT', 'PATCH'])
@jwt_required()
def update_todo(todo_id):
    auth_user_id = int(get_jwt_identity())
    todo = Todo.query.get_or_404(todo_id)

    if todo.user_id != auth_user_id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()

    if 'content' in data:
        todo.content = data['content']
    if 'completed' in data:
        todo.completed = data['completed']

    db.session.commit()

    return jsonify({
        'id': todo.id,
        'content': todo.content,
        'completed': todo.completed,
        'user_id': todo.user_id
    }), 200


# Delete todo
@app.route('/todos/<int:todo_id>', methods=['DELETE'])
@jwt_required()
def delete_todo(todo_id):
    auth_user_id = int(get_jwt_identity())
    todo = Todo.query.get_or_404(todo_id)

   
    if todo.user_id != auth_user_id:
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(todo)
    db.session.commit()

    return jsonify({"message": "Todo deleted"}), 200


if __name__ == "__main__":
    app.run(port=5000, debug=True)