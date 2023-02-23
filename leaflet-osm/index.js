// Initialiser l'affichage de la carte : 
let mapOptions = {
    center: [data[0].lat,data[0].lon], 
    zoom: 12
}; 

let map = L.map('the-map', mapOptions); 


// On peut choisir parmi de nombreux fonds de carte avec : http://leaflet-extras.github.io/leaflet-providers/preview/ 
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);




  // Créer un nouveau marker : 
//   let marker1 = L.marker([48.8550843,2.3468002835410653]).addTo(map); 





  

  // Réagir aux événements sur la carte : 
//   map.on("click", function(e) {
//       new L.marker([e.latlng.lat, e.latlng.lng]).addTo(map); 
//   }); 



/* **********************************************************
 * PARSE XML CONTENT : 
 */

let perso = '../CC_02_23_Paris_Melun_.gpx'; 
const listOfColors = [
    "red", "green", "blue", "teal", "crimson", "darkblue", "darkmagenta", "olive", "rebeccapurple", "lightslategray"
]; 



displayPointsOnMap(perso)
.then(() => {
    displayPointsOnMap('../premiere.tcx'); 
})



async function displayPointsOnMap(pathfile) {
    let data = []; 

    let input = pathfile.split('.')[pathfile.split('.').length-1]; 

    //select Color: 
    let rand = Math.floor(Math.random()*listOfColors.length); 
    color = listOfColors[rand]; 
    listOfColors.splice(rand,1); 

    console.log(color); 

    // Get data
    if (input === 'gpx') {
        data = await parseGPX(pathfile);
    } else if(input === 'tcx') {
        data = await parseTCX(pathfile); 
    }

    // Paint points : 
    data.forEach(point => {
        L.circle([point.lat, point.lon], {
            color: color, 
            fillColor: color, 
            fillOpacity: .1,
            radius: 4
        }).addTo(map); 
    }); 

    // Set time slider : 
    let ts_start = new Date(data[0].time).getTime(); 
    let ts_finish = new Date(data[data.length-1].time).getTime(); 


    // SET MIN
    console.log('slider min', document.querySelector('#time').getAttribute('min')); 
    if (document.querySelector('#time').getAttribute('min') === null) {
        document.querySelector('#time').setAttribute('min', ts_start); 
        document.querySelector('#display-time').textContent = new Date(ts_start*1).toLocaleTimeString(); 
    } else {
        let min_ts = Math.min(ts_start, document.querySelector('#time').getAttribute('min')*1); 
        document.querySelector('#time').setAttribute('min', min_ts); 
        document.querySelector('#display-time').textContent = new Date(min_ts*1).toLocaleTimeString(); 
    }
    
    // SET MAX 
    if (document.querySelector('#time').getAttribute('max') === null) {
        document.querySelector('#time').setAttribute('max', ts_finish); 
    } else {
        let max_ts = Math.max(ts_finish, document.querySelector('#time').getAttribute('max')*1); 
        document.querySelector('#time').setAttribute('max', max_ts); 
    }

    let markers = new Array(); 

    document.querySelector('#time').addEventListener('input', event => {
        let required_ts = event.target.value*1; 
        document.querySelector('#display-time').textContent = new Date(required_ts).toLocaleTimeString(); 

        // dislay marker 
        let positions_of_marker = getPositionForTimeStamp(required_ts, data); 

        if (markers.length === 0) {
            let tracker = new L.marker([positions_of_marker.lat,positions_of_marker.lon]); 
            markers.push(tracker)
            tracker.addTo(map).bindPopup(pathfile.split('/')[pathfile.split('/').length-1]).openPopup(); 
        } else {
            markers[0].setLatLng([positions_of_marker.lat,positions_of_marker.lon]); 
        }
    }); 
}



async function parseGPX(pathfile) {
    let parser = new DOMParser(); 
    let course_points = []; 
    return fetch(pathfile)
        .then(res => res.text())
        .then(text => {
            xmlDoc = parser.parseFromString(text, "text/xml"); 
            let collection = xmlDoc.querySelectorAll('trkpt'); 
            collection.forEach(point => {
                if (!point.querySelector('time')) { throw new Error("Pas d'information d'horaire pour cet itinéraire")}; 
                course_points.push({
                    time: point.querySelector('time').textContent, 
                    lat: point.getAttribute('lat'), 
                    lon: point.getAttribute('lon')
                }); 
            }); 
            return course_points; 
        }); 
}


function getPositionForTimeStamp(timestamp, collection_of_points) {
    let out = ''; 
    for (let i = 0; i < collection_of_points.length; i++) {
        if (new Date(collection_of_points[i].time).getTime() - new Date(timestamp).getTime() > 0) {
            out = collection_of_points[i]; 
            break; 
        }
    }
    return out;
}


function displayMarker(lat, lon) {

}


parseTCX('../CC02.tcx'); 

async function parseTCX(path) {
    let parser = new DOMParser(); 
    let course_points = []; 
    return fetch(path)
        .then(res => res.text())
        .then(text => {
            xmlDoc = parser.parseFromString(text, "text/xml"); 
            let collection = xmlDoc.querySelectorAll('Trackpoint'); 
            collection.forEach(point => {
                course_points.push({
                    time: point.querySelector('Time').textContent, 
                    lat: point.querySelector('Position LatitudeDegrees').textContent, 
                    lon: point.querySelector('Position LongitudeDegrees').textContent
                }); 
            }); 
            return course_points; 
        }); 
}
