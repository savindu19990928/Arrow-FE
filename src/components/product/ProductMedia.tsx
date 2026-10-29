import React, { useEffect, useMemo, useState } from 'react';
import { BoxIcon, ImageIcon, ImageOffIcon } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { catalogApi } from '../../utils/shopApi';
import { Model3DViewer } from './Model3DViewer';
import type { ProductDetail } from '../../types/api';

type Mode = 'photos' | '3d';

export function ProductMedia({ product, variantImage }: {product: ProductDetail;variantImage: string | null;}) {
  const [mode, setMode] = useState<Mode>('photos');
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(variantImage ? -1 : 0);
  }, [variantImage]);

  const images = useMemo(() => {
    const list = [...(product.images ?? [])].sort((a, b) => a.display_order - b.display_order);
    if (!list.length && product.primary_image) {
      return [{ id: 0, image: product.primary_image, alt_text: product.name, is_primary: true, display_order: 0 }];
    }
    return list;
  }, [product]);

  const inlineViewer = product.viewer_3d?.model_3d_file ? product.viewer_3d : null;
  const needsFetch = product.has_3d_model && !inlineViewer && mode === '3d';
  const fetched = useApi(() => catalogApi.model3d(product.slug), [product.slug], needsFetch);
  const viewer = inlineViewer ?? fetched.data;

  const current = variantImage && activeIndex === -1 ? variantImage : images[activeIndex]?.image ?? variantImage;
  const currentAlt = images[activeIndex]?.alt_text || product.name;

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-xl border border-line bg-surface sm:aspect-[5/4]">
        {mode === 'photos' ?
        current ?
        <img src={current} alt={currentAlt} className="h-full w-full object-contain" /> :

        <div className="flex h-full items-center justify-center text-subtle">
              <ImageOffIcon className="h-10 w-10" aria-hidden="true" />
            </div> :

        viewer ?
        <Model3DViewer config={viewer} alt={`3D model of ${product.name}`} /> :
        fetched.error ?
        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted">{fetched.error}</div> :

        <div className="flex h-full items-center justify-center text-sm text-muted" role="status">
            Preparing 3D viewer…
          </div>
        }

        {product.has_3d_model &&
        <div
          className="absolute right-4 top-4 flex rounded-lg border border-line bg-bg/90 p-1"
          role="tablist"
          aria-label="Media view">
          
            {(
          [
          { id: 'photos', label: 'Photos', icon: ImageIcon },
          { id: '3d', label: '3D view', icon: BoxIcon }] as
          const).
          map((tab) =>
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={mode === tab.id}
            onClick={() => setMode(tab.id)}
            className={`flex h-10 items-center gap-1.5 sm:h-8 whitespace-nowrap rounded-md px-3 text-xs font-medium transition-colors duration-150 ${
            mode === tab.id ? 'bg-fg text-bg' : 'text-muted hover:text-fg'}`
            }>
            
                <tab.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {tab.label}
              </button>
          )}
          </div>
        }
      </div>

      {mode === 'photos' && (images.length > 1 || variantImage) &&
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {variantImage &&
        <Thumb src={variantImage} alt="Selected variant" active={activeIndex === -1} onClick={() => setActiveIndex(-1)} />
        }
          {images.map((img, index) =>
        <Thumb
          key={img.id}
          src={img.image}
          alt={img.alt_text || `${product.name} image ${index + 1}`}
          active={activeIndex === index}
          onClick={() => setActiveIndex(index)} />

        )}
        </div>
      }
    </div>);

}

function Thumb({ src, alt, active, onClick }: {src: string;alt: string;active: boolean;onClick: () => void;}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-16 w-20 shrink-0 overflow-hidden rounded-md border bg-surface transition-colors duration-150 ${
      active ? 'border-fg' : 'border-line hover:border-fg/40'}`
      }>
      
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </button>);

}