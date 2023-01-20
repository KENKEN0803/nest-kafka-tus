export interface tUploadFileKafkaPayload {
  id: string;
  size: number;
  offset: number;
  creation_date: string;
  original_filename?: string;
  mimetype?: string;
  vsi_path?: string;
}
