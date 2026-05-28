export const noiseVertex = /* glsl */ `
  varying vec2  vUv;
  uniform float uTime;
  uniform vec2  uMouse;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const noiseFragment = /* glsl */ `
  varying vec2  vUv;
  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uHover;

  float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
  }

  // Smooth interpolated noise — has spatial structure so it visibly moves
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  void main() {
    // Snap time so grain flickers at ~12 fps
    float t = floor(uTime * 12.0);

    // Grain layer — scale up UV on hover for smaller, finer particles
    float scale1 = mix(800.0, 2000.0, uHover);
    float scale2 = mix(200.0,  600.0, uHover);
    float g1 = rand(vUv * scale1 + t * 1.7);
    float g2 = rand(vUv * scale2 + t * 0.9);
    float grain = g1 * 0.65 + g2 * 0.35;

    // Smooth noise cloud shifted by mouse
    vec2 mouseUV = vUv * 2.5 + uMouse * 0.8;
    float cloud = smoothNoise(mouseUV)
                + 0.5 * smoothNoise(mouseUV * 2.1)
                + 0.25 * smoothNoise(mouseUV * 4.3);
    cloud /= 1.75;
    cloud = smoothstep(0.3, 0.75, cloud);

    // Grain density controlled by the moving cloud
    float power      = mix(0.85, 0.45, uHover);
    float brightness = mix(0.55, 0.80, uHover);
    float col = pow(grain, power) * cloud * brightness;

    // Very subtle horizontal scan-line bands
    col *= 0.96 + 0.04 * sin(vUv.y * 600.0);

    // Soft vignette
    vec2  uv  = vUv - 0.5;
    float vig = 1.0 - dot(uv, uv) * 1.4;
    col *= clamp(vig, 0.0, 1.0);

    gl_FragColor = vec4(vec3(col), 1.0);
  }
`
