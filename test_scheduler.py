from database import SessionLocal
from scheduler import schedule_jobs_from_db


def main():
    db = SessionLocal()

    try:
        result = schedule_jobs_from_db(
            db,
            time_limit_sec=15
        )

        print("=" * 60)
        print("Monocle -AI DATABASE SCHEDULER")
        print("=" * 60)

        print("Status:", result["status"])
        print("Solver time:", result.get("solver_time_sec"), "seconds")

        print("\nMETRICS")
        print("-" * 60)

        metrics = result["metrics"]

        for key, value in metrics.items():
            print(f"{key}: {value}")

        print("\nVALIDATION")
        print("-" * 60)

        validation = result["validation"]

        print("Valid:", validation["valid"])

        if validation["errors"]:
            for error in validation["errors"]:
                print("ERROR:", error)

        print("\nFIRST 10 SCHEDULED JOBS")
        print("-" * 60)

        for job in result["scheduled_jobs"][:10]:
            print(
                f"{job['job_id']} | "
                f"{job['department']} | "
                f"{job['start']} - {job['end']} | "
                f"{job['block_type']} | "
                f"{job['block_id']} | "
                f"Priority {job['priority']}"
            )

        print("\nJOINT BLOCKS")
        print("-" * 60)

        for block in result["blocks"]:
            if block["block_type"] == "JOINT":
                print(
                    f"{block['block_id']} | "
                    f"{block['section']} | "
                    f"{block['start']} - {block['end']} | "
                    f"{block['departments']} | "
                    f"{block['jobs']}"
                )

        print("=" * 60)

    finally:
        db.close()


if __name__ == "__main__":
    main()