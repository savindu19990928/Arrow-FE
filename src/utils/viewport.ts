/**
 * Mobile browsers render pages at a ~980px virtual width unless a viewport meta tag is present,
 * which shrinks the desktop layout to fit and stops every responsive breakpoint from applying.
 * The host HTML can't be edited, so ensure the tag exists at runtime.
 */
export function ensureViewportMeta(): void {
  const content = 'width=device-width, initial-scale=1, viewport-fit=cover';
  let meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'viewport';
    document.head.prepend(meta);
  }
  if (meta.content !== content) meta.content = content;
}