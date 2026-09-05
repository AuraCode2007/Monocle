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

-- Mock 25 set data for tms
INSERT INTO tms_track_assets (track_job_id, line_section, line_direction, start_km, end_km, structure_type, work_category, tdms_collab_req, smms_collab_req, required_duration_mins, reported_by, blockchain_tx_hash) VALUES
('JOB-TMS-001', 'HWH-DEL', 'UP', 102.500, 103.200, 'Ballast Bed', 'Deep Screening', true, false, 240, 'A. K. Sharma', '0x7f83b2c1a4e5d6f7890123456789abcdef0123456789abcdef0123456789abcd'),
('JOB-TMS-002', 'BCT-NDLS', 'DN', 45.120, 45.150, 'Turnout Points', 'Rail Weld Grinding', false, true, 90, 'Rajesh Verma', '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b'),
('JOB-TMS-003', 'MAS-HWH', 'UP', 812.000, 814.500, 'Embankment', 'Slope Stabilization', false, false, 180, 'Vikram Singh', '0x9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c'),
('JOB-TMS-004', 'SDAH-LGL', 'DN', 12.340, 12.390, 'Level Crossing', 'Rubber Pad Replacement', true, true, 120, 'Amit Ghoshal', '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d'),
('JOB-TMS-005', 'CSTM-MAO', 'UP', 204.750, 205.100, 'Bridge Approach', 'De-stressing of Rails', false, false, 150, 'Sanjay Patil', '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f'),
('JOB-TMS-006', 'NDLS-JAT', 'UP', 310.050, 311.000, 'Tunnel 4 Base', 'Track Concrete Grouting', true, false, 300, 'Harpreet Singh', '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b'),
('JOB-TMS-007', 'HWH-GAYA', 'DN', 198.400, 199.000, 'Main Line Curve', 'Sleeper Renewal', false, false, 210, 'Subhash Pal', '0xf9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0'),
('JOB-TMS-008', 'PNBE-HWH', 'UP', 55.600, 56.100, 'Viaduct Pier', 'Expansion Joint Repair', false, false, 180, 'Ramesh Yadav', '0xb1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2'),
('JOB-TMS-009', 'SBC-MAS', 'DN', 142.250, 142.800, 'Cutting Section', 'Boulder Clearing', false, false, 100, 'M. Suresh Kumar', '0xd3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4'),
('JOB-TMS-010', 'ADI-BCT', 'UP', 22.100, 23.400, 'Station Yard', 'Points Rail Replacement', false, true, 135, 'Vijay Mehta', '0xe4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5'),
('JOB-TMS-011', 'LKO-NDLS', 'DN', 415.800, 416.000, 'Bridge No 42', 'Guard Rail Tightening', false, false, 75, 'Nitin Saxena', '0xf5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6'),
('JOB-TMS-012', 'GHY-NJP', 'UP', 88.450, 89.150, 'Catch Siding', 'Buffer Stop Inspection', false, false, 60, 'J. Borah', '0xa6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7'),
('JOB-TMS-013', 'VSKP-MAS', 'DN', 512.300, 514.000, 'Main Track', 'TRT Machine Sleepers', true, false, 360, 'P. Sreenu', '0xb7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8'),
('JOB-TMS-014', 'NZM-KOTA', 'UP', 180.500, 181.200, 'Curve Track', 'Rail Lubricator Install', false, false, 90, 'R. K. Meena', '0xc8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9'),
('JOB-TMS-015', 'NGP-CSMT', 'DN', 620.150, 620.250, 'Level Crossing', 'Check Rail Clearance', false, true, 45, 'Sunil Deshmukh', '0xd9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0'),
('JOB-TMS-016', 'PUNE-SUR', 'UP', 94.320, 95.120, 'Crossover Track', 'Insulated Joint Fix', false, true, 110, 'A. V. Joshi', '0xe0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1'),
('JOB-TMS-017', 'CNB-ALD', 'DN', 110.400, 112.000, 'High Speed Loop', 'Track Tamping Machine', true, false, 240, 'M. P. Yadav', '0xf1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2'),
('JOB-TMS-018', 'GKP-CPR', 'UP', 35.700, 36.200, 'Embankment', 'Ballast Regulating', false, false, 150, 'S. K. Rai', '0xa2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3'),
('JOB-TMS-019', 'MDU-TPJ', 'DN', 145.850, 146.000, 'Bridge Channel', 'Timber Hook Bolt Tight', false, false, 120, 'R. Pandian', '0xb3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4'),
('JOB-TMS-020', 'RE-JP', 'UP', 72.150, 73.000, 'Sand Hump', 'Derailment Switch Check', false, true, 80, 'Ram Niwas', '0xc4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5'),
('JOB-TMS-021', 'BJU-GHY', 'DN', 280.400, 281.900, 'Switches Cross', 'CMS Crossover Build', true, true, 270, 'N. K. Das', '0xd5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6'),
('JOB-TMS-022', 'TATA-HWH', 'UP', 154.600, 155.000, 'Glued Joint', 'Defect Track Isolation', false, true, 70, 'S. Chakraborty', '0xe6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7'),
('JOB-TMS-023', 'ASN-GAYA', 'DN', 89.200, 89.900, 'Cutting Section', 'Side Drain Desilting', false, false, 100, 'Ranjit Singh', '0xf7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8'),
('JOB-TMS-024', 'R-NGP', 'UP', 241.350, 242.000, 'Main Track', 'USFD Testing Ultra', false, false, 160, 'Alok Mishra', '0xa8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9'),
('JOB-TMS-025', 'SC-BZA', 'DN', 315.650, 316.450, 'Station Loop', 'Turnout Rail Grinding', true, true, 140, 'K. Jagannath', '0xb9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0');

-- Mock 25 set data for tdms
-- --- B. TDMS POWER ASSETS (CORRECTED HASH LENGTHS) ---
INSERT INTO tdms_power_assets (power_job_id, line_section, line_direction, source_mast_no, target_mast_no, power_isolation_needed, work_category, tms_collab_req, smms_collab_req, required_duration_mins, reported_by, blockchain_tx_hash) VALUES
('JOB-OHE-001', 'HWH-DEL', 'UP', '102/14', '102/22', true, 'Contact Wire Replacement', true, false, 180, 'K. Srinivasan', '0x11223344556677889900aabbccddeeff0011223344556677889900aabbccdd'),
('JOB-OHE-002', 'BCT-NDLS', 'DN', '44/02', '44/10', true, 'OHE Bracket Adjustment', false, false, 60, 'Nitin Deshmukh', '0x223344556677889900aabbccddeeff0011223344556677889900aabbccdd11'),
('JOB-OHE-003', 'MAS-HWH', 'UP', '811/45', '812/05', true, 'Isolator Testing', false, true, 45, 'P. Venkatesh', '0x3344556677889900aabbccddeeff0011223344556677889900aabbccdd2233'),
('JOB-OHE-004', 'SDAH-LGL', 'DN', '12/15', '12/25', true, 'Catenary Dropper Tuning', true, false, 120, 'Gopal Das', '0x44556677889900aabbccddeeff0011223344556677889900aabbccdd334455'),
('JOB-OHE-005', 'CSTM-MAO', 'UP', '204/30', '205/02', false, 'Mast Foundation Inspection', false, false, 90, 'Anil Shinde', '0x556677889900aabbccddeeff0011223344556677889900aabbccdd44556677'),
('JOB-OHE-006', 'NDLS-JAT', 'UP', '309/88', '310/12', true, 'Steady Arm Replacement', true, false, 150, 'Jaspal Singh', '0x6677889900aabbccddeeff0011223344556677889900aabbccdd5566778899'),
('JOB-OHE-007', 'HWH-GAYA', 'DN', '198/14', '198/32', true, 'AT Transformer Check', false, true, 75, 'B. N. Rao', '0x77889900aabbccddeeff0011223344556677889900aabbccdd6677889900aa'),
('JOB-OHE-008', 'SBC-MAS', 'DN', '141/50', '142/10', true, 'Neutral Section Overhaul', true, true, 200, 'Ravi Chandran', '0x889900aabbccddeeff0011223344556677889900aabbccdd77889900aabbcc'),
('JOB-OHE-009', 'ADI-BCT', 'UP', '22/10A', '22/18A', true, 'Catenary Splice Install', true, false, 110, 'V. P. Solanki', '0x9900aabbccddeeff0011223344556677889900aabbccdd77889900aabbccdd'),
('JOB-OHE-010', 'LKO-NDLS', 'DN', '415/33', '415/45', true, 'Jumper Wire Renewal', false, false, 85, 'S. C. Tiwari', '0x00aabbccddeeff0011223344556677889900aabbccdd77889900aabbccddee'),
('JOB-OHE-011', 'GHY-NJP', 'UP', '88/12', '88/24', false, 'Mast Alignment Check', false, false, 50, 'A. K. Das', '0xaabbccddeeff0011223344556677889900aabbccdd77889900aabbccddeeff'),
('JOB-OHE-012', 'VSKP-MAS', 'DN', '512/04', '512/16', true, 'Overhead Tension Balance', true, false, 140, 'K. S. Rao', '0xbbccddeeff0011223344556677889900aabbccdd77889900aabbccddeeff00'),
('JOB-OHE-013', 'NZM-KOTA', 'UP', '180/15', '180/35', true, 'Section Insulator Repair', false, true, 95, 'K. C. Meena', '0xccddeeff0011223344556677889900aabbccdd77889900aabbccddeeff0011'),
('JOB-OHE-014', 'NGP-CSMT', 'DN', '619/80', '620/05', true, 'OHE Tree Trimming Clearance', true, false, 105, 'S. G. Kale', '0xddeeff0011223344556677889900aabbccdd77889900aabbccddeeff001122'),
('JOB-OHE-015', 'PUNE-SUR', 'UP', '94/10', '94/20', true, 'Contact Tension Weight Bolt', false, false, 70, 'M. M. Kulkarni', '0xeeff0011223344556677889900aabbccdd77889900aabbccddeeff00112233'),
('JOB-OHE-016', 'CNB-ALD', 'DN', '110/12', '110/40', true, 'Cross Catenary Overhaul', true, true, 160, 'P. K. Mishra', '0xff0011223344556677889900aabbccdd77889900aabbccddeeff0011223344'),
('JOB-OHE-017', 'GKP-CPR', 'UP', '35/20', '35/36', true, 'OHE Structure Painting', false, false, 130, 'V. K. Pandey', '0x0011223344556677889900aabbccdd77889900aabbccddeeff001122334455'),
('JOB-OHE-018', 'MDU-TPJ', 'DN', '145/42', '145/60', true, 'Feeder Line Insulator replacement', false, false, 80, 'S. Murugan', '0x11223344556677889900aabbccdd77889900aabbccddeeff00112233445566'),
('JOB-OHE-019', 'RE-JP', 'UP', '72/08', '72/24', true, 'OHE Cantilever Fitting Check', false, false, 65, 'Satyawan Singh', '0x223344556677889900aabbccdd77889900aabbccddeeff0011223344556677'),
('JOB-OHE-020', 'BJU-GHY', 'DN', '280/10', '280/50', true, 'Traction Substation Interlock Check', false, true, 115, 'S. Bhattacharya', '0x3344556677889900aabbccdd77889900aabbccddeeff001122334455667788'),
('JOB-OHE-021', 'TATA-HWH', 'UP', '154/22', '154/44', true, 'Return Conductor Connection', true, false, 90, 'D. K. Mahato', '0x44556677889900aabbccdd77889900aabbccddeeff00112233445566778899'),
('JOB-OHE-022', 'ASN-GAYA', 'DN', '89/10', '89/22', true, 'Earth Discharge Rod Testing', false, false, 40, 'N. C. Das', '0x556677889900aabbccdd77889900aabbccddeeff0011223344556677889900'),
('JOB-OHE-023', 'R-NGP', 'UP', '241/15', '241/30', true, 'Traction Mast Upgrade Fit', true, false, 150, 'A. K. Verma', '0x6677889900aabbccdd77889900aabbccddeeff0011223344556677889900aa'),
('JOB-OHE-024', 'SC-BZA', 'DN', '315/20', '315/48', true, 'Neutral Section Span Wire Fix', true, true, 175, 'Ch. Krishna', '0x77889900aabbccdd77889900aabbccddeeff0011223344556677889900aabb'),
('JOB-OHE-025', 'HWH-DEL', 'DN', '140/02', '140/22', true, 'OHE Cross-Over Sag Correction', true, false, 125, 'R. N. Prasad', '0x889900aabbccdd77889900aabbccddeeff0011223344556677889900aabbcc');


-- Mock 25 set data for smms
INSERT INTO smms_signal_assets (signal_job_id, station_code, point_machine_no, interlocking_panel, work_category, tdms_collab_req, tms_collab_req, required_duration_mins, reported_by, blockchain_tx_hash) VALUES
('JOB-SIG-001', 'HWH', 'PM-202A', 'EI-WEST-01', 'Point Machine Lubrication', false, true, 40, 'Debasish Roy', '0xaa11bb22cc33dd44ee55ff660011223344556677889900aabbccddeeff112233'),
('JOB-SIG-002', 'NDLS', 'PM-045B', 'RRI-CENTRAL', 'Axle Counter Testing', true, false, 90, 'S. K. Mishra', '0xbb22cc33dd44ee55ff660011223344556677889900aabbccddeeff112233aa11'),
('JOB-SIG-003', 'MAS', 'PM-112C', 'EI-SOUTH', 'Signal Lamp Replacement', false, false, 30, 'T. Elangovan', '0xcc33dd44ee55ff660011223344556677889900aabbccddeeff112233aa11bb22'),
('JOB-SIG-004', 'SDAH', 'PM-012A', 'RRI-EAST-02', 'Track Circuit Tuning', true, true, 110, 'N. K. Banerjee', '0xdd44ee55ff660011223344556677889900aabbccddeeff112233aa11bb22cc33'),
('JOB-SIG-005', 'CSTM', 'PM-089D', 'PI-PLAT-05', 'Interlocking Logic Patch', false, false, 60, 'Milind Tambe', '0xee55ff660011223344556677889900aabbccddeeff112233aa11bb22cc33dd44'),
('JOB-SIG-006', 'JAT', 'PM-004E', 'EI-NORTH', 'AFTC Parameter Tuning', false, true, 80, 'Baldev Raj', '0xff660011223344556677889900aabbccddeeff112233aa11bb22cc33dd44ee55'),
('JOB-SIG-007', 'GAYA', 'PM-156A', 'RRI-YARD', 'UFSBI Device Card Change', true, false, 50, 'S. N. Prasad', '0x0011223344556677889900aabbccddeeff112233aa11bb22cc33dd44ee55ff66'),
('JOB-SIG-008', 'SBC', 'PM-073B', 'EI-MAIN', 'Calling-On Signal Repair', false, false, 45, 'K. Raghavan', '0x11223344556677889900aabbccddeeff112233aa11bb22cc33dd44ee55ff6600'),
('JOB-SIG-009', 'ADI', 'PM-101F', 'EI-WEST', 'Point Rod Adjustment', false, true, 75, 'H. J. Patel', '0x223344556677889900aabbccddeeff112233aa11bb22cc33dd44ee55ff660011'),
('JOB-SIG-010', 'LKO', 'PM-034A', 'RRI-CABIN-A', 'LED Signal Aspect Clean', false, false, 35, 'V. P. Srivastava', '0x3344556677889900aabbccddeeff112233aa11bb22cc33dd44ee55ff66001122'),
('JOB-SIG-011', 'GHY', 'PM-055C', 'PI-STN', 'Signal Cable Insulation', true, false, 120, 'B. Baruah', '0x44556677889900aabbccddeeff112233aa11bb22cc33dd44ee55ff6600112233'),
('JOB-SIG-012', 'VSKP', 'PM-211A', 'EI-EAST', 'Relay Box Contact Clean', false, false, 55, 'M. V. Naidu', '0x556677889900aabbccddeeff112233aa11bb22cc33dd44ee55ff660011223344'),
('JOB-SIG-013', 'NZM', 'PM-118B', 'RRI-SOUTH', 'Shunt Signal Card Fix', false, false, 40, 'Deepak Kumar', '0x6677889900aabbccddeeff112233aa11bb22cc33dd44ee55ff66001122334455'),
('JOB-SIG-014', 'NGP', 'PM-092E', 'EI-YARD-A', 'Point Ground Connections Check', true, true, 100, 'A. G. Joshi', '0x77889900aabbccddeeff112233aa11bb22cc33dd44ee55ff6600112233445566'),
('JOB-SIG-015', 'PUNE', 'PM-067A', 'PI-CENTRAL', 'Fuse Auto-Changeover Test', false, false, 30, 'R. S. Kadam', '0x889900aabbccddeeff112233aa11bb22cc33dd44ee55ff660011223344556677'),
('JOB-SIG-016', 'CNB', 'PM-301C', 'RRI-NORTH', 'Data Logger Loop Module Fix', true, false, 85, 'A. K. Tiwari', '0x9900aabbccddeeff112233aa11bb22cc33dd44ee55ff66001122334455667788'),
('JOB-SIG-017', 'GKP', 'PM-022D', 'EI-STN-02', 'Integrated Power System Test', true, false, 95, 'O. P. Mishra', '0x00aabbccddeeff112233aa11bb22cc33dd44ee55ff6600112233445566778899'),
('JOB-SIG-018', 'MDU', 'PM-081B', 'PI-YARD', 'Choke Coil Replacement', false, true, 50, 'S. Kumar', '0xaabbccddeeff112233aa11bb22cc33dd44ee55ff660011223344556677889900'),
('JOB-SIG-019', 'RE', 'PM-015F', 'EI-CABIN', 'Block Instrument Calibration', false, false, 70, 'Satish Yadav', '0xbbccddeeff112233aa11bb22cc33dd44ee55ff660011223344556677889900aa'),
('JOB-SIG-020', 'BJU', 'PM-142A', 'RRI-MAIN', 'Axle Counter Evaluator Swap', true, false, 105, 'P. K. Das', '0xccddeeff112233aa11bb22cc33dd44ee55ff660011223344556677889900aabb'),
('JOB-SIG-021', 'TATA', 'PM-077B', 'EI-WEST', 'Signal Aspect Voltage Tuning', false, false, 45, 'A. K. Mahapatra', '0xddeeff112233aa11bb22cc33dd44ee55ff660011223344556677889900aabbcc'),
('JOB-SIG-022', 'ASN', 'PM-103C', 'RRI-EAST', 'Point Machine Detection Check', false, true, 60, 'S. S. Chatterjee', '0xeeff112233aa11bb22cc33dd44ee55ff660011223344556677889900aabbccdd'),
('JOB-SIG-023', 'R', 'PM-088A', 'EI-MAIN', 'Track Circuit Feed Resistance', false, true, 40, 'R. K. Sahu', '0xff112233aa11bb22cc33dd44ee55ff660011223344556677889900aabbccddee'),
('JOB-SIG-024', 'SC', 'PM-250E', 'RRI-YARD', 'UFSBI Link Media Converter', true, false, 65, 'B. Venkateswarlu', '0x112233aa11bb22cc33dd44ee55ff660011223344556677889900aabbccddeeff'),
('JOB-SIG-025', 'HWH', 'PM-204B', 'EI-WEST-02', 'Route Indicator Lamp Fix', false, false, 35, 'S. Mukherjee', '0x2233aa11bb22cc33dd44ee55ff660011223344556677889900aabbccddeeff11');
