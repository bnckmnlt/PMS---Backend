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
    subscribe: () => pubsub.asyncIterator("PATIENT_COMPLETED"),
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

export default subscriptions;
