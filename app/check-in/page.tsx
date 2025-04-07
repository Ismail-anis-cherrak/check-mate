// app/check-in/page.tsx
"use client";
import { useState, useEffect } from "react";
import { FaUser, FaClock, FaExclamationTriangle } from "react-icons/fa";

// Define the type for the API response
interface ApiResponse {
  attendances: {
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
  }[];
  leaves: any[]; // Not used for now
}

// Define the type for check-in data (used for display)
interface CheckinData {
  name: string;
  employeeId: string;
  checkinTime: string;
  lateBy?: string;
}

export default function CheckinPage() {
  const [checkinData, setCheckinData] = useState<CheckinData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCheckin = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/check-in-today");
        console.log("API Response Status:", response.status);
        if (response.ok) {
          const data: ApiResponse = await response.json();
          console.log("API Response Data:", data);

          // Extract the latest attendance record
          const latestAttendance =
            data.attendances.length > 0 ? data.attendances[0] : null;

          if (!latestAttendance) {
            setCheckinData(null);
            return;
          }

          // Calculate lateBy (assuming 8:00 AM is the expected check-in time)
          const checkinTime = new Date(latestAttendance.timestamp);
          const expectedCheckinTime = new Date(checkinTime);
          expectedCheckinTime.setHours(8, 0, 0, 0); // 8:00 AM

          let lateBy: string | undefined;
          if (checkinTime > expectedCheckinTime) {
            const lateMinutes = Math.round(
              (checkinTime.getTime() - expectedCheckinTime.getTime()) /
                (1000 * 60)
            );
            lateBy = `${lateMinutes} Minutes`;
          }

          // Format the check-in time as "H:MM" (e.g., "8:07")
          const hours = checkinTime.getHours();
          const minutes = checkinTime.getMinutes().toString().padStart(2, "0");
          const formattedCheckinTime = `${hours}:${minutes}`;

          // Construct the CheckinData object
          const transformedData: CheckinData = {
            name: `${latestAttendance.employee_id.first_name} ${latestAttendance.employee_id.last_name}`,
            employeeId: latestAttendance.employee_id.rfid_tag || "Unknown",
            checkinTime: formattedCheckinTime,
            lateBy: lateBy,
          };

          setCheckinData(transformedData);
        } else {
          console.error(
            "API returned non-OK status:",
            response.status,
            response.statusText
          );
          setCheckinData(null);
        }
      } catch (error) {
        console.error("Error fetching check-in data:", error);
        setCheckinData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckin();
    const interval = setInterval(fetchCheckin, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-5 min-h-screen bg-[#F0F1F5] flex flex-col items-center">
      {/* Header */}
      <h1 className="text-3xl font-bold text-[#5F6868] mb-16">
        Real-time Check-in
      </h1>

      {loading ? (
        <div className="flex flex-col items-center py-10">
          <p className="text-lg text-gray-500">Loading...</p>
        </div>
      ) : checkinData ? (
        <div className="bg-white border border-blue-200 rounded-lg p-6 w-full max-w-sm shadow-sm">
          {/* Card Header */}
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <FaUser className="mr-2 text-gray-700" /> Latest check-in
          </h2>
          {/* Card Content */}
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-medium text-gray-800">Name:</span>{" "}
              {checkinData.name}
            </p>
            <p className="text-gray-600">
              <span className="font-medium text-gray-800">Employee ID:</span>{" "}
              {checkinData.employeeId}
            </p>
            <p className="text-gray-600 flex items-center">
              <FaClock className="mr-2 text-gray-600" />
              <span className="font-medium text-gray-800">
                Check-in Time:
              </span>{" "}
              {checkinData.checkinTime}
            </p>
            {checkinData.lateBy && (
              <p className="text-gray-600 flex items-center">
                <FaExclamationTriangle className="mr-2 text-red-500" />
                <span className="font-medium text-gray-800 mr-2">Late by:</span>
                <span className="text-red-500 font-medium">
                  {checkinData.lateBy}
                </span>
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center py-10">
          <p className="text-lg text-gray-500">Waiting for check-ins...</p>
          <p className="text-sm text-gray-400 mt-2">
            No recent check-ins found.
          </p>
        </div>
      )}
    </div>
  );
}
