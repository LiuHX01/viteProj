onmessage = (msg) => {
    const msgData = msg.data;
    if (msgData.type == "load") {
        let finished = [];
        const cnt = msgData.info;
        for (let i = 1; i <= cnt; i++) {
            fetch(`https://raw.githubusercontent.com/LiuHX01/DataSets/main/spd${i}.csv`)
                .then((response) => {
                    return response.text();
                })
                .then((data) => {
                    postMessage({
                        data: data,
                        type: "load",
                        info: i,
                    });
                    finished.push(i);
                    console.log(`fetch ${i}, ${finished.length} finished`);
                });
        }
    } else if ((msgData.type = "setPixel")) {
        const currFeature = msgData.info;
        const dataSet = new MotionRugsDataSet(msgData.data);
        let ordered = dataSet.getOrderedData("Hilbert");
        const draw = new Draw(
            ordered,
            dataSet.getFeatureMins(currFeature),
            dataSet.getFeatureMaxs(currFeature),
            dataSet.getDeciles(currFeature),
            currFeature
        );

        let img = new ImageData(ordered.length, ordered[0].length);

        for (let i = 0; i < ordered.length; i++) {
            for (let j = 0; j < ordered[i].length; j++) {
                const clr = hexColorToRGB(draw.getColor(ordered[i][j]["value"][currFeature]));
                const idx = 4 * (i + j * ordered.length);
                img.data[idx] = clr.r;
                img.data[idx + 1] = clr.g;
                img.data[idx + 2] = clr.b;
                img.data[idx + 3] = 255;
            }
        }

        postMessage({
            data: { img: img, width: ordered.length, height: ordered[0].length },
            type: "setPixel",
            info: null,
        });
    }
};

const hexColorToRGB = (hex) => {
    let ret = {
        r: 0,
        g: 0,
        b: 0,
    };
    if (hex.length == 7) {
        ret.r = parseInt(hex.substring(1, 3), 16);
        ret.g = parseInt(hex.substring(3, 5), 16);
        ret.b = parseInt(hex.substring(5, 7), 16);
    }
    return ret;
};

const HilbertCurveStrategy = (unsorted) => {
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

class MotionRugsDataSet {
    constructor(data) {
        this.data = data;
        this.features = Object.keys(data[0][0]);
        this.baseData = null;
        this.deciles = {};
        this.orderedDataSet = null;
        this.featureMins = {};
        this.featureMaxs = {};
        this.#init();
    }

    #init() {
        this.baseData = this.#getBaseData(this.data);
        this.features.forEach((feature) => {
            if (feature === "speed") {
                console.time("sort");

                const sortedFeatureValue = this.data
                    .reduce((a, b) => {
                        return a.concat(b);
                    })
                    .sort((a, b) => a[feature] - b[feature]);
                this.featureMins[feature] = sortedFeatureValue[0][feature];
                this.featureMaxs[feature] = sortedFeatureValue[sortedFeatureValue.length - 1][feature];

                // 计算每个feature的百分位数
                for (let i = 1; i < 10; i++) {
                    if (!this.deciles[feature]) this.deciles[feature] = [];
                    this.deciles[feature].push(parseFloat(this.#getPercentile(feature, sortedFeatureValue, i * 10)));
                }
                console.timeEnd("sort");
            }
        });
    }
    // 返回2D array，每个array是一个frame的数据
    #getBaseData(data) {
        let result = [];
        data.sort((a, b) => {
            return a.id - b.id;
        });
        data.forEach((item) => {
            item.forEach((subItem) => {
                if (!result[subItem.time]) result[subItem.time] = [];
                result[subItem.time].push({
                    latitude: subItem.latitude,
                    longitude: subItem.longitude,
                    value: {
                        speed: subItem.speed,
                    },
                    id: subItem.id,
                });
            });
        });
        return result;
    }

    // 计算百分位数上的值
    #getPercentile(feature, sorted, percentile) {
        const index = (sorted.length * percentile) / 100;
        if (Math.round(index) === index) {
            if (index === 0) return sorted[0];
            return sorted[index][feature];
        }
        return sorted[Math.round(index)][feature];
    }

    // 根据strategy返回一个新的orderedDataSet
    getOrderedData(strategyName) {
        if (strategyName === "Hilbert") {
            this.orderedDataSet = HilbertCurveStrategy(this.baseData);
            return this.orderedDataSet;
        }
    }

    getFeatureMins(feature) {
        return this.featureMins[feature];
    }

    getFeatureMaxs(feature) {
        return this.featureMaxs[feature];
    }

    getDeciles(feature) {
        return this.deciles[feature];
    }
}

class Draw {
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
