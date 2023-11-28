import { DevelopmentDataSource } from "../data-source";
import { Patient } from "../entity/Patient";
import { TransactionDetails } from "../entity/TransactionDetails";
import { PaymentDetails } from "../entity/PaymentDetails";
import {
  MutationAddTransactionArgs,
  MutationRemoveTransactionArgs,
  MutationUpdateTransactionArgs,
  QueryGetTransactionArgs,
} from "../generated/types";
import throwCustomError, { ErrorTypes } from "../helpers/error-handler.helper";
import { publishTransactionCompleted } from "../graphql/subscriptions";

class TransactionService {
  async transactions() {
    return await TransactionDetails.find({
      relations: {
        patientDetails: {
          doctor: { userInformation: true },
          appointment: true,
          transactions: true,
        },
        paymentDetails: true,
      },
    });
  }

  async getTransaction({
    tid,
    cardId,
    contactNumber,
  }: QueryGetTransactionArgs) {
    const input: any = {
      tid,
      cardId,
      contactNumber,
    };

    const transaction = await TransactionDetails.findOne({
      relations: {
        paymentDetails: true,
        patientDetails: {
          doctor: { userInformation: true },
          appointment: true,
        },
      },
      where: [
        { _tid: input.tid },
        {
          patientDetails: {
            cardId: input.cardId,
          },
        },
        {
          patientDetails: {
            contactNumber: input.contactNumber,
          },
        },
      ],
    });

    if (!transaction) {
      return throwCustomError(
        "No transaction records match the input criteria",
        ErrorTypes.NOT_FOUND
      );
    }

    return {
      code: 200,
      success: true,
      message: "Transaction records found",
      transaction: transaction,
    };
  }

  async addTransaction({ input }: MutationAddTransactionArgs) {
    const inputs: any = {
      _id: input?._id,
      subtotal: input?.subtotal,
    };

    const queryRunner = DevelopmentDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const getPatient = await Patient.findOne({
        where: { _id: inputs._id },
      });

      if (!getPatient) {
        return throwCustomError(
          "No patient records match the input criteria",
          ErrorTypes.NOT_FOUND
        );
      }

      const transaction = await TransactionDetails.findOne({
        relations: {
          patientDetails: true,
          paymentDetails: true,
        },
        where: [
          {
            patientDetails: {
              _id: getPatient?._id,
            },
          },
        ],
      });

      if (transaction) {
        return throwCustomError(
          "Transaction already exists",
          ErrorTypes.CONFLICT
        );
      }

      const createTransaction = TransactionDetails.create({
        patientDetails: getPatient,
      });
      const transactionResponse =
        await queryRunner.manager.save(createTransaction);

      const paymentDetails = await PaymentDetails.findOne({
        relations: {
          transactionDetails: true,
        },
        where: {
          transactionDetails: {
            patientDetails: { _id: getPatient?._id },
          },
        },
      });

      if (paymentDetails) {
        return throwCustomError(
          "Payment details already exists for this transaction",
          ErrorTypes.CONFLICT
        );
      }

      const newPaymentDetails = PaymentDetails.create({
        transactionDetails: transactionResponse,
        subtotal: input?.subtotal,
      });

      await queryRunner.manager.save(newPaymentDetails);
      await queryRunner.commitTransaction();

      return {
        code: 200,
        success: true,
        message: "Transaction added",
        transaction: transaction,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return throwCustomError(error, ErrorTypes.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }

  async updateTransaction({ input }: MutationUpdateTransactionArgs) {
    const transaction = await TransactionDetails.findOne({
      relations: {
        paymentDetails: true,
        patientDetails: {
          doctor: true,
          appointment: true,
        },
      },
      where: {
        _tid: input?._tid || "",
      },
    });

    if (!transaction) {
      return throwCustomError(
        "No transaction records match the input criteria",
        ErrorTypes.NOT_FOUND
      );
    }

    await TransactionDetails.update(
      { _tid: transaction._tid },
      {
        status: input?.status,
      }
    );

    await PaymentDetails.update(
      {
        _id: transaction._tid,
      },
      {
        additionalChargeDescription:
          input?.additionalChargeDescription || "NONE",
        additionalChargeAmount: input?.additionalChargeAmount || 0,
        discount: input?.discount,
        total: input?.total,
        amountTendered: input?.amountTendered,
        change: input?.change,
      }
    );

    const updatedTransaction = await TransactionDetails.findOne({
      relations: {
        paymentDetails: true,
        patientDetails: {
          doctor: true,
          appointment: true,
        },
      },
      where: {
        _tid: transaction._tid,
      },
    });

    if (!updatedTransaction) {
      return throwCustomError(
        "No transaction records match the input criteria",
        ErrorTypes.NOT_FOUND
      );
    }

    publishTransactionCompleted(updatedTransaction);

    return {
      code: 200,
      success: true,
      message: "Transaction updated",
      transaction: transaction,
    };
  }

  async removeTransaction(args: MutationRemoveTransactionArgs) {
    const queryRunner = DevelopmentDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const getTransaction = await TransactionDetails.findOne({
        relations: {
          paymentDetails: true,
          patientDetails: {
            doctor: true,
            appointment: true,
          },
        },
        where: {
          _tid: args._tid || "",
        },
      });

      if (!getTransaction) {
        return throwCustomError(
          "No transaction records match the input criteria",
          ErrorTypes.NOT_FOUND
        );
      }

      const getPayment = await PaymentDetails.findOne({
        where: {
          _id: getTransaction._tid,
        },
      });

      if (!getPayment) {
        return throwCustomError(
          "No payment records match the input criteria",
          ErrorTypes.NOT_FOUND
        );
      }

      publishTransactionCompleted(getTransaction);

      await queryRunner.manager.remove(getTransaction);
      await queryRunner.manager.remove(getPayment);
      await queryRunner.commitTransaction();

      return {
        code: 200,
        success: true,
        message: "Transaction removed",
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return throwCustomError(error, ErrorTypes.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }
}

export default new TransactionService();
