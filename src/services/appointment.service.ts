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

class AppointmentService {
  async appointments() {
    return Appointment.find({
      relations: {
        patientDetails: {
          doctor: {
            userInformation: true,
          },
          transactions: {
            paymentDetails: true,
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
          doctor: {
            userInformation: true,
          },
          transactions: {
            paymentDetails: true,
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
    const queryRunner = DevelopmentDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const patient = await Patient.findOne({
        relations: {
          doctor: true,
        },
        where: [
          { emailAddress: input?.emailAddress },
          { contactNumber: input?.contactNumber },
        ],
      });

      if (patient) {
        return throwCustomError(
          "Patient record already exists",
          ErrorTypes.CONFLICT
        );
      }

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

      const newPatient = Patient.create({
        doctor: consultant,
        firstName: input?.firstName,
        lastName: input?.lastName,
        middleName: input?.middleName,
        age: input?.age,
        contactNumber: input?.contactNumber,
        emailAddress: input?.emailAddress,
        bodyTemp: input?.bodyTemp || 0,
        heartRate: input?.heartRate || 0,
        weight: input?.weight || 0,
        height: input?.height || 0,
        findings: "",
        medications: "",
      });

      const newPatientResponse = await queryRunner.manager.save(newPatient);

      const appointment = await Appointment.findOneBy({
        _apid: newPatientResponse._id,
      });

      if (appointment) {
        return throwCustomError(
          "Appointment record already exists",
          ErrorTypes.CONFLICT
        );
      }

      const newAppointment = Appointment.create({
        schedule: input?.schedule,
        additionalInfo: input?.additionalInfo,
        patientDetails: newPatientResponse,
      });

      const newAppointmentResponse =
        await queryRunner.manager.save(newAppointment);

      await queryRunner.commitTransaction();
      return {
        code: 200,
        success: true,
        message: "Appointment confirmed",
        appointment: newAppointmentResponse,
        patient: newPatientResponse,
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

    const patientResponse = await Patient.preload({
      _id: appointment.patientDetails._id,
      status: "COMPLETED",
      updatedAt: new Date().toISOString(),
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
