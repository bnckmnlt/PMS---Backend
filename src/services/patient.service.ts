import { Patient } from "../entity/Patient";
import {
  MutationAddPatientArgs,
  MutationAddPatientResultArgs,
  MutationRemovePatientArgs,
  MutationUpdatePatientArgs,
  QueryGetPatientArgs,
} from "../generated/types";
import throwCustomError, { ErrorTypes } from "../helpers/error-handler.helper";
import { User } from "../entity/User";
import {
  publishPatientCompleted,
  publishPatientRecord,
} from "../graphql/subscriptions";
import { Notification } from "../entity/Notification";
import { DevelopmentDataSource } from "../data-source";

class PatientService {
  async patients() {
    return await Patient.find({
      relations: {
        doctor: {
          userInformation: true,
        },
        transactions: true,
        appointment: true,
      },
    });
  }

  async getPatient({ contactNumber, cardId, _id }: QueryGetPatientArgs) {
    const input: any = {
      contactNumber,
      cardId,
      _id,
    };

    const patient = await Patient.findOne({
      relations: {
        doctor: true,
        transactions: true,
        appointment: true,
      },
      where: [
        { _id: input._id },
        { contactNumber: input.contactNumber },
        { cardId: input.cardId },
      ],
    });

    if (!patient) {
      return throwCustomError(
        "No patient records match the input criteria",
        ErrorTypes.NOT_FOUND
      );
    }

    return {
      code: 200,
      success: true,
      message: "Patient record found",
      patient: patient,
    };
  }

  async addPatient({ input }: MutationAddPatientArgs) {
    const queryRunner = DevelopmentDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const patient = await Patient.findOne({
        relations: {
          doctor: true,
          appointment: true,
        },
        where: [
          { contactNumber: input?.contactNumber },
          { emailAddress: input?.emailAddress },
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
          notifications: true,
        },
        where: {
          _id: input?.doctor,
        },
      });

      if (!consultant) {
        return throwCustomError("Consultant not found", ErrorTypes.NOT_FOUND);
      }

      const newPatient = Patient.create({
        cardId: input?.cardId,
        doctor: consultant,
        firstName: input?.firstName,
        lastName: input?.lastName,
        middleName: input?.middleName,
        age: input?.age,
        contactNumber: input?.contactNumber,
        emailAddress: input?.emailAddress,
        bodyTemp: input?.bodyTemp,
        heartRate: input?.heartRate,
        weight: input?.weight,
        height: input?.height,
      });

      const patientResponse = await newPatient.save();

      const notification = await Notification.findOne({
        relations: {
          user: true,
          payload: true,
        },
        where: {
          payload: {
            _id: newPatient._id,
          },
        },
      });

      if (notification) {
        return throwCustomError(
          "Notification record already exists",
          ErrorTypes.CONFLICT
        );
      }

      const addNotification = Notification.create({
        type: "ADDED",
        user: consultant,
        title: "New patient added",
        description: "A new patient has been added in queue",
        payload: patientResponse,
      });

      const saveNotification = await addNotification.save();

      await queryRunner.manager.save(newPatient);
      await queryRunner.manager.save(addNotification);
      await queryRunner.commitTransaction();

      publishPatientRecord(saveNotification);

      return {
        code: 200,
        success: true,
        message: "Patient added",
        patient: patientResponse,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return throwCustomError(error, ErrorTypes.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }

  async updatePatient({ input }: MutationUpdatePatientArgs) {
    const inputs: any = {
      _id: input?._id,
      firstName: input?.firstName,
      lastName: input?.lastName,
      middleName: input?.middleName,
      age: input?.age,
      contactNumber: input?.contactNumber,
      emailAddress: input?.emailAddress,
      doctor: input?.doctor,
      bodyTemp: input?.bodyTemp,
      heartRate: input?.heartRate,
      weight: input?.weight,
      height: input?.height,
    };

    const patient = await Patient.findOne({
      relations: {
        doctor: true,
        appointment: true,
      },
      where: {
        _id: input?._id,
      },
    });

    if (!patient) {
      return throwCustomError(
        "No patient records match the input criteria",
        ErrorTypes.NOT_FOUND
      );
    }

    await Patient.update(
      { _id: patient._id },
      {
        firstName: inputs?.firstName,
        lastName: inputs?.lastName,
        middleName: inputs?.middleName,
        age: inputs?.age,
        contactNumber: inputs?.contactNumber,
        emailAddress: inputs?.emailAddress,
        doctor: inputs?.doctor,
        bodyTemp: inputs?.bodyTemp,
        heartRate: inputs?.heartRate,
        weight: inputs?.weight,
        height: inputs?.height,
        updatedAt: new Date().toISOString(),
      }
    );

    return {
      code: 200,
      success: true,
      message: "Patiend record updated",
      patient: patient,
    };
  }

  async addPatientResult({ input }: MutationAddPatientResultArgs) {
    const queryRunner = DevelopmentDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const inputs: any = {
        _id: input?._id,
        allergy: input?.allergy,
        findings: input?.findings,
        medications: input?.medications,
        status: input?.status,
      };

      const patient = await Patient.findOne({
        relations: {
          doctor: { userInformation: true },
          appointment: true,
        },
        where: {
          _id: input?._id,
        },
      });

      if (!patient) {
        return throwCustomError(
          "No patient records match the input criteria",
          ErrorTypes.NOT_FOUND
        );
      }

      const notification = await Notification.findOne({
        relations: {
          user: { userInformation: true },
          payload: { doctor: true, appointment: true, transactions: true },
        },
        where: {
          payload: {
            _id: patient._id,
          },
        },
      });

      if (!notification) {
        return throwCustomError(
          "No notification records match the input criteria",
          ErrorTypes.NOT_FOUND
        );
      }

      await queryRunner.manager.update(Notification, notification._id, {
        type: "COMPLETED",
        title: "Consultation completed",
        description: `A consultation has been completed by Dr. ${patient.doctor.userInformation.lastName}`,
        updatedAt: new Date().toISOString(),
      });
      await queryRunner.manager.update(Patient, patient._id, {
        allergy: inputs?.allergy,
        findings: inputs?.findings,
        medications: inputs?.medications,
        status: inputs.status,
        updatedAt: new Date().toISOString(),
      });

      await queryRunner.commitTransaction();

      const updatedNotification = await Notification.findOne({
        relations: {
          user: { userInformation: true },
          payload: { doctor: true, appointment: true, transactions: true },
        },
        where: {
          _id: notification._id,
        },
      });

      if (!updatedNotification) {
        return throwCustomError("Something went wrong", ErrorTypes.BAD_REQUEST);
      }

      publishPatientCompleted(updatedNotification);

      return {
        code: 200,
        success: true,
        message: "Patiend record updated",
        patient: patient,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return throwCustomError(error, ErrorTypes.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }

  async removePatient({ id }: MutationRemovePatientArgs) {
    const patient = await Patient.findOne({
      where: {
        _id: id,
      },
    });

    if (!patient) {
      return throwCustomError(
        "No patient records match the input criteria",
        ErrorTypes.NOT_FOUND
      );
    }

    const notification = await Notification.findOne({
      relations: {
        user: true,
        payload: true,
      },
      where: {
        payload: {
          _id: patient._id,
        },
      },
    });

    if (!notification) {
      return throwCustomError(
        "No notification records match the input criteria",
        ErrorTypes.NOT_FOUND
      );
    }

    await Patient.remove(patient);
    await Notification.remove(notification);

    return {
      code: 200,
      success: true,
      message: "Patient deleted",
    };
  }
}

export default new PatientService();
