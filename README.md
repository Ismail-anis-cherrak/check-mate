# RFID-Based Attendance System

Below is a detailed look at the **functionalities** your RFID-based attendance system could offer, along with **suggested improvements** to the database schema. The goal is to ensure you can track entries/exits accurately, manage employee data and schedules, generate statistics, and handle notifications for various attendance-related events.

---

## 1. Core Functionalities

1. **Employee Management (CRUD)**
   - Add new employees (with personal info, department, contact info, etc.).  
   - Update existing employee data.  
   - Deactivate employees who no longer work at the company (instead of deleting, to keep history).  
   - Assign or unassign RFID cards to employees.

2. **RFID-Based Check-In/Check-Out**
   - When an RFID card is scanned, the system logs the event (timestamp, employee/card ID, whether it’s an entry or exit).  
   - Possibility to have multiple RFID readers (e.g., main door, side door).  
   - Real-time indication of who is currently inside.

3. **Scheduling / Work Shifts**
   - Define daily or weekly schedules (start time, end time, break times if needed) for each employee or for entire departments.  
   - Mark which days an employee is supposed to work (vs. off-days, vacation, sick leave, etc.).  
   - Handle flexible schedules or rotating shifts if necessary.

4. **Attendance Tracking & Statistics**
   - Daily overview of who came in, who did not, and arrival times.  
   - Detect late arrivals (compare actual arrival vs. scheduled start).  
   - Track early departures.  
   - Monthly/Yearly attendance summary for each employee and for each department.  
   - Hours worked per day/week/month (in/out time calculation).  
   - Export attendance data as CSV, PDF, etc.

5. **Notifications & Alerts**
   - Notify you (the single system user) if an employee is late or has not checked in by a certain time.  
   - Optionally, notify employees of their attendance status (if you choose).  
   - Send daily/weekly/monthly reports automatically (e.g., email, PDF).

6. **Leave / Vacation Management (Optional but Useful)**
   - Track employees on vacation, sick leave, etc., so they do not appear as “absent” or “late.”  
   - Store the reason and duration of leave periods.

7. **Dashboard & Reporting**
   - A dashboard showing real-time info: who is in, who is out, total present, total absent.  
   - Quick links to daily/weekly/monthly attendance stats.  
   - Graphs showing trends (e.g., lateness, absences over time).

---

## 2. Suggested Database Schema

Below is a schema that can support the functionalities above. You can adapt table and column names to your preference.

### 2.1. Employees

**Table: `employees`**  
| Column         | Type        | Description                                                    |
|----------------|-------------|----------------------------------------------------------------|
| `employee_id`  | INT (PK)    | Unique identifier for each employee.                           |
| `rfid_tag`     | VARCHAR     | The RFID card/tag number assigned to the employee.            |
| `first_name`   | VARCHAR     | Employee’s first name.                                         |
| `last_name`    | VARCHAR     | Employee’s last name.                                          |
| `department_id`| INT (FK)    | References `departments.department_id`.                        |
| `phone_number` | VARCHAR     | Contact number (optional).                                     |
| `email`        | VARCHAR     | Email (optional).                                              |
| `status`       | VARCHAR     | e.g., “active,” “inactive,” “on_leave,” etc.                   |
| `created_at`   | DATETIME    | Record creation timestamp.                                     |
| `updated_at`   | DATETIME    | Record last update timestamp.                                  |

> **Notes**:  
> - You might store `rfid_tag` in a separate table if employees can have multiple cards over time.  
> - Add additional fields as needed (job title, hire date, etc.).

---

### 2.2. Departments

**Table: `departments`**  
| Column            | Type        | Description                                 |
|-------------------|-------------|---------------------------------------------|
| `department_id`   | INT (PK)    | Unique identifier for each department.      |
| `department_name` | VARCHAR     | e.g., “HR,” “IT,” “Finance,” etc.           |
| `created_at`      | DATETIME    | Record creation timestamp.                  |
| `updated_at`      | DATETIME    | Last update timestamp.                      |

> **Notes**:  
> - Useful for grouping employees and generating departmental statistics.

---

### 2.3. Attendance Logs (RFID Scans)

**Table: `attendance_logs`**  
| Column        | Type       | Description                                                       |
|---------------|----------- |-------------------------------------------------------------------|
| `log_id`      | INT (PK)   | Unique ID for each attendance event.                              |
| `employee_id` | INT (FK)   | References `employees.employee_id`.                               |
| `rfid_tag`    | VARCHAR    | Redundant storage of RFID tag (optional but helpful).             |
| `event_type`  | VARCHAR    | e.g., “IN” or “OUT.”                                              |
| `timestamp`   | DATETIME   | Exact time the RFID reader was triggered.                         |
| `device_id`   | VARCHAR    | If multiple RFID readers exist, store which device read the tag.  |

> **Notes**:  
> - Each row corresponds to **one** scan.  
> - You can determine total time inside by pairing “IN” with the next “OUT” for the same employee.  
> - `event_type` can be an enum or boolean if you prefer.

---

### 2.4. Schedules / Shifts

To handle lateness and expected attendance, you need to know an employee’s schedule:

**Table: `schedules`**  
| Column         | Type      | Description                                                  |
|----------------|-----------|--------------------------------------------------------------|
| `schedule_id`  | INT (PK)  | Unique identifier for the schedule record.                   |
| `employee_id`  | INT (FK)  | Which employee this schedule applies to.                     |
| `day_of_week`  | INT       | 1=Monday, 2=Tuesday, etc. (or store a date if it’s dynamic). |
| `start_time`   | TIME      | Scheduled start time.                                        |
| `end_time`     | TIME      | Scheduled end time.                                          |
| `active`       | BOOLEAN   | Indicates if this schedule is currently active.              |

> **Alternatively**:  
> - If schedules are uniform per department or shift, you can reference `department_id` or a `shift_id` table.  
> - For more complex scenarios (rotating shifts, etc.), you might store schedule patterns in a separate structure.

---

### 2.5. Leave / Absences (Optional but Recommended)

**Table: `leaves`**  
| Column         | Type       | Description                                     |
|----------------|----------- |-------------------------------------------------|
| `leave_id`     | INT (PK)   | Unique ID for each leave request/record.        |
| `employee_id`  | INT (FK)   | References `employees.employee_id`.             |
| `start_date`   | DATE       | Start date of leave.                            |
| `end_date`     | DATE       | End date of leave.                              |
| `leave_type`   | VARCHAR    | e.g., “Vacation,” “Sick,” “Unpaid,” etc.        |
| `status`       | VARCHAR    | e.g., “approved,” “pending,” “rejected.”        |

> **Notes**:  
> - During these dates, the employee is not expected to be “present,” so they should not appear as absent or late.

---

## 3. Application Flow & Detailed Features

### 3.1. RFID Scan Flow

- An employee swipes an RFID card at the entrance.  
- The system checks `rfid_tag` against the `employees` table.  
- A new record is inserted into `attendance_logs` with `event_type = "IN"` and current timestamp.  
- On exit, similarly, a record with `event_type = "OUT"` is created.

### 3.2. Daily Attendance Screen

- Show a list of employees expected to work today (based on `schedules` and not on leave).  
- Mark who has scanned “IN,” who is still “OUT,” who is on leave.  
- Highlight those who arrived late (if `IN` time > scheduled start_time).

### 3.3. Monthly/Yearly Stats

- For each employee or department, compute:  
  - Total days present, total days absent, total hours worked.  
  - Number of late arrivals or early departures.  
- Filter by date range (e.g., monthly or yearly).

### 3.4. Notifications

- If an employee has not scanned in after X minutes past their scheduled start time, generate a notification.  
- End-of-day notifications summarizing any anomalies (people who did not check out, etc.).

### 3.5. Leave & Vacation

- If an employee is on leave for a date range, they do not appear on the “expected” list for those days.  
- Store leaves so that the system doesn’t mark them as absent.

### 3.6. System Management

- Manage employees (CRUD).  
- Assign RFID tags.  
- Manage schedules (create, edit, delete).  
- Manage leave records.  
- View or export attendance logs.

---

## 4. Potential Improvements or Additional Tables

- **Table for Shifts**  
  If you have standardized shifts (e.g., 8 AM–4 PM, 9 AM–5 PM, etc.), you can store them in a dedicated table and link employees or departments to those shifts.

- **Table for Holidays**  
  Store public/company holidays so the system knows nobody is expected to attend on those days.

- **Aggregate/Archive Table**  
  Sometimes storing aggregated data (like total hours for each day per employee) helps generate reports faster rather than recalculating each time.

- **Audit Table**  
  If you need to track changes to critical data (e.g., who edited an employee’s schedule), keep a log of before/after states.

---

## 5. Is Your Current Schema Sufficient?

- **Employees**: You have `id`, `rfid`, `name`, `surname`, `department`, `telephone`. That’s a good start. Consider adding “active/inactive” status, email, or any additional info.  
- **Logs**: You have `id`, `timestamp`, `rfid`, and a `float`. You likely need an `event_type` (IN/OUT) or a way to differentiate entry from exit, plus a reference to the employee’s ID.  
- **Statistics**: You’ll compute them from the logs. That’s fine, but be sure to store enough data (event_type, timestamps) to do those calculations accurately.  
- **Who Didn’t Enter**: Compare the employees’ expected schedule vs. the logs. That means you need a schedule mechanism or a “working day” concept.  
- **Late Arrivals, Daily Presence**: Again requires comparing the log times to the scheduled times.  
- **People Who Don’t Work Today**: Hide them from the “expected to come” list. This requires either a day-by-day schedule or a default schedule plus exceptions (holidays, weekends, etc.).

In short, your schema is on the right track but you likely need:

1. A table to handle **departments** (or store them in a separate reference table).  
2. A table for **schedules** (or shifts) to know who is expected when.  
3. An **event_type** or “direction” column in your logs.  
4. A **leaves/vacation** table to accurately exclude people on leave from being flagged as absent.  

By adding these elements, you’ll cover all the functionalities (real-time notifications, daily presence, monthly/yearly stats, tracking who is absent or late) and ensure the application is flexible enough to scale in the future.
