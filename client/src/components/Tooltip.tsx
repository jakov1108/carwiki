import { useState } from "react";
import { HelpCircle } from "lucide-react";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const tooltipBubbleClasses =
  "pointer-events-none absolute bottom-full left-1/2 z-50 mb-3 w-max max-w-[18rem] -translate-x-1/2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm leading-6 text-slate-700 shadow-xl shadow-slate-900/10 whitespace-normal dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";

const tooltipArrowClasses =
  "pointer-events-none absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800";

/** Inline tooltip that shows on hover/tap */
export function Tooltip({ text, children }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-flex items-center gap-1 cursor-help"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow(!show)}
    >
      {children}
      {show && (
        <span className={tooltipBubbleClasses}>
          {text}
          <span className={tooltipArrowClasses} />
        </span>
      )}
    </span>
  );
}

/** Small help icon with tooltip */
export function HelpTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-flex items-center cursor-help ml-1"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow(!show)}
    >
      <HelpCircle className="w-4 h-4 text-slate-500 transition hover:text-blue-600 dark:hover:text-blue-300" />
      {show && (
        <span className={`${tooltipBubbleClasses} text-center`}>
          {text}
          <span className={tooltipArrowClasses} />
        </span>
      )}
    </span>
  );
}

/** 
 * Glossary of common automotive abbreviations used in the app.
 * Maps abbreviation → Croatian explanation.
 */
export const autoGlossary: Record<string, string> = {
  "FWD": "Prednji pogon (Front-Wheel Drive)",
  "RWD": "Stražnji pogon (Rear-Wheel Drive)",
  "AWD": "Pogon na sva četiri kotača (All-Wheel Drive)",
  "4WD": "Pogon na sva četiri kotača (Four-Wheel Drive)",
  "DSG": "Automatizirani mjenjač s dvostrukom spojkom",
  "CVT": "Kontinuirano varijabilni mjenjač",
  "AT": "Automatski mjenjač",
  "MT": "Ručni (manualni) mjenjač",
  "KS": "Konjska snaga (1 KS ≈ 0,735 kW)",
  "kW": "Kilovat - mjerna jedinica snage",
  "Nm": "Njuton-metar - mjerna jedinica okretnog momenta",
  "L/100km": "Litara na 100 km - potrošnja goriva",
  "km/h": "Kilometara na sat",
  "ccm": "Kubični centimetri - obujam motora",
  "TSI": "Motor s turbo i direktnim ubrizgavanjem (VW)",
  "TDI": "Turbodizel s direktnim ubrizgavanjem (VW)",
  "TFSI": "Turbo motor s direktnim ubrizgavanjem (Audi)",
  "HDi": "Turbodizel s direktnim ubrizgavanjem (Peugeot/Citroën)",
  "CDI": "Turbodizel s direktnim ubrizgavanjem (Mercedes)",
  "BlueHDi": "Euro 6 turbodizel (Peugeot/Citroën)",
  "EcoBoost": "Turbo benzinski motor (Ford)",
  "PHEV": "Plug-in hibridno električno vozilo",
  "BEV": "Potpuno električno vozilo (Battery EV)",
  "HEV": "Hibridno električno vozilo",
};

/** Renders a value with auto-detected tooltip for known abbreviations */
export function SpecValue({ value }: { value: string | null | undefined }) {
  if (!value) return <span className="text-white font-medium">-</span>;

  // Check if the value contains any known abbreviations
  const words = value.split(/\s+/);
  const matchedAbbr = words.find(w => autoGlossary[w.replace(/[,.:;]/g, '')]);

  if (matchedAbbr) {
    const cleanAbbr = matchedAbbr.replace(/[,.:;]/g, '');
    return (
      <Tooltip text={autoGlossary[cleanAbbr]}>
        <span className="text-white font-medium">{value}</span>
        <HelpCircle className="w-3.5 h-3.5 text-slate-500 transition hover:text-blue-600 dark:hover:text-blue-300" />
      </Tooltip>
    );
  }

  return <span className="text-white font-medium">{value}</span>;
}
