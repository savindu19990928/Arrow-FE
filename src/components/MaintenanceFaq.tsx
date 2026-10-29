import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PlusIcon } from 'lucide-react';
import { maintenanceFaqs } from '../data/maintenance';

export function MaintenanceFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ul className="border-b border-line">
      {maintenanceFaqs.map((faq, index) => {
        const isOpen = open === index;
        const panelId = `faq-panel-${index}`;
        return (
          <li key={faq.question} className="border-t border-line">
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : index)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-center justify-between gap-6 py-6 text-left">
                
                <span className="text-base font-medium text-fg md:text-lg">{faq.question}</span>
                <PlusIcon
                  className={`h-5 w-5 shrink-0 text-muted transition-transform duration-200 ease-out ${isOpen ? 'rotate-45' : ''}`}
                  aria-hidden="true" />
                
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen &&
              <motion.div
                id={panelId}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                className="overflow-hidden">
                
                  <p className="max-w-2xl pb-6 text-[15px] leading-relaxed text-muted">{faq.answer}</p>
                </motion.div>
              }
            </AnimatePresence>
          </li>);

      })}
    </ul>);

}