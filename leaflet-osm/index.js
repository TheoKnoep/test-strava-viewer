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

let pathfile = '../CC_02_23_Paris_Melun_.gpx'; 

displayPointsOnMap(pathfile);
displayPointsOnMap('../_CC02.gpx', 'green'); 

async function displayPointsOnMap(pathfile, color = 'red') {
    let data = await parseGPX(pathfile);
    // tracer les points : 
    // data.forEach(point => {
    //     L.marker([point.lat, point.lon]).addTo(map); 
    // })
    data.forEach(point => {
        L.circle([point.lat, point.lon], {
            color: color, 
            fillColor: color, 
            fillOpacity: .5,
            radius: 10, 
            title: point.time
        }).addTo(map); 
    }
    )
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
            // console.log(course_points); 
            return course_points; 
        }); 
}


async function parseTCX(pathtofile) {

}
