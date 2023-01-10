export function csvToArray(str, delimiter = ",") {
    const headers = str.slice(0, str.indexOf("\r")).split(delimiter);
    const rows = str.slice(str.indexOf("\r") + 1).split("\r");
    const arr = rows.map(function (row) {
        const values = row.split(delimiter);
        const el = headers.reduce(function (object, header, index) {
            object[header] = values[index];
            return object;
        }, {});
        return el;
    });
    return arr;
}

// return array
export function divideByKey(arr, key) {
    const allKey = getAllKeyByIdinObjectArraynoRepeat(arr, key);
    const res = allKey.map((k) => {
        return arr.filter((obj) => obj[key] === k);
    });
    return res;
}


export function getAllKeyByIdinObjectArraynoRepeat(arr, key) {
    const allKey = arr.map((obj) => obj[key]);
    return [...new Set(allKey)];
}

export function generatecolor() {
    return "#" + Math.floor(Math.random() * 0xffffff).toString(16);
}
