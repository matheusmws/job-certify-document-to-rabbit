import { CronJob } from "cron";
import CertifyDocumentModel from "../models/CertifyDocumentModel";
import { CertifyDocumentUseCase } from "../use-cases/CertifyDocumentUseCase";

class CertifyDocumentCronJob {
  private isCronRunning: boolean = false;
  public start() {
    new CronJob("*/5 * * * * *", async () => {
      if (this.isCronRunning) {
        return;
      }

      this.isCronRunning = true;

      const certifyPendings = await CertifyDocumentModel.getPendings(10);
      for (const certify of certifyPendings) {
        try {
          await CertifyDocumentUseCase(Buffer.from(certify.file, "base64"));
          await CertifyDocumentModel.setProcessed(certify.id);
        } catch (err: any) {
          await CertifyDocumentModel.setErrored(certify.id, err.message);
        }
      }

      this.isCronRunning = false;
    });
  }
}

export default new CertifyDocumentCronJob();
