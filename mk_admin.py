from datetime import datetime
import bcrypt
import pymysql

# Create database connection
conn = pymysql.connect(
    host='localhost',
    port=3306,
    user='limeuser',
    password='limepassword',
    database='survey_platform'
)
cursor = conn.cursor()

# Admin user details
email = 'admin2@example.com'
username = 'admin2'
password = 'Admin123'  # Change this to your desired password
first_name = 'Admin'
last_name = 'User'

# Hash the password using bcrypt
password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(12)).decode('utf-8')

# Insert the admin user
query = """
INSERT INTO users (
    email,
    username,
    password_hash,
    first_name,
    last_name,
    is_admin,
    is_active,
    created_at,
    updated_at
) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
"""

now = datetime.utcnow()
cursor.execute(query, (
    email,
    username,
    password_hash,
    first_name,
    last_name,
    True,
    True,
    now,
    now
))

conn.commit()
print(f"Admin user '{username}' created successfully!")

cursor.close()
conn.close()