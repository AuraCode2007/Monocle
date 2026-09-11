import pandas as pd
import secrets
import string
import smtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv

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

    # 2. Configure SMTP server details (Default: Gmail)
    smtp_server = "smtp.gmail.com"
    port = 465 # Standard port for SSL

    try:
        # 3. Establish a secure connection and send
        with smtplib.SMTP_SSL(smtp_server, port) as server:
            server.login(sender, admin_email_password)
            server.send_message(msg)
        
    except smtplib.SMTPAuthenticationError:
        print("❌ Authentication failed. Check your email and App Password.") # error needs to be handled correctly
    except Exception as e:
        print(f"❌ An error occurred: {e}") # error needs to be handled correctly

def read_and_update_excel_sheet(number_of_entries: int = 1):
    password_length = 16 # sets the length of passwords asssigned to each employee.

    # 1. Load the Excel file
    file_name = 'employee_data.xlsx' # Change file_name accordingly
    df = pd.read_excel(file_name)

    # 2. Get the last n rows using tail[n] and convert them to a liat of dictionaries
    row_dict_list = df.tail(number_of_entries).to_dict(orient='records')

    # Setting the configuration common to each email.
    SENDER = os.getenv("EMAIL_ADDRESS_OF_SYSTEM_ADMIN") # Specify email and password inside your .env file
    ADMIN_EMAIL_PASSWORD = os.getenv("EMAIL_APP_PASSWORD")
    SUBJECT = "Credentials for logging into Monocle"
    
    # 3. Iterate over the list of rows, set a password in each and send an email to each of the users
    for i, row in enumerate(row_dict_list):
        row['Passwords'] = generate_secure_string(password_length) # Assuming the passwords column is called "Passwords"
        # Calculate the correct row index in the original DataFrame and store password there.
        row_index = df.index[-number_of_entries + i]
        df.at[row_index, 'Passwords'] = row['Passwords']

        reciever = row['Name']
        reciever_email = row['Email']
        reciever_password = row['Password']

        body = f"""Hello {reciever}, to log into Monocle use the following email and password combination:
        Email: {reciever_email}
        Password: {reciever_password}"""

        # send the password as an email
        send_password_to_reciever(SENDER, ADMIN_EMAIL_PASSWORD, reciever, SUBJECT, body)

    # 4. Save the updated DataFrame back to the Excel file
    # index=False prevents pandas from accidentally writing row numbers into your sheet
    df.to_excel(file_name, index=False)