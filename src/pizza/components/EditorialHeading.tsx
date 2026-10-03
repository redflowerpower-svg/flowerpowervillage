import React from 'react';

interface EditorialHeadingProps {
  text: string;
  className?: string;
  hookClassName?: string;
  punchlineClassName?: string;
  pillClassName?: string;
}

/**
 * EditorialHeading
 * Regola d'Oro Estetica della Scrittura & Visual Copywriting:
 * - Se la stringa contiene ':', divide l'Hook dalla Punchline mandando a capo in modo armonico.
 * - Se contiene una nota tra parentesi '(...)', la separa esteticamente come sotto-pillola tecnica protetta (whitespace-nowrap).
 */
export const EditorialHeading: React.FC<EditorialHeadingProps> = ({
  text,
  className = '',
  hookClassName = 'text-stone-500 font-bold text-xs sm:text-sm uppercase tracking-wider',
  punchlineClassName = 'text-stone-950 font-black text-lg sm:text-xl tracking-tight leading-tight',
  pillClassName = 'inline-flex items-center gap-1 text-[11px] sm:text-xs font-black text-[#8B1E1E] bg-red-50 border border-red-200/80 px-2.5 py-0.5 rounded-full shadow-2xs whitespace-nowrap',
}) => {
  if (!text) return null;

  // 1. Caso con Due Punti ':' (es. "Non è la Moda a Fare la Pizza: È il Sapore. (Idratazione Estrema al 90%)")
  if (text.includes(':')) {
    const [rawHook, ...rest] = text.split(':');
    const afterColon = rest.join(':').trim();

    // Controlla se la seconda parte ha parentesi finali '(note)'
    const parenMatch = afterColon.match(/^(.*?)\s*\((.*?)\)$/);
    if (parenMatch) {
      const punchline = parenMatch[1].trim();
      const note = parenMatch[2].trim();
      return (
        <div className={`space-y-1.5 ${className}`}>
          <p className={hookClassName}>{rawHook.trim()}:</p>
          <p className={punchlineClassName}>{punchline}</p>
          <div className="pt-0.5">
            <span className={pillClassName}>
              <span>{note}</span>
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className={`space-y-1 ${className}`}>
        <p className={hookClassName}>{rawHook.trim()}:</p>
        <p className={punchlineClassName}>{afterColon}</p>
      </div>
    );
  }

  // 2. Caso senza due punti ma con parentesi finali (es. "90% di Idratazione Estrema (900g d'Acqua per kg di Farina)")
  const parenMatch = text.match(/^(.*?)\s*\((.*?)\)$/);
  if (parenMatch) {
    const mainTitle = parenMatch[1].trim();
    const note = parenMatch[2].trim();
    return (
      <div className={`space-y-1 ${className}`}>
        <p className={punchlineClassName}>{mainTitle}</p>
        <div className="pt-0.5">
          <span className="inline-flex items-center gap-1 text-[10.5px] sm:text-[11px] font-bold text-stone-600 bg-stone-100 border border-stone-200/80 px-2 py-0.5 rounded-md shadow-2xs whitespace-nowrap">
            <span>({note})</span>
          </span>
        </div>
      </div>
    );
  }

  // 3. Titolo standard senza due punti né parentesi
  return (
    <h2 className={`${punchlineClassName} ${className}`}>
      {text}
    </h2>
  );
};
