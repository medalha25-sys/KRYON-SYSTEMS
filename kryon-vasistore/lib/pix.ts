/**
 * Utilitário de Geração de PIX EMVCo (BR Code) e QR Code para o Sistema VasiStore
 * Padrão Oficial do Banco Central do Brasil (BACEN)
 */

function emv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export interface PixPayloadParams {
  key?: string;
  merchantName?: string;
  merchantCity?: string;
  amount?: number;
  txId?: string;
}

export function generatePixPayload({
  key = '08395029667',
  merchantName = 'VASISTORE UTILIDADES',
  merchantCity = 'BRASILIA',
  amount,
  txId = '***',
}: PixPayloadParams): string {
  const cleanKey = (key || '08395029667').trim();
  const cleanName = (merchantName || 'VASISTORE')
    .slice(0, 25)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
  const cleanCity = (merchantCity || 'BRASILIA')
    .slice(0, 15)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
  const cleanTxId = (txId || '***').slice(0, 25);

  let payload = '';
  // 00: Payload Format Indicator
  payload += emv('00', '01');
  // 01: Point of Initiation Method (12 = Estático/Dinâmico com valor)
  payload += emv('01', amount && amount > 0 ? '12' : '11');

  // 26: Merchant Account Information
  const mai = emv('00', 'br.gov.bcb.pix') + emv('01', cleanKey);
  payload += emv('26', mai);

  // 52: Merchant Category Code (0000 = Geral)
  payload += emv('52', '0000');
  // 53: Transaction Currency (986 = BRL)
  payload += emv('53', '986');

  // 54: Transaction Amount
  if (amount && amount > 0) {
    payload += emv('54', amount.toFixed(2));
  }

  // 58: Country Code (BR)
  payload += emv('58', 'BR');
  // 59: Merchant Name
  payload += emv('59', cleanName || 'VASISTORE');
  // 60: Merchant City
  payload += emv('60', cleanCity || 'BRASILIA');

  // 62: Additional Data Field Template (TxID)
  const addData = emv('05', cleanTxId);
  payload += emv('62', addData);

  // 63: CRC16 Checksum
  payload += '6304';
  const checksum = crc16(payload);
  payload += checksum;

  return payload;
}

export function getPixQrCodeUrl(payload: string, size = 280): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(payload)}&margin=6`;
}
