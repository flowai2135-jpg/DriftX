V6.1 UPDATE
  - Stickers removed.
  - DRIFT now follows your turning: the throttle only breaks the rear tyres loose when you steer (or the car is already sliding). Driving straight stays planted, no random slip. Steer + gas (or handbrake) starts a drift whose angle depends on how hard you turn. Rain grip loss is milder (max 28%).

V6 UPDATE
  - NO CAR DAMAGE anywhere: no dents, no damage %, no smoke/fire, no engine weakening. Hitting a building / wall / car just bumps you off with real physics (sparks + dust + camera shake + sound). Old saved dents are ignored.
  - RACES: you now collide with the AI rivals on the Grand Prix circuit and with the rival in the drag race (solid bump, no damage, no score penalty).
  - ENGINE SOUND: rewritten. Quiet idle, soft fade-in when the game starts, loudness and pitch grow slowly with RPM. Each car has its own voice (Dodge deep V8 burble, Vintage rough/raspy, Ferrari high revving scream + turbo whistle).
  - SPEED FEEL: camera stays closer and lower at speed, FOV opens up to ~98, more speed lines + vignette from ~50 km/h, and world-fixed wind streaks rush past the car so the sides really look fast. Camera shake from ~100 km/h.
  - DAY / NIGHT: morning -> noon -> evening -> night (full day = 12 min, starts in the morning). Sky colours, sun, moon + stars, fog, window lights and street-lamp glow all follow the clock. Clock is shown at the top of the screen. Key T = jump to next time of day.
  - HEADLIGHTS: spot light + glow on your car, automatic at night / rain / overcast. Key L = AUTO / ON / OFF.
  - WEATHER (rare, random): first the sky clouds over, then it may start a LIGHT rain, and only sometimes turns HEAVY (with thunder). Sometimes the clouds just pass without rain. Rain = streaks, darker wet road, fog, rain sound. Key Y = force the next weather step (for testing).
  - RAIN GRIP (real physics): wet road lowers tyre grip (up to 40%), longer braking distance, and throttle breaks the rear loose much easier, so the car slides / oversteers. Road dries slowly after the rain stops.
  - (stickers were removed in V6.1)
  - COCKPIT VIEW: press C (or the CAM button) until you are inside the car: dash, live gauges (RPM + speed + gear), steering wheel with gloved hands that turns with your steering, wing mirrors, working rear-view mirror, your paint colour on the hood. Drag the mouse to look around.
  - Note: day time and weather are local to each player (not synced between players).

V5 UPDATE
  - CAR SPEEDS: every car has its own top speed and power. Dodge 170 km/h, Vintage 190 km/h, Ferrari 250 km/h (hard limit, the speedometer stops exactly there). Gears on the dial scale with the car. Rivals in races are a little slower when you drive a slower car.
  - ENGINE SOUND: no longer loud at once. It starts quiet and gets louder + higher with RPM/speed, and when you release the gas it fades out. Each car has its own engine character (Dodge deep V8, Vintage rough, Ferrari high revving).
  - DRIFT: smoother and more progressive (slower steering build-up, limited yaw snap, steadier slide angle), so the car does not flick or spin out.
  - RACES: no car-to-car collision for you in the circuit race or the drag race (you pass through rivals). The AI rivals on the circuit can bump each other and shove each other aside.
  - MENU MUSIC: new 118 bpm synthwave track (pads that pump with the kick, rolling bass, lead melody, echo + reverb, 32-bar arrangement).
  - BRAKE LIGHTS: red tail-light glow turns on when you brake / use the handbrake and goes back to normal when you release (also seen on other players and on braking rivals).
  - BRAKE / TYRE SOUND: new friction sound: squeal whose pitch falls as you slow down, rubber rumble, ABS flutter on a full stop, disc grind at low speed and a small chirp when the car stops.

V4 UPDATE
  - HANDBRAKE + GAS = BURNOUT: car stays in place, rear wheels spin, heavy smoke + skid marks, engine screams at the limiter. Steer while doing it = slow donut. Handbrake alone now brakes the car to a full stop (drift mode + gas at speed still lets you slide).
  - SOUND (all synthesised, no files): menu music (starts after your first click/key, pause menu too), engine that follows the RPM dial, turbo whistle, wind, tyre screech, brake squeal, handbrake click, burnout, collision / scrape, race countdown beeps. Menu > Settings > Sound turns everything on/off.
  - HIGH SPEED EFFECT: camera drops back and widens (FOV) with speed, so the car gets smaller and seems to run away from you; speed lines, vignette and a little shake over ~100 km/h.
  - REAL TURNING PHYSICS in normal drive: real tyre model above ~30 km/h (grip limit, understeer when you steer too much or brake in a corner, weight transfer). Below that a light assist keeps parking-speed steering easy. Gravel / grass slows you down.
  - NEW GRAND PRIX CIRCUIT (3.3 km, F1 style: long main straight, hairpins, esses, fast sweepers). It is east of the city: follow Speedway Rd / Grand Prix Rd to the gate arch. Smooth spline road, kerbs on the inside of corners, edge lines, gravel run-off, solid walls on both sides (inside and outside), start/finish gantry, pit building, grandstand, ad boards. The old small oval is gone. The world is now much wider (east side).
  - RACE: 2 laps vs 3 AI rivals (they brake for corners, solid cars). Entering the circuit switches the minimap from the CITY to the TRACK: blue arrow = you, red arrows = rivals with the gap in metres (+ = ahead of you), position and nearest gap ahead/behind at the bottom. Race HUD shows lap, position and gaps. All places pay coins + XP.
  - Controls reminder: Space handbrake, hold with W for burnout.

V3 UPDATE
  - Smooth: physics fixed 60 Hz + render interpolation (no judder on 60/120/144 Hz), city split into tiles (only visible tiles are drawn), no flicker resolution scaling.
  - Tyres: body lean/dive can no longer push a wheel into the road, car tilts on ramps, sidewalks lowered.
  - Camera: MOUSE DRAG (or finger drag on phone) looks around the car, WHEEL zooms, camera returns behind car after ~2 s.
  - Phone: arrows bottom-left, BRAKE/GAS pedals bottom-right (slide thumb between them), DRIFT/HAND above pedals, MENU/CAM/MAP/FULL top-right. Drag empty screen = camera.
  - Minimap: rectangle, bottom-left, rotates with the car, shows route/pin/other players.
  - Speedometer: round RPM dial + gear + big speed. Click/tap it to switch km/h <-> mph.

DRIFT X  (online version)
=========================
Files: index.html (game), server.js (web server + online city), model/ (your .glb cars), package.json (for hosting).

RUN ON YOUR PC
  1) Install Node.js 16+ (no npm packages needed)
  2) Double-click start-game.bat   (or run:  node server.js)  ->  http://localhost:3000
  - Same Wi-Fi: friends open the  http://YOUR-PC-IP:3000  address printed in the server window.

PLAY WITH FRIENDS FROM ANYWHERE (one shared city)
  Host the folder on any Node host and share its https link. Everyone who opens that link joins the SAME city.
  Example (Render.com, free):  push this folder to a GitHub repo -> New > Web Service -> Build command: (empty) -> Start command: node server.js
  Railway / Fly / any VPS work the same way (the PORT variable is read automatically).
  - If the game page is hosted somewhere else, open it with  ?server=https://YOUR-SERVER  at the end of the URL.
  - Free hosts "sleep" when idle: the first player may wait ~30 s for the server to wake up.

HOW MULTIPLAYER WORKS NOW
  - WebSocket connection (very low delay); automatically falls back to SSE+POST if a host blocks WebSockets.
  - Players are tied to the connection: no more missing / ghost players. Auto reconnect with the same house.
  - The server assigns the 8 house lots and they never move. More than 8 players can still drive (no house).
  - Other cars are shown smoothly (snapshot interpolation), with their real car model, colour, finish, rims, underglow, brake lights, name and damage.
  - Other players are solid: you can crash into each other (both cars get damage, sparks and dents).
  - Test locally: open http://localhost:3000 in two tabs -> ONLINE count shows 2.

CUSTOMIZE (Menu -> CUSTOM)
  Finish: GLOSS / SATIN / MATTE / METALLIC / CHROME, 16 paint colours + any custom colour, rim colours, neon underglow.
  Everything is saved and other players see it.

CRASH DETAIL
  Sparks, debris, glass, dust, flying body parts, camera shake and crash sound. Real dents are pushed into the body at the impact point and stay until you repair in the Garage.
  Damaged cars smoke from the hood; badly damaged cars burn. Paint gets dirtier with damage. Damage % still weakens the engine.

Keys: W/S gas-brake, A/D steer, Space handbrake, P drift mode, H go home, M map + pins, C camera, Esc menu.
Garage: Dodge is free, other cars are bought with coins or unlocked by missions (const CARDB in index.html).
index.html alone (double click) still works as single player; run  node make-models.js  once after adding .glb files.
