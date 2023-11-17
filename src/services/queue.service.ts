import { User } from "../entity/User";
import { Queue } from "../entity/Queue";
import { MutationAddQueueArgs, QueryGetQueueArgs } from "../generated/types";
import throwCustomError, { ErrorTypes } from "../helpers/error-handler.helper";

class QueueService {
  async getQueue({ id }: QueryGetQueueArgs) {
    const queue = await Queue.find({
      relations: {
        user: {
          userInformation: true,
        },
        queue: {
          patient: {
            doctor: true,
            appointment: true,
            transactions: true,
          },
        },
      },
      where: {
        user: {
          _id: id || "",
        },
      },
    });

    if (!queue) {
      return throwCustomError(
        "No queue records match the input criteria",
        ErrorTypes.NOT_FOUND
      );
    }

    return {
      code: 200,
      success: true,
      message: "Queue succesfully fetched",
      queue: queue,
    };
  }

  async addQueue({ id }: MutationAddQueueArgs) {
    const queue = await Queue.findOne({
      relations: {
        user: {
          userInformation: true,
        },
        queue: {
          patient: {
            doctor: true,
            appointment: true,
            transactions: true,
          },
        },
      },
      where: {
        user: {
          _id: id || "",
        },
      },
    });

    if (queue) {
      return throwCustomError("Queue already exists", ErrorTypes.CONFLICT);
    }

    const consultant = await User.findOne({
      relations: {
        userInformation: true,
      },
      where: {
        _id: id || "",
      },
    });

    if (!consultant) {
      return throwCustomError(
        "No user records match the input criteria",
        ErrorTypes.NOT_FOUND
      );
    }

    const queueResponse = await Queue.save({
      user: consultant,
    });

    return {
      code: 200,
      success: true,
      message: "Queue successfully created",
      queue: queueResponse,
    };
  }
}

export default new QueueService();
