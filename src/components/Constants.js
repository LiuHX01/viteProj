const FILE_COUNT = 90;
const FRAME_LENGTH = 2000;

const colors = [
    "#ff1c12",
    "#de5991",
    "#759AA0",
    "#E69D87",
    "#be3259",
    "#EA7E53",
    "#EEDD78",
    "#9359b1",
    "#47c0d4",
    "#F49F42",
    "#AA312C",
    "#B35E45",
    "#4B8E6F",
    "#ff8603",
    "#ffde1d",
    "#1e9d95",
    "#7289AB",
];

const tileLayerSources = {
    stadiaMaps: {
        light: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
        dark: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
        voyager: "https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png",
    },
    baseMaps: {
        light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        voyager: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    },
};

export { FILE_COUNT, FRAME_LENGTH, colors, tileLayerSources };
