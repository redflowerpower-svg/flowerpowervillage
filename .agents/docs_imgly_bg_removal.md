# @imgly/background-removal - Local In-Browser AI Background Removal

## Panoramica
Libreria per la rimozione automatica dello sfondo da immagini (PNG/JPG/WebP) direttamente nel browser del client via WebAssembly e modelli ONNX Neural Network.

## Caratteristiche Principali
- **Esecuzione Client-Side**: 100% in-browser, nessun invio di foto a server esterni.
- **Nessuna API Key**: Gratuito e illimitato.
- **Output**: Genera un `Blob` PNG con canale Alpha (trasparenza).

## Integrazione
```ts
import { removeBackground } from '@imgly/background-removal';

const blob = await removeBackground(imageSource, {
  progress: (key, current, total) => {
    // tracciamento download modello e computazione
  }
});
```
