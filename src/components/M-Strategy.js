export const HilbertCurveStrategy = (unsorted) => {
    const interleaveBits = (odd, even) => {
        let val = 0;
        let max = Math.max(odd, even);
        let n = 0;
        while (max > 0) {
            max = max >> 1;
            n++;
        }
        for (let i = 0; i < n; i++) {
            let bitMask = 1 << i;
            let a = (even & bitMask) > 0 ? 1 << (2 * i) : 0;
            let b = (odd & bitMask) > 0 ? 1 << (2 * i + 1) : 0;
            val += a + b;
        }
        return val;
    };

    const encode = (x, y, r) => {
        let mask = (1 << r) - 1;
        let hodd = 0;
        let heven = x ^ y;
        let notx = ~x & mask;
        let noty = ~y & mask;
        let temp = notx ^ y;

        let v0 = 0;
        let v1 = 0;
        for (let k = 1; k < r; k++) {
            v1 = ((v1 & heven) | ((v0 ^ noty) & temp)) >> 1;
            v0 = ((v0 & (v1 ^ notx)) | (~v0 & (v1 ^ noty))) >> 1;
        }
        hodd = (~v0 & (v1 ^ x)) | (v0 & (v1 ^ noty));
        return interleaveBits(hodd, heven);
    };

    let result = new Array(unsorted.length);
    for (let x = 0; x < unsorted.length; x++) {
        result[x] = new Array(unsorted[x].length);
    }

    for (let x = 0; x < unsorted.length; x++) {
        let idx = new Array(unsorted[x].length);
        let hilbertValues = new Array(unsorted[x].length);
        for (let y = 0; y < unsorted[x].length; y++) {
            idx[y] = y;
            hilbertValues[y] = encode(parseInt(unsorted[x][y].x), parseInt(unsorted[x][y].y), 100);
        }

        idx.sort(function cmp(o1, o2) {
            return hilbertValues[o1] - hilbertValues[o2];
        });
        // console.log(idx);
        for (let y = 0; y < unsorted[x].length; y++) {
            result[x][y] = unsorted[x][idx[y]];
        }
    }

    return result;
};
/*
class HilbertCurveStrategy {
    constructor() {
        this.#hilbertOrder = 100;
    }

    getOrderedValues(unsorted) {
        console.log(unsorted);
        let result = new Array(unsorted.length);
        for (let x = 0; x < unsorted.length; x++) {
            result[x] = new Array(unsorted[x].length);
        }

        for (let x = 0; x < unsorted.length; x++) {
            let idx = new Array(unsorted[x].length);
            let hilbertValues = new Array(unsorted[x].length);
            for (let y = 0; y < unsorted[x].length; y++) {
                idx[y] = y;
                hilbertValues[y] = this.#encode(
                    parseInt(unsorted[x][y].x),
                    parseInt(unsorted[x][y].y),
                    this.hilbertOrder
                );
            }

            idx.sort(function cmp(o1, o2) {
                return hilbertValues[o1] - hilbertValues[o2];
            });
            console.log(idx);
            for (let y = 0; y < unsorted[x].length; y++) {
                result[x][y] = unsorted[x][idx[y]];
            }
        }

        return result;
    }

    #interleaveBits(odd, even) {
        let val = 0;
        let max = Math.max(odd, even);
        let n = 0;
        while (max > 0) {
            max = max >> 1;
            n++;
        }
        for (let i = 0; i < n; i++) {
            let bitMask = 1 << i;
            let a = (even & bitMask) > 0 ? 1 << (2 * i) : 0;
            let b = (odd & bitMask) > 0 ? 1 << (2 * i + 1) : 0;
            val += a + b;
        }
        return val;
    }

    #encode(x, y, r) {
        let mask = (1 << r) - 1;
        let hodd = 0;
        let heven = x ^ y;
        let notx = ~x & mask;
        let noty = ~y & mask;
        let temp = notx ^ y;

        let v0 = 0;
        let v1 = 0;
        for (let k = 1; k < r; k++) {
            v1 = ((v1 & heven) | ((v0 ^ noty) & temp)) >> 1;
            v0 = ((v0 & (v1 ^ notx)) | (~v0 & (v1 ^ noty))) >> 1;
        }
        hodd = (~v0 & (v1 ^ x)) | (v0 & (v1 ^ noty));
        return this.#interleaveBits(hodd, heven);
    }
}
*/
