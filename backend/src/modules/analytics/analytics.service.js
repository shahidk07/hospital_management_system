import prisma from '../../config/database.js';

export const analyticsService = {
  getOverview: async () => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      appointmentsToday,
      pendingPayments,
      revenueResult
    ] = await Promise.all([
      prisma.patientProfile.count(),
      prisma.doctorProfile.count(),
      prisma.appointment.count(),
      prisma.appointment.count({
        where: {
          scheduledAt: {
            gte: startOfToday,
            lte: endOfToday
          }
        }
      }),
      prisma.payment.count({
        where: {
          status: 'PENDING'
        }
      }),
      prisma.payment.aggregate({
        where: {
          status: 'SUCCESS'
        },
        _sum: {
          amount: true
        }
      })
    ]);

    const totalRevenue = Number(revenueResult._sum.amount || 0);

    return {
      totalPatients,
      totalDoctors,
      totalAppointments,
      totalRevenue,
      appointmentsToday,
      pendingPayments
    };
  },

  getRevenueTrends: async (months = 6) => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const payments = await prisma.payment.findMany({
      where: {
        status: 'SUCCESS',
        paidAt: {
          gte: startDate
        }
      },
      select: {
        amount: true,
        paidAt: true
      }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trends = {};

    for (let i = 0; i < months; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substr(-2)}`;
      trends[label] = 0;
    }

    payments.forEach(p => {
      if (p.paidAt) {
        const d = new Date(p.paidAt);
        const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substr(-2)}`;
        if (trends[label] !== undefined) {
          trends[label] += Number(p.amount);
        }
      }
    });

    const labels = Object.keys(trends).reverse();
    const values = labels.map(l => trends[l]);

    return { labels, values };
  },

  getAppointmentTrends: async (months = 6) => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const appointments = await prisma.appointment.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      select: {
        status: true,
        createdAt: true
      }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trends = {};

    for (let i = 0; i < months; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substr(-2)}`;
      trends[label] = { completed: 0, cancelled: 0, pending: 0 };
    }

    appointments.forEach(a => {
      const d = new Date(a.createdAt);
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substr(-2)}`;
      if (trends[label] !== undefined) {
        if (a.status === 'COMPLETED') trends[label].completed++;
        else if (a.status === 'CANCELLED') trends[label].cancelled++;
        else trends[label].pending++;
      }
    });

    const labels = Object.keys(trends).reverse();
    const values = labels.map(l => trends[l]);

    return { labels, values };
  },

  getDepartmentPerformance: async () => {
    const departments = await prisma.department.findMany({
      include: {
        appointments: {
          include: {
            invoice: {
              include: {
                payment: true
              }
            }
          }
        }
      }
    });

    return departments.map(dept => {
      const appointmentCount = dept.appointments.length;
      let revenue = 0;

      dept.appointments.forEach(appt => {
        if (appt.invoice && appt.invoice.payment && appt.invoice.payment.status === 'SUCCESS') {
          revenue += Number(appt.invoice.payment.amount);
        }
      });

      return {
        departmentName: dept.name,
        appointmentCount,
        revenue
      };
    });
  }
};

export default analyticsService;
