import { GraphQLResolveInfo } from 'graphql';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AddPatient = {
  age: Scalars['Int']['input'];
  bodyTemp: Scalars['Int']['input'];
  cardId: Scalars['String']['input'];
  contactNumber: Scalars['String']['input'];
  doctor: Scalars['String']['input'];
  emailAddress: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  heartRate: Scalars['Int']['input'];
  height: Scalars['Int']['input'];
  lastName: Scalars['String']['input'];
  middleName: Scalars['String']['input'];
  weight: Scalars['Int']['input'];
};

export type AddPatientResult = {
  _id: Scalars['ID']['input'];
  allergy: Scalars['String']['input'];
  findings: Scalars['String']['input'];
  medications: Scalars['String']['input'];
  status: CheckupStatus;
};

export type AddTransaction = {
  _id?: InputMaybe<Scalars['String']['input']>;
  subtotal: Scalars['String']['input'];
};

export type AddUserInformation = {
  _id: Scalars['ID']['input'];
  contactNumber: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  middleName: Scalars['String']['input'];
  schedule?: InputMaybe<Scalars['String']['input']>;
  specialization?: InputMaybe<Scalars['String']['input']>;
};

export type Appointment = {
  __typename?: 'Appointment';
  _apid: Scalars['ID']['output'];
  additionalInfo: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  patientDetails: Patient;
  schedule: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type AppointmentPayload = MutationResponse & {
  __typename?: 'AppointmentPayload';
  appointment?: Maybe<Appointment>;
  code: Scalars['String']['output'];
  message: Scalars['String']['output'];
  patient?: Maybe<Patient>;
  success: Scalars['Boolean']['output'];
};

export type AuthPayload = MutationResponse & {
  __typename?: 'AuthPayload';
  accessToken: Scalars['String']['output'];
  code: Scalars['String']['output'];
  message: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  user?: Maybe<User>;
};

export enum CheckupStatus {
  Completed = 'COMPLETED',
  Expired = 'EXPIRED',
  Pending = 'PENDING'
}

export enum DiscountCategory {
  None = 'NONE',
  PhilhealthDiscount = 'PHILHEALTH_DISCOUNT',
  PwdDiscount = 'PWD_DISCOUNT',
  SeniorCitizenDiscount = 'SENIOR_CITIZEN_DISCOUNT'
}

export type Mutation = {
  __typename?: 'Mutation';
  addPatient: PatientPayload;
  addPatientResult: PatientPayload;
  addQueue?: Maybe<QueuePayload>;
  addTransaction: TransactionPayload;
  addUserInformation: UserInfoPayload;
  deleteAccount: AuthPayload;
  loginUser: AuthPayload;
  register: AuthPayload;
  removeAppointment: AppointmentPayload;
  removePatient: PatientPayload;
  removeTransaction: TransactionPayload;
  removeUser: AuthPayload;
  setAppointment: AppointmentPayload;
  updateAppointment: AppointmentPayload;
  updatePatient: PatientPayload;
  updateTransaction: TransactionPayload;
};


export type MutationAddPatientArgs = {
  input?: InputMaybe<AddPatient>;
};


export type MutationAddPatientResultArgs = {
  input?: InputMaybe<AddPatientResult>;
};


export type MutationAddQueueArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
};


export type MutationAddTransactionArgs = {
  input?: InputMaybe<AddTransaction>;
};


export type MutationAddUserInformationArgs = {
  input?: InputMaybe<AddUserInformation>;
};


export type MutationDeleteAccountArgs = {
  id: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationLoginUserArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationRegisterArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  userRole?: InputMaybe<UserRoles>;
};


export type MutationRemoveAppointmentArgs = {
  _apid?: InputMaybe<Scalars['String']['input']>;
  contactNumber?: InputMaybe<Scalars['String']['input']>;
};


export type MutationRemovePatientArgs = {
  id: Scalars['String']['input'];
};


export type MutationRemoveTransactionArgs = {
  _tid?: InputMaybe<Scalars['String']['input']>;
};


export type MutationRemoveUserArgs = {
  id: Scalars['String']['input'];
};


export type MutationSetAppointmentArgs = {
  input?: InputMaybe<SetAppointment>;
};


export type MutationUpdateAppointmentArgs = {
  _apid?: InputMaybe<Scalars['ID']['input']>;
  contactNumber?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  status: CheckupStatus;
};


export type MutationUpdatePatientArgs = {
  input?: InputMaybe<UpdatePatient>;
};


export type MutationUpdateTransactionArgs = {
  input?: InputMaybe<UpdateTransaction>;
};

export type MutationResponse = {
  code: Scalars['String']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type Notification = {
  __typename?: 'Notification';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  isRead: Scalars['Boolean']['output'];
  payload?: Maybe<Patient>;
  title: Scalars['String']['output'];
  type?: Maybe<NotificationType>;
  updatedAt: Scalars['String']['output'];
  user: User;
};

export type NotificationPayload = MutationResponse & {
  __typename?: 'NotificationPayload';
  code: Scalars['String']['output'];
  message: Scalars['String']['output'];
  notification?: Maybe<Array<Maybe<Notification>>>;
  success: Scalars['Boolean']['output'];
};

export enum NotificationType {
  Added = 'ADDED',
  Completed = 'COMPLETED'
}

export type Patient = {
  __typename?: 'Patient';
  _id: Scalars['ID']['output'];
  age: Scalars['Int']['output'];
  allergy?: Maybe<Scalars['String']['output']>;
  appointment?: Maybe<Appointment>;
  bodyTemp?: Maybe<Scalars['Int']['output']>;
  cardId?: Maybe<Scalars['String']['output']>;
  contactNumber: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  doctor: User;
  emailAddress: Scalars['String']['output'];
  findings?: Maybe<Scalars['String']['output']>;
  firstName: Scalars['String']['output'];
  heartRate?: Maybe<Scalars['Int']['output']>;
  height?: Maybe<Scalars['Int']['output']>;
  lastName: Scalars['String']['output'];
  medications?: Maybe<Scalars['String']['output']>;
  middleName: Scalars['String']['output'];
  status: CheckupStatus;
  transactions?: Maybe<Array<Maybe<TransactionDetails>>>;
  updatedAt: Scalars['String']['output'];
  weight?: Maybe<Scalars['Int']['output']>;
};

export type PatientInQueue = {
  __typename?: 'PatientInQueue';
  createdAt: Scalars['String']['output'];
  isAccepted: Scalars['Boolean']['output'];
  isDone: Scalars['Boolean']['output'];
  number?: Maybe<Scalars['Int']['output']>;
  patient?: Maybe<Patient>;
  updatedAt: Scalars['String']['output'];
};

export type PatientPayload = MutationResponse & {
  __typename?: 'PatientPayload';
  code: Scalars['String']['output'];
  message: Scalars['String']['output'];
  patient?: Maybe<Patient>;
  success: Scalars['Boolean']['output'];
};

export type PaymentDetails = {
  __typename?: 'PaymentDetails';
  _id?: Maybe<Scalars['String']['output']>;
  additionalChargeAmount?: Maybe<Scalars['String']['output']>;
  additionalChargeDescription?: Maybe<Scalars['String']['output']>;
  amountTendered?: Maybe<Scalars['String']['output']>;
  change?: Maybe<Scalars['String']['output']>;
  discount?: Maybe<DiscountCategory>;
  subtotal: Scalars['String']['output'];
  total?: Maybe<Scalars['String']['output']>;
  transactionDetails?: Maybe<TransactionDetails>;
};

export type Query = {
  __typename?: 'Query';
  appointments?: Maybe<Array<Maybe<Appointment>>>;
  getAppointment: AppointmentPayload;
  getNotification?: Maybe<NotificationPayload>;
  getPatient: PatientPayload;
  getQueue?: Maybe<QueuePayload>;
  getTransaction: TransactionPayload;
  getUser: AuthPayload;
  getUserInformation: UserInfoPayload;
  notifications?: Maybe<Array<Maybe<Notification>>>;
  patients?: Maybe<Array<Maybe<Patient>>>;
  transactions?: Maybe<Array<Maybe<TransactionDetails>>>;
  users?: Maybe<Array<Maybe<User>>>;
};


export type QueryGetAppointmentArgs = {
  _apid?: InputMaybe<Scalars['String']['input']>;
  cardId?: InputMaybe<Scalars['String']['input']>;
  contactNumber?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetNotificationArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetPatientArgs = {
  _id?: InputMaybe<Scalars['String']['input']>;
  cardId?: InputMaybe<Scalars['String']['input']>;
  contactNumber?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetQueueArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetTransactionArgs = {
  cardId?: InputMaybe<Scalars['String']['input']>;
  contactNumber?: InputMaybe<Scalars['String']['input']>;
  tid?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetUserArgs = {
  _id?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetUserInformationArgs = {
  _id: Scalars['String']['input'];
};

export type QueryResponse = {
  code: Scalars['String']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type Queue = {
  __typename?: 'Queue';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  queue?: Maybe<Array<Maybe<PatientInQueue>>>;
  updatedAt: Scalars['String']['output'];
  user: User;
};

export type QueuePayload = MutationResponse & {
  __typename?: 'QueuePayload';
  code: Scalars['String']['output'];
  message: Scalars['String']['output'];
  queue?: Maybe<Queue>;
  success: Scalars['Boolean']['output'];
};

export type SetAppointment = {
  additionalInfo: Scalars['String']['input'];
  age: Scalars['Int']['input'];
  allergy?: InputMaybe<Scalars['String']['input']>;
  bodyTemp?: InputMaybe<Scalars['Int']['input']>;
  contactNumber: Scalars['String']['input'];
  doctor: Scalars['String']['input'];
  emailAddress: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  heartRate?: InputMaybe<Scalars['Int']['input']>;
  height?: InputMaybe<Scalars['Int']['input']>;
  lastName: Scalars['String']['input'];
  middleName: Scalars['String']['input'];
  schedule: Scalars['String']['input'];
  weight?: InputMaybe<Scalars['Int']['input']>;
};

export enum Specialization {
  GeneralPractitioner = 'GENERAL_PRACTITIONER',
  InternalMedicine = 'INTERNAL_MEDICINE',
  None = 'NONE'
}

export type Subscription = {
  __typename?: 'Subscription';
  addPatientInQueue?: Maybe<PatientInQueue>;
  patientAdded?: Maybe<Notification>;
  patientCompleted?: Maybe<Notification>;
  transactionCompleted?: Maybe<TransactionDetails>;
};


export type SubscriptionAddPatientInQueueArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
};


export type SubscriptionPatientAddedArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
};

export type TransactionDetails = {
  __typename?: 'TransactionDetails';
  _tid: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  patientDetails?: Maybe<Patient>;
  paymentDetails?: Maybe<PaymentDetails>;
  status: TransactionStatus;
  updatedAt: Scalars['String']['output'];
};

export type TransactionPayload = MutationResponse & {
  __typename?: 'TransactionPayload';
  code: Scalars['String']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  transaction?: Maybe<TransactionDetails>;
};

export enum TransactionStatus {
  Paid = 'PAID',
  Unpaid = 'UNPAID'
}

export type UpdatePatient = {
  _id: Scalars['ID']['input'];
  age?: InputMaybe<Scalars['Int']['input']>;
  bodyTemp?: InputMaybe<Scalars['Int']['input']>;
  contactNumber?: InputMaybe<Scalars['String']['input']>;
  doctor?: InputMaybe<Scalars['String']['input']>;
  emailAddress?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  heartRate?: InputMaybe<Scalars['Int']['input']>;
  height?: InputMaybe<Scalars['Int']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  middleName?: InputMaybe<Scalars['String']['input']>;
  weight?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateTransaction = {
  _tid: Scalars['String']['input'];
  additionalChargeAmount?: InputMaybe<Scalars['Int']['input']>;
  additionalChargeDescription?: InputMaybe<Scalars['String']['input']>;
  amountTendered: Scalars['Int']['input'];
  change: Scalars['Int']['input'];
  discount: DiscountCategory;
  status: TransactionStatus;
  total: Scalars['Int']['input'];
};

export type User = {
  __typename?: 'User';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  notifications?: Maybe<Array<Maybe<Notification>>>;
  password: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  userInformation?: Maybe<UserInformation>;
  userRole: UserRoles;
};

export type UserInfoPayload = MutationResponse & {
  __typename?: 'UserInfoPayload';
  code: Scalars['String']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  userInformation?: Maybe<UserInformation>;
};

export type UserInformation = {
  __typename?: 'UserInformation';
  _id: Scalars['ID']['output'];
  contactNumber: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  lastName: Scalars['String']['output'];
  middleName: Scalars['String']['output'];
  patients?: Maybe<Array<Maybe<Patient>>>;
  schedule?: Maybe<Scalars['String']['output']>;
  specialization?: Maybe<Specialization>;
  updatedAt: Scalars['String']['output'];
  user?: Maybe<User>;
};

export enum UserRoles {
  Admin = 'ADMIN',
  Doctor = 'DOCTOR',
  Personnel = 'PERSONNEL'
}



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;


/** Mapping of interface types */
export type ResolversInterfaceTypes<RefType extends Record<string, unknown>> = {
  MutationResponse: ( AppointmentPayload ) | ( AuthPayload ) | ( NotificationPayload ) | ( PatientPayload ) | ( QueuePayload ) | ( TransactionPayload ) | ( UserInfoPayload );
  QueryResponse: never;
};

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AddPatient: AddPatient;
  AddPatientResult: AddPatientResult;
  AddTransaction: AddTransaction;
  AddUserInformation: AddUserInformation;
  Appointment: ResolverTypeWrapper<Appointment>;
  AppointmentPayload: ResolverTypeWrapper<AppointmentPayload>;
  AuthPayload: ResolverTypeWrapper<AuthPayload>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CheckupStatus: CheckupStatus;
  DiscountCategory: DiscountCategory;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  MutationResponse: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['MutationResponse']>;
  Notification: ResolverTypeWrapper<Notification>;
  NotificationPayload: ResolverTypeWrapper<NotificationPayload>;
  NotificationType: NotificationType;
  Patient: ResolverTypeWrapper<Patient>;
  PatientInQueue: ResolverTypeWrapper<PatientInQueue>;
  PatientPayload: ResolverTypeWrapper<PatientPayload>;
  PaymentDetails: ResolverTypeWrapper<PaymentDetails>;
  Query: ResolverTypeWrapper<{}>;
  QueryResponse: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['QueryResponse']>;
  Queue: ResolverTypeWrapper<Queue>;
  QueuePayload: ResolverTypeWrapper<QueuePayload>;
  SetAppointment: SetAppointment;
  Specialization: Specialization;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Subscription: ResolverTypeWrapper<{}>;
  TransactionDetails: ResolverTypeWrapper<TransactionDetails>;
  TransactionPayload: ResolverTypeWrapper<TransactionPayload>;
  TransactionStatus: TransactionStatus;
  UpdatePatient: UpdatePatient;
  UpdateTransaction: UpdateTransaction;
  User: ResolverTypeWrapper<User>;
  UserInfoPayload: ResolverTypeWrapper<UserInfoPayload>;
  UserInformation: ResolverTypeWrapper<UserInformation>;
  UserRoles: UserRoles;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AddPatient: AddPatient;
  AddPatientResult: AddPatientResult;
  AddTransaction: AddTransaction;
  AddUserInformation: AddUserInformation;
  Appointment: Appointment;
  AppointmentPayload: AppointmentPayload;
  AuthPayload: AuthPayload;
  Boolean: Scalars['Boolean']['output'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Mutation: {};
  MutationResponse: ResolversInterfaceTypes<ResolversParentTypes>['MutationResponse'];
  Notification: Notification;
  NotificationPayload: NotificationPayload;
  Patient: Patient;
  PatientInQueue: PatientInQueue;
  PatientPayload: PatientPayload;
  PaymentDetails: PaymentDetails;
  Query: {};
  QueryResponse: ResolversInterfaceTypes<ResolversParentTypes>['QueryResponse'];
  Queue: Queue;
  QueuePayload: QueuePayload;
  SetAppointment: SetAppointment;
  String: Scalars['String']['output'];
  Subscription: {};
  TransactionDetails: TransactionDetails;
  TransactionPayload: TransactionPayload;
  UpdatePatient: UpdatePatient;
  UpdateTransaction: UpdateTransaction;
  User: User;
  UserInfoPayload: UserInfoPayload;
  UserInformation: UserInformation;
};

export type AppointmentResolvers<ContextType = any, ParentType extends ResolversParentTypes['Appointment'] = ResolversParentTypes['Appointment']> = {
  _apid?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  additionalInfo?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  patientDetails?: Resolver<ResolversTypes['Patient'], ParentType, ContextType>;
  schedule?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AppointmentPayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['AppointmentPayload'] = ResolversParentTypes['AppointmentPayload']> = {
  appointment?: Resolver<Maybe<ResolversTypes['Appointment']>, ParentType, ContextType>;
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  patient?: Resolver<Maybe<ResolversTypes['Patient']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AuthPayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['AuthPayload'] = ResolversParentTypes['AuthPayload']> = {
  accessToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  refreshToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addPatient?: Resolver<ResolversTypes['PatientPayload'], ParentType, ContextType, Partial<MutationAddPatientArgs>>;
  addPatientResult?: Resolver<ResolversTypes['PatientPayload'], ParentType, ContextType, Partial<MutationAddPatientResultArgs>>;
  addQueue?: Resolver<Maybe<ResolversTypes['QueuePayload']>, ParentType, ContextType, Partial<MutationAddQueueArgs>>;
  addTransaction?: Resolver<ResolversTypes['TransactionPayload'], ParentType, ContextType, Partial<MutationAddTransactionArgs>>;
  addUserInformation?: Resolver<ResolversTypes['UserInfoPayload'], ParentType, ContextType, Partial<MutationAddUserInformationArgs>>;
  deleteAccount?: Resolver<ResolversTypes['AuthPayload'], ParentType, ContextType, RequireFields<MutationDeleteAccountArgs, 'id' | 'password'>>;
  loginUser?: Resolver<ResolversTypes['AuthPayload'], ParentType, ContextType, RequireFields<MutationLoginUserArgs, 'email' | 'password'>>;
  register?: Resolver<ResolversTypes['AuthPayload'], ParentType, ContextType, RequireFields<MutationRegisterArgs, 'email' | 'password'>>;
  removeAppointment?: Resolver<ResolversTypes['AppointmentPayload'], ParentType, ContextType, Partial<MutationRemoveAppointmentArgs>>;
  removePatient?: Resolver<ResolversTypes['PatientPayload'], ParentType, ContextType, RequireFields<MutationRemovePatientArgs, 'id'>>;
  removeTransaction?: Resolver<ResolversTypes['TransactionPayload'], ParentType, ContextType, Partial<MutationRemoveTransactionArgs>>;
  removeUser?: Resolver<ResolversTypes['AuthPayload'], ParentType, ContextType, RequireFields<MutationRemoveUserArgs, 'id'>>;
  setAppointment?: Resolver<ResolversTypes['AppointmentPayload'], ParentType, ContextType, Partial<MutationSetAppointmentArgs>>;
  updateAppointment?: Resolver<ResolversTypes['AppointmentPayload'], ParentType, ContextType, RequireFields<MutationUpdateAppointmentArgs, 'status'>>;
  updatePatient?: Resolver<ResolversTypes['PatientPayload'], ParentType, ContextType, Partial<MutationUpdatePatientArgs>>;
  updateTransaction?: Resolver<ResolversTypes['TransactionPayload'], ParentType, ContextType, Partial<MutationUpdateTransactionArgs>>;
};

export type MutationResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['MutationResponse'] = ResolversParentTypes['MutationResponse']> = {
  __resolveType: TypeResolveFn<'AppointmentPayload' | 'AuthPayload' | 'NotificationPayload' | 'PatientPayload' | 'QueuePayload' | 'TransactionPayload' | 'UserInfoPayload', ParentType, ContextType>;
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type NotificationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Notification'] = ResolversParentTypes['Notification']> = {
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  isRead?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  payload?: Resolver<Maybe<ResolversTypes['Patient']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['NotificationType']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NotificationPayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['NotificationPayload'] = ResolversParentTypes['NotificationPayload']> = {
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  notification?: Resolver<Maybe<Array<Maybe<ResolversTypes['Notification']>>>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PatientResolvers<ContextType = any, ParentType extends ResolversParentTypes['Patient'] = ResolversParentTypes['Patient']> = {
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  age?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  allergy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  appointment?: Resolver<Maybe<ResolversTypes['Appointment']>, ParentType, ContextType>;
  bodyTemp?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  cardId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  doctor?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  emailAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  findings?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  heartRate?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  height?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  medications?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  middleName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['CheckupStatus'], ParentType, ContextType>;
  transactions?: Resolver<Maybe<Array<Maybe<ResolversTypes['TransactionDetails']>>>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  weight?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PatientInQueueResolvers<ContextType = any, ParentType extends ResolversParentTypes['PatientInQueue'] = ResolversParentTypes['PatientInQueue']> = {
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  isAccepted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isDone?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  patient?: Resolver<Maybe<ResolversTypes['Patient']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PatientPayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['PatientPayload'] = ResolversParentTypes['PatientPayload']> = {
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  patient?: Resolver<Maybe<ResolversTypes['Patient']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaymentDetailsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaymentDetails'] = ResolversParentTypes['PaymentDetails']> = {
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  additionalChargeAmount?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  additionalChargeDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  amountTendered?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  change?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  discount?: Resolver<Maybe<ResolversTypes['DiscountCategory']>, ParentType, ContextType>;
  subtotal?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  transactionDetails?: Resolver<Maybe<ResolversTypes['TransactionDetails']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  appointments?: Resolver<Maybe<Array<Maybe<ResolversTypes['Appointment']>>>, ParentType, ContextType>;
  getAppointment?: Resolver<ResolversTypes['AppointmentPayload'], ParentType, ContextType, Partial<QueryGetAppointmentArgs>>;
  getNotification?: Resolver<Maybe<ResolversTypes['NotificationPayload']>, ParentType, ContextType, Partial<QueryGetNotificationArgs>>;
  getPatient?: Resolver<ResolversTypes['PatientPayload'], ParentType, ContextType, Partial<QueryGetPatientArgs>>;
  getQueue?: Resolver<Maybe<ResolversTypes['QueuePayload']>, ParentType, ContextType, Partial<QueryGetQueueArgs>>;
  getTransaction?: Resolver<ResolversTypes['TransactionPayload'], ParentType, ContextType, Partial<QueryGetTransactionArgs>>;
  getUser?: Resolver<ResolversTypes['AuthPayload'], ParentType, ContextType, Partial<QueryGetUserArgs>>;
  getUserInformation?: Resolver<ResolversTypes['UserInfoPayload'], ParentType, ContextType, RequireFields<QueryGetUserInformationArgs, '_id'>>;
  notifications?: Resolver<Maybe<Array<Maybe<ResolversTypes['Notification']>>>, ParentType, ContextType>;
  patients?: Resolver<Maybe<Array<Maybe<ResolversTypes['Patient']>>>, ParentType, ContextType>;
  transactions?: Resolver<Maybe<Array<Maybe<ResolversTypes['TransactionDetails']>>>, ParentType, ContextType>;
  users?: Resolver<Maybe<Array<Maybe<ResolversTypes['User']>>>, ParentType, ContextType>;
};

export type QueryResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['QueryResponse'] = ResolversParentTypes['QueryResponse']> = {
  __resolveType: TypeResolveFn<null, ParentType, ContextType>;
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type QueueResolvers<ContextType = any, ParentType extends ResolversParentTypes['Queue'] = ResolversParentTypes['Queue']> = {
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  queue?: Resolver<Maybe<Array<Maybe<ResolversTypes['PatientInQueue']>>>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueuePayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['QueuePayload'] = ResolversParentTypes['QueuePayload']> = {
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  queue?: Resolver<Maybe<ResolversTypes['Queue']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  addPatientInQueue?: SubscriptionResolver<Maybe<ResolversTypes['PatientInQueue']>, "addPatientInQueue", ParentType, ContextType, Partial<SubscriptionAddPatientInQueueArgs>>;
  patientAdded?: SubscriptionResolver<Maybe<ResolversTypes['Notification']>, "patientAdded", ParentType, ContextType, Partial<SubscriptionPatientAddedArgs>>;
  patientCompleted?: SubscriptionResolver<Maybe<ResolversTypes['Notification']>, "patientCompleted", ParentType, ContextType>;
  transactionCompleted?: SubscriptionResolver<Maybe<ResolversTypes['TransactionDetails']>, "transactionCompleted", ParentType, ContextType>;
};

export type TransactionDetailsResolvers<ContextType = any, ParentType extends ResolversParentTypes['TransactionDetails'] = ResolversParentTypes['TransactionDetails']> = {
  _tid?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  patientDetails?: Resolver<Maybe<ResolversTypes['Patient']>, ParentType, ContextType>;
  paymentDetails?: Resolver<Maybe<ResolversTypes['PaymentDetails']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['TransactionStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TransactionPayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['TransactionPayload'] = ResolversParentTypes['TransactionPayload']> = {
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  transaction?: Resolver<Maybe<ResolversTypes['TransactionDetails']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  emailVerified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  notifications?: Resolver<Maybe<Array<Maybe<ResolversTypes['Notification']>>>, ParentType, ContextType>;
  password?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userInformation?: Resolver<Maybe<ResolversTypes['UserInformation']>, ParentType, ContextType>;
  userRole?: Resolver<ResolversTypes['UserRoles'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserInfoPayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserInfoPayload'] = ResolversParentTypes['UserInfoPayload']> = {
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  userInformation?: Resolver<Maybe<ResolversTypes['UserInformation']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserInformationResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserInformation'] = ResolversParentTypes['UserInformation']> = {
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  contactNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  middleName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  patients?: Resolver<Maybe<Array<Maybe<ResolversTypes['Patient']>>>, ParentType, ContextType>;
  schedule?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  specialization?: Resolver<Maybe<ResolversTypes['Specialization']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Appointment?: AppointmentResolvers<ContextType>;
  AppointmentPayload?: AppointmentPayloadResolvers<ContextType>;
  AuthPayload?: AuthPayloadResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  MutationResponse?: MutationResponseResolvers<ContextType>;
  Notification?: NotificationResolvers<ContextType>;
  NotificationPayload?: NotificationPayloadResolvers<ContextType>;
  Patient?: PatientResolvers<ContextType>;
  PatientInQueue?: PatientInQueueResolvers<ContextType>;
  PatientPayload?: PatientPayloadResolvers<ContextType>;
  PaymentDetails?: PaymentDetailsResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  QueryResponse?: QueryResponseResolvers<ContextType>;
  Queue?: QueueResolvers<ContextType>;
  QueuePayload?: QueuePayloadResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  TransactionDetails?: TransactionDetailsResolvers<ContextType>;
  TransactionPayload?: TransactionPayloadResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserInfoPayload?: UserInfoPayloadResolvers<ContextType>;
  UserInformation?: UserInformationResolvers<ContextType>;
};

