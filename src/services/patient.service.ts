import throwCustomError, { ErrorTypes } from "../helpers/error-handler.helper";
import {
  MutationAddExistingPatientArgs,
  MutationAddPatientArgs,
  MutationAddPatientResultArgs,
  MutationRemovePatientArgs,
  MutationUpdatePatientArgs,
  QueryGetPatientArgs,
  QueryGetPatientVisitArgs,
} from "../generated/types";
import { Patient } from "../entity/Patient";
import { User } from "../entity/User";
import { Notification } from "../entity/Notification";
import { DevelopmentDataSource } from "../data-source";
import { PatientInQueue } from "../entity/PatientInQueue";
import { Queue } from "../entity/Queue";
import { PatientVisit } from "../entity/PatientVisit";
import { Between } from "typeorm";
import { Appointment } from "../entity/Appointment";

class PatientService {
  //[x] All patients; Done
  async patients() {
    return await Patient.find({
      relations: {
        visits: {
          doctor: {
            userInformation: true,
          },
          transaction: {
            paymentDetails: true,
          },
        },
        transactions: {
          paymentDetails: true,
        },
        appointment: true,
      },
    });
  }

  //[x] Get patient record
  async getPatient({ contactNumber, cardId, _id }: QueryGetPatientArgs) {
    const input: any = {
      contactNumber,
      cardId,
      _id,
    };

    const patient = await Patient.findOne({
      relations: {
        visits: {
          doctor: {
            userInformation: true,
          },
          transaction: {
            paymentDetails: true,
          },
        },
        transactions: {
          paymentDetails: true,
        },
        appointment: {
          patientDetails: true,
          visitDetail: {
            doctor: {
              userInformation: true,
            },
          },
        },
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

  //[x] All patient visits record; Done
  async patientVisits() {
    return await PatientVisit.find({
      relations: {
        patient: {
          transactions: true,
          appointment: {
            patientDetails: true,
            visitDetail: {
              doctor: {
                userInformation: true,
              },
              patient: true,
            },
          },
          visits: true,
        },
        transaction: {
          paymentDetails: true,
        },
        doctor: {
          userInformation: true,
        },
      },
    });
  }

  //[x] Get patient visit
  async getPatientVisit({ id }: QueryGetPatientVisitArgs) {
    const patient = await PatientVisit.findOne({
      relations: {
        patient: {
          transactions: true,
          appointment: true,
          visits: true,
        },
        transaction: {
          paymentDetails: true,
        },
        doctor: {
          userInformation: true,
        },
      },
      where: {
        _id: id,
      },
    });

    if (!patient) {
      return throwCustomError("Patient record not found", ErrorTypes.NOT_FOUND);
    }

    return {
      code: 200,
      success: true,
      message: "Patient visit found",
      patient,
    };
  }

  //[x] Add patient; Done
  async addPatient({ input }: MutationAddPatientArgs) {
    const queryRunner = DevelopmentDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const patient = await Patient.findOne({
        relations: {
          visits: {
            doctor: {
              userInformation: true,
            },
            transaction: {
              paymentDetails: true,
            },
          },
          transactions: {
            paymentDetails: true,
          },
          appointment: true,
        },
        where: [
          { contactNumber: input?.contactNumber },
          { emailAddress: input?.emailAddress },
          { cardId: input?.cardId },
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

      const verifyQueue = await Queue.findOne({
        relations: {
          user: true,
          queue: true,
        },
        where: {
          user: {
            _id: consultant._id,
          },
        },
      });

      if (!verifyQueue) {
        return throwCustomError("Queue not found", ErrorTypes.NOT_FOUND);
      }

      const newPatient = Patient.create({
        cardId: input?.cardId,
        firstName: input?.firstName,
        middleName: input?.middleName,
        lastName: input?.lastName,
        age: input?.age,
        contactNumber: input?.contactNumber,
        emailAddress: input?.emailAddress,
        address: input?.address,
        gender: input?.gender,
      });

      const newPatientResponse = await queryRunner.manager.save(newPatient);

      const newPatientVisit = PatientVisit.create({
        doctor: consultant,
        patient: newPatientResponse,
        bodyTemp: input?.bodyTemp,
        heartRate: input?.heartRate,
        weight: input?.weight,
        height: input?.height,
      });

      const newPatientVisitResponse =
        await queryRunner.manager.save(newPatientVisit);

      const notification = await Notification.findOne({
        relations: {
          user: true,
          payload: {
            patient: true,
          },
        },
        where: {
          payload: {
            _id: newPatientVisitResponse._id,
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
        payload: newPatientVisit,
      });

      await queryRunner.manager.save(addNotification);

      const verifyPatientInQueue = await PatientInQueue.findOne({
        relations: {
          queue: true,
          patient: true,
        },
        where: {
          patient: {
            _id: newPatientVisit._id,
          },
        },
      });

      if (verifyPatientInQueue) {
        return throwCustomError("Patient in queue exists", ErrorTypes.CONFLICT);
      }

      const addPatientInQueue = PatientInQueue.create({
        queue: verifyQueue,
        patient: newPatientVisit,
      });

      await queryRunner.manager.save(addPatientInQueue);

      await queryRunner.commitTransaction();

      return {
        code: 200,
        success: true,
        message: "Patient added",
        patient: newPatientResponse,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return throwCustomError(error, ErrorTypes.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }

  //[x] Add existing patient; Done
  async addExistingPatient({ input }: MutationAddExistingPatientArgs) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const queryRunner = DevelopmentDataSource.createQueryRunner();

    queryRunner.connect();
    queryRunner.startTransaction();
    try {
      const getPatient = await Patient.findOne({
        relations: {
          visits: {
            doctor: {
              userInformation: true,
            },
            transaction: {
              paymentDetails: true,
            },
          },
          transactions: {
            paymentDetails: true,
          },
          appointment: true,
        },
        where: {
          _id: input?._id,
        },
      });

      if (!getPatient) {
        return throwCustomError(
          "No patient record/s matched the criteria",
          ErrorTypes.NOT_FOUND
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

      const verifyQueue = await Queue.findOne({
        relations: {
          user: true,
          queue: true,
        },
        where: {
          user: {
            _id: consultant._id,
          },
        },
      });

      if (!verifyQueue) {
        return throwCustomError("Queue not found", ErrorTypes.NOT_FOUND);
      }

      const getRecord = await PatientVisit.findOne({
        relations: {
          patient: true,
        },
        where: {
          patient: {
            _id: getPatient._id,
          },
          createdAt: Between(today.toISOString(), tomorrow.toISOString()),
        },
      });

      if (getRecord) {
        return throwCustomError(
          "Patient visit in queue exists",
          ErrorTypes.CONFLICT
        );
      }

      const newPatientVisit = PatientVisit.create({
        doctor: consultant,
        patient: getPatient,
        bodyTemp: input?.bodyTemp,
        heartRate: input?.heartRate,
        weight: input?.weight,
        height: input?.height,
      });

      const newPatientVisitResponse =
        await queryRunner.manager.save(newPatientVisit);

      const notification = await Notification.findOne({
        relations: {
          user: true,
          payload: {
            patient: true,
          },
        },
        where: {
          payload: {
            _id: newPatientVisitResponse._id,
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
        payload: newPatientVisit,
      });

      await queryRunner.manager.save(addNotification);

      const verifyPatientInQueue = await PatientInQueue.findOne({
        relations: {
          queue: true,
          patient: true,
        },
        where: {
          patient: {
            _id: newPatientVisit._id,
          },
        },
      });

      if (verifyPatientInQueue) {
        return throwCustomError("Patient in queue exists", ErrorTypes.CONFLICT);
      }

      const addPatientInQueue = PatientInQueue.create({
        queue: verifyQueue,
        patient: newPatientVisit,
      });

      await queryRunner.manager.save(addPatientInQueue);

      await queryRunner.commitTransaction();

      return {
        code: 200,
        success: true,
        message: "Patient added",
        patient: getPatient,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return throwCustomError(error, ErrorTypes.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }

  //[x] Update Patient Info; Done
  async updatePatient({ input }: MutationUpdatePatientArgs) {
    const inputs: any = {
      _id: input?._id,
      cardId: input?.cardId,
      firstName: input?.firstName,
      lastName: input?.lastName,
      middleName: input?.middleName,
      age: input?.age,
      contactNumber: input?.contactNumber,
      emailAddress: input?.emailAddress,
      address: input?.address,
      gender: input?.gender,
    };

    const patient = await Patient.findOne({
      relations: {
        visits: {
          doctor: {
            userInformation: true,
          },
          transaction: true,
          patient: true,
        },
        transactions: {
          paymentDetails: true,
        },
        appointment: {
          patientDetails: true,
        },
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

    const consultant = await User.findOne({
      relations: { userInformation: true },
      where: {
        _id: inputs?.doctor,
      },
    });

    if (!consultant) {
      return throwCustomError(
        "No consultant records match the input criteria",
        ErrorTypes.NOT_FOUND
      );
    }

    await Patient.update(
      { _id: patient._id },
      {
        cardId: inputs.cardId || undefined,
        firstName: inputs?.firstName || undefined,
        lastName: inputs?.lastName || undefined,
        middleName: inputs?.middleName || undefined,
        age: inputs?.age || undefined,
        contactNumber: inputs?.contactNumber || undefined,
        emailAddress: inputs?.emailAddress || undefined,
        address: inputs?.address || undefined,
        gender: inputs?.gender || undefined,
        updatedAt: new Date().toISOString(),
      }
    );

    const patientResponse = await Patient.findOne({
      relations: {
        visits: {
          doctor: {
            userInformation: true,
          },
          transaction: true,
          patient: true,
        },
        transactions: {
          paymentDetails: true,
        },
        appointment: {
          patientDetails: true,
        },
      },
      where: {
        _id: patient._id,
      },
    });

    return {
      code: 200,
      success: true,
      message: "Patiend record updated",
      patient: patientResponse,
    };
  }

  //[x] Add patient result; Done
  async addPatientResult({ input }: MutationAddPatientResultArgs) {
    const queryRunner = DevelopmentDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const inputs: any = {
        _id: input?._id,
        allergy: input?.allergy,
        diagnosis: input?.diagnosis,
        prescription: input?.prescription,
        status: input?.status,
      };

      const patient = await PatientVisit.findOne({
        relations: {
          patient: {
            transactions: true,
            appointment: true,
            visits: true,
          },
          transaction: {
            paymentDetails: true,
          },
          doctor: {
            userInformation: true,
          },
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

      const appointment = await Appointment.findOne({
        relations: { visitDetail: true },
        where: {
          visitDetail: {
            _id: patient._id,
          },
        },
      });

      if (appointment) {
        await queryRunner.manager.update(PatientVisit, patient._id, {
          allergy: inputs?.allergy,
          diagnosis: inputs?.diagnosis,
          prescription: inputs?.prescription,
          status: inputs.status,
          updatedAt: new Date().toISOString(),
        });

        const notification = await Notification.findOne({
          relations: {
            user: true,
            payload: {
              patient: true,
            },
          },
          where: {
            payload: {
              _id: patient._id,
            },
          },
        });

        if (!notification) {
          return throwCustomError(
            "Notification record already exists",
            ErrorTypes.CONFLICT
          );
        }

        await queryRunner.manager.update(Notification, notification._id, {
          type: "COMPLETED",
          title: "Appointment completed",
          description: `An Appointment has been completed by Dr. ${patient.doctor.userInformation.lastName}`,
          updatedAt: new Date().toISOString(),
        });

        await queryRunner.commitTransaction();

        const patientResponse = await Patient.findOne({
          relations: {
            visits: {
              doctor: {
                userInformation: true,
              },
              transaction: true,
              patient: true,
            },
            transactions: {
              paymentDetails: true,
            },
            appointment: {
              patientDetails: true,
            },
          },
          where: {
            visits: { _id: input?._id },
          },
        });

        return {
          code: 200,
          success: true,
          message: "Patiend record updated",
          patient: patientResponse,
        };
      }

      await queryRunner.manager.update(PatientVisit, patient._id, {
        allergy: inputs?.allergy,
        diagnosis: inputs?.diagnosis,
        prescription: inputs?.prescription,
        status: inputs.status,
        updatedAt: new Date().toISOString(),
      });

      const notification = await Notification.findOne({
        relations: {
          user: { userInformation: true },
          payload: {
            doctor: {
              userInformation: true,
            },
            patient: true,
            transaction: true,
          },
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

      const patientInQueue = await PatientInQueue.findOne({
        relations: {
          patient: true,
        },
        where: {
          patient: {
            _id: patient._id,
          },
        },
      });

      if (!patientInQueue) {
        return throwCustomError(
          "No patient in queue match the input criteria",
          ErrorTypes.NOT_FOUND
        );
      }

      await queryRunner.manager.update(PatientInQueue, patientInQueue, {
        isDone: true,
        updatedAt: new Date().toISOString(),
      });

      await queryRunner.commitTransaction();

      const patientResponse = await Patient.findOne({
        relations: {
          visits: {
            doctor: {
              userInformation: true,
            },
            transaction: true,
            patient: true,
          },
          transactions: {
            paymentDetails: true,
          },
          appointment: {
            patientDetails: true,
          },
        },
        where: {
          visits: { _id: input?._id },
        },
      });

      return {
        code: 200,
        success: true,
        message: "Patiend record updated",
        patient: patientResponse,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return throwCustomError(error, ErrorTypes.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }

  //[x] Patient removal; Done
  async removePatient({ id }: MutationRemovePatientArgs) {
    const queryRunner = DevelopmentDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const patient = await Patient.findOne({
        relations: {
          visits: true,
          appointment: true,
          transactions: {
            paymentDetails: true,
            patientDetails: true,
          },
        },
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

      const patientVisit = await PatientVisit.find({
        relations: {
          patient: {
            transactions: true,
            appointment: true,
            visits: true,
          },
          transaction: {
            paymentDetails: true,
          },
          doctor: {
            userInformation: true,
          },
        },
        where: {
          patient: {
            _id: id,
          },
        },
      });

      const notification = await Notification.find({
        relations: {
          user: {
            userInformation: true,
          },
          payload: {
            patient: {
              transactions: true,
              appointment: true,
              visits: true,
            },
            transaction: {
              paymentDetails: true,
            },
            doctor: {
              userInformation: true,
            },
          },
        },
        where: {
          payload: {
            patient: {
              _id: id,
            },
          },
        },
      });

      if (!notification) {
        return throwCustomError(
          "No notification records match the input criteria",
          ErrorTypes.NOT_FOUND
        );
      }

      const inQueue = await PatientInQueue.find({
        relations: {
          patient: {
            patient: {
              transactions: true,
              appointment: true,
              visits: true,
            },
            transaction: {
              paymentDetails: true,
            },
            doctor: {
              userInformation: true,
            },
          },
          queue: true,
        },
        where: {
          patient: {
            patient: {
              _id: id,
            },
          },
        },
      });

      if (!inQueue) {
        return throwCustomError(
          "No queue records match the input criteria",
          ErrorTypes.NOT_FOUND
        );
      }

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
        where: {
          patientDetails: {
            _id: patient._id,
          },
        },
      });

      if (appointment) {
        await queryRunner.manager.remove(appointment);
        await queryRunner.manager.remove(notification);
        await queryRunner.manager.remove(inQueue);
        await queryRunner.manager.remove(patientVisit);
        await queryRunner.manager.remove(patient);

        await queryRunner.commitTransaction();

        return {
          code: 200,
          success: true,
          message: "Patient deleted",
        };
      }

      await queryRunner.manager.remove(notification);
      await queryRunner.manager.remove(inQueue);
      await queryRunner.manager.remove(patientVisit);
      await queryRunner.manager.remove(patient);

      await queryRunner.commitTransaction();

      return {
        code: 200,
        success: true,
        message: "Patient deleted",
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return throwCustomError(error, ErrorTypes.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }
}

export default new PatientService();
