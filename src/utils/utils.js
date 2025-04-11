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
