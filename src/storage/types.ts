export interface tUploadFileKafkaPayload {
  id: string;
  size: number;
  offset: number;
  metadata: string;
  creation_date: string;
  original_filename?: string;
  mimetype?: string;
}
