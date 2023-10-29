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

class TransactionService {
  async transactions() {
    return await TransactionDetails.find({
      relations: {
        patientDetails: true,
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

    try {
      const transaction = await TransactionDetails.findOne({
        relations: {
          paymentDetails: true,
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
        return {
          code: 404,
          success: false,
          message: "No transactin record/s found",
        };
      }

      return {
        code: 200,
        success: true,
        message: "Transaction records found",
        transaction: transaction,
      };
    } catch (error) {
      return {
        code: 400,
        success: false,
        message: error.message,
      };
    }
  }

  async addTransaction({ input }: MutationAddTransactionArgs) {
    const inputs: any = {
      _id: input?._id,
      subtotal: input?.subtotal,
      additionalChargeDescription: input?.additionalChargeDescription || "NONE",
      additionalChargeAmount: input?.additionalChargeAmount || "0",
    };

    const queryRunner = DevelopmentDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const getPatient = await Patient.findOne({
        where: { _id: inputs._id },
      });

      if (!getPatient) {
        return {
          code: 404,
          success: false,
          message: "No patient record/s found",
        };
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
        return {
          code: 409,
          success: false,
          message: "Existing transaction found",
        };
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
        return {
          code: 409,
          success: false,
          message: "Existing payment detail already stored",
        };
      }

      const newPaymentDetails = PaymentDetails.create({
        transactionDetails: transactionResponse,
        subtotal: input?.subtotal,
        additionalChargeDescription:
          input?.additionalChargeDescription || "NONE",
        additionalChargeAmount: input?.additionalChargeAmount || "0",
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
      return {
        code: 400,
        success: false,
        message: error.message,
      };
    } finally {
      await queryRunner.release();
    }
  }

  async updateTransaction({ input }: MutationUpdateTransactionArgs) {
    const queryRunner = DevelopmentDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const transaction = await TransactionDetails.findOne({
        relations: { paymentDetails: true, patientDetails: true },
        where: {
          _tid: input?._tid || "",
        },
      });

      if (!transaction) {
        return {
          code: 404,
          success: false,
          message: "No transaction record found",
        };
      }

      const updateTransaction = await TransactionDetails.preload({
        _tid: transaction._tid,
        status: input?.status,
        updatedAt: new Date().toISOString(),
      });

      await queryRunner.manager.save(updateTransaction);

      const updatePaymentDetails = await PaymentDetails.preload({
        _id: transaction.paymentDetails._id,
        discount: input?.discount,
        total: input?.total,
        amountTendered: input?.amountTendered,
        change: input?.change,
      });

      await queryRunner.manager.save(updatePaymentDetails);

      await queryRunner.commitTransaction();

      return {
        code: 200,
        success: true,
        message: "Transaction updated",
        transaction: transaction,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return {
        code: 400,
        success: false,
        message: error.message,
      };
    } finally {
      await queryRunner.release();
    }
  }

  async removeTransaction(args: MutationRemoveTransactionArgs) {
    try {
      const getTransaction = await TransactionDetails.findOne({
        where: {
          _tid: args._tid || "",
        },
      });

      if (!getTransaction) {
        return {
          code: 400,
          success: false,
          message: "No transaction record found",
        };
      }

      const removeTransaction = await TransactionDetails.remove(getTransaction);

      if (!removeTransaction) {
        return {
          code: 400,
          success: false,
          message: "Something went wrong",
        };
      }

      return {
        code: 200,
        success: true,
        message: "Transaction removed",
      };
    } catch (error) {
      return {
        code: 400,
        success: false,
        message: error.message,
      };
    }
  }
}

export default new TransactionService();
