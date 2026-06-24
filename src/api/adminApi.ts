import { client } from "./adminConfig";


export const adminApi = {
  // ======================
  // Students
  // ======================

  async getAllStudents() {
    const res = await client.get(
      "/admin/all-students"
    );

    return res.data;
  },

  // Returns:
  // {
  //   total: number,
  //   students: User[]
  // }

  // ======================
  // Teachers
  // ======================

  async getAllTeachers() {
    const res = await client.get(
      "/admin/all-teachers"
    );

    return res.data;
  },

  // Returns:
  // {
  //   total: number,
  //   teachers: User[]
  // }

  // ======================
  // Classes
  // ======================

  async getAllClasses() {
    const res = await client.get(
      "/classes/allClasses"
    );

    return res.data;
  },

  // Returns:
  // [
  //   {
  //     id,
  //     name,
  //     teacher,
  //     enrollments:[]
  //   }
  // ]

  async createClass(
    name: string,
    teacherId: number,
    recurrenceDays: string[],
    startDate: string,
    endDate: string
  ) {
    const res = await client.post("/classes/create", {
      name,
      teacherId,
      recurrenceDays,
      startDate,
      endDate,
    });
    return res.data;
  },

  async updateClass(
    classId: number,
    name: string,
    teacherId: number,
    recurrenceDays: string[],
    startDate: string,
    endDate: string
  ) {
    const res = await client.put(`/classes/${classId}`, {
      name,
      teacherId,
      recurrenceDays,
      startDate,
      endDate,
    });
    return res.data;
  },

  // Returns: { message, updatedClass: { id, name, teacherId, recurrenceDays, startDate, endDate, sessionsRecreated } }

  async deleteClass(classId: number) {
    const res = await client.delete(`/classes/${classId}`);
    return res.data;
  },

  // Returns: { message, deletedClassId }

  // ======================
  // Enrollments
  // ======================

  async getAllEnrollments() {
    const res = await client.get(
      "/classes/all-enrollments"
    );

    return res.data;
  },

  async enrollStudent(
    classId: number,
    studentId: number
  ) {
    const res = await client.post(
      "/classes/enroll-students",
      {
        classId,
        studentId,
      }
    );

    return res.data;
  },

  async enrollMultipleStudents(
    classId: number,
    studentIds: number[]
  ) {
    const res = await client.post(
      "/classes/enroll-multiple-students",
      {
        classId,
        studentIds,
      }
    );

    return res.data;
  },

  async enrollAllStudents(
    classId: number
  ) {
    const res = await client.post(
      "/classes/enroll-all-students",
      {
        classId,
      }
    );

    return res.data;
  },

  async enrollByCsv(
    classId: number,
    file: File
  ) {
    const formData = new FormData();
    formData.append("classId", String(classId));
    formData.append("file", file);

    const res = await client.post(
      "/classes/enroll-csv",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data;
  },

  async deleteDevice(email: string) {
    const res = await client.post(
      "/auth/delete-device",
      {
        email,
      }
    );

    return res.data;
  },

  async deleteAllDevices() {
    const res = await client.post(
      "/auth/delete-alldevices"
    );

    return res.data;
  },
};