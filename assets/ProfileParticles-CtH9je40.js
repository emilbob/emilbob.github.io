import{j as g}from"./index-CIZNB3bF.js";import{a as d}from"./vendor-BPWfBN2A.js";import{W as X,O as Y,S as Z,B as $,F as p,c as tt,b as et,C as at}from"./three-CXEGLoh5.js";import{g as m}from"./animations-iKlWqJlF.js";const w=5,ot=`
  attribute vec3 aRandom;
  attribute float aBrightness;
  attribute float aImgAlpha;
  uniform float uHover;
  uniform float uPointSize;
  uniform float uTime;
  varying float vBrightness;
  varying float vAlpha;

  void main() {
    vBrightness = aBrightness;

    float h = clamp(uHover, 0.0, 1.0);
    float t = uTime;

    // ── Static scatter (radial, random direction per particle) ──────
    float twist = h * aRandom.z * 1.6;
    float cs = cos(twist);
    float sn = sin(twist);
    vec2 scatterDir = vec2(cs * aRandom.x - sn * aRandom.y,
                           sn * aRandom.x + cs * aRandom.y);
    vec2 scatter = scatterDir * h * 0.9;

    // ── Continuous drift (unique Lissajous path per particle) ───────
    float p1 = position.x * 8.0 + position.y * 11.0 + aRandom.z * 3.14;
    float p2 = position.y * 6.0 - position.x *  9.0 + aRandom.x * 2.5;
    float amp = (0.05 + abs(aRandom.x) * 0.07) * h;

    vec2 drift;
    drift.x = (sin(t * 1.1 + p1) * 0.55 + sin(t * 0.45 + p2       ) * 0.45) * amp;
    drift.y = (cos(t * 0.8 + p1 * 0.9) * 0.5 + cos(t * 1.25 + p2 * 1.1) * 0.5) * amp;

    // ── Gentle breathing when assembled ─────────────────────────────
    float breathe = sin(t * 1.3 + position.x * 9.0 + position.y * 7.0) * 0.003 * (1.0 - h);

    vec3 pos = position;
    pos.xy  += scatter + drift + breathe;

    vAlpha = aImgAlpha * (1.0 - h * 0.25);

    gl_Position  = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uPointSize * (1.0 + h * abs(aRandom.x) * 0.4);
  }
`,nt=`
  varying float vBrightness;
  varying float vAlpha;

  void main() {
    vec2  pc = gl_PointCoord - 0.5;
    float d  = length(pc);
    if (d > 0.5) discard;
    float soft = 1.0 - smoothstep(0.2, 0.5, d);
    gl_FragColor = vec4(vBrightness, vBrightness, vBrightness, vAlpha * soft);
  }
`;function lt({className:G}){const x=d.useRef(null),R=d.useRef(null),h=d.useRef(null);return d.useEffect(()=>{const a=x.current,O=R.current;let b=!0,y=0,n=null;const A=Math.min(window.devicePixelRatio,2),o=new X({canvas:O,antialias:!1,alpha:!0});o.setClearColor(0,0),o.setPixelRatio(A);const f=a.clientWidth||400,k=f;o.setSize(f,k);const S=new Y(-1,1,1,-1,.1,10);S.position.z=1;const P=new Z,t=new Image;return t.src="/profilna_bw.png",t.onload=()=>{if(!b)return;const v=document.createElement("canvas");v.width=t.width,v.height=t.height;const B=v.getContext("2d");B.drawImage(t,0,0);const s=B.getImageData(0,0,t.width,t.height).data,E=[],C=[],M=[],z=[],i=t.width,I=t.height;for(let c=0;c<I;c+=w)for(let l=0;l<i;l+=w){const u=(c*i+l)*4,H=s[u+3];if(H<20)continue;const V=s[u],N=s[u+1],J=s[u+2],K=(V*.299+N*.587+J*.114)/255,Q=l/i*2-1,U=-(c/I*2-1);E.push(Q,U,0);const W=Math.random()*Math.PI*2,_=.7+Math.random()*1.6;C.push(Math.cos(W)*_,Math.sin(W)*_,(Math.random()-.5)*2),M.push(K),z.push(H/255)}const e=new $;e.setAttribute("position",new p(E,3)),e.setAttribute("aRandom",new p(C,3)),e.setAttribute("aBrightness",new p(M,1)),e.setAttribute("aImgAlpha",new p(z,1));const D=f*A/(i/w)*1.7,r={uHover:{value:0},uPointSize:{value:D},uTime:{value:0}},j=new tt({transparent:!0,depthWrite:!1,uniforms:r,vertexShader:ot,fragmentShader:nt});P.add(new et(e,j));const L=()=>{m.to(r.uHover,{value:1,duration:1,ease:"expo.out"}),m.to(h.current,{opacity:.13,duration:.5,ease:"expo.out"})},T=()=>{m.to(r.uHover,{value:0,duration:1.4,ease:"expo.inOut"}),m.to(h.current,{opacity:0,duration:.9,ease:"expo.inOut"})};a.addEventListener("mouseenter",L),a.addEventListener("mouseleave",T);const q=new at,F=()=>{y=requestAnimationFrame(F),r.uTime.value=q.getElapsedTime(),o.render(P,S)};F(),n=()=>{cancelAnimationFrame(y),a.removeEventListener("mouseenter",L),a.removeEventListener("mouseleave",T),e.dispose(),j.dispose()}},()=>{b=!1,n==null||n(),o.dispose()}},[]),g.jsxs("div",{ref:x,className:G,style:{aspectRatio:"1 / 1",position:"relative",overflow:"hidden"},children:[g.jsx("canvas",{ref:R}),g.jsx("div",{ref:h,className:"grain-local",style:{opacity:0},"aria-hidden":"true"})]})}export{lt as default};
