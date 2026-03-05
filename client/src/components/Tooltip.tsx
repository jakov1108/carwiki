import { useState } from "react";
import { HelpCircle } from "lucide-react";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

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
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-700 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50 border border-slate-600">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-700" />
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
      <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 transition" />
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-700 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50 border border-slate-600 max-w-[200px] text-center leading-relaxed">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-700" />
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
        <HelpCircle className="w-3 h-3 text-slate-500" />
      </Tooltip>
    );
  }

  return <span className="text-white font-medium">{value}</span>;
}
