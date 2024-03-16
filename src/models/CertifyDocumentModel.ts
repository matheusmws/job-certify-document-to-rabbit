import db from "../configs/databases/KnexConfig";
import { CertifyDocumentsTablesEnum, CertifyDocumentsStatusEnum } from "../enums/CertifyDocumentsEnums";

class CertifyDocumentModel {
  async getPendings(limit: number = 1000): Promise<CertifyDocumentModel[]> {
    return await db(CertifyDocumentsTablesEnum.CERTIFIY_DOCUMENTS)
      .where({ status: CertifyDocumentsStatusEnum.PENDING })
      .limit(limit)
      .select("*");
  }

  async setProcessed(documentId: string): Promise<void> {
    await db(CertifyDocumentsTablesEnum.CERTIFIY_DOCUMENTS).where("id", documentId).update({
      status: CertifyDocumentsStatusEnum.PROCESSED,
      updated_at: new Date(),
    });
  }

  async setErrored(documentId: string, message: string): Promise<void> {
    await db(CertifyDocumentsTablesEnum.CERTIFIY_DOCUMENTS).where("id", documentId).update({
      status: CertifyDocumentsStatusEnum.ERRORED,
      message: message,
      updated_at: new Date(),
    });
  }

  async setSendToQueue(documentId: string): Promise<void> {
    await db(CertifyDocumentsTablesEnum.CERTIFIY_DOCUMENTS).where("id", documentId).update({
      status: CertifyDocumentsStatusEnum.IN_QUEUE,
      updated_at: new Date()
    });
  }

  async getDetailsById(documentId: string): Promise<CertifyDocumentModel>{
    return await db(CertifyDocumentsTablesEnum.CERTIFIY_DOCUMENTS).where("id", documentId).first()
  }
}

export default new CertifyDocumentModel();

interface CertifyDocumentModel {
  id: string;
  file: string;
  status: number;
  message: string;
  created_at: Date;
  updated_at: Date;
}
