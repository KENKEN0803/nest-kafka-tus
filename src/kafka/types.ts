export interface tTargetImageFind {
  // 업로드된 파일의 유니크 키
  id: string;
  // vsi 파일의 몇번 이미지를 변환해야하는지. 실패했다면 null
  series?: number;

  // 실패 사유. 성공했다면 null
  message?: string;
}
