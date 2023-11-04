import { PubSub, withFilter } from "graphql-subscriptions";

const pubsub = new PubSub();

const subscriptions = {
  patientAdded: {
    subscribe: withFilter(
      () => pubsub.asyncIterator("PATIENT_ADDED"),
      (payload, variables) => {
        return payload.patientAdded.doctor._id === variables.id;
      }
    ),
  },
};

export function publishPatientRecord(data: object) {
  pubsub.publish("PATIENT_ADDED", {
    patientAdded: data,
  });
}

export default subscriptions;
