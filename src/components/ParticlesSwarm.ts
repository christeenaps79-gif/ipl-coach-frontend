import * as THREE from "three";
import {
  EffectComposer,
  RenderPass,
  EffectPass,
  BloomEffect,
} from "postprocessing";

export class ParticlesSwarm {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;

  private particles: THREE.InstancedMesh;
  private geometry: THREE.TetrahedronGeometry;
  private material: THREE.MeshBasicMaterial;

  private positions: Float32Array;
  private targets: Float32Array;

  private readonly count = 20000;

  private start = performance.now();
  private frame = 0;

  private textCanvas: HTMLCanvasElement;
  private textContext: CanvasRenderingContext2D;

  private dummy = new THREE.Object3D();
  private color = new THREE.Color();

  constructor(private mount: HTMLDivElement) {
    this.scene = new THREE.Scene();

    /*
     * Keep the Three.js scene transparent so the light
     * CSS intro background remains visible behind the
     * particles.
     */
    this.scene.background = null;

    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    this.camera.position.set(0, 0, 32);

    /*
     * Alpha is required so the WebGL canvas does not
     * create its own opaque background.
     */
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 1.5),
    );

    this.renderer.setSize(
      window.innerWidth,
      window.innerHeight,
    );

    /*
     * Fully transparent clear color.
     */
    this.renderer.setClearColor(0x000000, 0);

    mount.appendChild(this.renderer.domElement);

    this.renderer.domElement.style.position =
      "absolute";

    this.renderer.domElement.style.inset = "0";

    this.renderer.domElement.style.width = "100%";

    this.renderer.domElement.style.height = "100%";

    this.renderer.domElement.style.pointerEvents =
      "none";

    // --------------------------------------------------
    // TEXT CANVAS
    // --------------------------------------------------

    this.textCanvas =
      document.createElement("canvas");

    this.textCanvas.width = 1800;
    this.textCanvas.height = 600;

    const ctx =
      this.textCanvas.getContext("2d");

    if (!ctx) {
      throw new Error(
        "Could not create text canvas",
      );
    }

    this.textContext = ctx;

    // --------------------------------------------------
    // PARTICLE ARRAYS
    // --------------------------------------------------

    this.positions =
      new Float32Array(
        this.count * 3,
      );

    this.targets =
      new Float32Array(
        this.count * 3,
      );

    // --------------------------------------------------
    // INSTANCED TETRAHEDRON GEOMETRY
    // --------------------------------------------------

    this.geometry =
      new THREE.TetrahedronGeometry(
        0.055,
        0,
      );

    this.material =
      new THREE.MeshBasicMaterial({
        color: 0xa8c9bd,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
        blending:
          THREE.AdditiveBlending,
      });

    this.particles =
      new THREE.InstancedMesh(
        this.geometry,
        this.material,
        this.count,
      );

    this.particles.instanceMatrix.setUsage(
      THREE.DynamicDrawUsage,
    );

    // Give every tetrahedron a slightly different
    // restrained green/grey tone.
    for (
      let i = 0;
      i < this.count;
      i++
    ) {
      const variation = i % 7;

      if (variation === 0) {
        this.color.setHex(0xd4e1dc);
      } else if (variation === 1) {
        this.color.setHex(0x9bb9ad);
      } else if (variation === 2) {
        this.color.setHex(0x78958a);
      } else if (variation === 3) {
        this.color.setHex(0x647d75);
      } else {
        this.color.setHex(0x8aa69c);
      }

      this.particles.setColorAt(
        i,
        this.color,
      );
    }

    if (this.particles.instanceColor) {
      this.particles.instanceColor.needsUpdate =
        true;
    }

    this.scene.add(this.particles);

    // --------------------------------------------------
    // CREATE TARGETS AND INITIAL PARTICLES
    // --------------------------------------------------

    this.createTextTargets();

    this.createInitialParticles();

    // --------------------------------------------------
    // SUBTLE BLOOM
    // --------------------------------------------------

    this.composer =
      new EffectComposer(
        this.renderer,
      );

    this.composer.addPass(
      new RenderPass(
        this.scene,
        this.camera,
      ),
    );

    this.composer.addPass(
      new EffectPass(
        this.camera,
        new BloomEffect({
          /*
           * Lower bloom is better for the light
           * background so the particles stay crisp.
           */
          intensity: 0.06,
          luminanceThreshold: 0.72,
          luminanceSmoothing: 0.35,
        }),
      ),
    );

    // --------------------------------------------------
    // RESIZE
    // --------------------------------------------------

    window.addEventListener(
      "resize",
      this.resize,
    );

    this.animate();
  }

  // ==================================================
  // TEXT TARGETS
  // ==================================================

  private createTextTargets() {
    const ctx =
      this.textContext;

    ctx.clearRect(
      0,
      0,
      this.textCanvas.width,
      this.textCanvas.height,
    );

    ctx.fillStyle = "#ffffff";

    ctx.textAlign = "center";

    ctx.textBaseline = "middle";

    ctx.font =
      'bold 82px "Arial", sans-serif';

    ctx.fillText(
      "INITIATING",
      this.textCanvas.width / 2,
      170,
    );

    ctx.font =
      'bold 190px "Arial", sans-serif';

    ctx.fillText(
      "STUMPS",
      this.textCanvas.width / 2,
      390,
    );

    const image =
      ctx.getImageData(
        0,
        0,
        this.textCanvas.width,
        this.textCanvas.height,
      );

    const pixels =
      image.data;

    const pointsX: number[] = [];
    const pointsY: number[] = [];

    for (
      let y = 0;
      y < this.textCanvas.height;
      y += 3
    ) {
      for (
        let x = 0;
        x < this.textCanvas.width;
        x += 3
      ) {
        const index =
          (
            y *
            this.textCanvas.width +
            x
          ) * 4;

        if (
          pixels[index + 3] >
          200
        ) {
          pointsX.push(x);
          pointsY.push(y);
        }
      }
    }

    const total =
      pointsX.length;

    if (total === 0) {
      for (
        let i = 0;
        i < this.count;
        i++
      ) {
        const p = i * 3;

        this.targets[p] = 0;

        this.targets[p + 1] =
          0;

        this.targets[p + 2] =
          0;
      }

      return;
    }

    const scale = 0.030;

    for (
      let i = 0;
      i < this.count;
      i++
    ) {
      const p = i * 3;

      const source =
        i % total;

      this.targets[p] =
        (
          pointsX[source] -
          this.textCanvas.width / 2
        ) * scale;

      this.targets[p + 1] =
        -(
          pointsY[source] -
          this.textCanvas.height / 2
        ) * scale;

      this.targets[p + 2] =
        Math.sin(
          i * 0.73,
        ) * 0.22;
    }
  }

  // ==================================================
  // INITIAL TETRAHEDRON SWARM
  // ==================================================

  private createInitialParticles() {
    const golden =
      2.399963229728653;

    for (
      let i = 0;
      i < this.count;
      i++
    ) {
      const p = i * 3;

      const u =
        i / this.count;

      const y =
        1 -
        2 * u;

      const radius =
        Math.sqrt(
          Math.max(
            0,
            1 - y * y,
          ),
        );

      const angle =
        i * golden;

      const baseRadius =
        7.0 +
        (i % 17) * 0.035;

      const x =
        radius *
        Math.cos(angle) *
        baseRadius;

      const z =
        radius *
        Math.sin(angle) *
        baseRadius;

      this.positions[p] =
        x;

      this.positions[p + 1] =
        y * baseRadius;

      this.positions[p + 2] =
        z;

      this.dummy.position.set(
        x,
        y * baseRadius,
        z,
      );

      this.dummy.rotation.set(
        Math.sin(
          i * 0.37,
        ),
        Math.cos(
          i * 0.61,
        ),
        Math.sin(
          i * 0.19,
        ),
      );

      const scale =
        0.45 +
        (i % 11) * 0.018;

      this.dummy.scale.setScalar(
        scale,
      );

      this.dummy.updateMatrix();

      this.particles.setMatrixAt(
        i,
        this.dummy.matrix,
      );
    }

    this.particles.instanceMatrix.needsUpdate =
      true;
  }

  // ==================================================
  // ANIMATION
  // ==================================================

  private animate = () => {
    this.frame =
      requestAnimationFrame(
        this.animate,
      );

    const elapsed =
      (
        performance.now() -
        this.start
      ) / 1000;

    // ==================================================
    // PHASE 1
    // LIVING SPHERICAL SWARM
    // ==================================================

    if (elapsed < 2.8) {
      const spin =
        elapsed * 0.65;

      const cosSpin =
        Math.cos(spin);

      const sinSpin =
        Math.sin(spin);

      for (
        let i = 0;
        i < this.count;
        i++
      ) {
        const p = i * 3;

        const u =
          i / this.count;

        const y =
          1 -
          2 * u;

        const radius =
          Math.sqrt(
            Math.max(
              0,
              1 - y * y,
            ),
          );

        const angle =
          i * goldenAngle();

        const baseRadius =
          7.0 +
          (i % 17) * 0.035;

        let x =
          radius *
          Math.cos(angle) *
          baseRadius;

        let z =
          radius *
          Math.sin(angle) *
          baseRadius;

        const rx =
          x * cosSpin -
          z * sinSpin;

        const rz =
          x * sinSpin +
          z * cosSpin;

        x = rx;
        z = rz;

        const wave =
          Math.sin(
            angle * 4 +
            elapsed * 2.5,
          ) * 0.35;

        const breathe =
          1 +
          wave * 0.025;

        x *= breathe;

        z *= breathe;

        const vertical =
          y * baseRadius +
          Math.sin(
            angle * 3 +
            elapsed * 2,
          ) * 0.22;

        this.positions[p] =
          x;

        this.positions[p + 1] =
          vertical;

        this.positions[p + 2] =
          z;

        this.updateInstance(
          i,
          x,
          vertical,
          z,
          elapsed,
          0.45 +
          (i % 11) *
          0.018,
        );
      }
    }

    // ==================================================
    // PHASE 2
    // SWARM COLLAPSES INTO STUMPS
    // ==================================================

    else if (elapsed < 5.2) {
      const progress =
        (
          elapsed - 2.8
        ) / 2.4;

      const eased =
        progress *
        progress *
        (
          3 -
          2 * progress
        );

      for (
        let i = 0;
        i < this.count;
        i++
      ) {
        const p = i * 3;

        const currentX =
          this.positions[p];

        const currentY =
          this.positions[
          p + 1
          ];

        const currentZ =
          this.positions[
          p + 2
          ];

        const orbitalAngle =
          elapsed * 0.32 +
          i * 0.0007;

        const cosSpin =
          Math.cos(
            orbitalAngle,
          );

        const sinSpin =
          Math.sin(
            orbitalAngle,
          );

        const orbitX =
          currentX *
          cosSpin -
          currentZ *
          sinSpin;

        const orbitZ =
          currentX *
          sinSpin +
          currentZ *
          cosSpin;

        const pull =
          0.025 +
          eased * 0.13;

        this.positions[p] +=
          (
            this.targets[p] -
            orbitX
          ) * pull;

        this.positions[p + 1] +=
          (
            this.targets[
            p + 1
            ] -
            currentY
          ) * pull;

        this.positions[p + 2] +=
          (
            this.targets[
            p + 2
            ] -
            orbitZ
          ) * pull;

        this.updateInstance(
          i,
          this.positions[p],
          this.positions[
          p + 1
          ],
          this.positions[
          p + 2
          ],
          elapsed,
          0.42 +
          eased * 0.12 +
          (i % 9) *
          0.012,
        );
      }
    }

    // ==================================================
    // PHASE 3
    // LOCKED TEXT
    // ==================================================

    else {
      for (
        let i = 0;
        i < this.count;
        i++
      ) {
        const p = i * 3;

        this.positions[p] +=
          (
            this.targets[p] -
            this.positions[p]
          ) * 0.12;

        this.positions[p + 1] +=
          (
            this.targets[
            p + 1
            ] -
            this.positions[
            p + 1
            ]
          ) * 0.12;

        this.positions[p + 2] +=
          (
            this.targets[
            p + 2
            ] -
            this.positions[
            p + 2
            ]
          ) * 0.12;

        const micro =
          Math.sin(
            elapsed * 1.4 +
            i * 0.31,
          ) * 0.018;

        this.updateInstance(
          i,
          this.positions[p] +
          micro,
          this.positions[
          p + 1
          ],
          this.positions[
          p + 2
          ],
          elapsed,
          0.48 +
          (i % 8) *
          0.012,
        );
      }
    }

    this.particles.instanceMatrix.needsUpdate =
      true;

    this.particles.rotation.y =
      Math.sin(
        elapsed * 0.12,
      ) * 0.003;

    this.particles.rotation.x =
      Math.sin(
        elapsed * 0.09,
      ) * 0.002;

    this.material.opacity =
      elapsed < 2.8
        ? 0.68
        : 0.76;

    this.composer.render();
  };

  // ==================================================
  // UPDATE INDIVIDUAL TETRAHEDRON
  // ==================================================

  private updateInstance(
    index: number,
    x: number,
    y: number,
    z: number,
    elapsed: number,
    scale: number,
  ) {
    this.dummy.position.set(
      x,
      y,
      z,
    );

    this.dummy.rotation.x =
      elapsed * 0.35 +
      index * 0.17;

    this.dummy.rotation.y =
      elapsed * 0.42 +
      index * 0.11;

    this.dummy.rotation.z =
      elapsed * 0.21 +
      index * 0.07;

    this.dummy.scale.setScalar(
      scale,
    );

    this.dummy.updateMatrix();

    this.particles.setMatrixAt(
      index,
      this.dummy.matrix,
    );
  }

  // ==================================================
  // RESIZE
  // ==================================================

  private resize = () => {
    this.camera.aspect =
      window.innerWidth /
      window.innerHeight;

    this.camera.updateProjectionMatrix();

    this.renderer.setSize(
      window.innerWidth,
      window.innerHeight,
    );

    this.composer.setSize(
      window.innerWidth,
      window.innerHeight,
    );
  };

  // ==================================================
  // CLEANUP
  // ==================================================

  dispose() {
    cancelAnimationFrame(
      this.frame,
    );

    window.removeEventListener(
      "resize",
      this.resize,
    );

    this.geometry.dispose();

    this.material.dispose();

    this.composer.dispose();

    this.renderer.dispose();

    if (
      this.mount.contains(
        this.renderer.domElement,
      )
    ) {
      this.mount.removeChild(
        this.renderer.domElement,
      );
    }
  }
}

const goldenAngle = () =>
  2.399963229728653;