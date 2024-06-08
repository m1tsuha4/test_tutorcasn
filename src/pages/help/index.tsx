

export const getDate = (date: any) => {
    const Dates = new Date(date);
    const day = Dates.getDate()
    const month = Dates.getMonth() + 1
    const year = Dates.getFullYear()
    return `${day < 10 ? `0${day}` : day}/${month < 10 ? `0${month}` : month}/${year}`
}
export const getHours = (date: any) => {
    const Dates = new Date(date);
    const hours = Dates.getHours()
    const minute = Dates.getMinutes()
    return `${hours < 10 ? `0${hours}` : hours}:${minute < 10 ? `0${minute}` : minute}`
}

export const base64ToFile = (base64: any, filename: any) => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    const blob = new Blob([u8arr], { type: mime });

    return new File([blob], filename, { type: mime });
}

export const Api_Url = "http://localhost:3000"