"use client";
import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Select,
  Table,
  Space,
  Modal,
  Form,
  Tabs,
  Tag,
  Divider,
  Card,
  Typography,
  Row,
  Col,
  Badge,
  Tooltip,
  Calendar,
  List,
  Avatar,
  message,
} from "antd";
import {
  EditOutlined,
  EyeOutlined,
  StopOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  IdcardOutlined,
  TeamOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Sample attendance data (à remplacer par une API plus tard)
const attendanceData = [
  { date: "2023-05-01", checkIn: "08:30", checkOut: "17:15" },
  { date: "2023-05-02", checkIn: "08:45", checkOut: "17:30" },
  { date: "2023-05-03", checkIn: "08:15", checkOut: "17:00" },
  { date: "2023-05-04", checkIn: "08:30", checkOut: "17:45" },
  { date: "2023-05-05", checkIn: "09:00", checkOut: "18:00" },
];

// Sample schedule data (à remplacer par une API plus tard)
const scheduleData = [
  { day: "Monday", start: "08:30", end: "17:00" },
  { day: "Tuesday", start: "08:30", end: "17:00" },
  { day: "Wednesday", start: "08:30", end: "17:00" },
  { day: "Thursday", start: "08:30", end: "17:00" },
  { day: "Friday", start: "08:30", end: "16:00" },
];

// Sample leave data (à remplacer par une API plus tard)
const leaveData = [
  { type: "Vacation", startDate: "2023-06-15", endDate: "2023-06-22", status: "Approved" },
  { type: "Sick Leave", startDate: "2023-04-03", endDate: "2023-04-04", status: "Taken" },
  { type: "Personal", startDate: "2023-07-10", endDate: "2023-07-10", status: "Pending" },
];

interface Employee {
  _id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  fullName: string;
  department_id: { _id: string; department_name: string };
  rfid_tag: string;
  email: string;
  phone_number: string;
  created_at: string;
  updated_at: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<{ _id: string; department_name: string }[]>([]);

  // Fetch departments for the dropdown
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch("/api/departments");
        if (!response.ok) {
          throw new Error(`Failed to fetch departments: ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Fetched Departments:", data);
        setDepartments(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des départements:", error);
        message.error("Failed to load departments");
      }
    };

    fetchDepartments();
  }, []);

  // Récupérer les employés depuis l'API au chargement de la page
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/employees");
        if (!response.ok) {
          throw new Error("Failed to fetch employees");
        }
        const data = await response.json();
        // Adapter les données pour correspondre à la structure attendue
        const formattedData = data.map((emp: any) => ({
          ...emp,
          employee_id: emp._id,
          fullName: `${emp.first_name} ${emp.last_name}`,
          department_id: emp.department_id || { _id: "", department_name: "N/A" },
          created_at: emp.createdAt,
          updated_at: emp.updatedAt,
        }));
        setEmployees(formattedData);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des employés:", error);
        message.error("Failed to load employees");
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Initialiser le formulaire avec les données de l'employé courant
  useEffect(() => {
    if (currentEmployee) {
      console.log("Current Employee:", currentEmployee);
      console.log("Departments:", departments);
      form.setFieldsValue({
        first_name: currentEmployee.first_name || "",
        last_name: currentEmployee.last_name || "",
        department_id: currentEmployee.department_id?._id || undefined,
        rfid_tag: currentEmployee.rfid_tag || "",
        email: currentEmployee.email || "",
        phone_number: currentEmployee.phone_number || "",
      });
    } else {
      form.resetFields();
    }
  }, [currentEmployee, form, departments]);

  // Filtrer les employés
  const filteredEmployees = employees.filter((e) => {
    const matchesSearch =
      search === "assigned"
        ? e.rfid_tag && e.rfid_tag.length > 0
        : search === "unassigned"
        ? !e.rfid_tag || e.rfid_tag.length === 0
        : e.fullName.toLowerCase().includes(search.toLowerCase()) ||
          e.employee_id.toLowerCase().includes(search.toLowerCase()) ||
          (e.rfid_tag && e.rfid_tag.toLowerCase().includes(search.toLowerCase()));

    return matchesSearch;
  });

  // Gérer la soumission du formulaire pour la mise à jour des données de l'employé
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (currentEmployee) {
        const updatedData = {
          id: currentEmployee._id,
          first_name: values.first_name,
          last_name: values.last_name,
          department_id: values.department_id,
          rfid_tag: values.rfid_tag,
          email: values.email,
          phone_number: values.phone_number,
        };

        console.log("Sending PUT request with data:", updatedData);

        const response = await fetch("/api/employees", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        });

        const responseData = await response.json();
        console.log("PUT response:", responseData);

        if (!response.ok) {
          throw new Error(responseData.error || "Failed to update employee");
        }

        setEmployees((prev) =>
          prev.map((emp) =>
            emp._id === currentEmployee._id
              ? {
                  ...emp,
                  first_name: updatedData.first_name,
                  last_name: updatedData.last_name,
                  fullName: `${updatedData.first_name} ${updatedData.last_name}`,
                  department_id:
                    departments.find((dept) => dept._id === updatedData.department_id) || emp.department_id,
                  rfid_tag: updatedData.rfid_tag,
                  email: updatedData.email,
                  phone_number: updatedData.phone_number,
                  updated_at: responseData.updated_at || new Date().toISOString(),
                }
              : emp
          )
        );
        setIsModalVisible(false);
        form.resetFields();
        setCurrentEmployee(null);
        message.success("Employee updated successfully");
      }
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de l'employé:", error);
      message.error(error.message || "Failed to update employee");
    }
  };

  // Afficher le modal pour l'édition des données de l'employé
  const showEditModal = (employee: Employee) => {
    console.log("Opening edit modal for employee:", employee);
    setCurrentEmployee(employee);
    setIsModalVisible(true);
  };

  // Supprimer le tag RFID d'un employé
  const removeRfid = async (employee: Employee) => {
    Modal.confirm({
      title: "Remove RFID Tag",
      content: `Are you sure you want to remove the RFID tag (${employee.rfid_tag}) from ${employee.fullName}?`,
      async onOk() {
        try {
          const response = await fetch(`/api/employees/${employee._id}/rfid`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to remove RFID tag");
          }

          const updatedEmployee = await response.json();
          setEmployees((prev) =>
            prev.map((emp) =>
              emp._id === employee._id ? { ...emp, rfid_tag: updatedEmployee.rfid_tag } : emp
            )
          );
          message.success("RFID tag removed successfully");
        } catch (error) {
          console.error("Erreur lors de la suppression du tag RFID:", error);
          message.error("Failed to remove RFID tag");
        }
      },
    });
  };

  const showEmployeeDetails = (employee: Employee) => {
    setCurrentEmployee(employee);
    setIsDetailVisible(true);
  };

  // Colonnes du tableau
  const columns = [
    {
      title: "ID",
      dataIndex: "employee_id",
      key: "employee_id",
      sorter: (a: Employee, b: Employee) => a.employee_id.localeCompare(b.employee_id),
    },
    {
      title: "Name",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a: Employee, b: Employee) => a.fullName.localeCompare(b.fullName),
      render: (text: string, record: Employee) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          {text}
        </Space>
      ),
    },
    {
      title: "Department",
      dataIndex: "department_id",
      key: "department_id",
      render: (department_id: { department_name: string }) => department_id?.department_name || "N/A",
    },
    {
      title: "RFID Tag",
      dataIndex: "rfid_tag",
      key: "rfid_tag",
      render: (rfid_tag: string) =>
        rfid_tag ? <Tag color="blue">{rfid_tag}</Tag> : <Tag color="red">Not Assigned</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Employee) => (
        <Space size="small">
          {record.rfid_tag ? (
            <>
              <Tooltip title="Edit Employee">
                <Button icon={<EditOutlined />} onClick={() => showEditModal(record)} type="primary" size="small" />
              </Tooltip>
              <Tooltip title="Remove RFID">
                <Button icon={<StopOutlined />} onClick={() => removeRfid(record)} danger size="small" />
              </Tooltip>
            </>
          ) : (
            <Tooltip title="Assign/Edit Employee">
              <Button icon={<IdcardOutlined />} onClick={() => showEditModal(record)} type="primary" size="small" />
            </Tooltip>
          )}
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              onClick={() => showEmployeeDetails(record)}
              type="default"
              size="small"
              ghost
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="p-6">
      <Title level={2}>Employee Management</Title>

      {/* Search and Filter Bar */}
      <Card className="mb-4">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={12} lg={12}>
            <Input
              placeholder="Search by name or ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <Select
              placeholder="RFID Status"
              style={{ width: "100%" }}
              onChange={(value) => setSearch(value ? value : "")}
              allowClear
            >
              <Option value="assigned">Has RFID</Option>
              <Option value="unassigned">No RFID</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Employee Table */}
      <Card>
        <Table dataSource={filteredEmployees} columns={columns} rowKey="_id" pagination={{ pageSize: 10 }} />
      </Card>

      {/* Employee Edit Modal */}
      <Modal
        title="Edit Employee"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>
            Save Changes
          </Button>,
        ]}
      >
        {currentEmployee ? (
          <Form form={form} layout="vertical">
            <div className="mb-4">
              <Text strong>Employee ID: </Text>
              <Text>{currentEmployee.employee_id}</Text>
            </div>
            <Form.Item
              name="first_name"
              label="First Name"
              rules={[{ required: true, message: "Please enter first name" }]}
            >
              <Input placeholder="Enter first name" />
            </Form.Item>
            <Form.Item
              name="last_name"
              label="Last Name"
              rules={[{ required: true, message: "Please enter last name" }]}
            >
              <Input placeholder="Enter last name" />
            </Form.Item>
            <Form.Item
              name="department_id"
              label="Department"
              rules={[{ required: true, message: "Please select a department" }]}
            >
              <Select placeholder="Select department" value={currentEmployee.department_id?._id}>
                {departments.map((dept) => (
                  <Option key={dept._id} value={dept._id}>
                    {dept.department_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="rfid_tag" label="RFID Tag">
              <Input placeholder="Enter RFID tag" />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ type: "email", message: "Please enter a valid email" }]}
            >
              <Input placeholder="Enter email" />
            </Form.Item>
            <Form.Item name="phone_number" label="Phone Number">
              <Input placeholder="Enter phone number" />
            </Form.Item>
          </Form>
        ) : (
          <p>Loading employee data...</p>
        )}
      </Modal>

      {/* Employee Detail Modal */}
      <Modal
        title="Employee Details"
        open={isDetailVisible}
        onCancel={() => setIsDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailVisible(false)}>
            Close
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              setIsDetailVisible(false);
              showEditModal(currentEmployee as Employee);
            }}
          >
            Edit Employee
          </Button>,
        ]}
        width={1000}
      >
        {currentEmployee && (
          <Tabs defaultActiveKey="profile">
            <TabPane
              tab={
                <span>
                  <UserOutlined />
                  Profile
                </span>
              }
              key="profile"
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                  <Card>
                    <div className="text-center mb-4">
                      <Avatar size={100} icon={<UserOutlined />} />
                      <Title level={4} className="mt-2 mb-0">
                        {currentEmployee.fullName}
                      </Title>
                    </div>
                    <Divider />
                    <div>
                      <p>
                        <IdcardOutlined className="mr-2" />
                        <Text strong>ID:</Text> {currentEmployee.employee_id}
                      </p>
                      <p>
                        <TeamOutlined className="mr-2" />
                        <Text strong>Department:</Text> {currentEmployee.department_id?.department_name || "N/A"}
                      </p>
                      <p>
                        <MailOutlined className="mr-2" />
                        <Text strong>Email:</Text> {currentEmployee.email || "Not provided"}
                      </p>
                      <p>
                        <PhoneOutlined className="mr-2" />
                        <Text strong>Phone:</Text> {currentEmployee.phone_number || "Not provided"}
                      </p>
                      <p>
                        <CalendarOutlined className="mr-2" />
                        <Text strong>Created At:</Text>{" "}
                        {new Date(currentEmployee.created_at).toLocaleDateString()}
                      </p>
                      <p>
                        <CalendarOutlined className="mr-2" />
                        <Text strong>Updated At:</Text>{" "}
                        {new Date(currentEmployee.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} md={16}>
                  <Card title="Employee Information">
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Text strong>First Name:</Text>
                        <div>{currentEmployee.first_name}</div>
                      </Col>
                      <Col span={12}>
                        <Text strong>Last Name:</Text>
                        <div>{currentEmployee.last_name}</div>
                      </Col>
                      <Col span={12}>
                        <Text strong>RFID Tag:</Text>
                        <div>{currentEmployee.rfid_tag || "Not Assigned"}</div>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            </TabPane>
            <TabPane
              tab={
                <span>
                  <ClockCircleOutlined />
                  Attendance History
                </span>
              }
              key="attendance"
            >
              <Card>
                <Table
                  dataSource={attendanceData}
                  columns={[
                    {
                      title: "Date",
                      dataIndex: "date",
                      key: "date",
                      render: (text) => new Date(text).toLocaleDateString(),
                    },
                    { title: "Check In", dataIndex: "checkIn", key: "checkIn" },
                    { title: "Check Out", dataIndex: "checkOut", key: "checkOut" },
                    {
                      title: "Total Hours",
                      key: "totalHours",
                      render: (_, record) => {
                        const checkIn = record.checkIn.split(":");
                        const checkOut = record.checkOut.split(":");
                        const startHours = Number.parseInt(checkIn[0]);
                        const startMinutes = Number.parseInt(checkIn[1]);
                        const endHours = Number.parseInt(checkOut[0]);
                        const endMinutes = Number.parseInt(checkOut[1]);

                        const totalMinutes = endHours * 60 + endMinutes - (startHours * 60 + startMinutes);
                        const hours = Math.floor(totalMinutes / 60);
                        const minutes = totalMinutes % 60;

                        return `${hours}h ${minutes}m`;
                      },
                    },
                  ]}
                  pagination={false}
                />
              </Card>
            </TabPane>
            <TabPane
              tab={
                <span>
                  <CalendarOutlined />
                  Schedule
                </span>
              }
              key="schedule"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card title="Weekly Schedule">
                    <List
                      itemLayout="horizontal"
                      dataSource={scheduleData}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta title={item.day} description={`${item.start} - ${item.end}`} />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title="Monthly View">
                    <Calendar fullscreen={false} />
                  </Card>
                </Col>
              </Row>
            </TabPane>
            <TabPane
              tab={
                <span>
                  <CalendarOutlined />
                  Leave
                </span>
              }
              key="leave"
            >
              <Card>
                <Table
                  dataSource={leaveData}
                  columns={[
                    { title: "Type", dataIndex: "type", key: "type" },
                    {
                      title: "Start Date",
                      dataIndex: "startDate",
                      key: "startDate",
                      render: (text) => new Date(text).toLocaleDateString(),
                    },
                    {
                      title: "End Date",
                      dataIndex: "endDate",
                      key: "endDate",
                      render: (text) => new Date(text).toLocaleDateString(),
                    },
                    {
                      title: "Duration",
                      key: "duration",
                      render: (_, record) => {
                        const start = new Date(record.startDate);
                        const end = new Date(record.endDate);
                        const diffTime = Math.abs(end.getTime() - start.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                        return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
                      },
                    },
                    {
                      title: "Status",
                      dataIndex: "status",
                      key: "status",
                      render: (status) => {
                        let color = "blue";
                        if (status === "Approved") color = "green";
                        if (status === "Rejected") color = "red";
                        if (status === "Taken") color = "purple";
                        return <Tag color={color}>{status}</Tag>;
                      },
                    },
                  ]}
                  pagination={false}
                />
              </Card>
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
}