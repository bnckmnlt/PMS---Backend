import { PubSub, withFilter } from "graphql-subscriptions";

const pubsub = new PubSub();

const subscriptions = {
  patientAdded: {
    subscribe: withFilter(
      () => pubsub.asyncIterator("PATIENT_ADDED"),
      (payload, variables) => {
        return (
          payload.patientAdded.user._id === variables.id &&
          payload.patientAdded.type === "ADDED"
        );
      }
    ),
  },
  patientCompleted: {
    subscribe: () => pubsub.asyncIterator(["PATIENT_COMPLETED"]),
  },
  transactionCompleted: {
    subscribe: withFilter(
      () => pubsub.asyncIterator("TRANSACTION_COMPLETED"),
      (payload) => {
        return payload.transactionCompleted.status === "PAID";
      }
    ),
  },
  addPatientInQueue: {
    subscribe: withFilter(
      () => pubsub.asyncIterator("ADD_PATIENT_INQUEUE"),
      (payload, variables) => {
        return payload.addPatientInQueue.patient.doctor._id === variables.id;
      }
    ),
  },
  addPatientInPersonnel: {
    subscribe: () => pubsub.asyncIterator(["ADD_PATIENT_IN_PERSONNEL"]),
  },
};

export function publishPatientRecord(data: object) {
  pubsub.publish("PATIENT_ADDED", {
    patientAdded: data,
  });
}

export function publishPatientCompleted(data: object) {
  pubsub.publish("PATIENT_COMPLETED", {
    patientCompleted: data,
  });
}

export function publishTransactionCompleted(data: object) {
  pubsub.publish("TRANSACTION_COMPLETED", {
    transactionCompleted: data,
  });
}

export function publishAddPatientInQueue(data: object) {
  pubsub.publish("ADD_PATIENT_INQUEUE", {
    addPatientInQueue: data,
  });
}

export function publishAddPatientInPersonnel(data: object) {
  pubsub.publish("ADD_PATIENT_IN_PERSONNEL", {
    addPatientInPersonnel: data,
  });
}

export default subscriptions;
