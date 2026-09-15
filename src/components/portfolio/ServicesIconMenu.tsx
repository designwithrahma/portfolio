import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Info, LayoutList, SquareArrowOutUpRight } from "lucide-react";

interface Props {
  menu: { x: number; y: number; mobile: boolean } | null;
  onClose: () => void;
  onOpen: () => void;
}

/** Context surface for the Services desktop app icon. */
export function ServicesIconMenu({ menu, onClose, onOpen }: Props) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopImmediatePropagation();
        onClose();
      }
    };
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [menu, onClose]);

  if (!menu) return null;

  const openNewTab = () => {
    window.open(`${window.location.origin}${window.location.pathname}#/services`, "_blank", "noopener,noreferrer");
    onClose();
  };

  const action =
    "flex min-h-10 w-full cursor-pointer items-center gap-2.5 rounded-[8px] px-2.5 text-left text-[12px] font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white";

  return (
    <AnimatePresence>
      {menu.mobile ? (
        <div className="fixed inset-0 z-[96] flex items-end">
          <button type="button" aria-label="Close Services actions" onClick={onClose} className="absolute inset-0 cursor-default bg-black/55 backdrop-blur-[3px]" />
          <motion.div
            ref={ref}
            initial={{ y: reduced ? 0 : "100%" }}
            animate={{ y: 0 }}
            exit={{ y: reduced ? 0 : "100%" }}
            className="relative z-10 w-full rounded-t-[18px] border-t border-white/12 bg-[#101013]/97 p-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] text-white"
          >
            <span className="mx-auto mb-3 block h-1 w-9 rounded-full bg-white/20" />
            <div className="mb-2 flex items-center gap-3 px-2">
              <span className="grid h-10 w-10 place-items-center rounded-[9px] bg-white/10"><LayoutList size={18} /></span>
              <span><span className="block text-[14px] font-semibold">Services</span><span className="block text-[10px] text-white/40">Studio offerings</span></span>
            </div>
            <button type="button" onClick={() => { onOpen(); onClose(); }} className={action}><SquareArrowOutUpRight size={15} />Open Services</button>
            <button type="button" onClick={openNewTab} className={action}><Info size={15} />Open in New Tab</button>
          </motion.div>
        </div>
      ) : (
        <motion.div
          ref={ref}
          role="menu"
          initial={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: reduced ? 1 : 0.97 }}
          style={{
            left: Math.max(8, Math.min(menu.x, window.innerWidth - 204)),
            top: Math.max(8, Math.min(menu.y, window.innerHeight - 110)),
          }}
          className="fixed z-[84] w-[196px] rounded-[12px] border border-white/12 bg-[#101013]/95 p-1.5 text-white shadow-dock backdrop-blur-xl"
        >
          <button type="button" role="menuitem" onClick={() => { onOpen(); onClose(); }} className={action}><SquareArrowOutUpRight size={14} />Open Services</button>
          <button type="button" role="menuitem" onClick={openNewTab} className={action}><Info size={14} />Open in New Tab</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}