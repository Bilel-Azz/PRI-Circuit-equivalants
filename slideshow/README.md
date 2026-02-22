# slideshow/ — Slides de soutenance

Presentation interactive construite avec Next.js et Framer Motion. 43 slides couvrant le contexte, la problematique, la methodologie, l'architecture, les resultats et le bilan.

## Lancement

```bash
cd slideshow
npm install
npm run dev
```

Ouvrir http://localhost:3000

## Navigation

- **Fleches gauche/droite** ou **clic** pour naviguer entre les slides
- La barre de progression en bas indique la position dans la presentation

## Structure

```
slideshow/
├── src/
│   ├── app/             # Point d'entree Next.js
│   ├── slides/          # 43 fichiers .tsx (un par slide)
│   │   ├── 01_TitleSlide.tsx
│   │   ├── 02_SommaireSlide.tsx
│   │   ├── ...
│   │   └── 43_BesoinsEnjeuxSlide.tsx
│   ├── components/      # Composants reutilisables (layout, animations)
│   └── lib/             # Utilitaires
├── package.json
└── tailwind.config.ts
```

## Technologies

- **Next.js 16** + React 19
- **Framer Motion** pour les animations
- **Tailwind CSS** pour le style
- **Lucide React** pour les icones
- **jsPDF + html2canvas** pour l'export PDF

## Modifier une slide

Chaque slide est un composant React dans `src/slides/`. Pour modifier une slide, editer le fichier correspondant. L'ordre est defini dans le composant principal (`src/app/page.tsx` ou `src/components/Slideshow.tsx`).
