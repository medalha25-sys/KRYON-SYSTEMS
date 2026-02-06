
/**
 * Simple PIX Payload Generator (Static QR Code)
 * Following BCB standards (BRCode)
 */
export function generatePixPayload(key: string, amount: number, merchantName: string = 'Kryon Systems', city: string = 'SAO PAULO') {
  const sanitize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  
  const name = sanitize(merchantName).slice(0, 25);
  const cityName = sanitize(city).slice(0, 15);
  const amountStr = amount.toFixed(2);

  const formatField = (id: string, value: string) => {
    return id + value.length.toString().padStart(2, '0') + value;
  };

  // Merchant Account Info (GUI + Key)
  const gui = formatField('00', 'br.gov.bcb.pix');
  const keyField = formatField('01', key);
  const merchantAccountInfo = formatField('26', gui + keyField);

  let payload = '000201'; // Payload Format Indicator
  payload += merchantAccountInfo;
  payload += '52040000'; // Merchant Category Code
  payload += '5303986';  // Transaction Currency (BRL)
  payload += formatField('54', amountStr); // Amount
  payload += '5802BR';   // Country Code
  payload += formatField('59', name); // Merchant Name
  payload += formatField('60', cityName); // Merchant City
  payload += '62070503***'; // Additional Data (TxID)

  payload += '6304'; // CRC16 placeholder

  // CRC16 CCITT Calculation
  const getCRC16 = (data: string) => {
    let crc = 0xFFFF;
    const polynomial = 0x1021;
    for (let i = 0; i < data.length; i++) {
        const b = data.charCodeAt(i);
        for (let j = 0; j < 8; j++) {
            const bit = ((b >> (7 - j) & 1) === 1);
            const c15 = ((crc >> 15 & 1) === 1);
            crc <<= 1;
            if (c15 !== bit) crc ^= polynomial;
        }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  };

  return payload + getCRC16(payload);
}
