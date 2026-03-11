export type MaksItem = {
  adi: string;
  soyadi: string;
  sokak: string;
  mahalle: string;
  ilce: string;
  abone_no: string;
  dis_kapi_no: string;
  ic_kapi_no: string;
  bina_maks: number;
};

export type MaksResponse = {
  sonucKodu: number;
  sonucAciklama: string;
  value: MaksItem[];
};

export type MyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  data: MaksResponse | null;
  onRefresh: () => void;
  userCode: string;
  userPasswd: string;
};

export type MaksItem2 = {
  donem: number;
  okuma_tarihi: string;
  sayac_durum: string;
  tuk_m3: number;
  toplam_tutar: number;
  abone_no: string;
};

export type MaksResponse2 = {
  sonucKodu: number;
  sonucAciklama: string;
  value: MaksItem2[];
};

export type MyModalProps2 = {
  isOpen: boolean;
  onClose: () => void;
  data: MaksResponse2 | null;
  onRefresh: () => void;
  icKapiNo: string | null;
};
