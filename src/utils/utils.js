import JSZip from "jszip";


export function RandomStringGenerator(len) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < len) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;

}


// Tambahkan di bagian atas file
export function DeepSortObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map(DeepSortObject);
  } else if (obj !== null && typeof obj === "object") {
    return Object.keys(obj)
      .sort()
      .reduce((result, key) => {
        result[key] = DeepSortObject(obj[key]);
        return result;
      }, {});
  }
  return obj;
}

export function FormatTimestamp(epoch) {
  if (!epoch) return "-";
  const date = new Date(epoch * 1000);
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};


export function GetLocalTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}



export function FormatToLocal(datetimeStr, timezone) {
  if (!datetimeStr) return ''

  const safeTimezone = (typeof timezone === 'string' && timezone.trim() !== '')
    ? timezone
    : Intl.DateTimeFormat().resolvedOptions().timeZone

  const date = new Date(datetimeStr)
  return date.toLocaleString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: safeTimezone,
  }).replace(/\./g, ':')
}




export function ConvertToEpoch(dateInput) {
  if (!dateInput) return null;

  // Jika input berupa string tanggal (misalnya dari v-date-picker)
  const date = new Date(dateInput);

  // Pastikan objek Date valid
  if (isNaN(date.getTime())) return null;

  // Konversi ke detik (bukan milidetik)
  return Math.floor(date.getTime() / 1000);
}





export async function ExtractImage(base64Data) {
  try {
    const zip = new JSZip();
    const zipData = await zip.loadAsync(base64Data.split(",")[1], { base64: true });

    for (const fileName in zipData.files) {
      if (fileName.match(/\.(jpeg|jpg|png)$/i)) {
        const fileData = await zipData.files[fileName].async("base64");
        return `data:image/${fileName.split(".").pop()};base64,${fileData}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error extracting image:", error);
    return null;
  }
};

export async function CompressToZip(file, fileName) {
  try {
    const zip = new JSZip();
    zip.file(fileName, file);

    const zipBlob = await zip.generateAsync({ type: "blob" });
    return zipBlob;
  } catch (error) {
    console.error("Error while compressing to ZIP:", error);
    return null;
  }
}


export async function ConvertImageToBase64(file) {
  try {
    const reader = new FileReader();

    return await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error("Error converting file to Base64:", error);
    return null;
  }
};


export function FormatSize(bytes) {
  if (bytes === 0 || bytes == null) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);

  return `${size.toFixed(2)} ${units[i]}`;
}







export function GetMonthNameLocal(monthNumber) {
  const month_names_local = [
    { id: 1, name: 'Januari' },
    { id: 2, name: 'Februari' },
    { id: 3, name: 'Maret' },
    { id: 4, name: 'April' },
    { id: 5, name: 'Mei' },
    { id: 6, name: 'Juni' },
    { id: 7, name: 'Juli' },
    { id: 8, name: 'Agustus' },
    { id: 9, name: 'September' },
    { id: 10, name: 'Oktober' },
    { id: 11, name: 'November' },
    { id: 12, name: 'Desember' }
  ]

  const month = month_names_local.find(m => m.id === monthNumber)
  return month ? month.name : 'Bulan Tidak Diketahui'
}




export function GetDayNameLocal(dayNumber) {
  const day_names_local = [
    { id: 1, name: 'Senin' },
    { id: 2, name: 'Selasa' },
    { id: 3, name: 'Rabu' },
    { id: 4, name: 'Kamis' },
    { id: 5, name: 'Jumat' },
    { id: 6, name: 'Sabtu' },
    { id: 7, name: 'Minggu' },
  ]

  const found = day_names_local.find(d => d.id === dayNumber)
  return found ? found.name : '-'
}

export function FormatCustomDateTime(timestamp, options = {}) {
  if (!timestamp) return '-'

  const date = new Date(timestamp)
  const {
    day = false,
    month = false,
    year = false,
    weekday = false,
    hour = false,
    minute = false,
    second = false
  } = options

  const parts = []

  if (weekday) {
    const dayName = GetDayNameLocal(date.getDay() === 0 ? 7 : date.getDay())
    parts.push(dayName)
  }

  const dateParts = []
  if (day) dateParts.push(date.getDate())
  if (month) dateParts.push(GetMonthNameLocal(date.getMonth() + 1))
  if (year) dateParts.push(date.getFullYear())
  if (dateParts.length > 0) parts.push(dateParts.join(' '))

  const timeParts = []
  if (hour) timeParts.push(date.getHours().toString().padStart(2, '0'))
  if (minute) timeParts.push(date.getMinutes().toString().padStart(2, '0'))
  if (second) timeParts.push(date.getSeconds().toString().padStart(2, '0'))

  const timeString = timeParts.join('.')

  return `${parts.join(', ')} ${timeString}`.trim()
}
