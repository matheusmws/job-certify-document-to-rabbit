import { CronJob } from "cron";
import CertifyDocumentModel from "../models/CertifyDocumentModel";
import { CertifyDocumentUseCase } from "../use-cases/CertifyDocumentUseCase";
import amqp from 'amqplib';
import { Queue } from "../types/Queue";
import 'dotenv/config';

class CertifyDocumentCronJob {
  private isCronRunning: boolean = false;

  private queueConfig: Queue = {
    route: 'certify_document',
    type: 'direct'
  };

  async start() {
    const rabbitConn = amqp.connect({
      hostname: process.env.RABBITMQ_HOST,
      port: Number(process.env.RABBITMQ_PORT),
      username: process.env.RABBITMQ_USER,
      password: process.env.RABBITMQ_PASS
    });

    const channel = (await rabbitConn).createChannel();

    (await channel).assertQueue(this.queueConfig.route, { durable: true });

    new CronJob(
      "*/5 * * * * *",
      async () => {
        if (this.isCronRunning) return;

        this.isCronRunning = true;

        const certifyPendings = await CertifyDocumentModel.getPendings(10);

        for (const certify of certifyPendings) {
          const rabbitData = { id: certify.id };

          const sendMessage = (await channel).publish('', this.queueConfig.route, Buffer.from(JSON.stringify(rabbitData)));

          if (sendMessage) {
            await CertifyDocumentModel.setSendToQueue(certify.id);
          }
        }

        this.isCronRunning = false;
      },
      null,
      true,
      "America/Sao_Paulo"
    );
  }
}

export default new CertifyDocumentCronJob();
