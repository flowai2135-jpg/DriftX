DRIFT X - 3D models folder
==========================
Put .glb files here (sub-folders are fine) and start the game with:  node server.js
The game scans this folder and swaps its built-in shapes for your models. Names decide what a file is used for:

  car      sedan, suv, taxi, police, sports, race, truck, van, car, ferrari ...   (first car = your car, others = rival / other players)
  tree     tree, palm, pine, oak ...                                            (street trees, parks, plots)
  lamp     streetlamp, streetlight, lamp ...                                    (street lights)
  tower    skyscraper, tower, highrise ...                                      (tall buildings)
  shop     building, shop, store, office, apartment, commercial ...             (mid-rise buildings)
  house    house, villa, cottage, suburban ...                                  (houses)
  industrial  industrial, factory, warehouse ...

Free packs that work well (CC0 / free):  kenney.nl (City Kit Commercial, City Kit Suburban, Nature Kit, Car Kit),
quaternius.com, poly.pizza.  Sketchfab: download "glTF" / .glb (check each model's licence and give credit if required).
Copy the WHOLE folder of a pack (the Textures sub-folder must stay next to the .glb files).
Cars: wheels are found by node names containing "wheel" (front/back or fl/fr/rl/rr) and spin + steer automatically.
Up to 4 models per category are loaded. Settings -> shows what was found.
If a car points the wrong way, add  <script>window.DRIFTX_CAR_YAW = 3.14159;</script>  before the game script.
