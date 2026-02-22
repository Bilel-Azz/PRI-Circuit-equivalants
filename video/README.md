# video/ — Video de presentation

Video de demonstration du projet, construite avec Remotion (React pour la video).

## Lancement (preview)

```bash
cd video
npm install
npx remotion preview
```

## Generer la video finale

```bash
npx remotion render MainComposition out/circuit_demo.mp4
```

La video generee se trouve dans `out/circuit_demo.mp4`.

## Structure

```
video/
├── src/
│   ├── Root.tsx               # Composition racine Remotion
│   ├── MainComposition.tsx    # Composition principale
│   ├── DemoComposition.tsx    # Composition demo
│   ├── scenes/                # Scenes individuelles
│   ├── components/            # Composants visuels
│   └── lib/                   # Utilitaires
├── public/
│   └── voiceover.mp3          # Piste audio (voix off)
├── out/
│   └── circuit_demo.mp4       # Video generee
├── SCRIPT_VOIX_OFF.md         # Script de la voix off
├── remotion.config.ts
└── package.json
```

## Technologies

- **Remotion 4.0** — Framework React pour generer des videos
- **React 19**
- **Tailwind CSS**
