import{j as H}from"./index-BAFUPdcy.js";import{a as E}from"./vendor-BPWfBN2A.js";import{W as U,S,P as V,a as b,c as L,V as a,M as N}from"./three-CXEGLoh5.js";import"./animations-iKlWqJlF.js";const z=`
  varying vec2  vUv;
  uniform float uTime;
  uniform vec2  uMouse;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,P=`
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
`;function j(){const c=E.useRef(null);return E.useEffect(()=>{const t=c.current,u=t.clientWidth,l=t.clientHeight,o=new U({antialias:!0,alpha:!1});o.setPixelRatio(Math.min(window.devicePixelRatio,1.5)),o.setSize(u,l),o.setClearColor(263172),t.appendChild(o.domElement);const v=new S,i=new V(60,u/l,.1,100);i.position.z=1.5;const m=new b(4,3,120,90),n={uTime:{value:0},uMouse:{value:new a(0,0)},uHover:{value:0}},d=new L({vertexShader:z,fragmentShader:P,uniforms:n});v.add(new N(m,d));const s=new a,f=e=>{s.x=e.clientX/window.innerWidth*2-1,s.y=-(e.clientY/window.innerHeight)*2+1};window.addEventListener("mousemove",f);let r=0;const h=e=>{e.target.tagName==="IMG"&&(r=1)},p=e=>{e.target.tagName==="IMG"&&(r=0)};document.addEventListener("mouseover",h),document.addEventListener("mouseout",p);const g=new a;let w=0;const x=()=>{w=requestAnimationFrame(x),n.uTime.value+=.016,g.lerp(s,.018),n.uMouse.value.copy(g),n.uHover.value+=(r-n.uHover.value)*.07,o.render(v,i)};x();const M=()=>{const e=t.clientWidth,y=t.clientHeight;o.setSize(e,y),i.aspect=e/y,i.updateProjectionMatrix()};return window.addEventListener("resize",M),()=>{cancelAnimationFrame(w),window.removeEventListener("mousemove",f),window.removeEventListener("resize",M),document.removeEventListener("mouseover",h),document.removeEventListener("mouseout",p),m.dispose(),d.dispose(),o.dispose(),t.removeChild(o.domElement)}},[]),H.jsx("div",{ref:c,className:"absolute inset-0 w-full h-full"})}export{j as default};
