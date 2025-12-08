# server/seed.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db, User, Todo
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt(app)

def seed_data():
    # Clear existing data
    Todo.query.delete()
    User.query.delete()
    db.session.commit()

    # Create Users
    users = [
        {'username': 'samuel', 'password': 'password123'},
        {'username': 'jane', 'password': 'securepass'},
        {'username': 'john', 'password': 'mypassword'}
    ]

    user_objects = []
    for u in users:
        hashed = bcrypt.generate_password_hash(u['password']).decode('utf-8')
        user = User(username=u['username'], password=hashed)
        db.session.add(user)
        user_objects.append(user)

    db.session.commit()

    # Create Todos
    todos = [
        {'content': 'Buy groceries', 'completed': False, 'user': user_objects[0]},
        {'content': 'Finish Angular project', 'completed': True, 'user': user_objects[1]},
        {'content': 'Read a book', 'completed': False, 'user': user_objects[2]},
    ]

    for t in todos:
        todo = Todo(content=t['content'], completed=t['completed'], user=t['user'])
        db.session.add(todo)

    db.session.commit()
    print("Database seeded successfully!")


if __name__ == "__main__":
    with app.app_context():
        seed_data()
