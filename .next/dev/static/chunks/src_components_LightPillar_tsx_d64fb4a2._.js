(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/LightPillar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.8_@babel+core@7.28.5_react-dom@19.2.1_react@19.2.1__react@19.2.1/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.8_@babel+core@7.28.5_react-dom@19.2.1_react@19.2.1__react@19.2.1/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$182$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three@0.182.0/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$182$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/three@0.182.0/node_modules/three/build/three.module.js [app-client] (ecmascript) <locals>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const LightPillar = ({ topColor = '#5227FF', bottomColor = '#FF9FFC', intensity = 1.0, rotationSpeed = 0.3, interactive = false, className = '', glowAmount = 0.005, pillarWidth = 3.0, pillarHeight = 0.4, noiseIntensity = 0.5, mixBlendMode = 'screen', pillarRotation = 0 })=>{
    _s();
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const rafRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const rendererRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const materialRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const sceneRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const cameraRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const geometryRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const mouseRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$182$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"](0, 0));
    const timeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const [webGLSupported, setWebGLSupported] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // Check WebGL support
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LightPillar.useEffect": ()=>{
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) {
                setWebGLSupported(false);
                console.warn('WebGL is not supported in this browser');
            }
        }
    }["LightPillar.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LightPillar.useEffect": ()=>{
            if (!containerRef.current || !webGLSupported) return;
            const container = containerRef.current;
            const width = container.clientWidth;
            const height = container.clientHeight;
            // Scene setup
            const scene = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$182$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Scene"]();
            sceneRef.current = scene;
            const camera = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$182$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OrthographicCamera"](-1, 1, 1, -1, 0, 1);
            cameraRef.current = camera;
            let renderer;
            try {
                renderer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$182$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["WebGLRenderer"]({
                    antialias: false,
                    alpha: true,
                    powerPreference: 'high-performance',
                    precision: 'lowp',
                    stencil: false,
                    depth: false
                });
            } catch (error) {
                console.error('Failed to create WebGL renderer:', error);
                setWebGLSupported(false);
                return;
            }
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            container.appendChild(renderer.domElement);
            rendererRef.current = renderer;
            // Convert hex colors to RGB
            const parseColor = {
                "LightPillar.useEffect.parseColor": (hex)=>{
                    const color = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$182$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"](hex);
                    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$182$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](color.r, color.g, color.b);
                }
            }["LightPillar.useEffect.parseColor"];
            // Shader material
            const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;
            const fragmentShader = `
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform vec3 uTopColor;
      uniform vec3 uBottomColor;
      uniform float uIntensity;
      uniform bool uInteractive;
      uniform float uGlowAmount;
      uniform float uPillarWidth;
      uniform float uPillarHeight;
      uniform float uNoiseIntensity;
      uniform float uPillarRotation;
      varying vec2 vUv;

      const float PI = 3.141592653589793;
      const float EPSILON = 0.001;
      const float E = 2.71828182845904523536;
      const float HALF = 0.5;

      mat2 rot(float angle) {
        float s = sin(angle);
        float c = cos(angle);
        return mat2(c, -s, s, c);
      }

      // Procedural noise function
      float noise(vec2 coord) {
        float G = E;
        vec2 r = (G * sin(G * coord));
        return fract(r.x * r.y * (1.0 + coord.x));
      }

      // Apply layered wave deformation to position
      vec3 applyWaveDeformation(vec3 pos, float timeOffset) {
        float frequency = 1.0;
        float amplitude = 1.0;
        vec3 deformed = pos;
        
        for(float i = 0.0; i < 4.0; i++) {
          deformed.xz *= rot(0.4);
          float phase = timeOffset * i * 2.0;
          vec3 oscillation = cos(deformed.zxy * frequency - phase);
          deformed += oscillation * amplitude;
          frequency *= 2.0;
          amplitude *= HALF;
        }
        return deformed;
      }

      // Polynomial smooth blending between two values
      float blendMin(float a, float b, float k) {
        float scaledK = k * 4.0;
        float h = max(scaledK - abs(a - b), 0.0);
        return min(a, b) - h * h * 0.25 / scaledK;
      }

      float blendMax(float a, float b, float k) {
        return -blendMin(-a, -b, k);
      }

      void main() {
        vec2 fragCoord = vUv * uResolution;
        vec2 uv = (fragCoord * 2.0 - uResolution) / uResolution.y;
        
        // Apply 2D rotation to UV coordinates
        float rotAngle = uPillarRotation * PI / 180.0;
        uv *= rot(rotAngle);

        vec3 origin = vec3(0.0, 0.0, -10.0);
        vec3 direction = normalize(vec3(uv, 1.0));

        float maxDepth = 50.0;
        float depth = 0.1;

        mat2 rotX = rot(uTime * 0.3);
        if(uInteractive && length(uMouse) > 0.0) {
          rotX = rot(uMouse.x * PI * 2.0);
        }

        vec3 color = vec3(0.0);
        
        for(float i = 0.0; i < 100.0; i++) {
          vec3 pos = origin + direction * depth;
          pos.xz *= rotX;

          // Apply vertical scaling and wave deformation
          vec3 deformed = pos;
          deformed.y *= uPillarHeight;
          deformed = applyWaveDeformation(deformed + vec3(0.0, uTime, 0.0), uTime);
          
          // Calculate distance field using cosine pattern
          vec2 cosinePair = cos(deformed.xz);
          float fieldDistance = length(cosinePair) - 0.2;
          
          // Radial boundary constraint
          float radialBound = length(pos.xz) - uPillarWidth;
          fieldDistance = blendMax(radialBound, fieldDistance, 1.0);
          fieldDistance = abs(fieldDistance) * 0.15 + 0.01;

          vec3 gradient = mix(uBottomColor, uTopColor, smoothstep(15.0, -15.0, pos.y));
          color += gradient * pow(1.0 / fieldDistance, 1.0);

          if(fieldDistance < EPSILON || depth > maxDepth) break;
          depth += fieldDistance;
        }

        // Normalize by pillar width to maintain consistent glow regardless of size
        float widthNormalization = uPillarWidth / 3.0;
        color = tanh(color * uGlowAmount / widthNormalization);
        
        // Add noise postprocessing
        float rnd = noise(gl_FragCoord.xy);
        color -= rnd / 15.0 * uNoiseIntensity;
        
        gl_FragColor = vec4(color * uIntensity, 1.0);
      }
    `;
            const material = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$182$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ShaderMaterial"]({
                vertexShader,
                fragmentShader,
                uniforms: {
                    uTime: {
                        value: 0
                    },
                    uResolution: {
                        value: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$182$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector2"](width, height)
                    },
                    uMouse: {
                        value: mouseRef.current
                    },
                    uTopColor: {
                        value: parseColor(topColor)
                    },
                    uBottomColor: {
                        value: parseColor(bottomColor)
                    },
                    uIntensity: {
                        value: intensity
                    },
                    uInteractive: {
                        value: interactive
                    },
                    uGlowAmount: {
                        value: glowAmount
                    },
                    uPillarWidth: {
                        value: pillarWidth
                    },
                    uPillarHeight: {
                        value: pillarHeight
                    },
                    uNoiseIntensity: {
                        value: noiseIntensity
                    },
                    uPillarRotation: {
                        value: pillarRotation
                    }
                },
                transparent: true,
                depthWrite: false,
                depthTest: false
            });
            materialRef.current = material;
            const geometry = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$182$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PlaneGeometry"](2, 2);
            geometryRef.current = geometry;
            const mesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$three$40$0$2e$182$2e$0$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Mesh"](geometry, material);
            scene.add(mesh);
            // Mouse interaction - throttled for performance
            let mouseMoveTimeout = null;
            const handleMouseMove = {
                "LightPillar.useEffect.handleMouseMove": (event)=>{
                    if (!interactive) return;
                    if (mouseMoveTimeout) return;
                    mouseMoveTimeout = window.setTimeout({
                        "LightPillar.useEffect.handleMouseMove": ()=>{
                            mouseMoveTimeout = null;
                        }
                    }["LightPillar.useEffect.handleMouseMove"], 16); // ~60fps throttle
                    const rect = container.getBoundingClientRect();
                    const x = (event.clientX - rect.left) / rect.width * 2 - 1;
                    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
                    mouseRef.current.set(x, y);
                }
            }["LightPillar.useEffect.handleMouseMove"];
            if (interactive) {
                container.addEventListener('mousemove', handleMouseMove, {
                    passive: true
                });
            }
            // Animation loop with fixed timestep
            let lastTime = performance.now();
            const targetFPS = 60;
            const frameTime = 1000 / targetFPS;
            const animate = {
                "LightPillar.useEffect.animate": (currentTime)=>{
                    if (!materialRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;
                    const deltaTime = currentTime - lastTime;
                    if (deltaTime >= frameTime) {
                        timeRef.current += 0.016 * rotationSpeed;
                        materialRef.current.uniforms.uTime.value = timeRef.current;
                        rendererRef.current.render(sceneRef.current, cameraRef.current);
                        lastTime = currentTime - deltaTime % frameTime;
                    }
                    rafRef.current = requestAnimationFrame(animate);
                }
            }["LightPillar.useEffect.animate"];
            rafRef.current = requestAnimationFrame(animate);
            // Handle resize with debouncing
            let resizeTimeout = null;
            const handleResize = {
                "LightPillar.useEffect.handleResize": ()=>{
                    if (resizeTimeout) {
                        clearTimeout(resizeTimeout);
                    }
                    resizeTimeout = window.setTimeout({
                        "LightPillar.useEffect.handleResize": ()=>{
                            if (!rendererRef.current || !materialRef.current || !containerRef.current) return;
                            const newWidth = containerRef.current.clientWidth;
                            const newHeight = containerRef.current.clientHeight;
                            rendererRef.current.setSize(newWidth, newHeight);
                            materialRef.current.uniforms.uResolution.value.set(newWidth, newHeight);
                        }
                    }["LightPillar.useEffect.handleResize"], 150);
                }
            }["LightPillar.useEffect.handleResize"];
            window.addEventListener('resize', handleResize, {
                passive: true
            });
            // Cleanup
            return ({
                "LightPillar.useEffect": ()=>{
                    window.removeEventListener('resize', handleResize);
                    if (interactive && container) {
                        container.removeEventListener('mousemove', handleMouseMove);
                    }
                    if (rafRef.current) {
                        cancelAnimationFrame(rafRef.current);
                    }
                    if (rendererRef.current) {
                        rendererRef.current.dispose();
                        rendererRef.current.forceContextLoss();
                        if (container && rendererRef.current.domElement && container.contains(rendererRef.current.domElement)) {
                            container.removeChild(rendererRef.current.domElement);
                        }
                    }
                    if (materialRef.current) {
                        materialRef.current.dispose();
                    }
                    if (geometryRef.current) {
                        geometryRef.current.dispose();
                    }
                    rendererRef.current = null;
                    materialRef.current = null;
                    sceneRef.current = null;
                    cameraRef.current = null;
                    geometryRef.current = null;
                    rafRef.current = null;
                }
            })["LightPillar.useEffect"];
        }
    }["LightPillar.useEffect"], [
        topColor,
        bottomColor,
        intensity,
        rotationSpeed,
        interactive,
        glowAmount,
        pillarWidth,
        pillarHeight,
        noiseIntensity,
        pillarRotation,
        webGLSupported
    ]);
    if (!webGLSupported) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `light-pillar-fallback ${className}`,
            style: {
                mixBlendMode
            },
            children: "WebGL not supported"
        }, void 0, false, {
            fileName: "[project]/src/components/LightPillar.tsx",
            lineNumber: 359,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$8_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$1_react$40$19$2e$2$2e$1_$5f$react$40$19$2e$2$2e$1$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: `light-pillar-container ${className}`,
        style: {
            mixBlendMode
        }
    }, void 0, false, {
        fileName: "[project]/src/components/LightPillar.tsx",
        lineNumber: 365,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0));
};
_s(LightPillar, "MQcgpDoBiXW9pNhYl6OstiLwH54=");
_c = LightPillar;
const __TURBOPACK__default__export__ = LightPillar;
var _c;
__turbopack_context__.k.register(_c, "LightPillar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_components_LightPillar_tsx_d64fb4a2._.js.map