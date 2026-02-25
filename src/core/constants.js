export const defaultMyMapsUrl =
  "https://www.google.com/maps/d/u/0/viewer?mid=1fMXnq7tJ3ToCsxz8NBltdYgiO5ldsyg&ll=-31.420478598270606%2C-64.18262452047118&z=13";

export const styleUrls = {
  bright: "https://tiles.openfreemap.org/styles/bright",
  positron: "https://tiles.openfreemap.org/styles/positron",
  liberty: "https://tiles.openfreemap.org/styles/liberty",
  dark: "https://tiles.openfreemap.org/styles/dark"
};

export const ratioMap = {
  fill: null,
  "1:1": 1,
  "4:5": 4 / 5,
  "3:4": 3 / 4,
  "16:9": 16 / 9,
  "9:16": 9 / 16
};

export const defaultCamera = {
  center: [-64.18262, -31.42048],
  zoom: 13,
  pitch: 0,
  bearing: 0
};

export const presets = {
  editorial: {
    basemapSelect: "positron",
    bgColor: "#f4efe7",
    waterColor: "#b8d3e4",
    parkColor: "#dce7ce",
    roadMajorColor: "#efb174",
    roadMinorColor: "#ffffff",
    buildingColor: "#e8ded1",
    mapContrast: 106,
    mapSaturation: 92,
    showPoiLabels: false,
    showWaterLabels: true,
    markerColor: "#d14f2b",
    markerStroke: "#fff3e5",
    haloColor: "#d14f2b",
    haloOpacity: 26,
    tintOpacity: 0,
    vignetteOpacity: 10,
    grainOpacity: 0
  },
  mono: {
    basemapSelect: "bright",
    bgColor: "#f6f6f4",
    waterColor: "#cfcfcf",
    parkColor: "#e0e0e0",
    landuseColor: "#ececec",
    roadMajorColor: "#c2c2c2",
    roadMinorColor: "#fefefe",
    buildingColor: "#d7d7d7",
    boundaryColor: "#9b9b9b",
    mapSaturation: 0,
    mapContrast: 120,
    showPoiLabels: false,
    showWaterLabels: false,
    baseLabelColor: "#2f2f2f",
    markerColor: "#121212",
    markerStroke: "#ffffff",
    haloColor: "#000000",
    haloOpacity: 16,
    tintOpacity: 0,
    grainOpacity: 8
  },
  night: {
    basemapSelect: "dark",
    bgColor: "#141922",
    waterColor: "#355f95",
    parkColor: "#233a2f",
    landuseColor: "#1e2430",
    roadMajorColor: "#6ea7ff",
    roadMinorColor: "#4a576d",
    buildingColor: "#2d3340",
    boundaryColor: "#7f8ba5",
    baseLabelColor: "#dce5ff",
    baseLabelHaloColor: "#131720",
    mapBrightness: 95,
    mapContrast: 122,
    mapSaturation: 115,
    showPoiLabels: false,
    markerColor: "#ffd166",
    markerStroke: "#1b2233",
    haloColor: "#ffd166",
    haloOpacity: 34,
    labelColor: "#fff4ce",
    tintColor: "#0f2442",
    tintOpacity: 16,
    vignetteOpacity: 22
  },
  park: {
    basemapSelect: "liberty",
    parkColor: "#b8e58a",
    parkOpacity: 90,
    waterColor: "#7fc9f6",
    roadMajorColor: "#ffc76b",
    roadMinorColor: "#ffefce",
    showPoiLabels: true,
    markerColor: "#ff5a36",
    haloColor: "#ff5a36",
    haloOpacity: 32,
    tintColor: "#f6e6a8",
    tintOpacity: 8,
    vignetteOpacity: 8
  },
  warm: {
    basemapSelect: "positron",
    bgColor: "#f5eadc",
    waterColor: "#b9cfda",
    parkColor: "#d8ddb8",
    roadMajorColor: "#d79c5b",
    roadMinorColor: "#fff8ec",
    buildingColor: "#e4d3bf",
    baseLabelColor: "#52453b",
    mapBrightness: 108,
    mapSaturation: 86,
    mapHue: 8,
    markerColor: "#8f3b2d",
    markerStroke: "#f5e8d6",
    haloColor: "#8f3b2d",
    haloOpacity: 24,
    tintColor: "#f2c993",
    tintOpacity: 13,
    grainOpacity: 10
  }
};
