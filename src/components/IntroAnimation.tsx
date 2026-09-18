import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  EffectComposer,
  RenderPass,
  EffectPass,
  BloomEffect,
} from "postprocessing";
import "./IntroAnimation.css";

interface IntroAnimationProps {
  onComplete: () => void;
}

const COUNT = 20000;
const SPEED_MULT = 1;
const AUTO_SPIN = true;

const STREAM_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%@&*+=<>?/\\|";

const STREAM_WORDS = [
  "SYSTEM",
  "DATA",
  "ANALYSIS",
  "PERFORMANCE",
  "DECISION",
  "INTELLIGENCE",
  "CRICKET",
  "IPL",
  "MATCHUP",
  "FORM",
  "PHASE",
  "VENUE",
  "BOWLER",
  "BATTER",
  "STRATEGY",
  "SIGNAL",
  "MODEL",
  "ENGINE",
  "QUERY",
  "PROCESS",
  "VECTOR",
  "CORE",
  "RUN",
  "WICKET",
  "POWERPLAY",
  "DEATH",
  "OVERS",
  "INSIGHT",
];

type TextStage =
  | "none"
  | "initializing"
  | "stumps"
  | "coach"
  | "ready";

interface StreamTextProps {
  text: string;
  stage: TextStage;
  visible: boolean;
}

/* --------------------------------------------------
   RANDOM CHARACTER
-------------------------------------------------- */

function randomCharacter() {
  return STREAM_CHARS[
    Math.floor(
      Math.random() * STREAM_CHARS.length,
    )
  ];
}

/* --------------------------------------------------
   RANDOM DATA STREAM
-------------------------------------------------- */

function makeRandomStream(count: number) {
  return Array.from(
    { length: count },
    () => {
      if (Math.random() < 0.72) {
        return STREAM_WORDS[
          Math.floor(
            Math.random() *
            STREAM_WORDS.length,
          )
        ];
      }

      return Array.from(
        {
          length:
            Math.floor(
              Math.random() * 4,
            ) + 1,
        },
        () => randomCharacter(),
      ).join("");
    },
  ).join("     ");
}

/* --------------------------------------------------
   MOVING DATA STREAM + TARGET WORD
-------------------------------------------------- */

function StreamText({
  text,
  stage,
  visible,
}: StreamTextProps) {
  const [characters, setCharacters] =
    useState<string[]>(
      text.split("").map((character) =>
        character === " "
          ? " "
          : randomCharacter(),
      ),
    );

  const [resolved, setResolved] =
    useState<boolean[]>(
      text
        .split("")
        .map(() => false),
    );

  /*
   * IMPORTANT:
   *
   * This ref always contains the latest
   * resolved state.
   *
   * The scrambling animation reads this ref
   * instead of an old React state snapshot.
   */
  const resolvedRef =
    useRef<boolean[]>([]);

  useEffect(() => {
    if (!visible || stage === "ready") {
      return;
    }

    const chars =
      text.split("");

    const initialResolved =
      chars.map(
        (character) =>
          character === " ",
      );

    const initialCharacters =
      chars.map((character) =>
        character === " "
          ? " "
          : randomCharacter(),
      );

    resolvedRef.current =
      initialResolved;

    setResolved(
      initialResolved,
    );

    setCharacters(
      initialCharacters,
    );

    const timers: number[] = [];

    /*
     * ------------------------------------------------
     * RIGHT -> LEFT RESOLUTION
     * ------------------------------------------------
     *
     * The final character locks first.
     * Then the characters resolve toward the left.
     */

    chars.forEach(
      (character, index) => {
        if (character === " ") {
          return;
        }

        const reverseIndex =
          chars.length -
          1 -
          index;

        /*
         * Fast enough that the whole word
         * becomes readable well before
         * the next stage.
         */
        const delay =
          350 +
          reverseIndex * 150;

        const timer =
          window.setTimeout(() => {
            /*
             * Mark the character as permanently
             * resolved BEFORE changing the visible
             * character.
             */
            resolvedRef.current[
              index
            ] = true;

            setResolved(
              [...resolvedRef.current],
            );

            /*
             * This is the ONLY place where a target
             * character is permanently written.
             */
            setCharacters(
              (current) => {
                const next = [
                  ...current,
                ];

                next[index] =
                  character;

                return next;
              },
            );
          }, delay);

        timers.push(timer);
      },
    );

    /*
     * ------------------------------------------------
     * SCRAMBLING
     * ------------------------------------------------
     *
     * Only unresolved characters are allowed
     * to change.
     *
     * Locked characters are NEVER touched again.
     */
    const scrambleTimer =
      window.setInterval(() => {
        const currentResolved =
          resolvedRef.current;

        setCharacters(
          (current) => {
            return current.map(
              (
                currentCharacter,
                index,
              ) => {
                if (
                  chars[index] ===
                  " " ||
                  currentResolved[
                  index
                  ]
                ) {
                  return currentCharacter;
                }

                return randomCharacter();
              },
            );
          },
        );
      }, 55);

    return () => {
      timers.forEach(
        (timer) => {
          window.clearTimeout(
            timer,
          );
        },
      );

      window.clearInterval(
        scrambleTimer,
      );
    };
  }, [
    text,
    stage,
    visible,
  ]);

  /*
   * No streams whatsoever during
   * the final title.
   */
  const streams =
    stage === "ready"
      ? []
      : Array.from(
        { length: 7 },
        (_, row) => ({
          id: `${stage}-stream-${row}`,
          content:
            makeRandomStream(
              14,
            ) +
            "          " +
            makeRandomStream(
              14,
            ),
          speed:
            10 +
            row * 1.5,
          offset:
            row % 2 === 0
              ? 0
              : -5,
        }),
      );

  return (
    <div
      className={`stream-system ${visible
        ? "stream-system-visible"
        : "stream-system-hidden"
        } ${stage === "ready"
          ? "stream-system-final"
          : ""
        }`}
    >
      {/* -------------------------------------------
          MOVING DATA STREAMS
      -------------------------------------------- */}

      {stage !== "ready" && (
        <div className="stream-field">
          {streams.map(
            (stream) => (
              <div
                className="stream-row"
                key={stream.id}
                style={{
                  animationDuration: `${stream.speed}s`,
                  animationDelay: `${stream.offset}s`,
                }}
              >
                <span>
                  {stream.content}
                </span>

                <span>
                  {stream.content}
                </span>
              </div>
            ),
          )}
        </div>
      )}

      {/* -------------------------------------------
          TARGET WORD
      -------------------------------------------- */}

      <div className="target-word">
        {characters.map(
          (
            character,
            index,
          ) => (
            <span
              key={`${stage}-${index}`}
              className={`target-character ${resolved[index]
                ? "target-character-locked"
                : "target-character-scanning"
                }`}
              style={{
                animationDelay: `${index * 0.035
                  }s`,
              }}
            >
              <span className="target-character-inner">
                {character === " "
                  ? "\u00A0"
                  : character}
              </span>
            </span>
          ),
        )}
      </div>

      {/* -------------------------------------------
          SCAN LINE
      -------------------------------------------- */}

      {stage !== "ready" && (
        <div className="scan-line" />
      )}
    </div>
  );
}

export default function IntroAnimation({
  onComplete,
}: IntroAnimationProps) {
  const mountRef =
    useRef<HTMLDivElement>(null);

  const onCompleteRef =
    useRef(onComplete);

  const [textStage, setTextStage] =
    useState<TextStage>("none");

  const [displayText, setDisplayText] =
    useState("");

  const [textVisible, setTextVisible] =
    useState(false);

  useEffect(() => {
    onCompleteRef.current =
      onComplete;
  }, [onComplete]);

  // --------------------------------------------------
  // TEXT TIMING
  // --------------------------------------------------

  useEffect(() => {
    const timers: number[] = [];

    const showText = (
      delay: number,
      stage: TextStage,
      text: string,
    ) => {
      const timer =
        window.setTimeout(() => {
          /*
           * Immediately hide the previous stage.
           */
          setTextVisible(false);

          /*
           * Then create the new stage cleanly.
           */
          const resetTimer =
            window.setTimeout(() => {
              setTextStage(stage);
              setDisplayText(text);
              setTextVisible(true);
            }, 80);

          timers.push(
            resetTimer,
          );
        }, delay);

      timers.push(timer);
    };

    /*
     * ------------------------------------------------
     * EXACT INTRO TIMELINE
     * ------------------------------------------------
     *
     * 0.0  - 4.7   FRACTAL
     *
     * 4.7  - 7.5   INITIALIZING
     *
     * 7.5  - 10.5  STUMPS
     *
     * 10.5 - 13.5  COACH OS
     *
     * 13.5 - 14.5  STUMPS // COACH OS
     *
     * 14.5 - 15.0  FADE
     *
     * 15.0         COMPLETE
     */

    showText(
      4700,
      "initializing",
      "INITIALIZING",
    );

    showText(
      7500,
      "stumps",
      "STUMPS",
    );

    showText(
      10500,
      "coach",
      "COACH OS",
    );

    showText(
      13500,
      "ready",
      "STUMPS // COACH OS",
    );

    const fadeTimer =
      window.setTimeout(() => {
        setTextVisible(false);
      }, 14500);

    timers.push(
      fadeTimer,
    );

    return () => {
      timers.forEach(
        (timer) => {
          window.clearTimeout(
            timer,
          );
        },
      );
    };
  }, []);

  // --------------------------------------------------
  // THREE.JS
  // --------------------------------------------------

  useEffect(() => {
    const mount =
      mountRef.current;

    if (!mount) return;

    const scene =
      new THREE.Scene();

    const camera =
      new THREE.PerspectiveCamera(
        60,
        window.innerWidth /
        window.innerHeight,
        0.1,
        2000,
      );

    camera.position.set(
      0,
      0,
      100,
    );

    const renderer =
      new THREE.WebGLRenderer({
        antialias: true,
        powerPreference:
          "high-performance",
      });

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        1.5,
      ),
    );

    renderer.setSize(
      window.innerWidth,
      window.innerHeight,
    );

    mount.appendChild(
      renderer.domElement,
    );

    renderer.domElement.style.position =
      "absolute";

    renderer.domElement.style.inset =
      "0";

    renderer.domElement.style.width =
      "100%";

    renderer.domElement.style.height =
      "100%";

    // --------------------------------------------------
    // CONTROLS
    // --------------------------------------------------

    const controls =
      new OrbitControls(
        camera,
        renderer.domElement,
      );

    controls.enableDamping = true;

    controls.autoRotate =
      AUTO_SPIN;

    controls.autoRotateSpeed = 2;

    // --------------------------------------------------
    // BLOOM
    // --------------------------------------------------

    const composer =
      new EffectComposer(
        renderer,
      );

    composer.addPass(
      new RenderPass(
        scene,
        camera,
      ),
    );

    const bloomEffect =
      new BloomEffect({
        intensity: 1.8,
        luminanceThreshold: 0,
        luminanceSmoothing: 0.4,
      });

    composer.addPass(
      new EffectPass(
        camera,
        bloomEffect,
      ),
    );

    // --------------------------------------------------
    // PARTICLES
    // --------------------------------------------------

    const geometry =
      new THREE.TetrahedronGeometry(
        0.25,
      );

    const material =
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1,
      });

    const instancedMesh =
      new THREE.InstancedMesh(
        geometry,
        material,
        COUNT,
      );

    instancedMesh.instanceMatrix.setUsage(
      THREE.DynamicDrawUsage,
    );

    scene.add(
      instancedMesh,
    );

    const positions:
      THREE.Vector3[] = [];

    const color =
      new THREE.Color();

    for (
      let i = 0;
      i < COUNT;
      i++
    ) {
      positions.push(
        new THREE.Vector3(
          (Math.random() -
            0.5) *
          100,
          (Math.random() -
            0.5) *
          100,
          (Math.random() -
            0.5) *
          100,
        ),
      );

      instancedMesh.setColorAt(
        i,
        color.setHex(
          0x00ff88,
        ),
      );
    }

    if (
      instancedMesh.instanceColor
    ) {
      instancedMesh.instanceColor.needsUpdate =
        true;
    }

    const dummy =
      new THREE.Object3D();

    const target =
      new THREE.Vector3();

    const clock =
      new THREE.Clock();

    let animationFrame = 0;

    let disposed = false;

    // --------------------------------------------------
    // PARTICLE ANIMATION
    // --------------------------------------------------

    const animate = () => {
      if (disposed) return;

      animationFrame =
        requestAnimationFrame(
          animate,
        );

      clock.getDelta();

      const time =
        clock.getElapsedTime() *
        SPEED_MULT;

      controls.update();

      /*
       * ----------------------------------------------
       * PARTICLES ONLY EXIST BEFORE 4.7 SECONDS
       * ----------------------------------------------
       */

      let particleMultiplier = 0;

      if (time < 3) {
        particleMultiplier = 1;
      } else if (time < 4.7) {
        const progress =
          (time - 3) /
          1.7;

        const eased =
          progress *
          progress *
          (3 - 2 * progress);

        particleMultiplier =
          1 - eased;
      } else {
        particleMultiplier = 0;
      }

      // ------------------------------------------------
      // FRACTAL
      // ------------------------------------------------

      for (
        let i = 0;
        i < COUNT;
        i++
      ) {
        const t =
          (i + 0.5) /
          COUNT;

        let x = t;

        let y =
          t *
          1.7320508075688772;

        let z =
          t *
          2.23606797749979;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        let keep = 1;

        for (
          let k = 0;
          k < 4;
          k++
        ) {
          const xi =
            Math.floor(
              x * 3,
            );

          const yi =
            Math.floor(
              y * 3,
            );

          const zi =
            Math.floor(
              z * 3,
            );

          const holes =
            (xi === 1 &&
              yi === 1) ||
            (xi === 1 &&
              zi === 1) ||
            (yi === 1 &&
              zi === 1);

          keep *= holes
            ? 0.25
            : 1;

          x =
            x * 3 -
            xi;

          y =
            y * 3 -
            yi;

          z =
            z * 3 -
            zi;
        }

        x =
          (x - 0.5) * 2;

        y =
          (y - 0.5) * 2;

        z =
          (z - 0.5) * 2;

        const breathing =
          1 +
          0.08 *
          Math.sin(
            time * 1.5,
          );

        const size =
          100 *
          breathing;

        let px =
          x *
          size *
          keep;

        let py =
          y *
          size *
          keep;

        let pz =
          z *
          size *
          keep;

        const angle =
          time * 0.8;

        const cosA =
          Math.cos(angle);

        const sinA =
          Math.sin(angle);

        const rx =
          px * cosA -
          pz * sinA;

        const rz =
          px * sinA +
          pz * cosA;

        px = rx;
        pz = rz;

        px *=
          particleMultiplier;

        py *=
          particleMultiplier;

        pz *=
          particleMultiplier;

        target.set(
          px,
          py,
          pz,
        );

        positions[i].lerp(
          target,
          0.12,
        );

        dummy.position.copy(
          positions[i],
        );

        dummy.rotation.x =
          time * 0.3 +
          i * 0.0001;

        dummy.rotation.y =
          time * 0.4 +
          i * 0.00015;

        dummy.updateMatrix();

        instancedMesh.setMatrixAt(
          i,
          dummy.matrix,
        );

        color.setHSL(
          0.42 +
          keep * 0.1,
          0.9,
          0.25 +
          keep * 0.45,
        );

        instancedMesh.setColorAt(
          i,
          color,
        );
      }

      instancedMesh.instanceMatrix.needsUpdate =
        true;

      if (
        instancedMesh.instanceColor
      ) {
        instancedMesh.instanceColor.needsUpdate =
          true;
      }

      /*
       * HARD CUT.
       *
       * After 4.7 seconds the particle material
       * is permanently invisible.
       */
      material.opacity =
        time >= 4.7
          ? 0
          : particleMultiplier;

      composer.render();
    };

    animate();

    // --------------------------------------------------
    // RESIZE
    // --------------------------------------------------

    const handleResize =
      () => {
        camera.aspect =
          window.innerWidth /
          window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
          window.innerWidth,
          window.innerHeight,
        );

        composer.setSize(
          window.innerWidth,
          window.innerHeight,
        );
      };

    window.addEventListener(
      "resize",
      handleResize,
    );

    // --------------------------------------------------
    // COMPLETE
    // --------------------------------------------------

    const completionTimer =
      window.setTimeout(() => {
        if (!disposed) {
          onCompleteRef.current();
        }
      }, 15000);

    // --------------------------------------------------
    // CLEANUP
    // --------------------------------------------------

    return () => {
      disposed = true;

      window.clearTimeout(
        completionTimer,
      );

      cancelAnimationFrame(
        animationFrame,
      );

      window.removeEventListener(
        "resize",
        handleResize,
      );

      controls.dispose();

      geometry.dispose();

      material.dispose();

      composer.dispose();

      renderer.dispose();

      if (
        mount.contains(
          renderer.domElement,
        )
      ) {
        mount.removeChild(
          renderer.domElement,
        );
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="intro-animation"
    >
      <StreamText
        text={displayText}
        stage={textStage}
        visible={textVisible}
      />
    </div>
  );
}