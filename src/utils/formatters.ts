export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatDateTimeIndo(dateTimeStr: string): string {
  if (!dateTimeStr) return '-';
  const date = new Date(dateTimeStr);
  if (isNaN(date.getTime())) return dateTimeStr;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date) + ' WIB';
}

export function numberToWordsIndo(num: number): string {
  if (num === 0) return 'Nol Rupiah';
  const units = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

  function terbilang(n: number): string {
    if (n < 12) {
      return units[n];
    } else if (n < 20) {
      return terbilang(n - 10) + ' Belas';
    } else if (n < 100) {
      return terbilang(Math.floor(n / 10)) + ' Puluh ' + terbilang(n % 10);
    } else if (n < 200) {
      return 'Seratus ' + terbilang(n - 100);
    } else if (n < 1000) {
      return terbilang(Math.floor(n / 100)) + ' Ratus ' + terbilang(n % 100);
    } else if (n < 2000) {
      return 'Seribu ' + terbilang(n - 1000);
    } else if (n < 1000000) {
      return terbilang(Math.floor(n / 1000)) + ' Ribu ' + terbilang(n % 1000);
    } else if (n < 1000000000) {
      return terbilang(Math.floor(n / 1000000)) + ' Juta ' + terbilang(n % 1000000);
    } else if (n < 1000000000000) {
      return terbilang(Math.floor(n / 1000000000)) + ' Miliar ' + terbilang(n % 1000000000);
    }
    return '';
  }

  const result = terbilang(Math.floor(num)).trim().replace(/\s+/g, ' ');
  return (result ? result : 'Nol') + ' Rupiah';
}
