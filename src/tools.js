// 将csv格式string转换为object array
export function csvToArray(str, delimiter = ",") {
    const headers = str.slice(0, str.indexOf("\n")).split(delimiter);
    const rows = str.slice(str.indexOf("\n") + 1).split("\n");
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

export function divideByKey(arr, key) {
    return arr.reduce(function (acc, obj) {
        const property = obj[key];
        acc[property] = acc[property] || [];
        acc[property].push(obj);
        return acc;
    }, {});
}

export function getAllKeyByIdinObjectArraynoRepeat(arr, key) {
    const allKey = arr.map((obj) => obj[key]);
    return [...new Set(allKey)];
}