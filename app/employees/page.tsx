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
  department: { name: string };
  role: string;
  rfid_tag: string;
  email: string;
  phone_number: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);

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
          employee_id: emp._id, // Utiliser _id comme employee_id
          fullName: `${emp.first_name} ${emp.last_name}`,
          department: emp.department_id ? emp.department_id : { name: emp.department || "N/A" },
          status: emp.status.charAt(0).toUpperCase() + emp.status.slice(1), // Normaliser "active" -> "Active"
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
    if (currentEmployee && isEditing) {
      form.setFieldsValue({
        first_name: currentEmployee.first_name,
        last_name: currentEmployee.last_name,
        employee_id: currentEmployee.employee_id,
        department: currentEmployee.department?.name,
        role: currentEmployee.role,
        rfid_tag: currentEmployee.rfid_tag,
        email: currentEmployee.email,
        phone_number: currentEmployee.phone_number,
        status: currentEmployee.status,
      });
    } else {
      form.resetFields();
    }
  }, [currentEmployee, isEditing, form]);

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

    const matchesDepartment = departmentFilter
      ? e.department?.name === departmentFilter
      : true;
    const matchesStatus = statusFilter
      ? e.status.toLowerCase() === statusFilter.toLowerCase()
      : true;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Gérer la soumission du formulaire pour l'assignation/mise à jour RFID
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (currentEmployee) {
        const response = await fetch(`/api/employees/${currentEmployee._id}/rfid`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rfid_tag: values.rfid_tag }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update RFID tag");
        }

        const updatedEmployee = await response.json();
        setEmployees((prev) =>
          prev.map((emp) =>
            emp._id === currentEmployee._id ? { ...emp, rfid_tag: updatedEmployee.rfid_tag } : emp
          )
        );
        setIsModalVisible(false);
        form.resetFields();
        setCurrentEmployee(null);
        message.success("RFID tag updated successfully");
      }
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du tag RFID:", error);
      message.error(error.message || "Failed to update RFID tag");
    }
  };

  // Basculer le statut de l'employé (actif/inactif)
  const toggleEmployeeStatus = async (employee: Employee) => {
    try {
      const newStatus = employee.status === "Active" ? "inactive" : "active"; // Utiliser des minuscules pour l'API
      const response = await fetch("/api/employees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: employee._id, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update employee status");
      }

      const updatedEmployee = await response.json();
      setEmployees((prev) =>
        prev.map((emp) =>
          emp._id === employee._id
            ? {
                ...emp,
                status: updatedEmployee.status.charAt(0).toUpperCase() + updatedEmployee.status.slice(1),
              }
            : emp
        )
      );
      message.success("Employee status updated successfully");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      message.error("Failed to update employee status");
    }
  };

  // Afficher le modal pour l'assignation/édition RFID
  const showRfidModal = (employee: Employee) => {
    setCurrentEmployee(employee);
    form.setFieldsValue({
      rfid_tag: employee.rfid_tag || "",
    });
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
      dataIndex: "department",
      key: "department",
      render: (department: { name: string }) => department?.name || "N/A",
    },
    {
      title: "RFID Tag",
      dataIndex: "rfid_tag",
      key: "rfid_tag",
      render: (rfid_tag: string) =>
        rfid_tag ? <Tag color="blue">{rfid_tag}</Tag> : <Tag color="red">Not Assigned</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>,
    },
    {
      title: "RFID Actions",
      key: "actions",
      render: (_: any, record: Employee) => (
        <Space size="small">
          {record.rfid_tag ? (
            <>
              <Tooltip title="Edit RFID">
                <Button icon={<EditOutlined />} onClick={() => showRfidModal(record)} type="primary" size="small" />
              </Tooltip>
              <Tooltip title="Remove RFID">
                <Button icon={<StopOutlined />} onClick={() => removeRfid(record)} danger size="small" />
              </Tooltip>
            </>
          ) : (
            <Tooltip title="Assign RFID">
              <Button icon={<IdcardOutlined />} onClick={() => showRfidModal(record)} type="primary" size="small" />
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
      <Title level={2}>Employee RFID Management</Title>

      {/* Search and Filter Bar */}
      <Card className="mb-4">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8} md={6} lg={6}>
            <Input
              placeholder="Search by name or ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={5} lg={4}>
            <Select
              placeholder="Filter by Department"
              style={{ width: "100%" }}
              value={departmentFilter}
              onChange={setDepartmentFilter}
              allowClear
            >
              <Option value="Executive">Executive</Option>
              <Option value="Administration">Administration</Option>
              <Option value="IT">IT</Option>
              <Option value="HR">HR</Option>
              <Option value="Finance">Finance</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={5} lg={4}>
            <Select
              placeholder="Filter by Status"
              style={{ width: "100%" }}
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
            >
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={5} lg={4}>
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

      {/* RFID Management Modal */}
      <Modal
        title={currentEmployee?.rfid_tag ? "Edit RFID Tag" : "Assign RFID Tag"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>
            {currentEmployee?.rfid_tag ? "Update RFID" : "Assign RFID"}
          </Button>,
        ]}
      >
        {currentEmployee && (
          <Form form={form} layout="vertical">
            <div className="mb-4">
              <Text strong>Employee: </Text>
              <Text>{currentEmployee.fullName}</Text>
            </div>
            <div className="mb-4">
              <Text strong>ID: </Text>
              <Text>{currentEmployee.employee_id}</Text>
            </div>
            <Form.Item name="rfid_tag" label="RFID Tag" rules={[{ required: true, message: "Please enter RFID tag" }]}>
              <Input placeholder="Enter RFID tag" />
            </Form.Item>
          </Form>
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
          currentEmployee && currentEmployee.rfid_tag ? (
            <Button
              key="edit-rfid"
              type="primary"
              onClick={() => {
                setIsDetailVisible(false);
                showRfidModal(currentEmployee as Employee);
              }}
            >
              Edit RFID
            </Button>
          ) : (
            <Button
              key="assign-rfid"
              type="primary"
              onClick={() => {
                setIsDetailVisible(false);
                showRfidModal(currentEmployee as Employee);
              }}
            >
              Assign RFID
            </Button>
          ),
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
                      <Text type="secondary">{currentEmployee.role || "N/A"}</Text>
                      <div className="mt-2">
                        <Badge
                          status={currentEmployee.status === "Active" ? "success" : "error"}
                          text={currentEmployee.status}
                        />
                      </div>
                    </div>
                    <Divider />
                    <div>
                      <p>
                        <IdcardOutlined className="mr-2" />
                        <Text strong>ID:</Text> {currentEmployee.employee_id}
                      </p>
                      <p>
                        <TeamOutlined className="mr-2" />
                        <Text strong>Department:</Text> {currentEmployee.department?.name || "N/A"}
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
                      <Col span={12}>
                        <Text strong>Status:</Text>
                        <div>
                          <Tag color={currentEmployee.status === "Active" ? "green" : "red"}>
                            {currentEmployee.status}
                          </Tag>
                        </div>
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