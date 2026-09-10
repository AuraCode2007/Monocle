# UNFINISHED function to mass update priority of existing database 
from sqlalchemy.orm import Session
from sqlalchemy import update
from priority import find_priority
# Assuming databaxe model is named 'db'

# Create the update statement
def update_priority(db: Session, ):
    mass_update_statement = (
        update(db)
        .where(db.priority == 0)
        .values(priority=find_priority()) # pass the necessary arguments here
    )

    # Execute and commit
    db.execute(mass_update_statement)
    db.commit()