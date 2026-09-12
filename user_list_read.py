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

def send_password_to_reciever(sender, admin_email_password, receiver, subject, body):
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
        print("❌ Authentication failed. Check your email and App Password.") 
    except Exception as e:
        print(f"❌ An error occurred: {e}") 

def read_and_update_excel_sheet(number_of_entries: int = 1):
    password_length = 16 

    file_name = 'employee_data.xlsx' 
    df = pd.read_excel(file_name)

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

            reciever = row['Name']
            reciever_email = row['Email']
            reciever_password = row['Passwords']
            
            # Retrieve required fields for the users table
            user_id_val = str(row.get('User ID', f"U{secrets.randbelow(99999):05d}"))[:10]
            role_val = row.get('Role', 'CONTROL_ROOM')

            body = f"""Hello {reciever}, to log into Monocle use the following email and password combination:
            Email: {reciever_email}
            Password: {reciever_password}"""

            send_password_to_reciever(SENDER, ADMIN_EMAIL_PASSWORD, reciever_email, SUBJECT, body)

            # Map to the User model
            new_user = User(
                user_id=user_id_val,
                username=reciever,
                password_hash=reciever_password,
                role=role_val,
                email=reciever_email
            )
            db.add(new_user)

        db.commit()
        
    except Exception as e:
        db.rollback()
        print(f"❌ Database error occurred: {e}")
    finally:
        df.to_excel(file_name, index=False)
        db.close()