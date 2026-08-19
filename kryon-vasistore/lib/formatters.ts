/**
 * Utilitários de formatação para o sistema Utillar
 */

// Formatar moeda em Real Brasileiro (R$)
export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Formatar número simples
export function formatNumber(value: number | undefined | null, decimals = 0): string {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// Formatar porcentagem
export function formatPercent(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return '0%';
  return `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)}%`;
}

// Formatar data abreviada (DD/MM/AAAA)
export function formatDate(dateString: string | Date | undefined | null): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'America/Sao_Paulo',
    }).format(d);
  } catch {
    return '-';
  }
}

// Formatar data e hora (DD/MM/AAAA HH:mm)
export function formatDateTime(dateString: string | Date | undefined | null): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
    }).format(d);
  } catch {
    return '-';
  }
}

// Formatar CPF ou CNPJ
export function formatCpfCnpj(value: string | undefined | null): string {
  if (!value) return '-';
  const clean = value.replace(/\D/g, '');
  if (clean.length === 11) {
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (clean.length === 14) {
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return value;
}

// Formatar Telefone / Celular / WhatsApp
export function formatPhone(value: string | undefined | null): string {
  if (!value) return '-';
  const clean = value.replace(/\D/g, '');
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return value;
}

// Gerador de SKU aleatório baseado no nome da categoria
export function generateSku(categoryCode = 'UTL'): string {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${categoryCode.toUpperCase()}-${random}`;
}

// Gerador de Código de Barras EAN-13 fictício válido
export function generateBarcode(): string {
  let code = '789'; // Prefixo Brasil
  for (let i = 0; i < 9; i++) {
    code += Math.floor(Math.random() * 10);
  }
  // Cálculo do dígito verificador EAN-13
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(code[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return `${code}${checkDigit}`;
}

// Criar link para WhatsApp direto com mensagem
export function getWhatsAppLink(phone: string, message?: string): string {
  const clean = phone.replace(/\D/g, '');
  const number = clean.startsWith('55') ? clean : `55${clean}`;
  const text = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${number}${text ? `?text=${text}` : ''}`;
}
