import { DevelopmentDataSource } from "../data-source";
import { Patient } from "../entity/Patient";
import {
  MutationAddPatientArgs,
  MutationRemovePatientArgs,
  MutationUpdatePatientArgs,
  QueryGetPatientArgs,
} from "../generated/types";

class PatientService {
  // [x]: Get all patient records; need optimization
  async patients() {
    return await Patient.find({
      relations: {
        transactions: true,
        appointment: true,
      },
    });
  }

  // [x]: Get specific patient record
  async getPatient({ contactNumber, cardId, _id }: QueryGetPatientArgs) {
    const input: any = {
      contactNumber,
      cardId,
      _id,
    };

    try {
      const patient = await Patient.findOne({
        relations: {
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
        return {
          code: 404,
          success: false,
          message: "No patient record/s found",
        };
      }

      return {
        code: 200,
        success: true,
        message: "Patient record found",
        patient: patient,
      };
    } catch (error) {
      return {
        code: 400,
        success: false,
        message: error.message,
      };
    }
  }

  // [x]: Add Patient record; code optimization
  async addPatient({ input }: MutationAddPatientArgs) {
    const queryRunner = DevelopmentDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const patient = await Patient.findOne({
        relations: {
          appointment: true,
        },
        where: [
          { contactNumber: input?.contactNumber },
          { emailAddress: input?.emailAddress },
        ],
      });

      if (patient) {
        return {
          code: 409,
          success: false,
          message: "An existing user is already stored",
        };
      }

      const newPatient = Patient.create({
        cardId: input?.cardId || "",
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
        findings: input?.findings || "",
        medications: input?.findings || "",
      });

      const newPatientResponse = await queryRunner.manager.save(newPatient);

      await queryRunner.commitTransaction();
      return {
        code: 200,
        success: true,
        message: "Patient added",
        patient: newPatientResponse,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return { code: 400, success: false, message: error.message };
    } finally {
      await queryRunner.release();
    }
  }

  // [ ]: Update any patient field
  async updatePatient({ input }: MutationUpdatePatientArgs) {
    const inputs: any = {
      status: input?.status,
      bodyTemp: input?.bodyTemp,
      heartRate: input?.heartRate,
      weight: input?.weight,
      allergy: input?.allergy,
      findings: input?.findings,
      medications: input?.medications,
    };
    try {
      const patient = await Patient.findOne({
        relations: {
          appointment: true,
        },
        where: {
          _id: input?._id,
        },
      });

      if (!patient) {
        return {
          code: 404,
          success: false,
          message: "Patient record not found",
        };
      }

      await Patient.update(
        { _id: patient._id },
        {
          status: inputs.status,
          bodyTemp: inputs?.bodyTemp,
          heartRate: inputs?.heartRate,
          weight: inputs?.weight,
          allergy: inputs?.allergy,
          findings: inputs?.findings,
          medications: inputs?.medications,
          updatedAt: new Date().toISOString(),
        }
      );

      return {
        code: 200,
        success: true,
        message: "Patiend record updated",
        patient: patient,
      };
    } catch (error) {
      return {
        code: 400,
        success: true,
        message: error.message,
      };
    }
  }

  // [x]: Remove patient record(optional command)
  async removePatient({ id }: MutationRemovePatientArgs) {
    const queryRunner = DevelopmentDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const patient = await Patient.findOne({
        where: {
          _id: id,
        },
      });

      if (!patient) {
        return {
          code: 404,
          success: false,
          message: "No patient record/s found",
        };
      }

      await Patient.remove(patient);
      await queryRunner.commitTransaction();

      return {
        code: 200,
        success: true,
        message: "Patient deleted",
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return { code: 400, success: false, message: error.message };
    } finally {
      await queryRunner.release();
    }
  }
}

export default new PatientService();
