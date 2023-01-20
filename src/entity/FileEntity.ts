import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'file' }) // 테이블 이름 지정
export class FileEntity {
  @PrimaryColumn('varchar', { length: 255 })
  id: string;

  @Column('bigint', { nullable: true })
  size?: number;

  @Column('bigint', { nullable: true })
  offset?: number;

  @Column('text', { nullable: true })
  metadata?: string;

  @CreateDateColumn({ nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  creation_date: Date;

  @Column('varchar', { length: 512, nullable: false })
  original_filename: string;

  @Column('varchar', { length: 256, nullable: true })
  mimetype?: string;

  @Column('varchar', { length: 2048, nullable: false })
  vsi_path: string;

  @Column('varchar', { length: 2048, nullable: false })
  path: string;

  @Column()
  status: number; // -1: error, 0: upload, 1: unzip, 2: target image find, 3: image convert, 5: ai process, 10: done

  @Column()
  status_message: string;
}
