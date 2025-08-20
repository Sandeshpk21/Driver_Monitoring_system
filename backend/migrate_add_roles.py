"""
Database migration script to add role field to existing users.
Run this script to update existing users with default 'driver' role.
The first user created will be promoted to 'admin'.
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from database.models import Base, User
from database.connection import DATABASE_URL
import sys

def migrate_add_roles():
    """Add role field to existing users"""
    print("Starting migration: Adding roles to users...")
    
    # Create engine and session
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    try:
        # Check if role column exists
        with engine.connect() as conn:
            result = conn.execute(text(
                "SELECT sql FROM sqlite_master WHERE type='table' AND name='users'"
            ))
            table_schema = result.fetchone()
            
            if table_schema and 'role' not in table_schema[0]:
                print("Adding 'role' column to users table...")
                # Add role column with default value
                conn.execute(text(
                    "ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'driver'"
                ))
                conn.commit()
                print("Role column added successfully.")
            else:
                print("Role column already exists.")
        
        # Update existing users
        db = SessionLocal()
        
        # Get all users ordered by creation date
        users = db.query(User).order_by(User.created_at).all()
        
        if users:
            # Make the first user an admin
            first_user = users[0]
            if not first_user.role or first_user.role == 'driver':
                first_user.role = 'admin'
                print(f"Promoted user '{first_user.username}' to admin role.")
            
            # Ensure all other users have a role
            for user in users[1:]:
                if not user.role:
                    user.role = 'driver'
                    print(f"Set user '{user.username}' to driver role.")
            
            db.commit()
            print(f"Successfully updated {len(users)} users with roles.")
        else:
            print("No existing users found.")
        
        # Create a default admin user if no users exist
        if not users:
            print("\nNo users found. Would you like to create a default admin user? (y/n): ", end="")
            response = input().strip().lower()
            
            if response == 'y':
                from auth.security import get_password_hash
                
                print("Creating default admin user...")
                print("Username (default: admin): ", end="")
                username = input().strip() or "admin"
                
                print("Email (default: admin@example.com): ", end="")
                email = input().strip() or "admin@example.com"
                
                print("Password (default: admin123): ", end="")
                password = input().strip() or "admin123"
                
                admin_user = User(
                    username=username,
                    email=email,
                    hashed_password=get_password_hash(password),
                    role="admin",
                    full_name="System Administrator"
                )
                
                db.add(admin_user)
                db.commit()
                
                print(f"\nAdmin user created successfully!")
                print(f"Username: {username}")
                print(f"Password: {password}")
                print("Please change the password after first login!")
        
        db.close()
        print("\nMigration completed successfully!")
        
    except Exception as e:
        print(f"Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    migrate_add_roles()