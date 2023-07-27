
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
    const posIndex = posJson.dataset.dimension.Tuloalue.category.index;
    const negIndex = negJson.dataset.dimension.Lähtöalue.category.index;

    for (let i in dataJson.features) {
      let kunta = dataJson.features[i].properties.kunta;
    
      let posValue = posJson.dataset.value[posIndex["KU" + kunta]];
      let negValue = negJson.dataset.value[negIndex["KU" + kunta]];

      dataJson.features[i].properties.positive = posValue;
      dataJson.features[i].properties.negative = negValue;

      let hue = (posValue / negValue)**3 * 60
      if (hue > 120) {
        hue = 120;
      }

      dataJson.features[i].properties.hue = hue;
    }

    initMap(dataJson);


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
    onEachFeature: getFeature,
    style: addHue
  }).addTo(map);

  let osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  map.fitBounds(geoJSON.getBounds());
};

const getFeature = (feature, layer) => {
    if(!feature.id) return;
    
    layer.bindPopup(
      `<ul>
            <li>Name: ${feature.properties.name}</li>
            <li>Positive: ${feature.properties.positive}</li>
            <li>Negative: ${feature.properties.negative}</li>
        </ul>`
    )

    layer.bindTooltip(feature.properties.name)

}

const addHue = (feature) => {
  return {
    color: `hsl(${feature.properties.hue}, 75%, 50%)`
  };
}

fetchData();
