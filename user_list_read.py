import pandas as pd
import secrets
import string
import smtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv

# Import database session and the User model
from database import SessionLocal
from models import User

load_dotenv()

def generate_secure_string(length=12):
    characters = string.ascii_letters + string.digits
    secure_string = ''.join(secrets.choice(characters) for _ in range(length))
    return secure_string

def send_password_to_receiver(sender, admin_email_password, receiver, subject, body):
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = sender
    msg['To'] = receiver
    msg.set_content(body)

    smtp_server = "smtp.gmail.com"
    port = 465 

    try:
        with smtplib.SMTP_SSL(smtp_server, port) as server:
            server.login(sender, admin_email_password)
            server.send_message(msg)
    except smtplib.SMTPAuthenticationError:
        print("[ERROR] Authentication failed. Check your email and App Password.") 
    except Exception as e:
        print(f"[ERROR] An error occurred: {e}") 

def read_and_update_excel_sheet(number_of_entries: int = 1):
    password_length = 16 
    file_name = 'employee_data.xlsx' 

    if not os.path.exists(file_name):
        print(f"[ERROR] File not found: '{file_name}'. Please create the Excel file and try again.")
        return

    try:
        df = pd.read_excel(file_name)
    except PermissionError:
        print(f"[ERROR] Permission denied: '{file_name}' is currently open in Excel or another program. Please save and close the file, then try again.")
        return
    except Exception as e:
        print(f"[ERROR] Failed to read '{file_name}': {e}")
        return

    if df.empty:
        print(f"[WARNING] '{file_name}' contains no data rows.")
        return

    if 'Passwords' not in df.columns:
        df['Passwords'] = None
    df['Passwords'] = df['Passwords'].astype(object)

    row_dict_list = df.tail(number_of_entries).to_dict(orient='records')

    SENDER = os.getenv("EMAIL_ADDRESS_OF_SYSTEM_ADMIN") 
    ADMIN_EMAIL_PASSWORD = os.getenv("EMAIL_APP_PASSWORD")
    SUBJECT = "Credentials for logging into Monocle"
    
    db = SessionLocal()
    
    try:
        for i, row in enumerate(row_dict_list):
            row['Passwords'] = generate_secure_string(password_length) 
            
            row_index = df.index[-number_of_entries + i]
            df.at[row_index, 'Passwords'] = row['Passwords']

            receiver = row['Name']
            receiver_email = row['Email']
            receiver_password = row['Passwords']
            
            # Retrieve required fields for the users table
            user_id_val = str(row.get('User ID', f"U{secrets.randbelow(99999):05d}"))[:10]
            role_val = row.get('Role', 'CONTROL_ROOM')

            body = f"""Hello {receiver}, to log into Monocle use the following email and password combination:
            Email: {receiver_email}
            Password: {receiver_password}"""

            send_password_to_receiver(SENDER, ADMIN_EMAIL_PASSWORD, receiver_email, SUBJECT, body)

            # Check if user already exists in DB by username or email
            existing_user = db.query(User).filter(
                (User.username == receiver) | (User.email == receiver_email)
            ).first()

            if existing_user:
                existing_user.password_hash = receiver_password
                existing_user.role = role_val
                existing_user.user_id = user_id_val
                existing_user.email = receiver_email
                print(f"[INFO] Updated existing user '{receiver}' in database.")
            else:
                new_user = User(
                    user_id=user_id_val,
                    username=receiver,
                    password_hash=receiver_password,
                    role=role_val,
                    email=receiver_email
                )
                db.add(new_user)
                print(f"[INFO] Created new user '{receiver}' in database.")

        db.commit()
        
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Database error occurred: {e}")
    finally:
        try:
            df.to_excel(file_name, index=False)
        except PermissionError:
            print(f"[ERROR] Permission denied: Could not save updated passwords to '{file_name}' because it is open in Excel. Please close the file.")
        except Exception as e:
            print(f"[ERROR] Could not save to '{file_name}': {e}")
        finally:
            db.close()
        
if __name__ == "__main__":
    read_and_update_excel_sheet(number_of_entries=1)
