import Rapier from "@dimforge/rapier3d-compat";
import {
  Box,
  KeyboardControls,
  PointerLockControls,
  useKeyboardControls,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import {
  CapsuleCollider,
  RigidBody,
  RigidBodyApi,
  useRapier,
} from "@react-three/rapier";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const idealCameraPosition = new THREE.Vector3();
const direction = new THREE.Vector3();
const frontVector = new THREE.Vector3();
const sideVector = new THREE.Vector3();
const rotation = new THREE.Vector3();

const accelerationTimeAirborne = 0.2;
const accelerationTimeGrounded = 0.025;

const timeToJumpApex = 1.2;
const maxJumpHeight = 10;
const minJumpHeight = 6;
const jumpGravity = -(1.5 * maxJumpHeight) / Math.pow(timeToJumpApex, 1.5);
const maxJumpVelocity = Math.abs(jumpGravity) * timeToJumpApex;
const minJumpVelocity = Math.sqrt(2 * Math.abs(jumpGravity) * minJumpHeight);

const velocityXZSmoothing = 0.2;
const velocityXZMin = 0.0001;

export const Player = (props: JSX.IntrinsicElements["group"]) => {
  const [, get] = useKeyboardControls();

  const camera = useThree((state) => state.camera);
  const rapier = useRapier();

  const handGroupRef = useRef<THREE.Group>(null!);
  const characterRigidBody = useRef<RigidBodyApi>(null!);
  const characterCollider = useRef<Rapier.Collider[]>(null!);

  const characterController = useRef<Rapier.KinematicCharacterController>(
    null!
  );

  const velocity = useRef({ x: 0, z: 0 });

  const holdingJump = useRef(false);
  const jumpVelocity = useRef(0);
  const jumpTime = useRef(0);

  useEffect(() => {
    const world = rapier.world.raw();
    console.log(world);

    characterController.current = world.createCharacterController(0.1);
    characterController.current.enableAutostep(0.7, 0.3, true);
    characterController.current.enableSnapToGround(0.7);
    characterController.current.setApplyImpulsesToDynamicBodies(true);

    return () => {
      characterController.current.free();
      characterController.current = null!;
    };
  }, []);

  useFrame((state, delta) => {
    if (!characterRigidBody.current || !characterController.current) return;

    // get controls
    const { forward, backward, left, right, jump, sprint } = get();

    // update character controller
    const speed = 15 * delta * (sprint ? 1.5 : 1);

    const grounded = characterController.current.computedGrounded();

    let smoothing = velocityXZSmoothing;
    smoothing *= grounded ? accelerationTimeGrounded : accelerationTimeAirborne;

    const factor = 1 - Math.pow(smoothing, delta);

    // x and z movement
    frontVector.set(0, 0, Number(backward) - Number(forward));
    sideVector.set(Number(left) - Number(right), 0, 0);
    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(speed)
      .applyEuler(camera.rotation);

    const targetVelocity = {
      x: direction.x,
      z: direction.z,
    };

    velocity.current = {
      x: THREE.MathUtils.lerp(velocity.current.x, targetVelocity.x, factor),
      z: THREE.MathUtils.lerp(velocity.current.z, targetVelocity.z, factor),
    };

    let movementDirection = {
      x: velocity.current.x,
      y: jumpVelocity.current * factor,
      z: velocity.current.z,
    };

    if (Math.abs(movementDirection.x) < velocityXZMin) {
      movementDirection.x = 0;
    }

    if (Math.abs(movementDirection.z) < velocityXZMin) {
      movementDirection.z = 0;
    }

    // jumping
    if ((jump && grounded) || holdingJump.current) {
      holdingJump.current = true;
      jumpTime.current = state.clock.elapsedTime;
      jumpVelocity.current = maxJumpVelocity;
    }

    if (
      (holdingJump.current && !jump) ||
      jumpTime.current + timeToJumpApex > state.clock.elapsedTime
    ) {
      holdingJump.current = false;

      if (jumpVelocity.current > minJumpVelocity) {
        jumpVelocity.current = minJumpVelocity;
      }
    }

    if (!jump && grounded) {
      jumpVelocity.current = 0;
    } else {
      jumpVelocity.current += jumpGravity * factor;
    }

    // compute collider movement and update rigid body
    characterController.current.computeColliderMovement(
      characterCollider.current[0],
      movementDirection
    );

    const movement = characterController.current.computedMovement();
    const newPos = characterRigidBody.current.translation();
    newPos.x += movement.x;
    newPos.y += movement.y;
    newPos.z += movement.z;
    characterRigidBody.current.setNextKinematicTranslation(newPos);

    // update camera
    const rigidBodyTranslation = characterRigidBody.current.translation();
    idealCameraPosition.set(
      rigidBodyTranslation.x,
      rigidBodyTranslation.y + 1,
      rigidBodyTranslation.z
    );
    camera.position.lerp(idealCameraPosition, 100 * delta);

    // update hand
    handGroupRef.current.children[0].rotation.x = THREE.MathUtils.lerp(
      handGroupRef.current.children[0].rotation.x,
      Math.sin(
        (characterRigidBody.current.linvel().length() > 1 ? 1 : 0) *
          state.clock.elapsedTime *
          10
      ) / 6,
      0.1
    );
    handGroupRef.current.rotation.copy(camera.rotation);
    handGroupRef.current.position
      .copy(camera.position)
      .add(camera.getWorldDirection(rotation).multiplyScalar(1));
  });

  return (
    <>
      <group>
        <RigidBody
          {...props}
          ref={characterRigidBody}
          colliders={false}
          mass={1}
          type="kinematicPosition"
          position={[0, 10, 0]}
          enabledRotations={[false, false, false]}
        >
          <CapsuleCollider ref={characterCollider} args={[0.5, 0.5]} />
        </RigidBody>

        <group
          ref={handGroupRef}
          onPointerMissed={(e) =>
            (handGroupRef.current.children[0].rotation.x = -0.5)
          }
        >
          <>
            <Box position={[0.5, -0.35, 0.5]} args={[0.25, 0.25, 1]}>
              <meshStandardMaterial color="orange" />
            </Box>
          </>
        </group>
      </group>
    </>
  );
};

export const KinematicCharacterController = () => {
  return (
    <>
      {/* player */}
      <KeyboardControls
        map={[
          { name: "forward", keys: ["ArrowUp", "w", "W"] },
          { name: "backward", keys: ["ArrowDown", "s", "S"] },
          { name: "left", keys: ["ArrowLeft", "a", "A"] },
          { name: "right", keys: ["ArrowRight", "d", "D"] },
          { name: "jump", keys: ["Space"] },
          { name: "sprint", keys: ["Shift"] },
        ]}
      >
        <Player />
      </KeyboardControls>

      {/* controls */}
      <PointerLockControls makeDefault />

      {/* dynamic rigid bodies */}
      {Array.from({ length: 10 }).map((_, i) => (
        <RigidBody
          key={i}
          colliders="cuboid"
          position={[-5, (i + 1) * 1.01, 0]}
          type="dynamic"
          mass={0.5}
        >
          <Box args={[1, 1, 1]} castShadow receiveShadow>
            <meshPhysicalMaterial color="pink" />
          </Box>
        </RigidBody>
      ))}

      {/* fixed stage rigid bodies */}
      <RigidBody colliders="cuboid" position={[0, -8, 0]} type="fixed">
        <Box args={[40, 1, 40]} castShadow receiveShadow>
          <meshPhysicalMaterial />
        </Box>
      </RigidBody>

      <RigidBody colliders="cuboid" position={[10, -8, 0]} type="fixed">
        <Box
          args={[40, 1, 40]}
          rotation={[0, 0, Math.PI / 5]}
          castShadow
          receiveShadow
        >
          <meshPhysicalMaterial />
        </Box>
      </RigidBody>

      <RigidBody colliders="cuboid" position={[10, -12, -8]} type="fixed">
        <Box args={[20, 20, 10]} castShadow receiveShadow>
          <meshPhysicalMaterial />
        </Box>
      </RigidBody>

      {Array.from({ length: 20 }).map((_, i) => (
        <RigidBody
          key={i}
          colliders="cuboid"
          position={[i * 0.3, -8 + (i + 1) * 0.3, 0]}
          type="fixed"
        >
          <Box args={[0.3, 0.3, 5]} castShadow receiveShadow>
            <meshPhysicalMaterial />
          </Box>
        </RigidBody>
      ))}
    </>
  );
};
