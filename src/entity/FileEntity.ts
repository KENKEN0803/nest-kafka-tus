import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

export enum FileStatus {
  ERROR = -1,
  UPLOAD = 0,
  UNZIP = 1,
  TARGET_IMAGE_FIND = 2,
  IMAGE_CONVERT = 3,
  AI_PROCESS = 5,
  DONE = 10,
}

@Entity({ name: 'file' }) // 테이블 이름 지정
export class FileEntity {
  @PrimaryColumn('varchar', { length: 255 })
  id: string;

  @Column({ nullable: true })
  uploader?: number;

  @Column('unsigned big int')
  size: number;

  @Column('unsigned big int')
  offset: number;

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  creation_date: Date;

  @Column('varchar', { length: 512 })
  original_filename: string;

  @Column('varchar', { length: 256, nullable: true })
  mimetype?: string;

  @Column('varchar', { length: 2048 })
  vsi_path: string;

  @Column('varchar', { length: 2048 })
  path: string;

  @Column() // int(11) default not null
  status: FileStatus; // -1: error, 0: upload, 1: unzip, 2: target image find, 3: image convert, 5: ai process, 10: done

  @Column({ nullable: true }) // varchar(255) default null
  status_message: string;
}
