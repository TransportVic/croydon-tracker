const trips = await (await fetch("./trips.json")).json()

const ATTRIBUTION = '<a id="home-link" target="_top" href="maps.stamen.com">Map tiles</a> by <a target="_top" href="http://stamen.com">Stamen Design</a>, under <a target="_top" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a target="_top" href="http://openstreetmap.org">OpenStreetMap</a>, under <a target="_top" href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
let accessToken = 'pk.eyJ1IjoidW5pa2l0dHkiLCJhIjoiY2p6bnVvYWJ4MDdlNjNlbWsxMzJwcjh4OSJ9.qhftGWgQBDdGlaz3jVGvUQ'

let map = L.map('map').setView([-37.86425260201223, 145.29442334943], 12)


L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map)


// L.tileLayer('https://vtiles.openhistoricalmap.org/maps/osm/{z}/{x}/{y}.pbf', {
// // L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
//   attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
//   maxZoom: 20,
//   id: 'mapbox/dark-v10',
//   tileSize: 512,
//   zoomOffset: -1,
//   // accessToken
// }).addTo(map)

L.control.scale().addTo(map)

let markers = []

let baseIconHTML = `
<div class='train'>
  <div class='trainArrowWrapper' style='transform: rotate({0}deg)'>
    <div class='trainArrow'></div>
  </div>
  <div class='trainData'>
  {1}
  </div>
</div>`

function createIcon(train, i) {
  return L.divIcon({
    html: baseIconHTML.replace('{0}', train.bearing)
    .replace('{1}', i)
  })
}

function createMarker(train, i) {
  let icon = createIcon(train, i)
  let marker = L.marker([ train.lat, train.lon ], {
    icon
  }).addTo(map)
  markers.push(marker)
}

async function genTrip(date, name) {
  let data = await (await fetch(`./logs/${date}/${name}`)).json()
  let startTime = new Date(data.departureTime)
  let relevantPositions = data.positions.filter(pos => {
    let posTime = new Date(pos.ts)
    return startTime - posTime < 1000 * 60 * 2
  })

  markers.forEach(m => m.remove())
  markers = []

  for (let index in relevantPositions) {
    createMarker(relevantPositions[index], index)
  }
}

function dateChange() {
  let date = document.getElementById('date').value
  document.getElementById('trip').innerHTML = trips[date].map(trip => `<option>${trip}</option>`)

  tripChange()
}

function tripChange() {
  let date = document.getElementById('date').value
  let trip = document.getElementById('trip').value

  genTrip(date, trip)
}

document.getElementById('date').innerHTML = Object.keys(trips).map(date => `<option>${date}</option>`)
document.getElementById('date').addEventListener('change', dateChange)
document.getElementById('trip').addEventListener('change', tripChange)

dateChange()
