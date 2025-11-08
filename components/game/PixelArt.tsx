/**
 * Pixel art SVG components for the game
 * These are simple pixel-style representations
 */

// Desk with computer
export function DeskSVG() {
  return (
    <svg viewBox="0 0 200 100" className="w-full h-full pixel-art">
      {/* Desk surface */}
      <rect x="0" y="60" width="200" height="40" fill="#8B4513" />
      <rect x="0" y="60" width="200" height="8" fill="#A0522D" />
      
      {/* Computer/Monitor */}
      <rect x="80" y="25" width="40" height="35" fill="#2C3E50" />
      <rect x="85" y="30" width="30" height="25" fill="#3498DB" />
      <rect x="95" y="60" width="10" height="5" fill="#34495E" />
      <rect x="90" y="65" width="20" height="3" fill="#2C3E50" />
    </svg>
  );
}

// Notepad with hint indicator
export function NotepadSVG({ hasHint = false }: { hasHint?: boolean }) {
  return (
    <svg viewBox="0 0 40 50" className="w-full h-full pixel-art">
      {/* Notepad */}
      <rect x="5" y="5" width="30" height="40" fill="#FFF9C4" />
      <rect x="5" y="5" width="30" height="6" fill="#FBC02D" />
      
      {/* Lines on notepad */}
      <line x1="10" y1="18" x2="30" y2="18" stroke="#BDBDBD" strokeWidth="1" />
      <line x1="10" y1="24" x2="30" y2="24" stroke="#BDBDBD" strokeWidth="1" />
      <line x1="10" y1="30" x2="30" y2="30" stroke="#BDBDBD" strokeWidth="1" />
      
      {/* Hint indicator (glowing) */}
      {hasHint && (
        <>
          <circle cx="20" cy="38" r="5" fill="#FFD700" opacity="0.8" />
          <text x="20" y="42" fontSize="10" fill="#000" textAnchor="middle">!</text>
        </>
      )}
    </svg>
  );
}

// Simple patient sprite
export function PatientSprite({ color = '#FF6B6B', name = '' }: { color?: string; name?: string }) {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full pixel-art">
      {/* Head */}
      <rect x="20" y="12" width="24" height="24" fill={color} />
      <circle cx="26" cy="22" r="3" fill="#000" />
      <circle cx="38" cy="22" r="3" fill="#000" />
      <rect x="26" y="28" width="12" height="2" fill="#000" />
      
      {/* Body */}
      <rect x="16" y="36" width="32" height="20" fill={color} />
      
      {/* Arms */}
      <rect x="8" y="36" width="8" height="16" fill={color} />
      <rect x="48" y="36" width="8" height="16" fill={color} />
      
      {/* Name tag */}
      {name && (
        <text x="32" y="60" fontSize="6" fill="#000" textAnchor="middle">{name}</text>
      )}
    </svg>
  );
}

// Coffee cup decoration
export function CoffeeCupSVG() {
  return (
    <svg viewBox="0 0 30 35" className="w-full h-full pixel-art">
      {/* Cup */}
      <rect x="8" y="12" width="14" height="18" fill="#D2691E" />
      <rect x="9" y="13" width="12" height="14" fill="#6F4E37" />
      
      {/* Handle */}
      <path d="M 22 16 Q 26 20 22 24" stroke="#D2691E" strokeWidth="2" fill="none" />
      
      {/* Steam */}
      <path d="M 12 8 Q 14 4 12 2" stroke="#AAA" strokeWidth="1" fill="none" opacity="0.6" />
      <path d="M 18 8 Q 20 4 18 2" stroke="#AAA" strokeWidth="1" fill="none" opacity="0.6" />
    </svg>
  );
}

// Medical book
export function MedicalBookSVG() {
  return (
    <svg viewBox="0 0 40 50" className="w-full h-full pixel-art">
      <rect x="5" y="10" width="30" height="35" fill="#E74C3C" />
      <rect x="8" y="13" width="24" height="29" fill="#C0392B" />
      
      {/* Cross symbol */}
      <rect x="17" y="22" width="6" height="14" fill="#FFF" />
      <rect x="14" y="25" width="12" height="8" fill="#FFF" />
    </svg>
  );
}

// Waiting room chair
export function ChairSVG() {
  return (
    <svg viewBox="0 0 30 40" className="w-full h-full pixel-art">
      {/* Seat */}
      <rect x="5" y="20" width="20" height="8" fill="#7F8C8D" />
      
      {/* Backrest */}
      <rect x="5" y="10" width="4" height="15" fill="#7F8C8D" />
      
      {/* Legs */}
      <rect x="6" y="28" width="3" height="10" fill="#34495E" />
      <rect x="21" y="28" width="3" height="10" fill="#34495E" />
    </svg>
  );
}

