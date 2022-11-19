import { forwardRef, useMemo, useRef } from "react"
import {
  DoubleSide,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  MeshNormalMaterial,
  PlaneGeometry,
  Quaternion,
  RawShaderMaterial,
  RepeatWrapping,
  Texture,
  TextureLoader,
  Vector2,
  Vector3
} from "three"
//Define the material, specifying attributes, uniforms, shaders etc.
import { useFrame } from "@react-three/fiber"
import mergeRefs from "react-merge-refs"
import { useNoiseTexture } from "../../lib/useNoiseTexture"

//Variables for blade mesh
var joints = 4
// var bladeHeight = 0.5;
// var instances = 50000;
//Patch side lengtwh
// export var width = 50;
//Number of vertices on ground plane side
export var resolution = 512
//Distance between two ground plane vertices
export var delta = 1
//User movement speed
var speed = 3

//Sun
//Height over horizon in range [0, PI/2.0]
export var elevation = 0.2
//Rotation around Y axis in range [0, 2*PI]
export var azimuth = 0.4

var fogFade = 0.005

//Lighting variables for grass
export var ambientStrength = 0.7
export var translucencyStrength = 1.5
export var specularStrength = 0.5
export var diffuseStrength = 1.5
export var shininess = 256
export var sunColour = new Vector3(1.0, 1.0, 1.0)
export var specularColour = new Vector3(1.0, 1.0, 1.0)

//The global coordinates
//The geometry never leaves a box of width*width around (0, 0)
//But we track where in space the camera would be globally
export var pos = new Vector2(0.1, 0.1)
var loader = new TextureLoader()
loader.crossOrigin = ""
export var grassTexture = loader.load(
  "https://al-ro.github.io/images/grass/blade_diffuse.jpg"
)
export var alphaMap = loader.load(
  "https://al-ro.github.io/images/grass/blade_alpha.jpg"
)
export function createGrassGeometry({
  width,
  count: instances,
  bladeHeight = 0.5,
  bladeWidth = 0.12
}) {
  //Define base geometry that will be instanced. We use a plane for an individual blade of grass
  var grassBaseGeometry = new PlaneGeometry(bladeWidth, bladeHeight, 1, joints)
  grassBaseGeometry.translate(0, bladeHeight / 2, 0)
  //Get alpha map and blade texture
  //These have been taken from "Realistic real-time grass rendering" by Eddie Lee, 2010

  //Define the bend of the grass blade as the combination of three quaternion rotations
  let vertex = new Vector3()
  let quaternion0 = new Quaternion()
  let quaternion1 = new Quaternion()
  let x, y, z, w, angle, sinAngle, rotationAngle

  //Rotate around Y
  angle = 0.05
  sinAngle = Math.sin(angle / 2.0)
  rotationAngle = new Vector3(0, 1, 0)
  x = rotationAngle.x * sinAngle
  y = rotationAngle.y * sinAngle
  z = rotationAngle.z * sinAngle
  w = Math.cos(angle / 2.0)
  quaternion0.set(x, y, z, w)

  //Rotate around X
  angle = 0.3
  sinAngle = Math.sin(angle / 2.0)
  rotationAngle.set(1, 0, 0)
  x = rotationAngle.x * sinAngle
  y = rotationAngle.y * sinAngle
  z = rotationAngle.z * sinAngle
  w = Math.cos(angle / 2.0)
  quaternion1.set(x, y, z, w)

  //Combine rotations to a single quaternion
  quaternion0.multiply(quaternion1)

  //Rotate around Z
  angle = 0.1
  sinAngle = Math.sin(angle / 2.0)
  rotationAngle.set(0, 0, 1)
  x = rotationAngle.x * sinAngle
  y = rotationAngle.y * sinAngle
  z = rotationAngle.z * sinAngle
  w = Math.cos(angle / 2.0)
  quaternion1.set(x, y, z, w)

  //Combine rotations to a single quaternion
  quaternion0.multiply(quaternion1)

  let quaternion2 = new Quaternion()

  //Bend grass base geometry for more organic look
  for (
    let v = 0;
    v < grassBaseGeometry.attributes.position.array.length;
    v += 3
  ) {
    quaternion2.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2)
    vertex.x = grassBaseGeometry.attributes.position.array[v]
    vertex.y = grassBaseGeometry.attributes.position.array[v + 1]
    vertex.z = grassBaseGeometry.attributes.position.array[v + 2]
    let frac = vertex.y / bladeHeight
    quaternion2.slerp(quaternion0, frac)
    vertex.applyQuaternion(quaternion2)
    grassBaseGeometry.attributes.position.array[v] = vertex.x
    grassBaseGeometry.attributes.position.array[v + 1] = vertex.y
    grassBaseGeometry.attributes.position.array[v + 2] = vertex.z
  }

  grassBaseGeometry.computeVertexNormals()

  var instancedGeometry = new InstancedBufferGeometry()

  instancedGeometry.index = grassBaseGeometry.index
  instancedGeometry.attributes.position = grassBaseGeometry.attributes.position
  instancedGeometry.attributes.uv = grassBaseGeometry.attributes.uv
  instancedGeometry.attributes.normal = grassBaseGeometry.attributes.normal

  // Each instance has its own data for position, orientation and scale
  var indices = []
  var offsets = []
  var size = []
  var halfRootAngles = []

  //For each instance of the grass blade
  for (let i = 0; i < instances; i++) {
    indices.push(i / instances)

    //Offset of the roots
    x = Math.random() * width - width / 2
    z = Math.random() * width - width / 2
    y = 0
    offsets.push(x, y, z)

    //Random orientation
    let angle = Math.PI - Math.random() * (2 * Math.PI)
    halfRootAngles.push(Math.sin(0.5 * angle), Math.cos(0.5 * angle))

    //Define variety in height
    if (i % 3 != 0) {
      size.push(2.0 + Math.random() * 1.25)
    } else {
      size.push(2.0 + Math.random())
    }
  }
  console.log(offsets)

  var offsetAttribute = new InstancedBufferAttribute(
    new Float32Array(offsets),
    3
  )
  var sizeAttribute = new InstancedBufferAttribute(new Float32Array(size), 1)
  var halfRootAngleAttribute = new InstancedBufferAttribute(
    new Float32Array(halfRootAngles),
    2
  )
  var indexAttribute = new InstancedBufferAttribute(
    new Float32Array(indices),
    1
  )

  instancedGeometry.setAttribute("offset", offsetAttribute)
  instancedGeometry.setAttribute("size", sizeAttribute)
  instancedGeometry.setAttribute("halfRootAngle", halfRootAngleAttribute)
  instancedGeometry.setAttribute("index", indexAttribute)

  return instancedGeometry
}

export var sharedPrefix = /*glsl*/ `
  uniform sampler2D heightMap;
  float getYPosition(vec2 p){
    //  return 15.0*(2.0*texture2D(noiseTexture, p/1000.0).r - 1.0);
     return 50.0 * (2.0 * texture2D(heightMap, p/512.0).r - 1.0);
     return 50.0 * (2.0 * texture2D(heightMap, p/512.0).r - 1.0);
     //return p.b;
  }
`

var grassVertexSource = /*glsl*/ `
  ${sharedPrefix}

  precision mediump float;
  attribute vec3 position;
  attribute vec3 normal;
  attribute vec3 offset;
  attribute vec2 uv;
  attribute vec2 halfRootAngle;
  attribute float size;
  attribute float index;
  uniform float time;

  uniform float scale;
  uniform float delta;
  uniform float posX;
  uniform float posZ;
  uniform float width;
  uniform float bladeHeight;
  uniform float offsetX;
  uniform float offsetY;
  uniform bool useHeightMap;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float frc;
  varying float idx;

  const float PI = 3.1415;
  const float TWO_PI = 2.0 * PI;
  
  //https://www.geeks3d.com/20141201/how-to-rotate-a-vertex-by-a-quaternion-in-glsl/
  vec3 rotateVectorByQuaternion(vec3 v, vec4 q){
    return 2.0 * cross(q.xyz, v * q.w + cross(q.xyz, v)) + v;
  }
  
  void main() {
  
    //Vertex height in blade geometry
    frc = position.y / float(bladeHeight);  
    //Scale vertices
    vec3 vPosition = position;
    vPosition.y *= size;
  
    //Invert scaling for normals
    vNormal = normal;
    vNormal.y /= size;
  
    //Rotate blade around Y axis
    vec4 direction = vec4(0.0, halfRootAngle.x, 0.0, halfRootAngle.y);
    vPosition = rotateVectorByQuaternion(vPosition, direction);
    vNormal = rotateVectorByQuaternion(vNormal, direction);
  
    //UV for texture
    vUv = uv;
  
    vec2 pos;
    vec2 globalPos;
    vec2 tile;

    vec3 playerPosition = vec3(posX, 0,posZ);
  
    globalPos = - playerPosition.xz +offset.xz;
  
    tile = floor((globalPos + 0.5 * width) / width);
  
    pos = globalPos - tile * width;
      // pos.y =  globalPos.y - tile.y * width;
  
    //Position of the blade in the visible patch [0->1]
    vec2 fractionalPos = 0.5 + offset.xz / width;
    //To make it seamless, make it a multiple of 2*PI
    fractionalPos *= TWO_PI;

    //Wind is sine waves in time. 
    float noise = 0.5 + 0.5 * sin(fractionalPos.x + time);
    float halfAngle = -noise * 0.1;
    noise = 0.5 + 0.5 * cos(fractionalPos.y + time);
    halfAngle -= noise * 0.05;
  
    direction = normalize(vec4(sin(halfAngle), 0.0, -sin(halfAngle), cos(halfAngle)));
  
    //Rotate blade and normals according to the wind
    vPosition = rotateVectorByQuaternion(vPosition, direction);
    vNormal = rotateVectorByQuaternion(vNormal, direction);
  

    vec2 texturePosition = (vec2(pos.x+delta*posX, pos.y+delta*posZ) - vec2(offsetX, offsetY)) / (512.0 * scale);
    vec4 cord = texture2D(heightMap, texturePosition);
    if (useHeightMap) {
      cord.r = 0.5;
    }
    float y = ((2.0 * cord.r) - 1.0) * 50.0;


    //Move vertex to global location
    vPosition += vec3(pos.x, y, pos.y);
  
    //Index of instance for varying colour in fragment shader
    idx = index;
  
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
  }  
`

var grassFragmentSource = /*glsl*/ `
  precision mediump float;
  
  uniform vec3 cameraPosition;
  
  //Light uniforms
  uniform float ambientStrength;
  uniform float diffuseStrength;
  uniform float specularStrength;
  uniform float translucencyStrength;
  uniform float shininess;
  uniform vec3 lightColour;
  uniform vec3 sunDirection;
  
  
  //Surface uniforms
  uniform sampler2D map;
  uniform sampler2D alphaMap;
  uniform vec3 specularColour;
  
  varying float frc;
  varying float idx;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  vec3 ACESFilm(vec3 x){
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0);
  }
  
  void main() {
  
    //If transparent, don't draw
    if(texture2D(alphaMap, vUv).r < 0.15){
      discard;
    }
  
    vec3 normal;
  
    //Flip normals when viewing reverse of the blade
    if(gl_FrontFacing){
      normal = normalize(vNormal);
    }else{
      normal = normalize(-vNormal);
    }
  
    //Get colour data from texture
    vec3 textureColour = pow(texture2D(map, vUv).rgb, vec3(2.2));
  
    //Add different green tones towards root
    vec3 mixColour = idx > 0.75 ? vec3(0.2, 0.8, 0.06) : vec3(0.5, 0.8, 0.08);
    textureColour = mix(0.1 * mixColour, textureColour, 0.75);
  
    vec3 lightTimesTexture = lightColour * textureColour;
    vec3 ambient = textureColour;
    vec3 lightDir = normalize(sunDirection);
  
    //How much a fragment faces the light
    float dotNormalLight = dot(normal, lightDir);
    float diff = max(dotNormalLight, 0.0);
  
    //Colour when lit by light
    vec3 diffuse = diff * lightTimesTexture;
  
    float sky = max(dot(normal, vec3(0,1,0)), 0.0);
    vec3 skyLight = sky * vec3(0.12, 0.29, 0.55);
  
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    vec3 halfwayDir = normalize(lightDir + viewDirection);
    //How much a fragment directly reflects the light to the camera
    float spec = pow(max(dot(normal, halfwayDir), 0.0), shininess);
  
    //Colour of light sharply reflected into the camera
    vec3 specular = spec * specularColour * lightColour;
  
    //https://en.wikibooks.org/wiki/GLSL_Programming/Unity/Translucent_Surfaces
    vec3 diffuseTranslucency = vec3(0);
    vec3 forwardTranslucency = vec3(0);
    float dotViewLight = dot(-lightDir, viewDirection);
    if(dotNormalLight <= 0.0){
      diffuseTranslucency = lightTimesTexture * translucencyStrength * -dotNormalLight;
      if(dotViewLight > 0.0){
        forwardTranslucency = lightTimesTexture * translucencyStrength * pow(dotViewLight, 16.0);
      }
    }
  
    vec3 col = 0.3 * skyLight * textureColour + ambientStrength * ambient + diffuseStrength * diffuse + specularStrength * specular + diffuseTranslucency + forwardTranslucency;
  
    //Add a shadow towards root
    col = mix(0.35*vec3(0.1, 0.25, 0.02), col, frc);
    
    //Tonemapping
    col = ACESFilm(col);
  
    //Gamma correction 1.0/2.2 = 0.4545...
    col = pow(col, vec3(0.4545));
  
    gl_FragColor = vec4(col, 1.0);
  }
`

// export var grassMaterial = new RawShaderMaterial({
//   uniforms: {
//     time: { value: 0 },
//     delta: { value: delta },
//     posX: { value: pos.x },
//     posZ: { value: pos.y },
//     width: { value: width },
//     map: { value: grassTexture },
//     alphaMap: { value: alphaMap },
//     noiseTexture: { value: noiseTexture },
//     sunDirection: {
//       value: new Vector3(
//         Math.sin(azimuth),
//         Math.sin(elevation),
//         -Math.cos(azimuth)
//       )
//     },
//     cameraPosition: { value: new Vector3(0, 0, 0) },
//     ambientStrength: { value: ambientStrength },
//     translucencyStrength: { value: translucencyStrength },
//     diffuseStrength: { value: diffuseStrength },
//     specularStrength: { value: specularStrength },
//     shininess: { value: shininess },
//     lightColour: { value: sunColour },
//     specularColour: { value: specularColour }
//   },
//   vertexShader: grassVertexSource,
//   fragmentShader: grassFragmentSource,
//   side: DoubleSide
// })

export const Grass = forwardRef<
  Mesh,
  {
    scale?: number
    offset?: [number, number]
    noiseTexture?: Texture
    bladeHeight?: number
    bladeWidth?: number
    width?: number
    count?: number
  }
>(
  (
    {
      scale = 1.0,
      offset = [0, 0],
      width = 50,
      noiseTexture,
      bladeHeight,
      bladeWidth,
      count = 50000,
      ...props
    },
    ref
  ) => {
    const defaultNoiseTexture = useNoiseTexture()
    const materialRef = useRef<RawShaderMaterial>(null)
    const meshRef = useRef<Mesh>(null)
    const geom = useMemo(() => {
      return createGrassGeometry({ width, count, bladeHeight, bladeWidth })
    }, [width, count, bladeHeight, bladeWidth])
    useFrame(({ clock }) => {
      if (materialRef.current)
        materialRef.current.uniforms.time.value = clock.getElapsedTime() * 5

      if (meshRef.current) {
        materialRef.current.uniforms.posX.value = meshRef.current.position.x
        materialRef.current.uniforms.posZ.value = meshRef.current.position.z
      }
    })
    return (
      <mesh
        ref={mergeRefs([ref, meshRef])}
        {...props}
        frustumCulled={false}
        geometry={geom}
      >
        <rawShaderMaterial
          uniforms={{
            time: { value: 0 },
            delta: { value: delta },
            posX: { value: pos.x },
            posZ: { value: pos.y },
            offsetX: { value: offset[0] },
            offsetY: { value: offset[1] },
            width: { value: width },
            map: { value: grassTexture },
            bladeHeight: { value: 0.5 },
            useHeightMap: { value: true },
            alphaMap: { value: alphaMap },
            heightMap: { value: noiseTexture ?? defaultNoiseTexture },
            sunDirection: {
              value: new Vector3(
                Math.sin(azimuth),
                Math.sin(elevation),
                -Math.cos(azimuth)
              )
            },
            cameraPosition: { value: new Vector3(0, 0, 0) },
            ambientStrength: { value: ambientStrength },
            translucencyStrength: { value: translucencyStrength },
            diffuseStrength: { value: diffuseStrength },
            specularStrength: { value: specularStrength },
            shininess: { value: shininess },
            lightColour: { value: sunColour },
            specularColour: { value: specularColour },
            scale: { value: scale }
          }}
          vertexShader={grassVertexSource}
          fragmentShader={grassFragmentSource}
          side={DoubleSide}
          ref={materialRef}
        />
      </mesh>
    )
  }
)
