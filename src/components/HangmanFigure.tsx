import { useMemo } from 'react';
import React from 'react';
import { useAccent } from '../hooks/useWaveAccent';
import { getAccentColorValues } from '../utils/gameConstants';

const HangmanFigureInner = ({ mistakes, maxMistakes, isLost }: { mistakes: number, maxMistakes: number, isLost: boolean }) => {
  const { wave } = useAccent();
  
  const { strokeColor, shadowFilter, poleStrokeColor, poleShadow } = useMemo(() => {
    const colorValues = getAccentColorValues(wave.color);
    const isRed = wave.color === 'RED';
    
    let stroke = '';
    let shadow = '';
    let poleStroke = '';
    let poleShdw = '';
    
    if (isLost) {
      if (isRed) {
        stroke = '#f97316';
        shadow = '0 0 12px rgba(249, 115, 22, 0.8)';
      } else {
        stroke = '#ef4444';
        shadow = '0 0 12px rgba(244, 63, 94, 0.8)';
      }
    } else {
      if (isRed) {
        stroke = '#f97316';
        shadow = '0 0 15px rgba(249, 115, 22, 0.8)';
      } else {
        stroke = colorValues.stroke;
        shadow = colorValues.shadow;
      }
    }
    
    if (isRed) {
      poleStroke = '#f97316';
      poleShdw = '0 0 8px rgba(249, 115, 22, 0.7)';
    } else {
      poleStroke = colorValues.stroke;
      poleShdw = colorValues.shadow.replace('15px', '8px');
    }
    
    return { strokeColor: stroke, shadowFilter: shadow, poleStrokeColor: poleStroke, poleShadow: poleShdw };
  }, [wave.color, isLost]);

  const drawnStages = mistakes > 0 ? Math.ceil((mistakes / maxMistakes) * 6) : 0;

  return (
    <svg 
      height="280" 
      width="280" 
      style={{ filter: `drop-shadow(${shadowFilter})` }}
      stroke={strokeColor}
      strokeWidth="5"
      fill="transparent"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Base & Pole */}
      <line x1="20" y1="260" x2="160" y2="260" stroke={poleStrokeColor} strokeWidth="5" style={{ filter: `drop-shadow(${poleShadow})` }} />
      <line x1="90" y1="260" x2="90" y2="20" stroke={poleStrokeColor} strokeWidth="5" style={{ filter: `drop-shadow(${poleShadow})` }} />
      <line x1="90" y1="20" x2="220" y2="20" stroke={poleStrokeColor} strokeWidth="5" style={{ filter: `drop-shadow(${poleShadow})` }} />
      <line x1="220" y1="20" x2="220" y2="50" stroke={poleStrokeColor} strokeWidth="5" style={{ filter: `drop-shadow(${poleShadow})` }} />
      <line x1="90" y1="60" x2="130" y2="20" stroke={poleStrokeColor} strokeWidth="3" style={{ filter: `drop-shadow(${poleShadow})` }} />
      
      {/* Head */}
      {drawnStages >= 1 && <circle cx="220" cy="80" r="25" className="animate-draw" style={{ '--path-length': '157' } as React.CSSProperties} />}
      {/* Body */}
      {drawnStages >= 2 && <line x1="220" y1="105" x2="220" y2="175" className="animate-draw" style={{ '--path-length': '70' } as React.CSSProperties} />}
      {/* Left Arm */}
      {drawnStages >= 3 && <line x1="220" y1="125" x2="180" y2="165" className="animate-draw" style={{ '--path-length': '57' } as React.CSSProperties} />}
      {/* Right Arm */}
      {drawnStages >= 4 && <line x1="220" y1="125" x2="260" y2="165" className="animate-draw" style={{ '--path-length': '57' } as React.CSSProperties} />}
      {/* Left Leg */}
      {drawnStages >= 5 && <line x1="220" y1="175" x2="190" y2="230" className="animate-draw" style={{ '--path-length': '62' } as React.CSSProperties} />}
      {/* Right Leg */}
      {drawnStages >= 6 && <line x1="220" y1="175" x2="250" y2="230" className="animate-draw" style={{ '--path-length': '62' } as React.CSSProperties} />}

      {/* Dead eyes (if lost) */}
      {isLost && (
        <>
          <line x1="210" y1="72" x2="216" y2="78" strokeWidth="3" />
          <line x1="216" y1="72" x2="210" y2="78" strokeWidth="3" />
          <line x1="224" y1="72" x2="230" y2="78" strokeWidth="3" />
          <line x1="230" y1="72" x2="224" y2="78" strokeWidth="3" />
        </>
      )}
    </svg>
  );
};

// Only re-render when mistakes count, maxMistakes, or isLost actually change
export const HangmanFigure = React.memo(HangmanFigureInner);
