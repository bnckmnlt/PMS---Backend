import { Notification } from "../entity/Notification";
import { QueryGetNotificationArgs } from "../generated/types";
import throwCustomError, { ErrorTypes } from "../helpers/error-handler.helper";

class NotificationService {
  //[x] All notifications; Done
  async notifications() {
    return await Notification.find({
      relations: {
        user: {
          userInformation: true,
        },
        payload: {
          patient: {
            transactions: true,
            appointment: true,
            visits: true,
          },
          transaction: {
            paymentDetails: true,
          },
          doctor: {
            userInformation: true,
          },
        },
      },
    });
  }

  //[x] Get notification; Done
  async getNotification({ id }: QueryGetNotificationArgs) {
    const input = {
      _id: id || "",
    };
    const notification = await Notification.find({
      relations: {
        user: { userInformation: true },
        payload: {
          patient: {
            transactions: true,
            appointment: true,
            visits: true,
          },
          transaction: {
            paymentDetails: true,
          },
          doctor: {
            userInformation: true,
          },
        },
      },
      where: {
        user: {
          _id: input._id,
        },
      },
    });

    if (!notification) {
      return throwCustomError(
        "No notification records match the input criteria",
        ErrorTypes.NOT_FOUND
      );
    }

    return {
      code: 200,
      success: true,
      message: "Notification record found",
      notification: notification,
    };
  }
}

export default new NotificationService();
