-- Creating Enum types
CREATE TYPE dept_enum AS ENUM ('TMS', 'TDMS', 'SMMS');
CREATE TYPE role_enum AS ENUM ('TMS', 'TDMS', 'SMMS', 'CONTROL_ROOM');

-- 2. Create User Management Table (For FastAPI Authentication)
CREATE TABLE users (
    user_sl SERIAL PRIMARY KEY,            -- stores serial number appends automatically
    user_id VARCHAR(10) NOT NULL,          -- stores user id 
    username VARCHAR(50) UNIQUE NOT NULL,  -- stores user name
    password_hash VARCHAR(255) NOT NULL,   -- stores password 
    role role_enum NOT NULL,               -- sets the role of the user of the dept to which they belong
    email VARCHAR(100)                     -- stores email not a necessary condition
);

-- 3. Create Central Control Room Table (The Merged Table)
CREATE TABLE control_room_master (
    sl_no BIGSERIAL PRIMARY KEY,
    job_id VARCHAR(20) NOT NULL UNIQUE,                -- Added UNIQUE to prevent duplicate entries and facilitate updates
    department dept_enum NOT NULL,                     -- stores the department type whose data is stored in this row
    work_category VARCHAR(50) NOT NULL,                -- stores the work description in two to four words
    required_duration_mins INT NOT NULL,               -- stores work duration in minutes
    department_specific_details JSONB NOT NULL,         -- stores the department specific data in JSON
    priority INT DEFAULT 0,                             -- Numerical scale (0=PENDING, 1=LOW, 2=MEDIUM, 3=HIGH) managed by backend
    blockchain_tx_hash VARCHAR(66) DEFAULT NULL,        -- For SIH Blockchain tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP      -- stores the time when log in is done by default it is current 
);

-- 4. Create Departmental Tables
CREATE TABLE tms_track_assets (
    sl_no BIGSERIAL PRIMARY KEY,                        -- Serial number auto increases by 1
    track_job_id VARCHAR(20) NOT NULL UNIQUE,           -- Increased length to match standard job IDs
    line_section VARCHAR(20) NOT NULL,                  -- stores the corridor in coded form like HWH-DEL 
    line_direction VARCHAR(10) NOT NULL,                -- Direction either UP or DN 
    start_km NUMERIC(7,3) NOT NULL,
    end_km NUMERIC(7,3) NOT NULL,
    structure_type VARCHAR(30) NOT NULL,
    work_category VARCHAR(50) NOT NULL,
    tdms_collab_req BOOLEAN DEFAULT false,              -- whether collaboration with tdms is required or not
    smms_collab_req BOOLEAN DEFAULT false,              -- whether collaboration with smms is required or not
    required_duration_mins INT NOT NULL,                -- Time req to complete work 
    reported_by VARCHAR(100) NOT NULL,                  -- stores name of official who reported
    blockchain_tx_hash VARCHAR(66) DEFAULT NULL         
);

CREATE TABLE tdms_power_assets (
    sl_no BIGSERIAL PRIMARY KEY,                         -- Serial number auto increases by 1
    power_job_id VARCHAR(20) NOT NULL UNIQUE,
    line_section VARCHAR(20) NOT NULL,                   -- stores the corridor in coded form like HWH-DEL 
    line_direction VARCHAR(10) NOT NULL,                 -- Direction either UP or DN 
    source_mast_no VARCHAR(15) NOT NULL,
    target_mast_no VARCHAR(15) NOT NULL,
    power_isolation_needed BOOLEAN DEFAULT false,        -- whether powercut is required or not
    work_category VARCHAR(50) NOT NULL,                  -- Work description
    tms_collab_req BOOLEAN DEFAULT false,                -- whether two departments require collaboration or not
    smms_collab_req BOOLEAN DEFAULT false,
    required_duration_mins INT NOT NULL,
    reported_by VARCHAR(100) NOT NULL,
    blockchain_tx_hash VARCHAR(66) DEFAULT NULL          -- Security code
);

CREATE TABLE smms_signal_assets (
    sl_no BIGSERIAL PRIMARY KEY,
    signal_job_id VARCHAR(20) NOT NULL UNIQUE,
    station_code VARCHAR(10) NOT NULL,                  -- Station code eg: HWH , BWN etc.
    point_machine_no VARCHAR(15) NOT NULL,              -- Malfunctioning machine no.
    interlocking_panel VARCHAR(20) NOT NULL,            -- stores code of the panel under whose jurisdiction the machine lies
    work_category VARCHAR(50) NOT NULL,                 -- Work dscription
    tdms_collab_req BOOLEAN DEFAULT false,
    tms_collab_req BOOLEAN DEFAULT false,               -- Whether collaboration is required or not
    required_duration_mins INT NOT NULL,
    reported_by VARCHAR(100) NOT NULL,
    blockchain_tx_hash VARCHAR(66) DEFAULT NULL         -- Security code
);

-- 5. Enhanced Trigger Function to handle both INSERTS and UPDATES (UPSERT)
CREATE OR REPLACE FUNCTION sync_to_control_room()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'tms_track_assets' THEN
        INSERT INTO control_room_master (job_id, department, work_category, required_duration_mins, department_specific_details, blockchain_tx_hash)
        VALUES (
            NEW.track_job_id, 'TMS', NEW.work_category, NEW.required_duration_mins,
            jsonb_build_object(
                'line_section', NEW.line_section,
                'line_direction', NEW.line_direction,
                'start_km', NEW.start_km,
                'end_km', NEW.end_km,
                'structure_type', NEW.structure_type,
                'tdms_collab_req', NEW.tdms_collab_req,
                'smms_collab_req', NEW.smms_collab_req
            ),
            NEW.blockchain_tx_hash
        )
        ON CONFLICT (job_id) DO UPDATE 
        SET blockchain_tx_hash = EXCLUDED.blockchain_tx_hash,
            work_category = EXCLUDED.work_category,
            required_duration_mins = EXCLUDED.required_duration_mins,
            department_specific_details = EXCLUDED.department_specific_details;

    ELSIF TG_TABLE_NAME = 'tdms_power_assets' THEN
        INSERT INTO control_room_master (job_id, department, work_category, required_duration_mins, department_specific_details, blockchain_tx_hash)
        VALUES (
            NEW.power_job_id, 'TDMS', NEW.work_category, NEW.required_duration_mins,
            jsonb_build_object(
                'line_section', NEW.line_section,
                'line_direction', NEW.line_direction,
                'source_mast_no', NEW.source_mast_no,
                'target_mast_no', NEW.target_mast_no,
                'power_isolation_needed', NEW.power_isolation_needed,
                'tms_collab_req', NEW.tms_collab_req,
                'smms_collab_req', NEW.smms_collab_req
            ),
            NEW.blockchain_tx_hash
        )
        ON CONFLICT (job_id) DO UPDATE 
        SET blockchain_tx_hash = EXCLUDED.blockchain_tx_hash,
            work_category = EXCLUDED.work_category,
            required_duration_mins = EXCLUDED.required_duration_mins,
            department_specific_details = EXCLUDED.department_specific_details;

    ELSIF TG_TABLE_NAME = 'smms_signal_assets' THEN
        INSERT INTO control_room_master (job_id, department, work_category, required_duration_mins, department_specific_details, blockchain_tx_hash)
        VALUES (
            NEW.signal_job_id, 'SMMS', NEW.work_category, NEW.required_duration_mins,
            jsonb_build_object(
                'station_code', NEW.station_code,
                'point_machine_no', NEW.point_machine_no,
                'interlocking_panel', NEW.interlocking_panel,
                'tdms_collab_req', NEW.tdms_collab_req,
                'tms_collab_req', NEW.tms_collab_req
            ),
            NEW.blockchain_tx_hash
        )
        ON CONFLICT (job_id) DO UPDATE 
        SET blockchain_tx_hash = EXCLUDED.blockchain_tx_hash,
            work_category = EXCLUDED.work_category,
            required_duration_mins = EXCLUDED.required_duration_mins,
            department_specific_details = EXCLUDED.department_specific_details;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Attach Triggers to Tables (Modified to trigger on AFTER INSERT OR UPDATE)
CREATE TRIGGER tms_sync_trigger AFTER INSERT OR UPDATE ON tms_track_assets FOR EACH ROW EXECUTE FUNCTION sync_to_control_room();
CREATE TRIGGER tdms_sync_trigger AFTER INSERT OR UPDATE ON tdms_power_assets FOR EACH ROW EXECUTE FUNCTION sync_to_control_room();
CREATE TRIGGER smms_sync_trigger AFTER INSERT OR UPDATE ON smms_signal_assets FOR EACH ROW EXECUTE FUNCTION sync_to_control_room();

-- 7. CSV Integration via PostgreSQL COPY command
-- Update the file paths to point to your physical directory environment.
\copy tms_track_assets(track_job_id, line_section, line_direction, start_km, end_km, structure_type, work_category, tdms_collab_req, smms_collab_req, required_duration_mins, reported_by, blockchain_tx_hash) FROM 'tms_track_assets.csv' DELIMITER ',' CSV HEADER;
\copy tdms_power_assets(power_job_id, line_section, line_direction, source_mast_no, target_mast_no, power_isolation_needed, work_category, tms_collab_req, smms_collab_req, required_duration_mins, reported_by, blockchain_tx_hash) FROM 'tdms_power_assets.csv' DELIMITER ',' CSV HEADER;
\copy smms_signal_assets(signal_job_id, station_code, point_machine_no, interlocking_panel, work_category, tdms_collab_req, tms_collab_req, required_duration_mins, reported_by, blockchain_tx_hash) FROM 'smms_signal_assets.csv' DELIMITER ',' CSV HEADER;
