export class Draw {
    constructor(da, min, max, decs, featureID) {
        this.da = da;
        this.min = min;
        this.max = max;
        this.decs = decs;
        this.featureID = featureID;
        this.colors = [
            "#313695",
            "#4575B4",
            "#74ADD1",
            "#ABD9E9",
            "#E0F3F8",
            "#FEE090",
            "#FDAE61",
            "#F46D43",
            "#D73027",
            "#A50026",
        ];
        this.bqcm = new BinnedPercentileColorMapper(this.decs, this.min, this.max, this.colors);
    }

    getColor(value) {
        // console.log(value);
        return this.bqcm.getColorByValue(value);
    }
}

class BinnedPercentileColorMapper {
    constructor(percentiles, min, max, colors) {
        this.percentiles = percentiles;
        this.min = min;
        this.max = max;
        this.colors = colors;
    }

    getColorByValue(value) {
        return this.colors[this.searchBin(value)];
    }

    searchBin(value) {
        if (value <= this.percentiles[0]) {
            return 0;
        }
        if (value > this.percentiles[this.percentiles.length - 1]) {
            return this.percentiles.length;
        }

        for (let i = 0; i < this.percentiles.length; i++) {
            if (value > this.percentiles[i] && value <= this.percentiles[i + 1]) {
                return i + 1;
            }
        }
        return -1;
    }
}

/*
[Log] 2 (M-Draw.js, line 37)
[Log] 1 (M-Draw.js, line 37)
[Log] 2 (M-Draw.js, line 37, x2)
2
[Log] 1 (M-Draw.js, line 37)
[Log] 2 (M-Draw.js, line 37)
[Log] 0 (M-Draw.js, line 37)

[Log] 2 (M-Draw.js, line 37)
[Log] 3 (M-Draw.js, line 37)
[Log] 0 (M-Draw.js, line 37)

[Log] 5 (M-Draw.js, line 37)
[Log] 2 (M-Draw.js, line 37)
[Log] 0 (M-Draw.js, line 37)
[Log] 6 (M-Draw.js, line 37, x2)
[Log] 7 (M-Draw.js, line 37)
[Log] 2 (M-Draw.js, line 37)
[Log] 0 (M-Draw.js, line 37)
[Log] 2 (M-Draw.js, line 37)
[Log] 1 (M-Draw.js, line 37)
[Log] 6 (M-Draw.js, line 37)
[Log] 0 (M-Draw.js, line 37)
[Log] 1 (M-Draw.js, line 37, x3)
[Log] 2 (M-Draw.js, line 37)
[Log] 0 (M-Draw.js, line 37, x3)
[Log] 1 (M-Draw.js, line 37)
[Log] 2 (M-Draw.js, line 37)
[Log] 0 (M-Draw.js, line 37, x3)
[Log] 1 (M-Draw.js, line 37, x3)
[Log] 0 (M-Draw.js, line 37)
[Log] 3 (M-Draw.js, line 37)
[Log] 0 (M-Draw.js, line 37, x2)
[Log] 1 (M-Draw.js, line 37)
[Log] 5 (M-Draw.js, line 37)
[Log] 0 (M-Draw.js, line 37)
[Log] 2 (M-Draw.js, line 37)
[Log] 1 (M-Draw.js, line 37)
[Log] 2 (M-Draw.js, line 37)
[Log] 1 (M-Draw.js, line 37)
[Log] 3 (M-Draw.js, line 37)
[Log] 1 (M-Draw.js, line 37)
[Log] 0 (M-Draw.js, line 37)
[Log] 1 (M-Draw.js, line 37, x2)
[Log] 0 (M-Draw.js, line 37, x2)
[Log] 1 (M-Draw.js, line 37)
[Log] 3 (M-Draw.js, line 37)
[Log] 1 (M-Draw.js, line 37)
[Log] 3 (M-Draw.js, line 37)
[Log] 4 (M-Draw.js, line 37)
[Log] 0 (M-Draw.js, line 37)
[Log] 8 (M-Draw.js, line 37)
[Log] 2 (M-Draw.js, line 37, x2)
[Log] 0 (M-Draw.js, line 37)
[Log] 3 (M-Draw.js, line 37)
[Log] 1 (M-Draw.js, line 37)
[Log] 7 (M-Draw.js, line 37)
[Log] 6 (M-Draw.js, line 37)
[Log] 5 (M-Draw.js, line 37)
[Log] 1 (M-Draw.js, line 37)
[Log] 3 (M-Draw.js, line 37)
[Log] 2 (M-Draw.js, line 37)
[Log] 1 (M-Draw.js, line 37, x2)
[Log] 0 (M-Draw.js, line 37)
[Log] 1 (M-Draw.js, line 37)
[Log] 2 (M-Draw.js, line 37)
[Log] 4 (M-Draw.js, line 37)
[Log] 3 (M-Draw.js, line 37)
[Log] 0 (M-Draw.js, line 37)
[Log] 5 (M-Draw.js, line 37)
[Log] 1 (M-Draw.js, line 37)
[Log] 0 (M-Draw.js, line 37)
[Log] 1 (M-Draw.js, line 37)
[Log] 0 (M-Draw.js, line 37)
[Log] 2 (M-Draw.js, line 37)
[Log] 0 (M-Draw.js, line 37, x2)
[Log] 2 (M-Draw.js, line 37, x2)
[Log] 0 (M-Draw.js, line 37)
[Log] 1 (M-Draw.js, line 37)
[Log] 0 (M-Draw.js, line 37, x4)
[Log] 7 (M-Draw.js, line 37)
[Log] 5 (M-Draw.js, line 37)
[Log] 0 (M-Draw.js, line 37, x2)
[Log] 5 (M-Draw.js, line 37)
[Log] 1 (M-Draw.js, line 37)
[Log] 0 (M-Draw.js, line 37, x6)
[Log] 4 (M-Draw.js, line 37)
[Log] 5 (M-Draw.js, line 37)
[Log] 7 (M-Draw.js, line 37)
[Log] 5 (M-Draw.js, line 37)
[Log] 6 (M-Draw.js, line 37)
[Log] 5 (M-Draw.js, line 37, x2)
[Log] 4 (M-Draw.js, line 37)
[Log] 5 (M-Draw.js, line 37)
[Log] 3 (M-Draw.js, line 37)
[Log] 0 (M-Draw.js, line 37)
[Log] 2 (M-Draw.js, line 37)
[Log] 3 (M-Draw.js, line 37)
[Log] 6 (M-Draw.js, line 37)
[Log] 1 (M-Draw.js, line 37)
[Log] 0 (M-Draw.js, line 37)
[Log] 3 (M-Draw.js, line 37, x2)
[Log] 2 (M-Draw.js, line 37)
[Log] 0 (M-Draw.js, line 37)
[Log] 2 (M-Draw.js, line 37)
[Log] 5 (M-Draw.js, line 37)
[Log] 2 (M-Draw.js, line 37)
[Log] 1 (M-Draw.js, line 37)
[Log] 0 (M-Draw.js, line 37)
[Log] 2 (M-Draw.js, line 37)
[Log] 0 (M-Draw.js, line 37, x2)
[Log] 5 (M-Draw.js, line 37)
[Log] 0 (M-Draw.js, line 37)
[Log] 8 (M-Draw.js, line 37)
[Log] 0 (M-Draw.js, line 37)
[Log] 1 (M-Draw.js, line 37, x3)
[Log] 3 (M-Draw.js, line 37)
[Log] 0 (M-Draw.js, line 37)
[Log] 2 (M-Draw.js, line 37)
[Log] 7 (M-Draw.js, line 37)
[Log] 0 (M-Draw.js, line 37)
[Log] 7 (M-Draw.js, line 37)
[Log] 1 (M-Draw.js, line 37)
*/
