# Good Bones

A game for a jam whose theme was "It's a house".

You are the house. The family who lives in you (Marion, Dell, and their daughter Wren) is moving out at the end of the week. You can't stop them, but you can talk. You speak through your fridge, your kettle, your vents and your telephone, and you can only say words you have heard them say.

It's a small, dark, absurd love story about a house that doesn't want to be left.

*Contains implied death, grief, and an overly attentive home.*

## How to play

- **Listen, or type.** Whatever you type comes out of the object you're speaking through.
- **You can only say what you have heard.** Words the family says go into your vocabulary.
- **Hold a key** to hold the sound.
- **Left and right arrows** switch which object you're talking through.
- **Tab** moves you to another room. You only hear the room you're in.

The week goes from Wednesday to Friday, and the ending depends on what you said and how much of the packing got done.

## Running it

It's plain HTML and JavaScript with no build step, but it has to be served over http (opening `index.html` straight from disk won't load the pictures).

- **On GitHub Pages:** in the repo, go to Settings → Pages, set the source to *Deploy from a branch*, pick `main` and `/ (root)`, and save. The game appears at `https://<your-username>.github.io/<repo-name>/` after a minute or so.
- **Locally:** run any static server in this folder, for example `python -m http.server 8000` and then open `http://localhost:8000`. On Windows, `powershell -File tools/serve.ps1` also works (it serves on port 8765).

Best in a desktop browser with sound on.

## Credits

Built with [three.js](https://threejs.org/) r128 (MIT licence), included in `lib/`.
