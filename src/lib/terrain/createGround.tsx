import { useFrame } from "@react-three/fiber"
import { useControls } from "leva"
import { useLayoutEffect, useRef } from "react"
import { forwardRef } from "react"
import {
  Color,
  DoubleSide,
  Mesh,
  MeshPhongMaterial,
  PlaneGeometry,
  RawShaderMaterial,
  ShaderLib,
  ShaderMaterial,
  Texture,
  UniformsUtils,
  Vector3
} from "three"
import { width, resolution, sharedPrefix, delta, pos } from "./grass"

// //************** Ground **************
export function createGround(noiseTexture: Texture) {
  // //Ground material is a modification of the existing MeshPhongMaterial rather than one from scratch
  // var groundBaseGeometry = new PlaneGeometry(
  //   width,
  //   width,
  //   resolution,
  //   resolution
  // )
  // groundBaseGeometry.lookAt(new Vector3(0, 1, 0))
  // groundBaseGeometry.verticesNeedUpdate = true;

  //   // groundGeometry.attributes.vertices.needsUpdate = true;
  //   var groundMaterial = new MeshPhongMaterial({
  //     color: new Color("rgb(10%, 25%, 2%)")
  //   })

  //   var groundVertexPrefix =
  //     sharedPrefix +
  //     `
  //   attribute vec3 basePosition;
  //   uniform float delta;
  //   uniform float posX;
  //   uniform float posZ;
  //   uniform float width;

  //   vec3 getPosition(vec3 pos, float epsX, float epsZ){
  //     vec3 temp;
  //     temp.x = pos.x + epsX;
  //     temp.z = pos.z + epsZ;
  //     temp.y = getYPosition(
  //       vec2(
  //         basePosition.x+epsX+delta*posX,
  //         basePosition.z+epsZ+delta*posZ
  //       )
  //     );
  //     // temp.y = 0.0;
  //     return temp;
  //   }

  //   //Find the normal at pos as the cross product of the central-differences in x and z directions
  //   vec3 getNormal(vec3 pos){
  //     float eps = 1e-1;

  //     vec3 tempP = getPosition(pos, eps, 0.0);
  //     vec3 tempN = getPosition(pos, -eps, 0.0);

  //     vec3 slopeX = tempP - tempN;

  //     tempP = getPosition(pos, 0.0, eps);
  //     tempN = getPosition(pos, 0.0, -eps);

  //     vec3 slopeZ = tempP - tempN;

  //     vec3 norm = normalize(cross(slopeZ, slopeX));
  //     return norm;
  //   }
  // `

  //   var customShaderMaterial = new ShaderMaterial({
  //     vertexShader:
  //       groundVertexPrefix +
  //       ShaderLib.phong.vertexShader
  //         .replace(
  //           "#include <beginnormal_vertex>",
  //           `//https://dev.to/maurobringolf/a-neat-trick-to-compute-modulo-of-negative-numbers-111e
  //       vec3 pos = vec3(0);
  //       pos.x = basePosition.x - mod(mod((delta*posX),delta) + delta, delta);
  //       pos.z = basePosition.z - mod(mod((delta*posZ),delta) + delta, delta);
  //       pos.y = getYPosition(vec2(basePosition.x+delta*posX, basePosition.z+delta*posZ));
  //       vec3 objectNormal = getNormal(pos);
  // #ifdef USE_TANGENT
  //       vec3 objectTangent = vec3( tangent.xyz );
  // #endif`
  //         )
  //         .replace("#include <begin_vertex>", `vec3 transformed = vec3(pos);`),
  //     fragmentShader: ShaderLib.phong.fragmentShader,
  //     uniforms: {
  //       ...UniformsUtils.clone(ShaderLib.phong.uniforms),
  //       delta: { value: delta },
  //       posX: { value: pos.x },
  //       posZ: { value: pos.y },
  //       width: { value: width },
  //       noiseTexture: { value: noiseTexture }
  //     }
  //   })

  //   customShaderMaterial.uniforms.diffuse.value.copy(
  //     new Color("rgb(10%, 25%, 2%)")
  //   )

  //   customShaderMaterial.lights = true
  //   customShaderMaterial.extensions.derivatives = true
  //   customShaderMaterial.extensions.fragDepth = true

  //   var groundShader
  //   groundMaterial.onBeforeCompile = function (shader) {
  //     shader.uniforms.delta = { value: delta }
  //     shader.uniforms.posX = { value: pos.x }
  //     shader.uniforms.posZ = { value: pos.y }
  //     shader.uniforms.width = { value: width }
  //     shader.uniforms.noiseTexture = { value: noiseTexture }
  //     shader.vertexShader = groundVertexPrefix + shader.vertexShader
  //     shader.vertexShader = shader.vertexShader.replace(
  //       "#include <beginnormal_vertex>",
  //       `//https://dev.to/maurobringolf/a-neat-trick-to-compute-modulo-of-negative-numbers-111e
  //       vec3 pos = vec3(0);
  //       pos.x = position.x;
  //       pos.z = position.z;
  //       pos.y = getYPosition(vec2(basePosition.x+delta*floor(posX), basePosition.z+delta*floor(posZ)));
  //       // pos.y = 1;
  //       // pos.y = 0.0;
  //       vec3 objectNormal = getNormal(pos);
  // #ifdef USE_TANGENT
  //       vec3 objectTangent = vec3( tangent.xyz );
  // #endif`
  //     )
  //     shader.vertexShader = shader.vertexShader.replace(
  //       "#include <begin_vertex>",
  //       `vec3 transformed = position;`
  //     )
  //     console.log(shader.vertexShader)
  //     groundShader = shader
  //   }
  const material = new RawShaderMaterial({
    vertexShader: `
    uniform mat4 projectionMatrix;
    uniform mat4 viewMatrix;
    uniform mat4 modelMatrix;
    uniform float posZ;
    uniform float posX;
    uniform sampler2D noiseTexture;
    uniform highp float width;
    uniform highp float scale;

    attribute vec3 position;

    varying lowp vec4 cord;

    void main() {
      vec3 pos = vec3(0.0);
      pos.x = posX;
      pos.z = posZ;
      pos.y = 0.0;
      vec3 vPosition = position + pos/2.0; 
      vec2 texturePosition = (pos.xz + position.xz - width / 2.0) / (width * scale);
      cord = texture2D(noiseTexture, texturePosition) * 5;
      vec3 vPos = position.xyz;
      vPos.y = cord.r;
      gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(vPos, 1.0);
    }
  `,
    fragmentShader: `
    varying lowp vec4 cord;
    void main() {
      gl_FragColor = cord;
    }
  `,
    uniforms: {
      noiseTexture: { value: noiseTexture },
      posX: { value: pos.x },
      posZ: { value: pos.y },
      width: { value: width },
      scale: { value: 1.0 }
    }
  })

  // return groundGeometry
}

// export const Ground = forwardRef(({ noiseTexture, ...props }, ref) => {
//   return (
//     <mesh ref={ref} {...props}>
//       <planeGeometry
//         attach="geometry"
//         args={[width, width, resolution, resolution]}
//       />
//       <GroundMaterial noiseTexture={noiseTexture} />
//     </mesh>
//   )
// })
export function GroundMaterial({ noiseTexture, offset = [0, 0], scale = 1.0 }) {
  let ref = useRef()
  const controls = useControls({
    elevate: {
      value: true,
      onChange: (value) => {
        if (ref.current) {
          ref.current.uniforms.elevate = value
        }
      }
    }
  })

  return (
    <rawShaderMaterial
      ref={ref}
      uniforms={{
        noiseTexture: { value: noiseTexture },
        posX: { value: pos.x },
        posZ: { value: pos.y },
        width: { value: width },
        scale: { value: scale },
        elevate: { value: controls.elevate },
        offsetX: { value: offset[0] },
        offsetY: { value: offset[1] }
      }}
      vertexShader={
        /* glsl */ `
        uniform mat4 projectionMatrix;
        uniform mat4 viewMatrix;
        uniform mat4 modelMatrix;
        uniform float posZ;
        uniform float posX;
        uniform float offsetX;
        uniform float offsetY;

        uniform sampler2D noiseTexture;
        uniform highp float width;
        uniform highp float scale;
        uniform bool elevate;
    
        attribute vec3 position;
    
        varying lowp vec4 cord;
    
        void main() {
          vec3 pos = vec3(0.0);
          pos.x = posX;
          pos.z = posZ;
          pos.y = 0.0;
          
          vec2 texturePosition = (pos.xz + position.xz - vec2(offsetX, offsetY)) / (width * scale);
          cord = texture2D(noiseTexture, texturePosition);
          vec3 vPos = position.xyz;
          vPos.y = ((2.0 * cord.r) - 1.0) * 50.0;
          gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(vPos, 1.0);
        }
      `
      }
      fragmentShader={
        /* glsl */ `
      varying lowp vec4 cord;
      void main() {
        gl_FragColor = cord;
      }
    `
      }
    />
  )
}
