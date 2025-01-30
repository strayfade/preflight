const BuildMap = async () => {
    return `
    <!DOCTYPE html>
    <body>
        <style>
            #map {
                position: absolute;
                width: 150%;
                height: 100%;
                background-color: black;
            }
        </style>
        <link rel="stylesheet" href="/utils/leaflet.css" />
        <script src="/utils/leaflet.js"></script>
        <div id="map" style="margin-left: -25%;"></div>
        <script src="https://cdn.jsdelivr.net/npm/heatmapjs@2.0.2/heatmap.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/leaflet-heatmap@1.0.0/leaflet-heatmap.js"></script>
        <script>
            sales = ${await (async () => {
            const fs = require('fs').promises

            ips = (await fs.readFile("../ips")).toString()
            lines = ips.split("\n")
            let newips = "["
            for (line of lines) {
                secs = line.split("\t")
                if (secs[4]) {
                    newips += `{"lat":${secs[4].split(",")[0]},"lng":${secs[4].split(",")[1]},"value":1},`
                }
            }
            newips += "]"
            return newips
        })()}

            let baseLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a>'
            })
            let cfg = {
                "radius": 25,
                "useLocalExtrema": false,
                valueField: 'value'
            };
            let heatmapLayer = new HeatmapOverlay(cfg);
            let min = Math.min(...sales.map(sale => sale.value))
            let max = Math.max(...sales.map(sale => sale.value))
            let propertyHeatMap = new L.Map('map', {
                center: new L.LatLng(30, 0),
                zoom: 3,
                layers: [baseLayer, heatmapLayer]
            })
            heatmapLayer.setData({
                min: min,
                max: max,
                data: sales
            });
        </script>
    </body`
}

module.exports = { BuildMap }