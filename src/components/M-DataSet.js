import { HilbertCurveStrategy } from "./M-Strategy.js";

export class DataSet {
    constructor(data) {
        this.data = data;
        this.features = Object.keys(data[0]);
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
            if (
                feature === "acceleration" ||
                feature === "distance_centroid" ||
                feature === "heading_change" ||
                feature === "speed"
            ) {
                // 计算每个feature的最大值和最小值
                const sortedFeatureValue = this.data.sort((a, b) => a[feature] - b[feature]);
                this.featureMins[feature] = sortedFeatureValue[0][feature];
                this.featureMaxs[feature] = sortedFeatureValue[sortedFeatureValue.length - 1][feature];

                // 计算每个feature的百分位数
                for (let i = 1; i < 10; i++) {
                    if (!this.deciles[feature]) this.deciles[feature] = [];
                    this.deciles[feature].push(this.#getPercentile(feature, sortedFeatureValue, i * 10));
                }
            }
        });
    }
    // 返回2D array，每个array是一个frame的数据
    #getBaseData(data) {
        const result = new Array(this.#numberOfUniqueKeys(data, "frame"));
        for (let i = 0; i < result.length; i++) {
            result[i] = [];
        }
        data.sort((a, b) => {
            return a.id - b.id;
        });
        data.forEach((item) => {
            result[item.frame].push({
                x: item.x,
                y: item.y,
                value: {
                    acceleration: item.acceleration,
                    distance_centroid: item.distance_centroid,
                    heading_change: item.heading_change,
                    speed: item.speed,
                },
                id: item.id,
            });
        });
        return result;
    }

    // TODO: 并不准确
    // 计算百分位数上的值
    #getPercentile(feature, sorted, percentile) {
        const index = (sorted.length * percentile) / 100;
        if (Math.round(index) === index) {
            if (index === 0) return sorted[0];
            return sorted[index - 1][feature];
        }
        return sorted[Math.round(index)][feature];
    }

    // 计算obj array中某个key的不重复数量
    #numberOfUniqueKeys(data, key) {
        const keys = new Set();
        data.forEach((item) => {
            keys.add(item[key]);
        });
        return keys.size;
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

    getFeatures() {
        return this.features;
    }

    getBaseData() {
        return this.baseData;
    }
}
