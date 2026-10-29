import React, { createElement, useEffect, useRef, useState } from 'react';
import { RotateCcwIcon, RotateCwIcon, ScanIcon, ZoomInIcon, ZoomOutIcon, AlertTriangleIcon } from 'lucide-react';
import type { Viewer3D } from '../../types/api';

interface ModelViewerElement extends HTMLElement {
  cameraOrbit: string;
  getCameraOrbit: () => {theta: number;phi: number;radius: number;};
}

interface Model3DViewerProps {
  config: Viewer3D;
  alt: string;
}

const SUPPORTED_FORMATS = ['GLB', 'GLTF'];

export function Model3DViewer({ config, alt }: Model3DViewerProps) {
  const ref = useRef<ModelViewerElement | null>(null);
  const [libraryReady, setLibraryReady] = useState(false);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [progress, setProgress] = useState(0);

  const format = (config.model_3d_format ?? '').toUpperCase();
  const fileExt = (config.model_3d_file ?? '').split('?')[0].split('.').pop()?.toUpperCase() ?? '';
  const supported = !!config.model_3d_file && (SUPPORTED_FORMATS.includes(format) || SUPPORTED_FORMATS.includes(fileExt));

  useEffect(() => {
    let active = true;
    import('@google/model-viewer').
    then(() => {
      if (active) setLibraryReady(true);
    }).
    catch(() => {
      if (active) setStatus('error');
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setStatus('loading');
    setProgress(0);
    const onLoad = () => setStatus('loaded');
    const onError = () => setStatus('error');
    const onProgress = (event: Event) => {
      const detail = (event as CustomEvent<{totalProgress?: number;}>).detail;
      setProgress(detail?.totalProgress ?? 0);
    };
    el.addEventListener('load', onLoad);
    el.addEventListener('error', onError);
    el.addEventListener('progress', onProgress);
    return () => {
      el.removeEventListener('load', onLoad);
      el.removeEventListener('error', onError);
      el.removeEventListener('progress', onProgress);
    };
  }, [libraryReady, config.model_3d_file]);

  const adjustOrbit = (thetaDelta: number, radiusFactor: number) => {
    const el = ref.current;
    if (!el || typeof el.getCameraOrbit !== 'function') return;
    const orbit = el.getCameraOrbit();
    el.cameraOrbit = `${orbit.theta + thetaDelta}rad ${orbit.phi}rad ${orbit.radius * radiusFactor}m`;
  };

  const resetView = () => {
    const el = ref.current;
    if (!el) return;
    el.cameraOrbit = config.camera_orbit || 'auto auto auto';
  };

  if (!supported) {
    return (
      <ViewerMessage
        title="3D preview unavailable"
        message="This model format can't be displayed in the browser. Photos are still available." />);


  }

  const viewerProps: Record<string, unknown> = {
    ref,
    src: config.model_3d_file,
    alt,
    'camera-controls': '',
    'touch-action': 'pan-y',
    'interaction-prompt': 'none',
    'shadow-intensity': '1',
    exposure: '1',
    'environment-image': config.environment_preset || 'neutral',
    style: { width: '100%', height: '100%', backgroundColor: 'transparent', '--poster-color': 'transparent' } as React.CSSProperties
  };
  if (config.model_3d_poster) viewerProps.poster = config.model_3d_poster;
  if (config.camera_orbit) viewerProps['camera-orbit'] = config.camera_orbit;
  if (config.field_of_view) viewerProps['field-of-view'] = config.field_of_view;
  if (config.auto_rotate) viewerProps['auto-rotate'] = '';
  if (!config.allow_zoom) viewerProps['disable-zoom'] = '';

  const controlBtn =
  'flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-raised hover:text-fg';

  return (
    <div className="relative h-full w-full">
      {libraryReady && createElement('model-viewer', viewerProps)}

      {status === 'loading' &&
      <div className="pointer-events-none absolute inset-x-0 bottom-20 mx-auto w-48 text-center" role="status">
          <div className="h-0.5 w-full overflow-hidden rounded-full bg-line">
            <div
            className="h-full bg-fg transition-[width] duration-200 ease-out"
            style={{ width: `${Math.max(6, Math.round(progress * 100))}%` }} />
          
          </div>
          <p className="mt-2 text-xs text-muted">Loading 3D model…</p>
        </div>
      }

      {status === 'error' &&
      <div className="absolute inset-0">
          <ViewerMessage title="Couldn't load the 3D model" message="Please try again later or browse the photos instead." />
        </div>
      }

      {status === 'loaded' &&
      <>
          <p className="pointer-events-none absolute left-4 top-4 flex items-center gap-1.5 text-xs text-muted">
            <ScanIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Drag to rotate{config.allow_zoom ? ' · Scroll or pinch to zoom' : ''}
          </p>
          <div
          className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-lg border border-line bg-bg/90 p-1"
          role="toolbar"
          aria-label="3D view controls">
          
            <button type="button" className={controlBtn} onClick={() => adjustOrbit(-Math.PI / 4, 1)} aria-label="Rotate left">
              <RotateCcwIcon className="h-4 w-4" />
            </button>
            <button type="button" className={controlBtn} onClick={() => adjustOrbit(Math.PI / 4, 1)} aria-label="Rotate right">
              <RotateCwIcon className="h-4 w-4" />
            </button>
            {config.allow_zoom &&
          <>
                <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
                <button type="button" className={controlBtn} onClick={() => adjustOrbit(0, 0.8)} aria-label="Zoom in">
                  <ZoomInIcon className="h-4 w-4" />
                </button>
                <button type="button" className={controlBtn} onClick={() => adjustOrbit(0, 1.25)} aria-label="Zoom out">
                  <ZoomOutIcon className="h-4 w-4" />
                </button>
              </>
          }
            <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
            <button type="button" onClick={resetView} className="h-9 rounded-md px-3 text-xs font-medium text-muted hover:bg-raised hover:text-fg">
              Reset
            </button>
          </div>
        </>
      }
    </div>);

}

function ViewerMessage({ title, message }: {title: string;message: string;}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <AlertTriangleIcon className="h-6 w-6 text-muted" aria-hidden="true" />
      <p className="mt-3 text-sm font-medium text-fg">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-muted">{message}</p>
    </div>);

}