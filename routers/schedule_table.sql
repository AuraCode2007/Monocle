-- schedule_table.sql
-- Stores the Python list returned by scheduler.py (scheduled_jobs)
-- so the Gantt chart can read from PostgreSQL instead of only in memory.

DROP TABLE IF EXISTS schedule CASCADE;

CREATE TABLE schedule (
    job_id VARCHAR(50) PRIMARY KEY,
    department VARCHAR(20) NOT NULL,
    section VARCHAR(100) NOT NULL,
    direction VARCHAR(10) NOT NULL,
    resource_key VARCHAR(120) NOT NULL,
    priority INT NOT NULL,
    work_category VARCHAR(100) NOT NULL,
    duration_mins INT NOT NULL,
    start_mins INT NOT NULL,
    end_mins INT NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    block_id VARCHAR(50) NOT NULL,
    block_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION load_schedule_from_json(schedule_json jsonb)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    rows_loaded INTEGER := 0;
BEGIN
    -- Replace the previous schedule contents with the latest scheduler output
    TRUNCATE TABLE schedule;

    INSERT INTO schedule (
        job_id,
        department,
        section,
        direction,
        resource_key,
        priority,
        work_category,
        duration_mins,
        start_mins,
        end_mins,
        start_time,
        end_time,
        block_id,
        block_type,
        status
    )
    SELECT
        item->>'job_id',
        item->>'department',
        item->>'section',
        item->>'direction',
        item->>'resource_key',
        (item->>'priority')::INT,
        item->>'work_category',
        (item->>'duration_mins')::INT,
        (item->>'start_mins')::INT,
        (item->>'end_mins')::INT,
        item->>'start',
        item->>'end',
        item->>'block_id',
        item->>'block_type',
        item->>'status'
    FROM jsonb_array_elements(schedule_json) AS item;

    GET DIAGNOSTICS rows_loaded = ROW_COUNT;

    RETURN rows_loaded;
END;
$$;

COMMENT ON TABLE schedule IS 'Persisted scheduler output for Gantt chart display.';
COMMENT ON FUNCTION load_schedule_from_json(jsonb) IS 'Loads the Python scheduled_jobs list from scheduler.py into the schedule table.';

-- Example usage after running scheduler.py:
-- SELECT load_schedule_from_json('[{"job_id":"JOB-1",...}]'::jsonb);
-- SELECT * FROM schedule ORDER BY start_mins;