import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDownIcon } from './Icons';

/** Disclosure menu: closes on outside click, Escape and navigation. Items are plain links/buttons passed as children. */
export default function Dropdown({ label, icon, align = 'left', children, buttonClass = '' }) {
  const [openAt, setOpenAt] = useState(null);
  const ref = useRef(null);
  const { pathname } = useLocation();
  const open = openAt === pathname; // navigating closes the menu
  const setOpen = (v) => setOpenAt(v ? pathname : null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        ref.current?.querySelector('button')?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button type="button" aria-expanded={open} aria-haspopup="true" className={`flex min-h-[44px] items-center gap-1.5 rounded-pill px-4 text-sm font-medium text-mute transition-colors hover:text-paper ${buttonClass}`} onClick={() => setOpen(!open)}>
        {icon}{label}<ChevronDownIcon />
      </button>
      {open && (
        <div className={`absolute z-50 mt-2 min-w-[210px] animate-fade-in rounded-poster border border-line bg-velvet p-2 shadow-royal ${align === 'right' ? 'right-0' : 'left-0'}`}>
          {children}
        </div>
      )}
    </div>
  );
}

export const menuItemClass = 'flex min-h-[40px] w-full items-center justify-between gap-3 rounded-lg px-3 text-left text-sm text-paper hover:bg-curtain hover:text-gold';
