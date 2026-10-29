import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangleIcon, XIcon } from 'lucide-react';
import { contact } from '../data/site';
import { buttonClasses } from './ui/Button';

const STORAGE_KEY = 'av-maintenance-notice-dismissed';
const ease = [0.23, 1, 0.32, 1] as const;

export function MaintenanceNotice() {
  const [open, setOpen] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) !== '1';
    } catch {
      return true;
    }
  });
  const confirmRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {

      /* storage unavailable — dismiss for this view only */}
  };

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <div role="status" className="border-b border-warn/30 bg-warn/10">
        <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-3 sm:items-center sm:px-6 lg:px-8">
          <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-warn sm:mt-0" aria-hidden="true" />
          <p className="min-w-0 flex-1 text-sm text-fg">
            <span className="font-semibold">Website under maintenance.</span>{' '}
            <span className="text-fg/80">Please do not place any orders until we're back.</span>
          </p>
          {!open &&
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 rounded text-sm font-medium text-warn underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warn/60">
            
              Details
            </button>
          }
        </div>
      </div>

      <AnimatePresence>
        {open &&
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-bg/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease }}
          onClick={close}>
          
            <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="maintenance-title"
            aria-describedby="maintenance-desc"
            className="relative max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl border border-line bg-surface px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 sm:max-w-md sm:rounded-2xl sm:p-8"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.24, ease }}
            onClick={(e) => e.stopPropagation()}>
            
              <button
              type="button"
              onClick={close}
              aria-label="Close notice"
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-raised hover:text-fg">
              
                <XIcon className="h-5 w-5" aria-hidden="true" />
              </button>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-warn/15 text-warn">
                <AlertTriangleIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2
              id="maintenance-title"
              className="mt-5 pr-8 font-display text-2xl font-extrabold uppercase leading-tight tracking-tight text-fg">
              
                Website under maintenance
              </h2>
              <div id="maintenance-desc" className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted">
                <p>
                  We're updating our store right now. <strong className="text-fg">Please do not buy anything</strong>{' '}
                  — orders and payments placed during maintenance may not be processed.
                </p>
                <p>
                  You can still browse products. For urgent enquiries call{' '}
                  <a href={contact.phoneHref} className="whitespace-nowrap text-fg underline underline-offset-2">
                    {contact.phone}
                  </a>
                  .
                </p>
              </div>
              <button ref={confirmRef} type="button" onClick={close} className={`${buttonClasses('primary', 'lg', true)} mt-7`}>
                I understand
              </button>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </>);

}