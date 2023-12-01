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
  MutationRemoveUserArgs,
  MutationDeleteAccountArgs,
  MutationAddPatientResultArgs,
  MutationAddQueueArgs,
  MutationAddAdminArgs,
  MutationLoginAdminArgs,
  MutationVerifyEmailArgs,
  MutationUpdateUserInformationArgs,
  MutationAddExistingPatientArgs,
  MutationLoginRfidArgs,
} from "../generated/types";
import throwCustomError, { ErrorTypes } from "../helpers/error-handler.helper";
import QueueService from "../services/queue.service";
import AdminService from "../services/admin.service";

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

  updateUserInformation: async (
    _: any,
    args: MutationUpdateUserInformationArgs
  ) => {
    const updateUserInformation = await UserService.updateUserInformation(args);

    return updateUserInformation;
  },

  removeUser: async (_: any, args: MutationRemoveUserArgs) => {
    const removeUser = await UserService.removeUser(args);

    return removeUser;
  },

  deleteAccount: async (_: any, args: MutationDeleteAccountArgs) => {
    const deleteAccount = await UserService.deleteAccount(args);

    return deleteAccount;
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

  addPatient: async (_: any, args: MutationAddPatientArgs, context: any) => {
    if (context.user.userRole !== "PERSONNEL") {
      return throwCustomError(
        "Access Denied: Insufficient Permissions. Contact your administrator for assistance.",
        ErrorTypes.FORBIDDEN
      );
    }
    const addPatient = await PatientService.addPatient(args);

    return addPatient;
  },

  addExistingPatient: async (_: any, args: MutationAddExistingPatientArgs) => {
    const addExistingPatient = await PatientService.addExistingPatient(args);

    return addExistingPatient;
  },

  updatePatient: async (_: any, args: MutationUpdatePatientArgs) => {
    const updatePatient = await PatientService.updatePatient(args);

    return updatePatient;
  },

  addPatientResult: async (
    _: any,
    args: MutationAddPatientResultArgs,
    context: any
  ) => {
    if (context.user.userRole !== "DOCTOR") {
      return throwCustomError(
        "Access Denied: Insufficient Permissions. Contact your administrator for assistance.",
        ErrorTypes.FORBIDDEN
      );
    }

    const updatePatient = await PatientService.addPatientResult(args);

    return updatePatient;
  },

  removePatient: async (_: any, args: MutationRemovePatientArgs) => {
    const updatePatient = await PatientService.removePatient(args);

    return updatePatient;
  },

  addTransaction: async (
    _: any,
    args: MutationAddTransactionArgs,
    context: any
  ) => {
    if (context.user.userRole !== "PERSONNEL") {
      return throwCustomError(
        "Access Denied: Insufficient Permissions. Contact your administrator for assistance.",
        ErrorTypes.FORBIDDEN
      );
    }

    const addPatient = await TransactionService.addTransaction(args);

    return addPatient;
  },

  updateTransaction: async (
    _: any,
    args: MutationUpdateTransactionArgs,
    context: any
  ) => {
    if (context.user.userRole) {
      if (context.user.userRole !== "PERSONNEL") {
        return throwCustomError(
          "Access Denied: Insufficient Permissions. Contact your administrator for assistance.",
          ErrorTypes.FORBIDDEN
        );
      }
    }

    const updateTransaction = await TransactionService.updateTransaction(args);

    return updateTransaction;
  },

  removeTransaction: async (
    _: any,
    args: MutationRemoveTransactionArgs,
    context: any
  ) => {
    if (context.user.userRole) {
      if (context.user.userRole !== "PERSONNEL") {
        return throwCustomError(
          "Access Denied: Insufficient Permissions. Contact your administrator for assistance.",
          ErrorTypes.FORBIDDEN
        );
      }
    }

    const removeTransaction = await TransactionService.removeTransaction(args);

    return removeTransaction;
  },

  addQueue: async (_: any, args: MutationAddQueueArgs, _context: any) => {
    const addQueue = await QueueService.addQueue(args);

    return addQueue;
  },

  addAdmin: async (_: any, args: MutationAddAdminArgs, _context: any) => {
    const addAdmin = await AdminService.addAdmin(args);

    return addAdmin;
  },

  loginAdmin: async (_: any, args: MutationLoginAdminArgs, context: any) => {
    if (context.user.userRole !== "ADMIN") {
      return throwCustomError(
        "Access Denied: Insufficient Permissions. Contact your administrator for assistance.",
        ErrorTypes.FORBIDDEN
      );
    }

    const loginAdmin = await AdminService.loginAdmin(args);

    return loginAdmin;
  },

  verifyEmail: async (_: any, args: MutationVerifyEmailArgs, _context: any) => {
    const verifyEmail = await UserService.verifyEmail(args);

    return verifyEmail;
  },

  loginRfid: async (_: any, args: MutationLoginRfidArgs, _context: any) => {
    const loginRfid = await UserService.loginRfid(args);

    return loginRfid;
  },
};

export default mutations;
