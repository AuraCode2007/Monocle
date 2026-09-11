import pandas as pd
import secrets
import string

def generate_secure_string(length=12):
    characters = string.ascii_letters + string.digits
    secure_string = ''.join(secrets.choice(characters) for _ in range(length))
    return secure_string

def read_and_update_excel_sheet():
    password_length = 16 # sets the length of passwords asssigned to each employee.

    # 1. Load the Excel file
    file_name = 'employee_data.xlsx' # Change file_name accordingly
    df = pd.read_excel(file_name)

    # 2. Locate the last row's index and change a specific column's value
    # df.index[-1] gets the exact index number of the very last row
    df.at[df.index[-1], 'Passwords'] = generate_secure_string(password_length) # Assuming the passwords column is called "Passwords"

    # 3. Save the updated DataFrame back to the Excel file
    # index=False prevents pandas from accidentally writing row numbers into your sheet
    df.to_excel(file_name, index=False)

    # 4. Get the last row using iloc[-1] and convert it to a dictionary
    last_row_dict = df.iloc[-1].to_dict() # saves the contents of the last row into a dict.

    # Print the result
    print(last_row_dict)