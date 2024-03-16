import amqp from 'amqplib';

import { CertifyDocumentsTablesEnum } from '../enums/CertifyDocumentsEnums';
import { CertifyDocumentUseCase } from '../use-cases/CertifyDocumentUseCase';
import CertifyDocumentModel from '../models/CertifyDocumentModel';
import 'dotenv/config';

async function consumer() {
    const rabbitConn = amqp.connect({
        hostname: process.env.RABBITMQ_HOST,
        port: Number(process.env.RABBITMQ_PORT),
        username: process.env.RABBITMQ_USER,
        password: process.env.RABBITMQ_PASS
    });

    const channel = (await rabbitConn).createChannel();

    (await channel).prefetch(5);

    (await channel).consume(CertifyDocumentsTablesEnum.CERTIFIY_DOCUMENTS, async (data) => {
        const msg = JSON.parse(data.content.toString());

        try {
            const documentDetails = await CertifyDocumentModel.getDetailsById(msg.id);
            await CertifyDocumentUseCase(Buffer.from(documentDetails.file, "base64"));
            await CertifyDocumentModel.setProcessed(msg.id);
        } catch (err: any) {
            await CertifyDocumentModel.setErrored(msg.id, err.message);
        }

        (await channel).ack(data);
    });
}

consumer();