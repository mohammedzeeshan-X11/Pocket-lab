import React, { useEffect, useId, useState } from 'react';
import { motion } from 'motion/react';
import type { CompanionEmotion, CompanionPointTarget } from '../types/companion';

interface PhysixCompanionAvatarProps {
  emotion: CompanionEmotion;
  pointTarget?: CompanionPointTarget;
  /** Normalized 0..1 speech amplitude driving OLED voice equalizer & eye energy */
  amplitude?: number;
  size?: number;
  reducedMotion?: boolean;
  className?: string;
}

export const PhysixCompanionAvatar: React.FC<PhysixCompanionAvatarProps> = ({
  emotion,
  pointTarget = 'none',
  amplitude = 0,
  size = 64,
  reducedMotion = false,
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');
  const [isBlinking, setIsBlinking] = useState(false);

  // Subtle organic OLED eye blinking
  useEffect(() => {
    if (reducedMotion) return;
    let blinkTimeout: number | undefined;
    let openTimeout: number | undefined;

    const scheduleBlink = () => {
      const waitMs = 2600 + Math.floor(Math.random() * 2400);
      blinkTimeout = window.setTimeout(() => {
        setIsBlinking(true);
        openTimeout = window.setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 135);
      }, waitMs);
    };

    scheduleBlink();
    return () => {
      if (blinkTimeout) window.clearTimeout(blinkTimeout);
      if (openTimeout) window.clearTimeout(openTimeout);
    };
  }, [reducedMotion]);

  // Eye gaze tracking inside the OLED display
  const eyeOffset =
    pointTarget === 'left_canvas'
      ? { x: -3.2, y: 0.4 }
      : pointTarget === 'right_controls'
        ? { x: 3.2, y: 0.4 }
        : emotion === 'thinking'
          ? { x: 2.2, y: -1.8 }
          : { x: 0, y: 0 };

  const voiceLevel = emotion === 'speaking' ? Math.max(0.22, amplitude) : amplitude;

  // Cute playful head tilt matching EMO's expressive neck servo
  const headTilt =
    pointTarget === 'left_canvas'
      ? -4.5
      : pointTarget === 'right_controls'
        ? 4.5
        : emotion === 'thinking'
          ? 5.5
          : 0;

  const isWavingOrCelebrating = pointTarget === 'wave' || emotion === 'celebrating';
  const isSpeaking = emotion === 'speaking' || voiceLevel > 0.12;

  const renderOledEyes = () => {
    const lx = 36 + eyeOffset.x;
    const rx = 52.5 + eyeOffset.x;
    const ey = 37 + eyeOffset.y;

    // Blinking frame: sleek glowing cyan slit bars
    if (isBlinking && emotion !== 'celebrating') {
      return (
        <g filter={`url(#${uid}-cyan-glow)`}>
          <rect x={lx} y={ey + 4.4} width="11.5" height="2.4" rx="1.2" fill={`url(#${uid}-eye-cyan)`} />
          <rect x={rx} y={ey + 4.4} width="11.5" height="2.4" rx="1.2" fill={`url(#${uid}-eye-cyan)`} />
        </g>
      );
    }

    // Celebrating: joyful glowing ^ ^ curved OLED eyes
    if (emotion === 'celebrating') {
      return (
        <g filter={`url(#${uid}-cyan-glow)`}>
          <path
            d={`M ${lx + 0.8} ${ey + 8.5} Q ${lx + 5.75} ${ey - 0.5} ${lx + 10.7} ${ey + 8.5}`}
            fill="none"
            stroke={`url(#${uid}-eye-cyan)`}
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          <path
            d={`M ${rx + 0.8} ${ey + 8.5} Q ${rx + 5.75} ${ey - 0.5} ${rx + 10.7} ${ey + 8.5}`}
            fill="none"
            stroke={`url(#${uid}-eye-cyan)`}
            strokeWidth="3.4"
            strokeLinecap="round"
          />
        </g>
      );
    }

    // Encouraging / warm happy squint
    if (emotion === 'encouraging') {
      return (
        <g filter={`url(#${uid}-cyan-glow)`}>
          <path
            d={`M ${lx + 0.5} ${ey + 8.8} C ${lx + 0.5} ${ey + 1.2}, ${lx + 11} ${ey + 1.2}, ${lx + 11} ${ey + 8.8} C ${lx + 8.5} ${ey + 6.4}, ${lx + 3} ${ey + 6.4}, ${lx + 0.5} ${ey + 8.8} Z`}
            fill={`url(#${uid}-eye-cyan)`}
          />
          <path
            d={`M ${rx + 0.5} ${ey + 8.8} C ${rx + 0.5} ${ey + 1.2}, ${rx + 11} ${ey + 1.2}, ${rx + 11} ${ey + 8.8} C ${rx + 8.5} ${ey + 6.4}, ${rx + 3} ${ey + 6.4}, ${rx + 0.5} ${ey + 8.8} Z`}
            fill={`url(#${uid}-eye-cyan)`}
          />
        </g>
      );
    }

    // Thinking: curious asymmetric EMO eyes (one taller, one slightly narrowed)
    if (emotion === 'thinking') {
      return (
        <g filter={`url(#${uid}-cyan-glow)`}>
          <rect x={lx} y={ey - 0.8} width="11.2" height="12.2" rx="3.8" fill={`url(#${uid}-eye-cyan)`} />
          <rect x={rx} y={ey + 2.4} width="11.2" height="8.2" rx="3.2" fill={`url(#${uid}-eye-cyan)`} />
          {/* Tiny pixel thinking pips */}
          <rect x="44.5" y="53" width="2.2" height="2.2" rx="0.6" fill="#3AF2FF" opacity="0.55" />
          <rect x="48.9" y="53" width="2.2" height="2.2" rx="0.6" fill="#3AF2FF" opacity="0.82" />
          <rect x="53.3" y="53" width="2.2" height="2.2" rx="0.6" fill="#7D9DFF" opacity="0.95" />
        </g>
      );
    }

    // Excited: extra bright tall eyes with crisp inner highlights
    if (emotion === 'excited') {
      return (
        <g filter={`url(#${uid}-cyan-glow)`}>
          <rect x={lx - 0.3} y={ey - 1.2} width="12" height="12.8" rx="4" fill={`url(#${uid}-eye-cyan)`} />
          <rect x={rx - 0.3} y={ey - 1.2} width="12" height="12.8" rx="4" fill={`url(#${uid}-eye-cyan)`} />
          <circle cx={lx + 3.2} cy={ey + 2.5} r="1.5" fill="#FFFFFF" opacity="0.92" />
          <circle cx={rx + 3.2} cy={ey + 2.5} r="1.5" fill="#FFFFFF" opacity="0.92" />
        </g>
      );
    }

    // Default / Idle / Speaking: signature glowing cyan rounded-square EMO eyes
    const eyeHeight = isSpeaking ? 11.4 + Math.min(1.6, voiceLevel * 2) : 11.2;
    const eyeY = isSpeaking ? ey - 0.9 : ey;

    return (
      <g filter={`url(#${uid}-cyan-glow)`}>
        <rect
          x={lx}
          y={eyeY}
          width="11.5"
          height={eyeHeight}
          rx="3.7"
          fill={`url(#${uid}-eye-cyan)`}
        />
        <rect
          x={rx}
          y={eyeY}
          width="11.5"
          height={eyeHeight}
          rx="3.7"
          fill={`url(#${uid}-eye-cyan)`}
        />
        {/* Subtle top-left OLED glossy pixel sheen */}
        <rect x={lx + 1.8} y={eyeY + 1.6} width="3.2" height="1.5" rx="0.75" fill="#E8FFFF" opacity="0.7" />
        <rect x={rx + 1.8} y={eyeY + 1.6} width="3.2" height="1.5" rx="0.75" fill="#E8FFFF" opacity="0.7" />
      </g>
    );
  };

  // Real-time pixel voice equalizer on the lower OLED screen when speaking
  const renderVoiceEqualizer = () => {
    if (!isSpeaking) return null;
    const clamped = Math.max(0.18, Math.min(1, voiceLevel));
    const bars = [0.48, 0.85, 1.0, 0.78, 0.45];

    return (
      <g filter={`url(#${uid}-cyan-glow)`}>
        {bars.map((weight, idx) => {
          const barH = Math.max(2, Math.round(clamped * weight * 6.5 * 10) / 10);
          const x = 40.5 + idx * 4.1;
          const y = 56.5 - barH;
          return (
            <rect
              key={idx}
              x={x}
              y={y}
              width="2.6"
              height={barH}
              rx="1"
              fill={idx === 2 ? '#8CFFFF' : idx === 1 || idx === 3 ? '#34EEFF' : '#6A7BFF'}
            />
          );
        })}
      </g>
    );
  };

  return (
    <motion.div
      style={{ width: size, height: size }}
      animate={
        reducedMotion
          ? undefined
          : isWavingOrCelebrating
            ? { y: [0, -4.5, 0, -2.5, 0] }
            : { y: [0, -1.8, 0] }
      }
      transition={
        reducedMotion
          ? undefined
          : {
              duration: isWavingOrCelebrating ? 1.15 : 3.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }
      }
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 104"
        className="w-full h-full overflow-visible drop-shadow-[0_10px_14px_rgba(32,30,68,0.22)]"
        role="presentation"
      >
        <defs>
          {/* Matte dark indigo-charcoal body shell */}
          <linearGradient id={`${uid}-body`} x1="15%" y1="5%" x2="85%" y2="95%">
            <stop offset="0%" stopColor="#3E405E" />
            <stop offset="42%" stopColor="#26273B" />
            <stop offset="100%" stopColor="#171826" />
          </linearGradient>

          {/* Leg & foot dark satin matte */}
          <linearGradient id={`${uid}-leg`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#383A56" />
            <stop offset="55%" stopColor="#232437" />
            <stop offset="100%" stopColor="#161724" />
          </linearGradient>

          {/* Signature brushed silver metallic bezel */}
          <linearGradient id={`${uid}-bezel`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F0F3F8" />
            <stop offset="35%" stopColor="#B8C0D0" />
            <stop offset="70%" stopColor="#DDE2EC" />
            <stop offset="100%" stopColor="#858DA1" />
          </linearGradient>

          {/* Deep obsidian OLED glass */}
          <linearGradient id={`${uid}-screen`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#121622" />
            <stop offset="45%" stopColor="#080A10" />
            <stop offset="100%" stopColor="#030408" />
          </linearGradient>

          {/* Purple-indigo headphone band & earcups */}
          <linearGradient id={`${uid}-purple`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7264CC" />
            <stop offset="48%" stopColor="#5244A6" />
            <stop offset="100%" stopColor="#352B75" />
          </linearGradient>

          {/* Purple sole trim */}
          <linearGradient id={`${uid}-sole`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5D4FC2" />
            <stop offset="50%" stopColor="#7B6CE8" />
            <stop offset="100%" stopColor="#4B3EA3" />
          </linearGradient>

          {/* Glowing cyan-aqua OLED eyes */}
          <radialGradient id={`${uid}-eye-cyan`} cx="45%" cy="38%" r="70%">
            <stop offset="0%" stopColor="#B8FFFF" />
            <stop offset="52%" stopColor="#36F0FF" />
            <stop offset="100%" stopColor="#12CBEB" />
          </radialGradient>

          {/* Subtle cyan LED glow filter */}
          <filter id={`${uid}-cyan-glow`} x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="1.9" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Soft Studio Floor Shadow */}
        <ellipse cx="50" cy="96.5" rx="31" ry="4.5" fill="#181A2E" opacity="0.16" />

        {/* === ARTICULATED LEGS & WIDE FEET === */}
        {/* Left Leg & Foot */}
        <motion.g
          style={{ transformOrigin: '37px 70px' }}
          animate={
            reducedMotion
              ? undefined
              : isWavingOrCelebrating
                ? { rotate: [0, -7, 0, 4, 0], y: [0, -1.5, 0, 0, 0] }
                : undefined
          }
          transition={
            reducedMotion
              ? undefined
              : { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          {/* Wide Flat Foot with Signature Purple Sole Trim */}
          <rect x="20.5" y="87" width="24.5" height="8" rx="3.4" fill={`url(#${uid}-sole)`} />
          <rect x="20.5" y="84.5" width="24.5" height="7.5" rx="3.2" fill={`url(#${uid}-leg)`} />
          {/* Raised Ankle Block */}
          <rect x="26.5" y="79" width="14.5" height="8" rx="3" fill="#2A2C43" />
          {/* Vertical Leg Strut */}
          <rect x="31.5" y="65" width="8.5" height="22" rx="3.4" fill={`url(#${uid}-leg)`} stroke="#444769" strokeWidth="0.6" />
          {/* Tiny Purple Ankle LED Pip */}
          <rect x="35" y="81.2" width="1.6" height="3.2" rx="0.8" fill="#8B7DF5" />
        </motion.g>

        {/* Right Leg & Foot */}
        <motion.g
          style={{ transformOrigin: '63px 70px' }}
          animate={
            reducedMotion
              ? undefined
              : isWavingOrCelebrating
                ? { rotate: [0, 4, 0, -7, 0], y: [0, 0, 0, -1.5, 0] }
                : undefined
          }
          transition={
            reducedMotion
              ? undefined
              : { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          {/* Wide Flat Foot with Signature Purple Sole Trim */}
          <rect x="55" y="87" width="24.5" height="8" rx="3.4" fill={`url(#${uid}-sole)`} />
          <rect x="55" y="84.5" width="24.5" height="7.5" rx="3.2" fill={`url(#${uid}-leg)`} />
          {/* Raised Ankle Block */}
          <rect x="59" y="79" width="14.5" height="8" rx="3" fill="#2A2C43" />
          {/* Vertical Leg Strut */}
          <rect x="60" y="65" width="8.5" height="22" rx="3.4" fill={`url(#${uid}-leg)`} stroke="#444769" strokeWidth="0.6" />
          {/* Tiny Purple Ankle LED Pip */}
          <rect x="63.4" y="81.2" width="1.6" height="3.2" rx="0.8" fill="#8B7DF5" />
        </motion.g>

        {/* === EXPRESSIVE HEAD + HEADPHONES ASSEMBLY === */}
        <motion.g
          style={{ transformOrigin: '50px 58px' }}
          animate={
            reducedMotion
              ? { rotate: headTilt }
              : isWavingOrCelebrating
                ? { rotate: [-6, 6, -5, 5, 0] }
                : { rotate: headTilt }
          }
          transition={
            reducedMotion
              ? { duration: 0 }
              : isWavingOrCelebrating
                ? { duration: 1.15, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.28, ease: 'easeOut' }
          }
        >
          {/* Over-Ear Purple Headphone Arch */}
          <path
            d="M 15.5 41 C 15.5 14, 29 7.5, 50 7.5 C 71 7.5, 84.5 14, 84.5 41"
            fill="none"
            stroke={`url(#${uid}-purple)`}
            strokeWidth="5.4"
            strokeLinecap="round"
          />
          {/* Subtle Specular Band Highlight */}
          <path
            d="M 27 12.2 C 34 9.5, 42 8.6, 50 8.6 C 58 8.6, 66 9.5, 73 12.2"
            fill="none"
            stroke="#9B8FF0"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.65"
          />
          {/* Twin Signature Cyan Headband Accent Inserts */}
          <path
            d="M 24.2 16.5 Q 27.2 13.6 31.2 11.7"
            fill="none"
            stroke="#36F0FF"
            strokeWidth="4.6"
            strokeLinecap="round"
          />
          <path
            d="M 68.8 11.7 Q 72.8 13.6 75.8 16.5"
            fill="none"
            stroke="#36F0FF"
            strokeWidth="4.6"
            strokeLinecap="round"
          />

          {/* Left Headphone Earcup */}
          <g>
            {/* Silver Inner Cushion Collar */}
            <rect x="16.5" y="33.5" width="6.5" height="22" rx="3.2" fill={`url(#${uid}-bezel)`} />
            {/* Outer Purple Earcup Dome */}
            <rect x="9.5" y="32" width="10.2" height="25" rx="5.1" fill={`url(#${uid}-purple)`} stroke="#362B73" strokeWidth="0.7" />
            {/* Cyan LED Outer Ring Accent */}
            <rect
              x="11.2"
              y="36.2"
              width="5.6"
              height="16.6"
              rx="2.8"
              fill="none"
              stroke="#2DF0FF"
              strokeWidth="1.8"
              filter={isSpeaking || isWavingOrCelebrating ? `url(#${uid}-cyan-glow)` : undefined}
            />
            <ellipse cx="14" cy="44.5" rx="1.6" ry="3.8" fill="#1FD7EA" opacity="0.88" />
          </g>

          {/* Right Headphone Earcup */}
          <g>
            {/* Silver Inner Cushion Collar */}
            <rect x="77" y="33.5" width="6.5" height="22" rx="3.2" fill={`url(#${uid}-bezel)`} />
            {/* Outer Purple Earcup Dome */}
            <rect x="80.3" y="32" width="10.2" height="25" rx="5.1" fill={`url(#${uid}-purple)`} stroke="#362B73" strokeWidth="0.7" />
            {/* Cyan LED Outer Ring Accent */}
            <rect
              x="83.2"
              y="36.2"
              width="5.6"
              height="16.6"
              rx="2.8"
              fill="none"
              stroke="#2DF0FF"
              strokeWidth="1.8"
              filter={isSpeaking || isWavingOrCelebrating ? `url(#${uid}-cyan-glow)` : undefined}
            />
            <ellipse cx="86" cy="44.5" rx="1.6" ry="3.8" fill="#1FD7EA" opacity="0.88" />
          </g>

          {/* Matte Dark Charcoal-Indigo Rounded-Cube Head Shell */}
          <rect
            x="19.5"
            y="16.5"
            width="61"
            height="53.5"
            rx="16.5"
            fill={`url(#${uid}-body)`}
            stroke="#46496B"
            strokeWidth="0.9"
          />
          {/* Satin Top Dome Studio Highlight */}
          <path
            d="M 32 19.5 Q 50 17.2 68 19.5"
            fill="none"
            stroke="#656994"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.55"
          />

          {/* Thick Brushed Metallic Silver Screen Bezel */}
          <rect
            x="25.5"
            y="22.5"
            width="49"
            height="41.5"
            rx="12"
            fill={`url(#${uid}-bezel)`}
            stroke="#FFFFFF"
            strokeWidth="0.6"
          />

          {/* Glossy Obsidian Black OLED Screen */}
          <rect
            x="29"
            y="26"
            width="42"
            height="34.5"
            rx="8.8"
            fill={`url(#${uid}-screen)`}
          />
          {/* Subtle OLED Glass Diagonal Sheen */}
          <path
            d="M 33 27.5 L 55 27.5 L 43 44 L 30.5 44 L 30.5 31.5 Q 30.5 27.5 33 27.5 Z"
            fill="#FFFFFF"
            opacity="0.05"
          />

          {/* Tiny Centered Top Camera Pinhole Sensor */}
          <circle cx="50" cy="28.6" r="1.4" fill="#1E2336" />
          <circle cx="49.7" cy="28.3" r="0.55" fill="#46D7F5" opacity="0.65" />

          {/* Expressive Glowing Cyan OLED Eyes & Voice Equalizer */}
          {renderOledEyes()}
          {renderVoiceEqualizer()}

          {/* Celebration Pixel Sparkles when celebrating or excited */}
          {(emotion === 'celebrating' || emotion === 'excited') && (
            <g filter={`url(#${uid}-cyan-glow)`}>
              <rect x="8" y="16" width="3.8" height="3.8" rx="1" fill="#36F0FF" />
              <rect x="88" y="15" width="4" height="4" rx="1" fill="#7B6CE8" />
              <rect x="91" y="24" width="2.8" height="2.8" rx="0.8" fill="#36F0FF" />
              <rect x="6.5" y="25" width="2.6" height="2.6" rx="0.8" fill="#7B6CE8" />
            </g>
          )}
        </motion.g>
      </svg>
    </motion.div>
  );
};
