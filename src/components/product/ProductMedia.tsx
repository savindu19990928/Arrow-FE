import React, { useEffect, useMemo, useState } from 'react';
import { ImageIcon, ImageOffIcon, Loader2Icon } from 'lucide-react';
import { ModelViewer3D } from './ModelViewer3D';
import { useApi } from '../../hooks/useApi';
import { catalogApi } from '../../utils/storeApi';
import type { ProductDetail, ProductImage } from '../../types/api';
interface ProductMediaProps {
  product: ProductDetail;
  variantImage?: string | null;
}
export function ProductMedia({
  product,
  variantImage
}: ProductMediaProps) {
  const [mode, setMode] = useState<'photos' | '3d'>('photos');
  const images = useMemo<ProductImage[]>(() => {
    const sorted = [...(product.images ?? [])].sort((a, b) => a.display_order - b.display_order);
    if (sorted.length === 0 && product.primary_image) {
      sorted.push({
        id: -1,
        image: product.primary_image,
        alt_text: product.name,
        is_primary: true,
        display_order: 0
      });
    }
    if (variantImage && !sorted.some((i) => i.image === variantImage)) {
      sorted.unshift({
        id: -2,
        image: variantImage,
        alt_text: product.name,
        is_primary: false,
        display_order: -1
      });
    }
    return sorted;
  }, [product, variantImage]);
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => setActiveIndex(0), [variantImage]);
  const needsFetch = mode === '3d' && product.has_3d_model && !product.viewer_3d?.model_3d_file;
  const modelReq = useApi(() => catalogApi.model3d(product.slug), [product.slug], needsFetch);
  const viewerConfig = product.viewer_3d?.model_3d_file ? product.viewer_3d : modelReq.data;
  const active = images[activeIndex];
  return <div>
      <div className="relative aspect-square overflow-hidden rounded-md bg-canvas">
        {product.has_3d_model && <div role="tablist" aria-label="Product media" className="absolute right-4 top-4 z-10 flex rounded-full bg-white p-1 shadow-sm ring-1 ring-black/5">
            {(['photos', '3d'] as const).map((m) => <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={`focus-ring inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors duration-150 ease-out ${mode === m ? 'bg-ink text-white' : 'text-ink hover:bg-canvas'}`}>
                {m === 'photos' ? <ImageIcon className="h-3.5 w-3.5" aria-hidden /> : <div className="h-3.5 w-3.5" aria-hidden />}
                {m === 'photos' ? 'Photos' : '3D view'}
              </button>)}
          </div>}

        {mode === '3d' ? viewerConfig ? <ModelViewer3D config={viewerConfig} alt={product.name} /> : modelReq.error ? <div role="alert" className="flex h-full items-center justify-center p-8 text-center text-muted">
              {modelReq.error}
            </div> : <div className="flex h-full items-center justify-center gap-2 text-muted">
              <Loader2Icon className="h-5 w-5 animate-spin" aria-hidden /> Preparing 3D model…
            </div> : active ? <img src={active.image} alt={active.alt_text || product.name} className="h-full w-full object-contain mix-blend-multiply" /> : <div className="flex h-full flex-col items-center justify-center gap-2 text-subtle">
            <ImageOffIcon className="h-10 w-10" aria-hidden />
            <span className="text-sm">No photos available</span>
          </div>}
      </div>

      {mode === 'photos' && images.length > 1 && <ul className="mt-3 grid grid-cols-5 gap-3" aria-label="Product photos">
          {images.map((img, i) => <li key={img.id}>
              <button type="button" onClick={() => setActiveIndex(i)} aria-label={`Show photo ${i + 1}`} aria-current={i === activeIndex} className={`focus-ring block aspect-square w-full overflow-hidden rounded-sm bg-canvas ring-2 transition-shadow duration-150 ease-out ${i === activeIndex ? 'ring-ink' : 'ring-transparent hover:ring-line'}`}>
                <img src={img.image} alt="" className="h-full w-full object-contain mix-blend-multiply" />
              </button>
            </li>)}
        </ul>}
    </div>;
}