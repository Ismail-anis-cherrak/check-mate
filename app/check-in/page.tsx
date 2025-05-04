// app/check-in/page.tsx
"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";

// Define the type for a single attendance record from the API
interface AttendanceRecord {
  _id: string;
  timestamp: string;
  employee_id: {
    first_name: string;
    last_name: string;
    rfid_tag: string;
    department_id: {
      department_name: string;
    };
  };
}

// Define the type for a single leave record from the API
interface LeaveRecord {
  _id: string;
  timestamp: string;
  employee_id: {
    first_name: string;
    last_name: string;
    rfid_tag: string;
    department_id: {
      department_name: string;
    };
  };
}

// Define the type for the API response
interface ApiResponse {
  attendances: AttendanceRecord[];
  leaves: LeaveRecord[];
}

// Define the type for a check-in record (for display)
interface CheckinData {
  rfid: string;
  name: string;
  department: string;
  checkinTime: string;
  lateBy: string;
  status: "In" | "Out";
  timestamp: Date; // Add raw timestamp for sorting
}

export default function CheckinPage() {
  const [checkins, setCheckins] = useState<CheckinData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");

  // Fetch check-ins from the API and refresh every 10 seconds
  useEffect(() => {
    const fetchCheckins = async () => {
      try {
        const response = await fetch("/api/check-in-today");
        if (response.ok) {
          const data: ApiResponse = await response.json();
          console.log("API Response Data:", data);

          // Transform attendances (status: "In")
          const transformedAttendances: CheckinData[] = data.attendances.map(
            (attendance) => {
              const checkinTime = new Date(attendance.timestamp);
              const expectedCheckinTime = new Date(checkinTime);
              expectedCheckinTime.setHours(9, 0, 0, 0); // 9:00 AM as expected check-in time

              // Calculate lateBy for attendances (status: "In")
              let lateBy = "";
              const status: "In" | "Out" = "In"; // Attendance records are "In"
              if (status === "In") {
                let lateByMinutes: number;
                if (checkinTime > expectedCheckinTime) {
                  lateByMinutes = Math.round(
                    (checkinTime.getTime() - expectedCheckinTime.getTime()) /
                      (1000 * 60)
                  );
                } else {
                  lateByMinutes = -Math.round(
                    (expectedCheckinTime.getTime() - checkinTime.getTime()) /
                      (1000 * 60)
                  );
                }
                lateBy = `${lateByMinutes >= 0 ? "+" : ""}${lateByMinutes
                  .toString()
                  .padStart(2, "0")}:00`;
              }

              // Format check-in time as "HH:MM AM/PM"
              const formattedCheckinTime = checkinTime.toLocaleTimeString(
                "en-US",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }
              );

              return {
                rfid: attendance.employee_id.rfid_tag || "Unknown",
                name: `${attendance.employee_id.first_name} ${attendance.employee_id.last_name}`,
                department:
                  attendance.employee_id.department_id?.department_name ||
                  "Unknown",
                checkinTime: formattedCheckinTime,
                lateBy: lateBy,
                status: status,
                timestamp: checkinTime, // Store raw timestamp for sorting
              };
            }
          );

          // Transform leaves (status: "Out")
          const transformedLeaves: CheckinData[] = data.leaves.map((leave) => {
            const checkinTime = new Date(leave.timestamp);

            // Format check-in time as "HH:MM AM/PM"
            const formattedCheckinTime = checkinTime.toLocaleTimeString(
              "en-US",
              {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }
            );

            return {
              rfid: leave.employee_id.rfid_tag || "Unknown",
              name: `${leave.employee_id.first_name} ${leave.employee_id.last_name}`,
              department:
                leave.employee_id.department_id?.department_name || "Unknown",
              checkinTime: formattedCheckinTime,
              lateBy: "", // No lateBy for leaves (status: "Out")
              status: "Out", // Leave records are "Out"
              timestamp: checkinTime, // Store raw timestamp for sorting
            };
          });

          // Combine attendances and leaves, sort by timestamp (newest first)
          const combinedCheckins = [
            ...transformedAttendances,
            ...transformedLeaves,
          ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

          setCheckins(combinedCheckins);
        } else {
          console.error(
            "API returned non-OK status:",
            response.status,
            response.statusText
          );
          setCheckins([]);
        }
      } catch (error) {
        console.error("Error fetching check-ins:", error);
        setCheckins([]);
      }
    };

    fetchCheckins();
    const interval = setInterval(fetchCheckins, 10000);

    return () => clearInterval(interval);
  }, []);

  // Filter check-ins based on search query and department
  const filteredCheckins = checkins.filter((checkin) => {
    const matchesSearch = checkin.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesDepartment =
      departmentFilter === "ALL" || checkin.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  // Calculate status counts
  const inCount = filteredCheckins.filter(
    (checkin) => checkin.status === "In"
  ).length;
  const outCount = filteredCheckins.filter(
    (checkin) => checkin.status === "Out"
  ).length;

  // Get unique departments for the filter dropdown
  const departments = [
    "ALL",
    ...new Set(checkins.map((checkin) => checkin.department)),
  ];

  // Handle manual refresh
  const handleRefresh = async () => {
    try {
      const response = await fetch("/api/check-in-today");
      if (response.ok) {
        const data: ApiResponse = await response.json();

        // Transform attendances (status: "In")
        const transformedAttendances: CheckinData[] = data.attendances.map(
          (attendance) => {
            const checkinTime = new Date(attendance.timestamp);
            const expectedCheckinTime = new Date(checkinTime);
            expectedCheckinTime.setHours(9, 0, 0, 0);

            // Calculate lateBy for attendances (status: "In")
            let lateBy = "";
            const status: "In" | "Out" = "In";
            if (status === "In") {
              let lateByMinutes: number;
              if (checkinTime > expectedCheckinTime) {
                lateByMinutes = Math.round(
                  (checkinTime.getTime() - expectedCheckinTime.getTime()) /
                    (1000 * 60)
                );
              } else {
                lateByMinutes = -Math.round(
                  (expectedCheckinTime.getTime() - checkinTime.getTime()) /
                    (1000 * 60)
                );
              }
              lateBy = `${lateByMinutes >= 0 ? "+" : ""}${lateByMinutes
                .toString()
                .padStart(2, "0")}:00`;
            }

            const formattedCheckinTime = checkinTime.toLocaleTimeString(
              "en-US",
              {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }
            );

            return {
              rfid: attendance.employee_id.rfid_tag || "Unknown",
              name: `${attendance.employee_id.first_name} ${attendance.employee_id.last_name}`,
              department:
                attendance.employee_id.department_id?.department_name ||
                "Unknown",
              checkinTime: formattedCheckinTime,
              lateBy: lateBy,
              status: status,
              timestamp: checkinTime,
            };
          }
        );

        // Transform leaves (status: "Out")
        const transformedLeaves: CheckinData[] = data.leaves.map((leave) => {
          const checkinTime = new Date(leave.timestamp);

          const formattedCheckinTime = checkinTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });

          return {
            rfid: leave.employee_id.rfid_tag || "Unknown",
            name: `${leave.employee_id.first_name} ${leave.employee_id.last_name}`,
            department:
              leave.employee_id.department_id?.department_name || "Unknown",
            checkinTime: formattedCheckinTime,
            lateBy: "", // No lateBy for leaves (status: "Out")
            status: "Out",
            timestamp: checkinTime,
          };
        });

        // Combine attendances and leaves, sort by timestamp (newest first)
        const combinedCheckins = [
          ...transformedAttendances,
          ...transformedLeaves,
        ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        setCheckins(combinedCheckins);
      } else {
        console.error(
          "API returned non-OK status:",
          response.status,
          response.statusText
        );
        setCheckins([]);
      }
    } catch (error) {
      console.error("Error fetching check-ins:", error);
      setCheckins([]);
    }
  };

  return (
    <div className="p-6 bg-[#F0F1F5] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#5F6868]">Check-In</h1>
          <p className="text-gray-500">
            Today’s employee check-ins: {format(new Date(), "dd/MM/yyyy")}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              ></path>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Employee Check-Ins
          </h2>
          <div className="flex space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search employee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <svg
                className="w-4 h-4 text-gray-500 absolute left-2 top-1/2 transform -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredCheckins.length > 0 ? (
          <>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-xs uppercase">
                  <th className="py-2 px-4">RFID</th>
                  <th className="py-2 px-4">NAME</th>
                  <th className="py-2 px-4">DEPARTMENT</th>
                  <th className="py-2 px-4">CHECK-IN TIME</th>
                  <th className="py-2 px-4">LATE BY</th>
                  <th className="py-2 px-4">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredCheckins.map((checkin, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-700">{checkin.rfid}</td>
                    <td className="py-3 px-4 text-gray-700">{checkin.name}</td>
                    <td className="py-3 px-4 text-gray-700">
                      {checkin.department}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {checkin.checkinTime}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {checkin.lateBy}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          checkin.status === "In"
                            ? "bg-green-50 text-green-700"
                            : "bg-orange-50 text-orange-700"
                        }`}
                      >
                        {checkin.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between items-center mt-3 text-gray-600 text-sm">
              <p>
                Showing {filteredCheckins.length} of {filteredCheckins.length}{" "}
                employees
              </p>
              <div className="flex space-x-4">
                <p>
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                  In: {inCount}
                </p>
                <p>
                  <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-1"></span>
                  Out: {outCount}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-gray-500">
            No check-ins found for today.
          </div>
        )}
      </div>
    </div>
  );
}
