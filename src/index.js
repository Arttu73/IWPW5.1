import { geoJSON } from "leaflet";
import "./styles.css";

const fetchData = async () => {
  try {
    const url =
      "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326 ";
    const dataResponse = await fetch(url);
    const dataJson = await dataResponse.json();

    const urlPos = "https://statfin.stat.fi/PxWeb/sq/4bb2c735-1dc3-4c5e-bde7-2165df85e65f";
    const urlNeg = "https://statfin.stat.fi/PxWeb/sq/944493ca-ea4d-4fd9-a75c-4975192f7b6e";
    const posRes = await fetch(urlPos);
    const posJson = await posRes.json();
    const negRes = await fetch(urlNeg);
    const negJson = await negRes.json();

    initMap(dataJson, posJson, negJson);


  } catch (error) {
    console.error("Error fetching or parsing data:", error);
  }
};

const initMap = (data) => {
  let map = L.map("map", {
    center: [51.505, -0.09],
    zoom: 13,
    minZoom: 3,
  });

  let geoJSON = L.geoJSON(data, {
    weight: 2,
    onEachFeature: getFeature
  }).addTo(map);

  let osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  map.fitBounds(geoJSON.getBounds());
};

const getFeature = async (feature, layer) => {
    if(!feature.id) return;
    
    layer.bindTooltip(feature.properties.name)

}

fetchData();
