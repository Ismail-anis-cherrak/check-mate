// Sample data based on your database schema
export interface Employee {
    employee_id: string
    rfid_tag: string
    first_name: string
    last_name: string
    fullName: string
    department_id: number
    department: string
    phone_number: string
    email: string
    status: string
    created_at: string
    updated_at: string
    role: string
  }
  
  // Sample departments
  export const departments = [
    { id: 1, name: "Executive" },
    { id: 2, name: "Administration" },
    { id: 3, name: "IT" },
    { id: 4, name: "HR" },
    { id: 5, name: "Finance" },
    { id: 6, name: "Operations" },
  ]
  
  // Sample employees data matching your database schema
  export const employeesData: Employee[] = [
    {
      employee_id: "EMP001",
      rfid_tag: "A12345",
      first_name: "John",
      last_name: "Doe",
      fullName: "John Doe",
      department_id: 1,
      department: "Executive",
      phone_number: "+1 555-123-4567",
      email: "john.doe@company.com",
      status: "active",
      created_at: "2023-01-15T08:30:00Z",
      updated_at: "2023-01-15T08:30:00Z",
      role: "CEO",
    },
    {
      employee_id: "EMP002",
      rfid_tag: "",
      first_name: "Jane",
      last_name: "Smith",
      fullName: "Jane Smith",
      department_id: 2,
      department: "Administration",
      phone_number: "+1 555-987-6543",
      email: "jane.smith@company.com",
      status: "active",
      created_at: "2023-01-20T09:15:00Z",
      updated_at: "2023-01-20T09:15:00Z",
      role: "Secretary",
    },
    {
      employee_id: "EMP003",
      rfid_tag: "B67890",
      first_name: "Robert",
      last_name: "Johnson",
      fullName: "Robert Johnson",
      department_id: 3,
      department: "IT",
      phone_number: "+1 555-456-7890",
      email: "robert.johnson@company.com",
      status: "active",
      created_at: "2023-02-05T10:00:00Z",
      updated_at: "2023-02-05T10:00:00Z",
      role: "Developer",
    },
    {
      employee_id: "EMP004",
      rfid_tag: "",
      first_name: "Maria",
      last_name: "Garcia",
      fullName: "Maria Garcia",
      department_id: 4,
      department: "HR",
      phone_number: "+1 555-222-3333",
      email: "maria.garcia@company.com",
      status: "active",
      created_at: "2023-02-10T11:30:00Z",
      updated_at: "2023-02-10T11:30:00Z",
      role: "Manager",
    },
    {
      employee_id: "EMP005",
      rfid_tag: "C13579",
      first_name: "David",
      last_name: "Chen",
      fullName: "David Chen",
      department_id: 3,
      department: "IT",
      phone_number: "+1 555-444-5555",
      email: "david.chen@company.com",
      status: "active",
      created_at: "2023-03-01T09:45:00Z",
      updated_at: "2023-03-01T09:45:00Z",
      role: "System Admin",
    },
    {
      employee_id: "EMP006",
      rfid_tag: "",
      first_name: "Sarah",
      last_name: "Wilson",
      fullName: "Sarah Wilson",
      department_id: 5,
      department: "Finance",
      phone_number: "+1 555-666-7777",
      email: "sarah.wilson@company.com",
      status: "inactive",
      created_at: "2023-03-15T14:20:00Z",
      updated_at: "2023-04-01T10:15:00Z",
      role: "Accountant",
    },
    {
      employee_id: "EMP007",
      rfid_tag: "D24680",
      first_name: "Michael",
      last_name: "Brown",
      fullName: "Michael Brown",
      department_id: 6,
      department: "Operations",
      phone_number: "+1 555-888-9999",
      email: "michael.brown@company.com",
      status: "active",
      created_at: "2023-04-05T08:00:00Z",
      updated_at: "2023-04-05T08:00:00Z",
      role: "Supervisor",
    },
    {
      employee_id: "EMP008",
      rfid_tag: "",
      first_name: "Emily",
      last_name: "Taylor",
      fullName: "Emily Taylor",
      department_id: 3,
      department: "IT",
      phone_number: "+1 555-111-2222",
      email: "emily.taylor@company.com",
      status: "active",
      created_at: "2023-04-20T13:10:00Z",
      updated_at: "2023-04-20T13:10:00Z",
      role: "QA Engineer",
    },
  ]
  
  