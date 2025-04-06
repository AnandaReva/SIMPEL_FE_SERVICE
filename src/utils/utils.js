



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
  