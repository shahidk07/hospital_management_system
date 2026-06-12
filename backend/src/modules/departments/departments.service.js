import prisma from '../../config/database.js';

export const departmentsService = {
  getDepartments: async () => {
    return await prisma.department.findMany({
      where: { isActive: true }
    });
  },

  getDoctorsInDepartment: async (departmentId) => {
    return await prisma.doctorProfile.findMany({
      where: {
        departmentId,
        isAvailable: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        specialization: true,
        phone: true,
        licenseNumber: true,
        isAvailable: true,
        user: {
          select: {
            email: true
          }
        }
      }
    });
  }
};

export default departmentsService;
