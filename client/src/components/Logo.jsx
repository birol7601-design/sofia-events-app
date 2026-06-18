export default function Logo({ size = 48, bob = false }) {
  const h  = Math.round(size * 1.15);
  const s  = size / 50;

  // Bee body (striped teardrop abdomen)
  const bw = Math.round(13 * s);
  const bh = Math.round(18 * s);
  const stripeH   = Math.max(1.5, Math.round(2.4 * s * 10) / 10);
  const stripeGap = Math.round(5 * s);

  // Wings
  const ww = Math.round(14 * s);
  const wh = Math.round(16 * s);

  // Bee container dimensions
  const wingBodyOverlapX = Math.round(3 * s);   // how far wings tuck behind body
  const wingBodyOverlapY = Math.round(5 * s);   // vertical overlap of wings and body top
  const beeW = (ww - wingBodyOverlapX) * 2 + bw;
  const beeH = wh + bh - wingBodyOverlapY;

  return (
    <div
      style={{
        display: 'inline-block',
        width: size,
        height: h,
        filter: 'drop-shadow(0 0 14px rgba(196,106,0,.55))',
        animation: bob ? 'bob 3.6s ease-in-out infinite' : undefined,
        flexShrink: 0,
      }}
    >
      {/* Glossy hex cell */}
      <div
        style={{
          width: size,
          height: h,
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          background: 'radial-gradient(120% 120% at 30% 22%, #FFF7C0 0%, #FFE45C 28%, #FFB800 58%, #D87A00 100%)',
          boxShadow: [
            'inset 0 5px 4px rgba(255,255,255,.92)',
            'inset 0 -22px 30px -10px rgba(122,61,0,.75)',
            'inset 0 0 0 2px rgba(255,247,192,.4)',
          ].join(', '),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Bee */}
        <div style={{ position: 'relative', width: beeW, height: beeH }}>

          {/* Left wing */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: ww,
              height: wh,
              borderRadius: '72% 50% 60% 40% / 82% 70% 40% 30%',
              background: 'radial-gradient(circle at 60% 35%, rgba(255,255,255,.95), rgba(255,255,255,.15) 75%)',
              transformOrigin: 'bottom right',
              animation: 'wing 2.2s ease-in-out infinite',
            }}
          />

          {/* Right wing */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: ww,
              height: wh,
              borderRadius: '50% 72% 40% 60% / 70% 82% 30% 40%',
              background: 'radial-gradient(circle at 40% 35%, rgba(255,255,255,.95), rgba(255,255,255,.15) 75%)',
              transformOrigin: 'bottom left',
              animation: 'wingR 2.2s ease-in-out infinite',
            }}
          />

          {/* Body (striped abdomen) */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: bw,
              height: bh,
              borderRadius: '48% 48% 50% 50% / 38% 38% 62% 62%',
              background: 'linear-gradient(160deg, #7A3D00, #2a1400)',
              overflow: 'hidden',
            }}
          >
            {/* Two #FFB800 stripes — stripe 1 is the div, stripe 2 via box-shadow */}
            <div
              style={{
                position: 'absolute',
                left: '8%',
                right: '8%',
                top: '26%',
                height: stripeH,
                background: '#FFB800',
                boxShadow: `0 ${stripeGap}px 0 #FFB800`,
                borderRadius: 1,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
