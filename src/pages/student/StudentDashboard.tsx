import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom"; // for nested routes
import { AlertTriangle, Info } from "lucide-react"; // Clear indicators

const StudentDashboard: React.FC = () => {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        // Simulating API call failure or bypass for preview
        throw new Error("No live backend connection detected.");
      } catch (err) {
        console.error(err);

        // Explicitly clear up that this is boilerplate mock data
        setProfile({
          name: "DEMO STUDENT (PREVIEW)",
          status: "Sandbox Active",
          admissionNo: "EXXXXCSXXXXX",
          admissionYear: "YYYY",
          rollNo: "E25CSEU0001 (SAMPLE)",
          degree: "Undergraduate",
          department: "School of Computer Science Engineering & Technology",
          semester: "Semester - 1",
          tenure: "2025 - 2029",
          year: "1st Year",
          courseName: "Bachelor of Technology (Computer Science and Engineering)",
          specialization: "Cloud Computing & Cyber Security",
          college: "Bennett University",
          curriculum: "B.Tech CSE Cloud",
          academicStanding: "Good",
          academicClassification: "UG",
          discountCategory: "N/A",
          intake: "2025",
          validity: "2029",
          firstName: "DEMO",
          lastName: "STUDENT",
          dob: "DD-MM-YYYY",
          age: "--",
          gender: "Not Specified",
          fatherName: "Sample Father Name",
          motherName: "Sample Mother Name",
          address: "123 Innovation Way, Tech Park",
          city: "Greater Noida",
          state: "Uttar Pradesh-201310",
          contact: "999XXXXXXX",
          email: "your.email@bennett.edu.in",
          profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=DS&backgroundColor=b6e3f4`,
        });

        setError(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-gray-500">
        <span className="animate-spin inline-block w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full" />
        Loading template data...
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      
      {/* 🚨 Preview Environment Indicator Banner */}
      <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-amber-900">Developer Sandbox Mode</h4>
          <p className="text-xs text-amber-700 mt-0.5">
            You are viewing a dummy template interface. This profile card contains 
            <strong> placeholder data </strong> for evaluation purposes. Your personal academic data 
            will populate automatically once live student databases are linked.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-200">
          <Info className="w-3.5 h-3.5" /> Frontend Mockup View
        </span>
      </div>

      {/* 👇 Student Profile Section */}
      {profile && (
        <section className="bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-100 relative overflow-hidden">
          {/* Subtle diagonal watermark to reinforce mockup state */}
          <div className="absolute top-12 right-[-40px] rotate-45 bg-gray-100 text-gray-300 text-xs font-black tracking-widest py-1 px-12 select-none pointer-events-none uppercase">
            Preview Model
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column → Image + Basic Info */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <img
                src={profile.profileImage}
                alt="Demo Student Placeholder"
                className="w-36 h-36 rounded-full border shadow-md object-cover mb-4 bg-gray-50"
              />
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  {profile.name}
                </h2>
                <p className="text-gray-500 font-medium text-sm mt-0.5">{profile.rollNo}</p>
                <p className="text-gray-600 text-sm mt-1">{profile.courseName}</p>
                <span className="inline-block text-xs font-bold mt-3 px-3 py-1 bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                  {profile.status}
                </span>
              </div>
            </div>

            {/* Right Column → Academic + Personal Info */}
            <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 text-sm">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  College
                </h3>
                <p className="font-medium">{profile.college}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Specialization
                </h3>
                <p className="font-medium">{profile.specialization}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Tenure
                </h3>
                <p className="font-medium">{profile.tenure}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Current Semester
                </h3>
                <p className="font-medium">{profile.semester}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Year
                </h3>
                <p className="font-medium">{profile.year}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Curriculum Plan
                </h3>
                <p className="font-medium">{profile.curriculum}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Academic Standing
                </h3>
                <p className="font-medium">{profile.academicStanding}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Academic Classification
                </h3>
                <p className="font-medium">{profile.academicClassification}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Enrollment No.
                </h3>
                <p className="font-medium text-gray-500 italic">{profile.admissionNo}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Admission Year
                </h3>
                <p className="font-medium">{profile.admissionYear}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Program Validity Date
                </h3>
                <p className="font-medium">{profile.validity}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Father's Name
                </h3>
                <p className="font-medium text-gray-400 italic">{profile.fatherName}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Mother's Name
                </h3>
                <p className="font-medium text-gray-400 italic">{profile.motherName}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  DOB
                </h3>
                <p className="font-medium text-gray-400 italic">{profile.dob}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Age
                </h3>
                <p className="font-medium text-gray-400">{profile.age}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Gender
                </h3>
                <p className="font-medium text-gray-400">{profile.gender}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Email
                </h3>
                <p className="font-medium text-gray-500 italic">{profile.email}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Contact
                </h3>
                <p className="font-medium text-gray-400">{profile.contact}</p>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Address
                </h3>
                <p className="font-medium text-gray-400">
                  {profile.address}, {profile.city}, {profile.state}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Nested route outlet */}
      <Outlet />
    </div>
  );
};

export default StudentDashboard;