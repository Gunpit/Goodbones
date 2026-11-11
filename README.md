# Good Bones

A game for a jam whose theme was "It's a house".

You are the house. The family who lives in you (Marion, Dell, and their daughter Wren) is moving out at the end of the week. You can't stop them, but you can talk. You speak through your fridge, your kettle, your vents and your telephone, and you can only say words you have heard them say.

It's a small, dark, absurd love story about a house that doesn't want to be left.

*Contains implied death, grief, and an overly attentive home.*

## How to play

- **Listen, or type.** Whatever you type comes out of the object you're speaking through. Wren teaches you the rest at the start.
- **You can only say what you have heard.** Words the family says go into your vocabulary.
- **Hold a key** to hold the sound.
- **Hold ↓ or ↑ while you type** to talk low like Dad or high like Wren. Do it from another room and they'll go looking for whoever they think called.
- **Left and right arrows** switch which object you're talking through.
- **Press and hold on a thing** to make it move: taps run, lamps flicker, doors slam, the phone rings. Whoever's nearest goes to deal with it. Each thing works twice a day.
- **Tab** goes to the next room and **Shift** goes back, or click a room on the map. You only hear the room you're in.

- **At night, while they sleep,** press and hold on the boxes in the hall to work them open again. It makes noise, and the map shows who's stirring upstairs. Work while the furnace is on.
- **Wren asks for favors** now and then. Do them and her hearts by the map fill up, and she starts helping you keep them.

The week goes from Wednesday to Friday. The boxes under the map show how much they've packed. The ending depends on what you say and how much of the house is still unpacked.

## Running it

It's plain HTML and JavaScript with no build step, but it has to be served over http (opening `index.html` straight from disk won't load the pictures).

- **On GitHub Pages:** in the repo, go to Settings → Pages, set the source to *Deploy from a branch*, pick `main` and `/ (root)`, and save. The game appears at `https://<your-username>.github.io/<repo-name>/` after a minute or so.
- **Locally:** run any static server in this folder, for example `python -m http.server 8000` and then open `http://localhost:8000`. On Windows, `powershell -File tools/serve.ps1` also works (it serves on port 8765).

Best in a desktop browser with sound on.

## Credits

Built with [three.js](https://threejs.org/) r128 (MIT licence), included in `lib/`.
