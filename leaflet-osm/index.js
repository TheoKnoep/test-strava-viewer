let to_display = [
    {
        path: '../tracks/aigoual-nat.tcx', 
        modifier: 3600*1000*2, 
        display: false
    }, 
    {
        path: '../tracks/sens-to.tcx', 
        modifier: 0, 
        display: false
    }, 
    {
        path: '../tracks/sens-arielle.tcx', 
        modifier: 3600*1000*2, 
        display: false
    }, 
    {
        path: '../tracks/vosges-to.tcx', 
        modifier: 0, 
        display: false
    }, 
    {
        path: '../tracks/vosges-tibo.tcx', 
        modifier: 3600000*2, 
        display: false
    }, 
    {
        path: "../tracks/Sortie_poly_d'hiver.tcx", 
        modifier: 0, 
        display: true
    }, 
    {
        path: "../tracks/poly-ar.tcx", 
        modifier: 3600000, 
        display: true
    }
]; 




// config
let listOfColors = [
    "red", "green", "blue", "teal", "crimson", "darkblue", "darkmagenta", "olive", "rebeccapurple", "lightslategray"
]; 

// shuffle : 
listOfColors = listOfColors.sort((a,b) => 0.5 - Math.random()); 

console.log(listOfColors); 


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





/* **********************************************************
 * PARSE XML CONTENT : 
 */


to_display.forEach((item, index) => {
    if (item.display) {
        displayPointsOnMap(item.path, { color: listOfColors[index], time_modifier: item.modifier}); 
    }
})


// displayPointsOnMap('../CC_02_23_Paris_Melun_.tcx')
//     .then(() => { 
//         // displayPointsOnMap('../CC02.tcx', { time_modifier: 1000*60*60, color: listOfColors[1]})
//     });  



async function displayPointsOnMap(pathfile, options = null) {
    let data = []; 
    let input = pathfile.split('.')[pathfile.split('.').length-1]; 


    let time_modifier = 0; 
    if (options && options.time_modifier) { time_modifier = options.time_modifier }

    //select Color: 
    let color = listOfColors[0]; 
    if (options && options.color) { color = options.color }

    console.log(color); 

    // Get data
    if (input === 'gpx') {
        data = await parseGPX(pathfile);
    } else if(input === 'tcx') {
        data = await parseTCX(pathfile); 
    }

    map.panTo([data[0].lat, data[0].lon]); 

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
    let ts_start = new Date(data[0].time).getTime() - time_modifier; 
    let ts_finish = new Date(data[data.length-1].time).getTime() - time_modifier; 


    // SET MIN
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
        let positions_of_marker = getPositionForTimeStamp(required_ts+time_modifier, data); 

        // console.log(1, positions_of_marker); 
        // console.log(2, markers); 

        if (markers.length === 0) {
            let customIcon = L.icon({
                iconUrl: `markers/${color}.png`, 
                iconSize: [25,41], 
                iconAnchor: [12,41], 
                popupAnchor: [0,-42], 
                shadowUrl: 'markers/shadow.png', 
                shadowSize: [25,10]
            })
            let tracker = new L.marker([positions_of_marker.lat,positions_of_marker.lon], {
                icon: customIcon
            }); 
            markers.push(tracker); 
            tracker.addTo(map).bindPopup(pathfile.split('/')[pathfile.split('/').length-1]); 
        } else {
            markers[0].setLatLng([positions_of_marker.lat,positions_of_marker.lon]); 
        }
    }); 
}


function moveSlider(ms) {
    document.querySelector("#time").value = document.querySelector("#time").value*1 + ms;
    let forceInput = new Event('input'); 
    document.querySelector("#time").dispatchEvent(forceInput); 
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
