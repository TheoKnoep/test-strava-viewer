// Initialiser l'affichage de la carte : 
let mapOptions = {
    center: [48.8550843,2.3468002835410653], 
    zoom: 13
}; 

let map = L.map('the-map', mapOptions); 


// On peut choisir parmi de nombreux fonds de carte avec : http://leaflet-extras.github.io/leaflet-providers/preview/ 
let layer = new L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
	maxZoom: 20,
	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
});
  map.addLayer(layer);




  // Créer un nouveau marker : 
  let marker1 = L.marker([48.8550843,2.3468002835410653]).addTo(map); 
  marker1.bindPopup("Ici c'est Paris").openPopup(); 
  let marker2 = L.marker([48.879555100000005,2.3820982131570987]).addTo(map); 

  

  // Réagir aux événements sur la carte : 
  map.on("click", function(e) {
      new L.marker([e.latlng.lat, e.latlng.lng]).addTo(map); 
  }); 