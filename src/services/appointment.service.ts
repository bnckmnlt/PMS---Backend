import { DevelopmentDataSource } from "../data-source";
import { Appointment } from "../entity/Appointment";
import { Patient } from "../entity/Patient";
import {
  MutationRemoveAppointmentArgs,
  MutationSetAppointmentArgs,
  MutationUpdateAppointmentArgs,
  QueryGetAppointmentArgs,
} from "../generated/types";
import throwCustomError, { ErrorTypes } from "../helpers/error-handler.helper";
import { User } from "../entity/User";
import { PatientVisit } from "../entity/PatientVisit";
import { Between } from "typeorm";
import { Notification } from "../entity/Notification";

class AppointmentService {
  async appointments() {
    return Appointment.find({
      relations: {
        patientDetails: {
          visits: {
            doctor: {
              userInformation: true,
            },
          },
          transactions: {
            paymentDetails: true,
          },
        },
        visitDetail: {
          doctor: {
            userInformation: true,
          },
        },
      },
    });
  }

  async getAppointment({
    contactNumber,
    cardId,
    _apid,
  }: QueryGetAppointmentArgs) {
    const input: any = {
      cardId,
      contactNumber,
      _apid,
    };

    const appointment = await Appointment.findOne({
      relations: {
        patientDetails: {
          visits: {
            doctor: {
              userInformation: true,
            },
          },
          transactions: {
            paymentDetails: true,
          },
        },
        visitDetail: {
          doctor: {
            userInformation: true,
          },
        },
      },
      where: [
        { _apid: input._apid },
        { patientDetails: { contactNumber: input.contactNumber } },
        { patientDetails: { cardId: input.cardId } },
      ],
    });

    if (!appointment) {
      return throwCustomError(
        "No appointment records match the input criteria.",
        ErrorTypes.NOT_FOUND
      );
    }

    return {
      code: 200,
      success: true,
      message: "Appointment record found",
      appointment: appointment,
    };
  }

  async setAppointment({ input }: MutationSetAppointmentArgs) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const queryRunner = DevelopmentDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const consultant = await User.findOne({
        relations: {
          userInformation: true,
        },
        where: {
          _id: input?.doctor,
        },
      });

      if (!consultant) {
        return throwCustomError("Consultant not found", ErrorTypes.NOT_FOUND);
      }

      const patient = await Patient.findOne({
        relations: {
          appointment: true,
          visits: {
            doctor: {
              userInformation: true,
            },
          },
        },
        where: [
          {
            emailAddress: input?.emailAddress,
            contactNumber: input?.contactNumber,
          },
        ],
      });

      if (patient) {
        const newPatientVisit = PatientVisit.create({
          doctor: consultant,
          patient: patient,
          bodyTemp: input?.bodyTemp || 0,
          heartRate: input?.heartRate || 0,
          weight: input?.weight || 0,
          height: input?.height || 0,
          diagnosis: "",
          prescription: "",
        });

        const newPatientVisitResponse =
          await queryRunner.manager.save(newPatientVisit);

        const addNotification = Notification.create({
          type: "ADDED",
          user: newPatientVisitResponse.doctor,
          title: "Appointment booked",
          description: `An appointment has been booked for ${input?.schedule}`,
          payload: newPatientVisitResponse,
        });

        await queryRunner.manager.save(addNotification);

        const appointment = await Appointment.findOne({
          relations: {
            patientDetails: true,
            visitDetail: true,
          },
          where: {
            visitDetail: {
              patient: {
                _id: patient._id,
              },
              createdAt: Between(today.toISOString(), tomorrow.toISOString()),
            },
          },
        });

        if (appointment) {
          return throwCustomError(
            "Appointment record already exists",
            ErrorTypes.CONFLICT
          );
        }

        const newAppointment = Appointment.create({
          schedule: input?.schedule,
          patientDetails: patient,
          visitDetail: newPatientVisitResponse,
        });

        const newAppointmentResponse =
          await queryRunner.manager.save(newAppointment);

        return {
          code: 200,
          success: true,
          message: "Appointment confirmed",
          appointment: newAppointmentResponse,
          patient: patient,
        };
      }

      const newPatient = Patient.create({
        firstName: input?.firstName,
        lastName: input?.lastName,
        middleName: input?.middleName,
        age: input?.age,
        contactNumber: input?.contactNumber,
        emailAddress: input?.emailAddress,
        address: input?.address,
        gender: input?.gender,
      });

      const newPatientResponse = await queryRunner.manager.save(newPatient);

      const newPatientVisit = PatientVisit.create({
        doctor: consultant,
        patient: newPatient,
        bodyTemp: input?.bodyTemp || 0,
        heartRate: input?.heartRate || 0,
        weight: input?.weight || 0,
        height: input?.height || 0,
      });

      const newPatientVisitResponse =
        await queryRunner.manager.save(newPatientVisit);

      const addNotification = Notification.create({
        type: "ADDED",
        user: newPatientVisitResponse.doctor,
        title: "Appointment booked",
        description: `An appointment has been booked for ${new Date(
          input?.schedule as string
        ).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}`,
        payload: newPatientVisitResponse,
      });

      await queryRunner.manager.save(addNotification);

      const appointment = await Appointment.findOne({
        relations: {
          patientDetails: true,
          visitDetail: true,
        },
        where: {
          visitDetail: {
            patient: {
              _id: newPatientResponse._id,
            },
            createdAt: Between(today.toISOString(), tomorrow.toISOString()),
          },
        },
      });

      if (appointment) {
        return throwCustomError(
          "Appointment record already exists",
          ErrorTypes.CONFLICT
        );
      }

      const newAppointment = Appointment.create({
        schedule: input?.schedule,
        patientDetails: newPatientResponse,
        visitDetail: newPatientVisitResponse,
      });

      const newAppointmentResponse =
        await queryRunner.manager.save(newAppointment);

      await queryRunner.commitTransaction();

      return {
        code: 200,
        success: true,
        message: "Appointment confirmed",
        appointment: newAppointmentResponse,
        patient: newPatient,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return throwCustomError(error, ErrorTypes.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }

  async updateAppointment({
    email,
    contactNumber,
    status,
    _apid,
  }: MutationUpdateAppointmentArgs) {
    const input: any = {
      _apid,
      email,
      contactNumber,
      status,
    };

    const appointment = await Appointment.findOne({
      relations: {
        patientDetails: true,
      },
      where: [
        { _apid: input._apid },
        { patientDetails: { emailAddress: input.email } },
        { patientDetails: { contactNumber: input.contactNumber } },
      ],
    });

    if (!appointment) {
      return throwCustomError(
        "No appointment records match the input criteria.",
        ErrorTypes.NOT_FOUND
      );
    }

    const patientResponse = await PatientVisit.preload({
      _id: appointment.patientDetails._id,
      status: "COMPLETED",
      updatedAt: new Date(``).toISOString(),
    });

    return {
      code: 200,
      success: true,
      message: "Appointment updated",
      patient: patientResponse,
    };
  }

  async removeAppointment({
    contactNumber,
    _apid,
  }: MutationRemoveAppointmentArgs) {
    const input: any = {
      _apid,
      contactNumber,
    };
    const queryRunner = DevelopmentDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const appointment = await Appointment.findOne({
        relations: {
          patientDetails: true,
          visitDetail: true,
        },
        where: [
          { _apid: input._apid },
          {
            patientDetails: {
              contactNumber: input.contactNumber,
            },
          },
        ],
      });

      if (!appointment) {
        return throwCustomError(
          "No appointment records match the input criteria.",
          ErrorTypes.NOT_FOUND
        );
      }

      const timeCreated: any = appointment.createdAt;
      const currentDate: any = new Date();
      const timeDifference = currentDate - timeCreated;

      if (timeDifference >= 3600000) {
        return throwCustomError(
          "Appointment cannot be canceled, as it's past the 1-hour limit.",
          ErrorTypes.BAD_REQUEST
        );
      }

      await Appointment.remove(appointment);
      await queryRunner.commitTransaction();

      return {
        code: 200,
        success: true,
        message: "Appointment cancelled",
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return throwCustomError(error, ErrorTypes.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }
}

export default new AppointmentService();
