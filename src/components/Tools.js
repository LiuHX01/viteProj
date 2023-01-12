// Description: This file contains all the functions that are used in the app

// This function is used to convert the csv file to an array of objects
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

// This function is used to generate a random color
export function generateColor() {
    // return "#" + Math.floor(Math.random() * 0x333).toString(16);
    return chooseFromColors();
}

function chooseFromColors() {
    const color = colors[Math.floor(Math.random() * colors.length)];
    return color;
}

const colors = [
    "#ff1c12",
    "#de5991",
    // "#759AA0",
    // "#E69D87",
    "#be3259",
    // "#EA7E53",
    // "#EEDD78",
    "#9359b1",
    // "#47c0d4",
    // "#F49F42",
    "#AA312C",
    "#B35E45",
    // "#4B8E6F",
    "#ff8603",
    // "#ffde1d",
    // "#1e9d95",
    "#7289AB",
];
