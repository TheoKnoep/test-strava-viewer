# NOTES

Les différents fichiers d'entrée : (récupérables à partir d'une activité Strava) 

- .FIT

- .TCX

- .GPX

## GPX

Collection de points avec coodonnées lat / lon + timestamp : 

```xml
<trkpt lat="48.8159660" lon="2.5045710">
    <ele>62.8</ele>
    <time>2023-02-18T07:22:43Z</time>
    <extensions>
        <gpxtpx:TrackPointExtension>
            <gpxtpx:atemp>31</gpxtpx:atemp>
            <gpxtpx:hr>142</gpxtpx:hr>
            <gpxtpx:cad>0</gpxtpx:cad>
        </gpxtpx:TrackPointExtension>
    </extensions>
</trkpt>
```

Par contre, apparemment, avec le fichier GPX natif de Strava, on n'a pas les timestamps horaires pour les activités des autres comptes. 

## TCX

Format enrichi de Strava 

Features : 

- parser le contenu du fichier donné
  
  - readfile / DOMparser / convert en JSON ? 

- afficher un parcours sur une carte
  
  - afficher chaque point et un segment entre chaque

- ajouter un graphique / slider pour faire glisser une icone voyante pour faire correspondre un horaire à une position sur l'itinéraire 

-----

Problématique des dates : 

le principal enjeu de comparaison entre 2 fichiers TCX est d'avoir des horaires cohérents malgré les différentes timezones 

| Fichier                   | <Time> du fichier        | horaire réel | converti en |
| ------------------------- | ------------------------ | ------------ | ----------- |
| premiere.tcx              | 2023-02-18T08:32:58.000Z | 8h32         | 9h32 : +1h  |
| CC_02_23_Paris_Melun_.tcx | 2023-02-18T07:22:32Z     | 8h22         | 8:22 : ok   |
