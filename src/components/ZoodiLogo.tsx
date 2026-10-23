import React from 'react';

interface ZoodiLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  lightMode?: boolean; // When on dark backgrounds (e.g. Navy admin bars)
  className?: string;
  variant?: 'full' | 'emblem' | 'horizontal';
}

export const ZoodiLogo: React.FC<ZoodiLogoProps> = ({
  size = 'md',
  showTagline = true,
  lightMode = false,
  className = '',
  variant = 'horizontal',
}) => {
  // Proportional sizing presets for headers, cards, and modal hero
  const dimensions = {
    xs: { emblemSize: 24, textHeight: 20 },
    sm: { emblemSize: 32, textHeight: 26 },
    md: { emblemSize: 38, textHeight: 32 },
    lg: { emblemSize: 60, textHeight: 48 },
    xl: { emblemSize: 88, textHeight: 68 },
  }[size];

  const navyColor = lightMode ? '#FFFFFF' : '#192E4D';
  const taglineColor = lightMode ? '#5EEAD4' : '#08A9A2';

  // SVG Emblem Mark (The stylized geometric 'Z')
  const Emblem = ({ width = dimensions.emblemSize, height = dimensions.emblemSize }: { width?: number; height?: number }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 350 350"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-2xs select-none"
      aria-hidden="true"
    >
      <defs>
        <mask id="teal-cutout-mask">
          <rect width="350" height="350" fill="white" />
          {/* Clearance cutout around top-right yellow circle */}
          <circle cx="265" cy="85" r="38" fill="black" />
        </mask>
      </defs>

      {/* Top-Right Navy Circles */}
      <circle cx="295" cy="38" r="17" fill={lightMode ? '#5EEAD4' : '#192E4D'} />
      <circle cx="275" cy="14" r="8" fill={lightMode ? '#5EEAD4' : '#192E4D'} />

      {/* Top Golden Yellow Horizontal Capsule */}
      <rect x="96" y="24" width="94" height="64" rx="32" fill="#FFA700" />

      {/* Top-Right Yellow Circle */}
      <circle cx="265" cy="85" r="30" fill="#FFA700" />

      {/* Central Teal Diagonal of Z with cutout around yellow circle */}
      <path
        d="M 202 24 L 284 24 L 284 52 L 148 212 L 82 212 L 82 190 Z"
        fill="#08A9A2"
        mask="url(#teal-cutout-mask)"
      />

      {/* Top-Left Floating Bubble Dots */}
      <circle cx="78" cy="48" r="14" fill="#08A9A2" />
      <circle cx="56" cy="68" r="7.5" fill="#FFA700" />
      <circle cx="62" cy="100" r="11" fill="#F56645" />
      <circle cx="84" cy="84" r="8" fill="#F20D58" />

      {/* Mid-Left Magenta/Hot Pink Rounded Block */}
      <rect x="50" y="114" width="90" height="82" rx="18" fill="#F20D58" />

      {/* Bottom-Left Coral Orange Dome */}
      <path
        d="M 52 270 L 140 270 C 140 220 120 208 92 208 C 66 208 52 228 52 250 Z"
        fill="#F56645"
      />

      {/* Bottom Center Navy Petal */}
      <path
        d="M 148 270 C 148 232 170 210 200 210 C 200 248 180 270 148 270 Z"
        fill={lightMode ? '#5EEAD4' : '#192E4D'}
      />

      {/* Bottom-Right Magenta/Pink Leaf */}
      <path
        d="M 206 270 C 206 210 246 182 306 182 C 306 242 270 270 206 270 Z"
        fill="#F20D58"
      />
    </svg>
  );

  // Vector Wordmark: ZOODI (width: 368) and COLLECTION (exact matching length 368)
  const TextLockup = ({ height = dimensions.textHeight }: { height?: number }) => {
    const viewBoxWidth = 368;
    const viewBoxHeight = showTagline ? 104 : 68;
    const computedWidth = Math.round(height * (viewBoxWidth / viewBoxHeight));

    return (
      <svg
        width={computedWidth}
        height={height}
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 select-none overflow-visible"
        aria-label="ZOODI COLLECTION"
      >
        {/* ZOODI Wordmark (Exact Vector Glyphs, width 0 to 368) */}
        <g id="zoodi-letters">
          {/* Z (Teal) */}
          <path d="M 0 0 L 56 0 L 56 15 L 20 53 L 58 53 L 58 68 L 0 68 L 0 53 L 36 15 L 0 15 Z" fill="#08A9A2" />

          {/* O (Golden Yellow) */}
          <path
            fillRule="evenodd"
            d="M 112 0 C 135.2 0 152 15.2 152 34 C 152 52.8 135.2 68 112 68 C 88.8 68 72 52.8 72 34 C 72 15.2 88.8 0 112 0 Z M 112 18 C 101.5 18 92.5 25.2 92.5 34 C 92.5 42.8 101.5 50 112 50 C 122.5 50 131.5 42.8 131.5 34 C 131.5 25.2 122.5 18 112 18 Z"
            fill="#FFA700"
          />

          {/* O (Coral Orange) */}
          <path
            fillRule="evenodd"
            d="M 204 0 C 227.2 0 244 15.2 244 34 C 244 52.8 227.2 68 204 68 C 180.8 68 164 52.8 164 34 C 164 15.2 180.8 0 204 0 Z M 204 18 C 193.5 18 184.5 25.2 184.5 34 C 184.5 42.8 193.5 50 204 50 C 214.5 50 223.5 42.8 223.5 34 C 223.5 25.2 214.5 18 204 18 Z"
            fill="#F56645"
          />

          {/* D (Magenta Pink) */}
          <path
            fillRule="evenodd"
            d="M 260 0 L 298 0 C 322 0 338 14 338 34 C 338 54 322 68 298 68 L 260 68 Z M 279 17 L 279 51 L 296 51 C 310 51 318 43.5 318 34 C 318 24.5 310 17 296 17 Z"
            fill="#F20D58"
          />

          {/* I (Dark Navy or White in lightMode) */}
          <rect x="350" y="0" width="18" height="68" rx="2" fill={navyColor} />
        </g>

        {/* COLLECTION Sub-line: Starts at x=0, ends at x=368, EXACT MATCHING LENGTH WITH ZOODI */}
        {showTagline && (
          <text
            x="0"
            y="96"
            textLength="368"
            lengthAdjust="spacing"
            fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
            fontSize="22"
            fontWeight="700"
            letterSpacing="0.22em"
            fill={taglineColor}
          >
            COLLECTION
          </text>
        )}
      </svg>
    );
  };

  // If emblem-only variant is requested
  if (variant === 'emblem') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <Emblem />
      </div>
    );
  }

  // If full vertical lockup (e.g. Admin login screen hero)
  if (variant === 'full' || size === 'lg' || size === 'xl') {
    return (
      <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
        <Emblem width={dimensions.emblemSize} height={dimensions.emblemSize} />
        <div className="mt-3">
          <TextLockup height={Math.round(dimensions.textHeight * 1.15)} />
        </div>
      </div>
    );
  }

  // Standard Header Horizontal Lockup (Default for customer header and admin top bar)
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Emblem Icon */}
      <Emblem width={dimensions.emblemSize} height={dimensions.emblemSize} />

      {/* Brand Text Stack (ZOODI and COLLECTION aligned to identical length) */}
      <TextLockup height={dimensions.textHeight} />
    </div>
  );
};
