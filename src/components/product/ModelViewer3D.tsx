import React, { useEffect, useRef, useState } from 'react';
import {
  Loader2Icon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  RotateCwIcon,
  ScanIcon,
  ZoomInIcon,
  ZoomOutIcon } from
'lucide-react';
import { loadModelViewer, type ModelViewerElement } from '../../utils/modelViewer';
import type { Viewer3D } from '../../types/api';

interface ModelViewer3DProps {
  config: Viewer3D;
  alt: string;
}

const RAD = 180 / Math.PI;

export function ModelViewer3D({ config, alt }: ModelViewer3DProps) {
  const ref = useRef<ModelViewerElement | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [autoRotate, setAutoRotate] = useState(config.auto_rotate ?? true);
  const allowZoom = config.allow_zoom !== false;

  useEffect(() => {
    loadModelViewer().
    then(() => setReady(true)).
    catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!ready || !el) return;
    const onProgress = (e: Event) =>
    setProgress((e as CustomEvent<{totalProgress: number;}>).detail.totalProgress);
    const onError = () => setError('This 3D model could not be loaded. Product photos are still available.');
    el.addEventListener('progress', onProgress);
    el.addEventListener('error', onError);
    return () => {
      el.removeEventListener('progress', onProgress);
      el.removeEventListener('error', onError);
    };
  }, [ready]);

  const rotate = (deg: number) => {
    const el = ref.current;
    if (!el) return;
    const o = el.getCameraOrbit();
    el.cameraOrbit = `${o.theta * RAD + deg}deg ${o.phi * RAD}deg ${o.radius}m`;
  };

  const zoom = (factor: number) => {
    const el = ref.current;
    if (!el) return;
    const o = el.getCameraOrbit();
    el.cameraOrbit = `${o.theta * RAD}deg ${o.phi * RAD}deg ${o.radius * factor}m`;
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.cameraOrbit = config.camera_orbit || 'auto auto auto';
  };

  if (!config.model_3d_file) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-muted">
        A 3D model isn’t available for this product yet.
      </div>);

  }

  if (error) {
    return (
      <div role="alert" className="flex h-full items-center justify-center p-8 text-center text-muted">
        {error}
      </div>);

  }

  const controls: {label: string;icon: React.ReactNode;onClick: () => void;show: boolean;}[] = [
  { label: 'Rotate left', icon: <RotateCcwIcon className="h-4 w-4" />, onClick: () => rotate(-30), show: true },
  { label: 'Rotate right', icon: <RotateCwIcon className="h-4 w-4" />, onClick: () => rotate(30), show: true },
  { label: 'Zoom in', icon: <ZoomInIcon className="h-4 w-4" />, onClick: () => zoom(0.8), show: allowZoom },
  { label: 'Zoom out', icon: <ZoomOutIcon className="h-4 w-4" />, onClick: () => zoom(1.25), show: allowZoom },
  { label: 'Reset view', icon: <ScanIcon className="h-4 w-4" />, onClick: reset, show: true },
  {
    label: autoRotate ? 'Pause auto-rotate' : 'Start auto-rotate',
    icon: autoRotate ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />,
    onClick: () => setAutoRotate((v) => !v),
    show: true
  }];


  return (
    <div className="relative h-full w-full">
      {!ready ?
      <div className="flex h-full items-center justify-center gap-2 text-muted">
          <Loader2Icon className="h-5 w-5 animate-spin" aria-hidden /> Loading 3D viewer…
        </div> :

      React.createElement('model-viewer', {
        ref,
        src: config.model_3d_file,
        poster: config.model_3d_poster ?? undefined,
        alt: `Interactive 3D model of ${alt}`,
        'camera-controls': '',
        'camera-orbit': config.camera_orbit || undefined,
        'field-of-view': config.field_of_view || undefined,
        'environment-image': config.environment_preset === 'neutral' || config.environment_preset === 'legacy' ? config.environment_preset : undefined,
        'auto-rotate': autoRotate ? '' : undefined,
        'disable-zoom': allowZoom ? undefined : '',
        'shadow-intensity': '1',
        'interaction-prompt': 'auto',
        'touch-action': 'pan-y',
        style: { width: '100%', height: '100%', backgroundColor: 'transparent' }
      })
      }

      {ready && progress < 1 &&
      <div className="pointer-events-none absolute inset-x-6 top-5" aria-hidden>
          <div className="h-1 overflow-hidden rounded-full bg-black/10">
            <div className="h-full bg-lime-bright" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        </div>
      }

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white/95 p-1.5 shadow-sm ring-1 ring-black/5">
        {controls.
        filter((c) => c.show).
        map((c) =>
        <button
          key={c.label}
          type="button"
          onClick={c.onClick}
          disabled={!ready}
          className="focus-ring rounded-full p-2.5 text-ink hover:bg-canvas disabled:opacity-40"
          aria-label={c.label}
          title={c.label}>
          
              {c.icon}
            </button>
        )}
      </div>
      <p className="pointer-events-none absolute left-5 top-5 hidden text-xs text-muted md:block">
        Drag to rotate{allowZoom ? ' · Scroll or pinch to zoom' : ''}
      </p>
    </div>);

}