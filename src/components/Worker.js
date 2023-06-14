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
        const strategyNames = ["Hilbert", "zOrder"];
        const currFeature = msgData.info;
        const dataSet = new MotionRugsDataSet(msgData.data);

        strategyNames.forEach((strategyName) => {
            let ordered = dataSet.getOrderedData(strategyName);
            const draw = new Draw(
                ordered,
                dataSet.getFeatureMins(currFeature),
                dataSet.getFeatureMaxs(currFeature),
                dataSet.getDeciles(currFeature),
                currFeature
            );
            let img = new ImageData(ordered.length, ordered[0].length);
            const ordered2 = dataSet.baseData;
            for (let i = 0; i < ordered.length; i++) {
                for (let j = 0; j < ordered[i].length; j++) {
                    let clr;
                    if (strategyName == "zOrder") {
                        clr = hexColorToRGB(draw.getColor(ordered[i][j]["value"][currFeature]));
                    } else {
                        clr = hexColorToRGB(draw.getColor(ordered[i][j]["value"][currFeature]));
                    }
                    const idx = 4 * (i + j * ordered.length);
                    img.data[idx] = clr.r;
                    img.data[idx + 1] = clr.g;
                    img.data[idx + 2] = clr.b;
                    img.data[idx + 3] = 255;
                }
            }

            // image data upside down in canvas
            let flipped = new ImageData(ordered.length, ordered[0].length);
            for (let i = 0; i < ordered.length; i++) {
                for (let j = 0; j < ordered[i].length; j++) {
                    const idx = 4 * (i + j * ordered.length);
                    const flippedIdx = 4 * (i + (ordered[i].length - j - 1) * ordered.length);
                    flipped.data[flippedIdx] = img.data[idx];
                    flipped.data[flippedIdx + 1] = img.data[idx + 1];
                    flipped.data[flippedIdx + 2] = img.data[idx + 2];
                    flipped.data[flippedIdx + 3] = img.data[idx + 3];
                }
            }

            postMessage({
                data: { img: flipped, width: ordered.length, height: ordered[0].length },
                type: "setPixel",
                info: strategyName,
            });
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
        // console.time("hilbert");
        for (let y = 0; y < unsorted[x].length; y++) {
            idx[y] = y;
            hilbertValues[y] = encode(Math.round(unsorted[x][y].latitude * 10000), Math.round(unsorted[x][y].longitude * 10000), 100);
        }
        // console.timeEnd("hilbert");

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

const pointQuadTreeStrategy = (unsorted) => {
    // TODO: implement
};

const rTreeStrategy = (unsorted) => {
    // TODO: implement
};

const zOrderCurveStrategy = (unsorted) => {
    const MortonTable256 = [
        0x0000, 0x0001, 0x0004, 0x0005, 0x0010, 0x0011, 0x0014, 0x0015, 0x0040, 0x0041, 0x0044, 0x0045, 0x0050, 0x0051, 0x0054, 0x0055, 0x0100,
        0x0101, 0x0104, 0x0105, 0x0110, 0x0111, 0x0114, 0x0115, 0x0140, 0x0141, 0x0144, 0x0145, 0x0150, 0x0151, 0x0154, 0x0155, 0x0400, 0x0401,
        0x0404, 0x0405, 0x0410, 0x0411, 0x0414, 0x0415, 0x0440, 0x0441, 0x0444, 0x0445, 0x0450, 0x0451, 0x0454, 0x0455, 0x0500, 0x0501, 0x0504,
        0x0505, 0x0510, 0x0511, 0x0514, 0x0515, 0x0540, 0x0541, 0x0544, 0x0545, 0x0550, 0x0551, 0x0554, 0x0555, 0x1000, 0x1001, 0x1004, 0x1005,
        0x1010, 0x1011, 0x1014, 0x1015, 0x1040, 0x1041, 0x1044, 0x1045, 0x1050, 0x1051, 0x1054, 0x1055, 0x1100, 0x1101, 0x1104, 0x1105, 0x1110,
        0x1111, 0x1114, 0x1115, 0x1140, 0x1141, 0x1144, 0x1145, 0x1150, 0x1151, 0x1154, 0x1155, 0x1400, 0x1401, 0x1404, 0x1405, 0x1410, 0x1411,
        0x1414, 0x1415, 0x1440, 0x1441, 0x1444, 0x1445, 0x1450, 0x1451, 0x1454, 0x1455, 0x1500, 0x1501, 0x1504, 0x1505, 0x1510, 0x1511, 0x1514,
        0x1515, 0x1540, 0x1541, 0x1544, 0x1545, 0x1550, 0x1551, 0x1554, 0x1555, 0x4000, 0x4001, 0x4004, 0x4005, 0x4010, 0x4011, 0x4014, 0x4015,
        0x4040, 0x4041, 0x4044, 0x4045, 0x4050, 0x4051, 0x4054, 0x4055, 0x4100, 0x4101, 0x4104, 0x4105, 0x4110, 0x4111, 0x4114, 0x4115, 0x4140,
        0x4141, 0x4144, 0x4145, 0x4150, 0x4151, 0x4154, 0x4155, 0x4400, 0x4401, 0x4404, 0x4405, 0x4410, 0x4411, 0x4414, 0x4415, 0x4440, 0x4441,
        0x4444, 0x4445, 0x4450, 0x4451, 0x4454, 0x4455, 0x4500, 0x4501, 0x4504, 0x4505, 0x4510, 0x4511, 0x4514, 0x4515, 0x4540, 0x4541, 0x4544,
        0x4545, 0x4550, 0x4551, 0x4554, 0x4555, 0x5000, 0x5001, 0x5004, 0x5005, 0x5010, 0x5011, 0x5014, 0x5015, 0x5040, 0x5041, 0x5044, 0x5045,
        0x5050, 0x5051, 0x5054, 0x5055, 0x5100, 0x5101, 0x5104, 0x5105, 0x5110, 0x5111, 0x5114, 0x5115, 0x5140, 0x5141, 0x5144, 0x5145, 0x5150,
        0x5151, 0x5154, 0x5155, 0x5400, 0x5401, 0x5404, 0x5405, 0x5410, 0x5411, 0x5414, 0x5415, 0x5440, 0x5441, 0x5444, 0x5445, 0x5450, 0x5451,
        0x5454, 0x5455, 0x5500, 0x5501, 0x5504, 0x5505, 0x5510, 0x5511, 0x5514, 0x5515, 0x5540, 0x5541, 0x5544, 0x5545, 0x5550, 0x5551, 0x5554,
        0x5555,
    ];

    const encode = (x, y) => {
        let res = 0;
        res = (MortonTable256[y >> 8] << 17) | (MortonTable256[x >> 8] << 16) | (MortonTable256[y & 0xff] << 1) | MortonTable256[x & 0xff];
        return res;
    };

    let result = new Array(unsorted.length);
    for (let x = 0; x < unsorted.length; x++) {
        result[x] = new Array(unsorted[x].length);
    }

    for (let x = 0; x < unsorted.length; x++) {
        let idx = new Array(unsorted[x].length);
        let zValues = new Array(unsorted[x].length);

        for (let y = 0; y < unsorted[x].length; y++) {
            idx[y] = y;
            zValues[y] = encode(Math.round(unsorted[x][y].latitude), Math.round(unsorted[x][y].longitude));
        }

        idx.sort((a, b) => zValues[a] - zValues[b]);

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
            console.time("Hilbert");
            console.log(this.baseData);
            this.orderedDataSet = HilbertCurveStrategy(this.baseData);
            console.log(this.orderedDataSet);
            console.timeEnd("Hilbert");
            return this.orderedDataSet;
        } else if (strategyName === "zOrder") {
            console.time("zOrder");
            this.orderedDataSet = zOrderCurveStrategy(this.baseData);
            console.timeEnd("zOrder");
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
        this.colors = ["#313695", "#4575B4", "#74ADD1", "#ABD9E9", "#E0F3F8", "#FEE090", "#FDAE61", "#F46D43", "#D73027", "#A50026"];
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
