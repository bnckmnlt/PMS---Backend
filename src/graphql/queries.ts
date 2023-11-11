import "reflect-metadata";
import UserService from "../services/user.service";
import AppointmentService from "../services/appointment.service";
import PatientService from "../services/patient.service";
import TransactionService from "../services/transactiondetails.service";
import {
  QueryGetAppointmentArgs,
  QueryGetPatientArgs,
  QueryGetUserArgs,
  QueryGetUserInformationArgs,
  QueryGetTransactionArgs,
  QueryGetNotificationArgs,
} from "../generated/types";
import throwCustomError, { ErrorTypes } from "../helpers/error-handler.helper";
import NotificationsService from "../services/notifications.service";

const queries = {
  users: async () => {
    return UserService.users();
  },

  getUser: async (_: any, args: QueryGetUserArgs) => {
    const getUser = await UserService.getUser(args);
    return getUser;
  },

  getUserInformation: async (_: any, args: QueryGetUserInformationArgs) => {
    const getUserInformation = await UserService.getUserInformation(args);

    return getUserInformation;
  },

  appointments: async () => {
    return AppointmentService.appointments();
  },

  getAppointment: async (_: any, args: QueryGetAppointmentArgs) => {
    const getAppointment = await AppointmentService.getAppointment(args);

    return getAppointment;
  },

  patients: async (_: any, _args: any) => {
    return PatientService.patients();
  },

  getPatient: async (_: any, args: QueryGetPatientArgs) => {
    const getPatient = await PatientService.getPatient(args);

    return getPatient;
  },

  transactions: async (_: any, _args: any, context: any) => {
    if (context.user.userRole !== "PERSONNEL") {
      return throwCustomError(
        "Access Denied: Insufficient Permissions. Contact your administrator for assistance.",
        ErrorTypes.FORBIDDEN
      );
    }

    return TransactionService.transactions();
  },

  getTransaction: async (_: any, args: QueryGetTransactionArgs) => {
    const getTransaction = await TransactionService.getTransaction(args);

    return getTransaction;
  },

  notifications: async () => {
    return NotificationsService.notifications();
  },

  getNotification: async (_: any, args: QueryGetNotificationArgs) => {
    const getNotification = await NotificationsService.getNotification(args);

    return getNotification;
  },
};

export default queries;
