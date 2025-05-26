"use client";

import React, { useState, useEffect } from "react";
import { Table, Spin, Button, message, Tag, Modal, Descriptions } from "antd";
import type { ColumnsType } from "antd/es/table";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const APP_NAME = "CheckMate";

interface Employee {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  department_id: { department_name: string };
}

interface MonthlyReport {
  present_days: number;
  absent_days: number;
  monthly_presence_rate: string;
  total_late: string;
  total_early_leaves: string;
  daily_reports: Array<{
    date: string;
    status: string;
    entry_time: string | null;
    leave_time: string | null;
    entered_late_by: string;
    left_early_by: string;
    presence_duration: string;
  }>;
}

interface DailyReport {
  status: string;
  entered_late_by_minutes: string;
  left_early_by_minutes: string;
  entry_time: string | null;
  leave_time: string | null;
}

interface TableData {
  key: string;
  id: string;
  name: string;
  department: string;
  email: string;
  monthly_presence_rate: string;
  present_days: number;
  absent_days: number;
  total_late: string;
  total_early_leaves: string;
  daily_status: string;
  daily_late: string;
  daily_early_leave: string;
  monthlyReport: MonthlyReport;
  dailyReport: DailyReport;
}

export default function StatisticsPage() {
  const [data, setData] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<TableData | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const employeesRes = await fetch("/api/employees");
        const employees: Employee[] = await employeesRes.json();

        if (!employeesRes.ok) {
          throw new Error("Failed to fetch employees");
        }

        const tableData: TableData[] = [];
        for (const emp of employees) {
          const monthlyRes = await fetch("/api/monthly_rapport", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ employee_id: emp._id }),
          });
          const monthlyReport: MonthlyReport = await monthlyRes.json();

          if (!monthlyRes.ok) {
            console.error("Failed to fetch monthly report for", emp._id);
            continue;
          }
//comment
          const dailyRes = await fetch("/api/daily_rapport", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ employee_id: emp._id }),
          });
          const dailyReport: DailyReport = await dailyRes.json();

          if (!dailyRes.ok) {
            console.error("Failed to fetch daily report for", emp._id);
            continue;
          }

          tableData.push({
            key: emp._id,
            id: emp._id,
            name: `${emp.first_name} ${emp.last_name}`,
            department: emp.department_id?.department_name || "N/A",
            email: emp.email || "N/A",
            monthly_presence_rate: monthlyReport.monthly_presence_rate || "0%",
            present_days: monthlyReport.present_days || 0,
            absent_days: monthlyReport.absent_days || 0,
            total_late: monthlyReport.total_late || "0h 0m",
            total_early_leaves: monthlyReport.total_early_leaves || "0h 0m",
            daily_status: dailyReport.status || "N/A",
            daily_late: dailyReport.entered_late_by_minutes || "0h 0m",
            daily_early_leave: dailyReport.left_early_by_minutes || "0h 0m",
            monthlyReport,
            dailyReport,
          });
        }

        setData(tableData);
      } catch (error) {
        message.error("Failed to load statistics");
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const showDetails = (record: TableData) => {
    setSelectedEmployee(record);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedEmployee(null);
  };

  // Function to generate and download PDF
  const generatePDF = (employee: TableData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    // Add header and footer to the current page
    const addHeaderFooter = () => {
      // Header
      doc.setFillColor(66, 153, 225); // #4299E1
      doc.rect(0, 0, pageWidth, 40, "F");
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("Employee Statistics Report", margin, 25);
      // App name as logo
      doc.setFontSize(16);
      doc.setTextColor(95, 104, 104); // #5F6868
      doc.setFont("helvetica", "bold");
      const logoTextWidth = doc.getTextWidth(APP_NAME);
      doc.text(APP_NAME, pageWidth - margin - logoTextWidth, 25);

      // Footer
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Generated on: ${new Date().toLocaleString()}`,
        margin,
        pageHeight - 10
      );
      doc.text(
        `Page ${doc.getCurrentPageInfo().pageNumber}`,
        pageWidth - margin - 20,
        pageHeight - 10
      );
    };

    // Add header and footer to the first page
    addHeaderFooter();

    // Employee Details Table
    let y = 50;
    doc.setFontSize(14);
    doc.setTextColor(95, 104, 104); // #5F6868
    doc.setFont("helvetica", "bold");
    doc.text("Employee Details", margin, y);
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [["Field", "Value"]],
      body: [
        ["Name", employee.name],
        ["Department", employee.department],
        ["Email", employee.email],
      ],
      theme: "striped",
      headStyles: {
        fillColor: [66, 153, 225],
        textColor: [255, 255, 255],
        fontSize: 12,
      },
      bodyStyles: { fontSize: 11, textColor: [50, 50, 50] },
      margin: { left: margin, right: margin },
    });
    y = (doc as any).lastAutoTable.finalY + 15;

    // Monthly Report Table
    doc.setFontSize(14);
    doc.setTextColor(95, 104, 104); // #5F6868
    doc.setFont("helvetica", "bold");
    doc.text("Monthly Report", margin, y);
    y += 10;
    autoTable(doc, {
      startY: y,
      head: [["Field", "Value"]],
      body: [
        ["Presence Rate", employee.monthly_presence_rate],
        ["Present Days", employee.present_days.toString()],
        ["Absent Days", employee.absent_days.toString()],
        ["Total Late", employee.total_late],
        ["Total Early Leaves", employee.total_early_leaves],
      ],
      theme: "striped",
      headStyles: {
        fillColor: [66, 153, 225],
        textColor: [255, 255, 255],
        fontSize: 12,
      },
      bodyStyles: { fontSize: 11, textColor: [50, 50, 50] },
      margin: { left: margin, right: margin },
    });
    y = (doc as any).lastAutoTable.finalY + 15;

    // Check if content exceeds page height and add a new page if necessary
    if (y > pageHeight - 50) {
      doc.addPage();
      addHeaderFooter();
      y = 50;
    }

    // Daily Report Table
    doc.setFontSize(14);
    doc.setTextColor(95, 104, 104); // #5F6868
    doc.setFont("helvetica", "bold");
    doc.text("Daily Report", margin, y);
    y += 10;
    autoTable(doc, {
      startY: y,
      head: [["Field", "Value"]],
      body: [
        ["Status", employee.daily_status],
        ["Entry Time", employee.dailyReport.entry_time || "N/A"],
        ["Leave Time", employee.dailyReport.leave_time || "N/A"],
        ["Late By", employee.daily_late],
        ["Early Leave By", employee.daily_early_leave],
      ],
      theme: "striped",
      headStyles: {
        fillColor: [66, 153, 225],
        textColor: [255, 255, 255],
        fontSize: 12,
      },
      bodyStyles: { fontSize: 11, textColor: [50, 50, 50] },
      margin: { left: margin, right: margin },
    });

    // Save the PDF
    doc.save(
      `${employee.name}_Statistics_Report_${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );
  };

  const columns: ColumnsType<TableData> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id.localeCompare(b.id),
      fixed: "left",
      width: 90,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      fixed: "left",
      width: 110,
    },
    {
      title: "Dept",
      dataIndex: "department",
      key: "department",
      sorter: (a, b) => a.department.localeCompare(b.department),
      width: 90,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
      width: 130,
    },
    {
      title: "Presence Rate",
      dataIndex: "monthly_presence_rate",
      key: "monthly_presence_rate",
      sorter: (a, b) =>
        parseFloat(a.monthly_presence_rate) -
        parseFloat(b.monthly_presence_rate),
      width: 110,
    },
    // {
    //   title: "Present",
    //   dataIndex: "present_days",
    //   key: "present_days",
    //   sorter: (a, b) => a.present_days - b.present_days,
    //   width: 90,
    // },
    // {
    //   title: "Absent",
    //   dataIndex: "absent_days",
    //   key: "absent_days",
    //   sorter: (a, b) => a.absent_days - b.absent_days,
    //   width: 90,
    // },
    // {
    //   title: "Total Late",
    //   dataIndex: "total_late",
    //   key: "total_late",
    //   width: 90,
    // },
    // {
    //   title: "Early Leaves",
    //   dataIndex: "total_early_leaves",
    //   key: "total_early_leaves",
    //   width: 100,
    // },
    {
      title: "Daily Status",
      dataIndex: "daily_status",
      key: "daily_status",
      render: (status: string) => (
        <Tag
          color={
            status === "Present"
              ? "green"
              : status === "Absent"
              ? "red"
              : "orange"
          }
        >
          {status}
        </Tag>
      ),
      width: 100,
    },
    // {
    //   title: "Daily Late",
    //   dataIndex: "daily_late",
    //   key: "daily_late",
    //   width: 90,
    // },
    // {
    //   title: "Daily Early",
    //   dataIndex: "daily_early_leave",
    //   key: "daily_early_leave",
    //   width: 100,
    // },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 80,
      render: (_, record) => (
        <Button
          type="link"
          className="text-[#4299E1] hover:text-[#2B6CB0]"
          onClick={() => showDetails(record)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 bg-[#F0F1F5] min-h-screen">
      <h1 className="text-3xl text-[#5F6868] font-bold mb-6">
        Statistics Dashboard
      </h1>
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={data}
          scroll={{ x: 1100 }}
          pagination={{ pageSize: 10 }}
          bordered
          className="shadow-md rounded-lg overflow-hidden"
          rowClassName="hover:bg-white transition-colors"
          style={{ background: "white" }}
          title={() => (
            <div className="bg-[#4299E1] text-white p-3 rounded-t-lg">
              <h2 className="text-lg font-semibold">
                Employee Statistics Overview
              </h2>
            </div>
          )}
        />
      </Spin>

      <Modal
        title={
          <span className="text-[#5F6868] font-bold">Employee Details</span>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Close
          </Button>,
          <Button
            key="download"
            type="primary"
            onClick={() => selectedEmployee && generatePDF(selectedEmployee)}
            disabled={!selectedEmployee}
          >
            Download PDF
          </Button>,
        ]}
        width={700}
        centered
        bodyStyle={{
          background: "#F9FAFB",
          borderRadius: "8px",
          padding: "24px",
        }}
      >
        {selectedEmployee && (
          <>
            <Descriptions bordered column={1} className="mb-4">
              <Descriptions.Item label="Name">
                {selectedEmployee.name}
              </Descriptions.Item>
              <Descriptions.Item label="Department">
                {selectedEmployee.department}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedEmployee.email}
              </Descriptions.Item>
            </Descriptions>

            <h3 className="text-lg font-semibold text-[#5F6868] mb-2">
              Monthly Report
            </h3>
            <Descriptions bordered column={1} className="mb-4">
              <Descriptions.Item label="Presence Rate">
                {selectedEmployee.monthly_presence_rate}
              </Descriptions.Item>
              <Descriptions.Item label="Present Days">
                {selectedEmployee.present_days}
              </Descriptions.Item>
              <Descriptions.Item label="Absent Days">
                {selectedEmployee.absent_days}
              </Descriptions.Item>
              <Descriptions.Item label="Total Late">
                {selectedEmployee.total_late}
              </Descriptions.Item>
              <Descriptions.Item label="Total Early Leaves">
                {selectedEmployee.total_early_leaves}
              </Descriptions.Item>
            </Descriptions>

            <h3 className="text-lg font-semibold text-[#5F6868] mb-2">
              Daily Report
            </h3>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Status">
                <Tag
                  color={
                    selectedEmployee.daily_status === "Present"
                      ? "green"
                      : selectedEmployee.daily_status === "Absent"
                      ? "red"
                      : "orange"
                  }
                >
                  {selectedEmployee.daily_status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Entry Time">
                {selectedEmployee.dailyReport.entry_time || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Leave Time">
                {selectedEmployee.dailyReport.leave_time || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Late By">
                {selectedEmployee.daily_late}
              </Descriptions.Item>
              <Descriptions.Item label="Early Leave By">
                {selectedEmployee.daily_early_leave}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>
    </div>
  );
}
