import { DevelopmentDataSource } from "../data-source";
import { Appointment } from "../entity/Appointment";
import { Patient } from "../entity/Patient";
import {
  MutationRemoveAppointmentArgs,
  MutationSetAppointmentArgs,
  MutationUpdateAppointmentArgs,
  QueryGetAppointmentArgs,
} from "../generated/types";

class AppointmentService {
  // [x]: Get all appointments
  async appointments() {
    return Appointment.find({
      relations: {
        patientDetails: true,
      },
    });
  }

  // [x]: Get a specific appointment; needs optimization
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

    try {
      const appointment = await Appointment.findOne({
        relations: { patientDetails: true },
        where: [
          { _apid: input._apid },
          { patientDetails: { contactNumber: input.contactNumber } },
          { patientDetails: { cardId: input.cardId } },
        ],
      });

      if (!appointment) {
        return {
          code: 404,
          success: false,
          message: "No appointment record/s found",
        };
      }

      return {
        code: 200,
        success: true,
        message: "Appointment record found",
        appointment: appointment,
      };
    } catch (error) {
      return { code: 400, success: false, message: error.message };
    }
  }

  // [x]: Create appointment
  async setAppointment({ input }: MutationSetAppointmentArgs) {
    const queryRunner = DevelopmentDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const patient = await Patient.findOne({
        where: [
          { emailAddress: input?.emailAddress },
          { contactNumber: input?.contactNumber },
        ],
      });

      if (patient) {
        return {
          code: 409,
          success: false,
          message: "Patient record already exists",
        };
      }

      const newPatient = Patient.create({
        doctor: input?.doctor,
        firstName: input?.firstName,
        lastName: input?.lastName,
        middleName: input?.middleName,
        age: input?.age,
        contactNumber: input?.contactNumber,
        emailAddress: input?.emailAddress,
        bodyTemp: input?.bodyTemp || 0,
        heartRate: input?.heartRate || 0,
        weight: input?.weight || 0,
        allergy: input?.allergy || "",
        findings: "",
        medications: "",
      });

      const newPatientResponse = await queryRunner.manager.save(newPatient);

      const appointment = await Appointment.findOneBy({
        _apid: newPatientResponse._id,
      });

      if (appointment) {
        return {
          code: 409,
          success: false,
          message: "Appointment record already exists",
        };
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
      return {
        code: 400,
        success: false,
        message: error.message,
      };
    } finally {
      await queryRunner.release();
    }
  }

  // [x]: Update existing appointment status; needs optimization
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

    try {
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
        return {
          code: 404,
          success: false,
          message: "No appointment record/s found",
        };
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
    } catch (error) {
      return { code: 400, success: false, message: error.message };
    }
  }

  // [x]: Cancel patient appointment (only valid for 1 hour since appointment creation)
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
        return {
          code: 404,
          success: false,
          message: "No appointment record/s found",
        };
      }

      const timeCreated: any = appointment.createdAt;
      const currentDate: any = new Date();
      const timeDifference = currentDate - timeCreated;

      if (timeDifference >= 3600000) {
        return {
          code: 400,
          success: false,
          message: "Cannot cancel appointment",
        };
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
      return {
        code: 400,
        success: false,
        message: error.message,
      };
    } finally {
      await queryRunner.release();
    }
  }
}

export default new AppointmentService();
