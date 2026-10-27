const MODEL_VIEWER_SRC =
'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';

let loader: Promise<void> | null = null;

/** Lazily loads Google's <model-viewer> web component the first time a 3D view opens. */
export function loadModelViewer(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (customElements.get('model-viewer')) return Promise.resolve();
  if (!loader) {
    loader = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = MODEL_VIEWER_SRC;
      script.onload = () => {
        customElements.whenDefined('model-viewer').then(() => resolve());
      };
      script.onerror = () => {
        loader = null;
        reject(new Error('The 3D viewer could not be loaded.'));
      };
      document.head.appendChild(script);
    });
  }
  return loader;
}

export interface ModelViewerElement extends HTMLElement {
  cameraOrbit: string;
  getCameraOrbit: () => {theta: number;phi: number;radius: number;};
  jumpCameraToGoal: () => void;
  autoRotate: boolean;
}