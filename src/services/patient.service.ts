import { DevelopmentDataSource } from "../data-source";
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
    });

    const patientResponse = await newPatient.save();

    return {
      code: 200,
      success: true,
      message: "Patient added",
      patient: patientResponse,
    };
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
    const inputs: any = {
      _id: input?._id,
      weight: input?.weight,
      allergy: input?.allergy,
      findings: input?.findings,
      medications: input?.medications,
      status: input?.status,
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
        weight: inputs?.weight,
        allergy: inputs?.allergy,
        findings: inputs?.findings,
        medications: inputs?.medications,
        status: inputs.status,
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
        return throwCustomError(
          "No patient records match the input criteria",
          ErrorTypes.NOT_FOUND
        );
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
      return throwCustomError(error, ErrorTypes.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }
}

export default new PatientService();
