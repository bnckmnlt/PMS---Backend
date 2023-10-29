import "reflect-metadata";
import UserService from "../services/user.service";
import AppointmentService from "../services/appointment.service";
import PatientService from "../services/patient.service";
import TransactionService from "../services/transactiondetails.service";
import {
  MutationAddPatientArgs,
  MutationAddTransactionArgs,
  MutationAddUserInformationArgs,
  MutationLoginUserArgs,
  MutationRegisterArgs,
  MutationRemovePatientArgs,
  MutationSetAppointmentArgs,
  MutationUpdateAppointmentArgs,
  MutationUpdatePatientArgs,
  MutationUpdateTransactionArgs,
  MutationRemoveTransactionArgs,
} from "../generated/types";

const mutations = {
  register: async (_: any, args: MutationRegisterArgs) => {
    const newUser = await UserService.registerUser(args);

    return newUser;
  },

  loginUser: async (_: any, args: MutationLoginUserArgs) => {
    const loginUser = await UserService.loginUser(args);

    return loginUser;
  },

  addUserInformation: async (_: any, args: MutationAddUserInformationArgs) => {
    const addInformation = await UserService.addUserInformation(args);

    return addInformation;
  },

  setAppointment: async (_: any, args: MutationSetAppointmentArgs) => {
    const setAppointment = await AppointmentService.setAppointment(args);

    return setAppointment;
  },

  updateAppointment: async (_: any, args: MutationUpdateAppointmentArgs) => {
    const setAppointment = await AppointmentService.updateAppointment(args);

    return setAppointment;
  },

  removeAppointment: async (_: any, args: MutationUpdateAppointmentArgs) => {
    const setAppointment = await AppointmentService.removeAppointment(args);

    return setAppointment;
  },

  addPatient: async (_: any, args: MutationAddPatientArgs) => {
    const addPatient = await PatientService.addPatient(args);

    return addPatient;
  },

  updatePatient: async (_: any, args: MutationUpdatePatientArgs) => {
    const updatePatient = await PatientService.updatePatient(args);

    return updatePatient;
  },

  removePatient: async (_: any, args: MutationRemovePatientArgs) => {
    const updatePatient = await PatientService.removePatient(args);

    return updatePatient;
  },

  addTransaction: async (_: any, args: MutationAddTransactionArgs) => {
    const addPatient = await TransactionService.addTransaction(args);

    return addPatient;
  },

  updateTransaction: async (_: any, args: MutationUpdateTransactionArgs) => {
    const updateTransaction = await TransactionService.updateTransaction(args);

    return updateTransaction;
  },

  removeTransaction: async (_: any, args: MutationRemoveTransactionArgs) => {
    const removeTransaction = await TransactionService.removeTransaction(args);

    return removeTransaction;
  },
};

export default mutations;
