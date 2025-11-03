import React, { useState, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useSpring, animated } from '@react-spring/three'
import '../styles/home.css'

// We'll load models directly in the component so we can render body + hairs inside the same group

function Home() {
  // Define default and hair-selected positions
  const defaultPosition = [0, -0.10, 0]
  const defaultRotation = [0.20, 5.70, 0]
  const defaultScale = [1, 1, 1]
  const defaultCameraDistance = 0.24

  const hairPosition = [0, -0.15, 0]
  const hairRotation = [0.25, 5.8, 0]
  const hairScale = [1, 1, 1]
  const hairCameraDistance = 0.18

  // State to track current values
  const [modelPosition, setModelPosition] = useState(defaultPosition)
  const [modelRotation, setModelRotation] = useState(defaultRotation)
  const [modelScale, setModelScale] = useState(defaultScale)
  const [cameraDistance, setCameraDistance] = useState(defaultCameraDistance) // Ajuste este valor para alterar o zoom inicial
  const orbitControlsRef = useRef()
  const groupRef = useRef()
  const [initialFitDone, setInitialFitDone] = useState(false)
  const [suppressControls, setSuppressControls] = useState(false)

  // load GLB files (body + hairs)
  const body = useGLTF('/models/female/GBody_0.glb')
  const hair0 = useGLTF('/models/female/GHair_0.glb')
  const hair1 = useGLTF('/models/female/GHair_1.glb')
  const hair2 = useGLTF('/models/female/GHair_2.glb')

  const [selectedHair, setSelectedHair] = useState(0) // 0 = none, 1..3 = hair index

  // Create springs for smooth transitions
  const springs = useSpring({
    position: selectedHair === 0 ? defaultPosition : hairPosition,
    rotation: selectedHair === 0 ? defaultRotation : hairRotation,
    scale: selectedHair === 0 ? defaultScale : hairScale,
    config: { mass: 1, tension: 170, friction: 26 },
    onChange: ({ value }) => {
      setModelPosition(value.position)
      setModelRotation(value.rotation)
      setModelScale(value.scale)
    },
  })

  // Spring for camera distance
  const cameraSpring = useSpring({
    distance: selectedHair === 0 ? defaultCameraDistance : hairCameraDistance,
    config: { mass: 1, tension: 170, friction: 26 },
    onChange: ({ value }) => {
      setCameraDistance(value.distance)
    },
  })

  // Keep camera distance fixed when toggling hairs: preserve camera direction but re-apply configured distance
  useEffect(() => {
    const controls = orbitControlsRef.current
    if (!controls) return
    const cam = controls.object
    // direction from target to camera
    const dir = new THREE.Vector3().subVectors(cam.position, controls.target).normalize()
    // set camera at same direction but fixed distance
    cam.position.copy(controls.target.clone().add(dir.multiplyScalar(cameraDistance)))
    controls.update()
  }, [selectedHair, cameraDistance])

  // When selectedHair changes, briefly suppress OrbitControls 'change' reactions so cameraDistance/state isn't updated
  useEffect(() => {
    if (!orbitControlsRef.current) return
    setSuppressControls(true)
    // re-apply camera position immediately to enforce exact distance
    const controls = orbitControlsRef.current
    const cam = controls.object
    const dir = new THREE.Vector3().subVectors(cam.position, controls.target).normalize()
    cam.position.copy(controls.target.clone().add(dir.multiplyScalar(cameraDistance)))
    controls.update()
    // clear suppression after a short delay to allow scene to settle
    const t = setTimeout(() => setSuppressControls(false), 150)
    return () => clearTimeout(t)
  }, [selectedHair])

  const handlePositionChange = (axis, value) => {
    const newPosition = [...modelPosition]
    newPosition[axis] = parseFloat(value)
    setModelPosition(newPosition)
  }

  const handleRotationChange = (axis, value) => {
    const newRotation = [...modelRotation]
    newRotation[axis] = parseFloat(value)
    setModelRotation(newRotation)
  }

  const handleScaleChange = (axis, value) => {
    const newScale = [...modelScale]
    newScale[axis] = parseFloat(value)
    setModelScale(newScale)
  }

  const handleZoomChange = (value) => {
    const distance = parseFloat(value)
    setCameraDistance(distance)
    if (orbitControlsRef.current) {
      orbitControlsRef.current.object.position.z = distance
      orbitControlsRef.current.update()
    }
  }

  const handleZoomIn = () => {
    const newDistance = cameraDistance * 0.5
    handleZoomChange(newDistance)
  }

  const handleZoomOut = () => {
    const newDistance = cameraDistance * 2
    handleZoomChange(newDistance)
  }

  // When OrbitControls moves (user rotates/zooms camera), update cameraDistance state
  useEffect(() => {
    const controls = orbitControlsRef.current
    if (!controls) return
    const onChange = () => {
      if (suppressControls) return
      // compute distance from camera to model (or origin if model not present)
      const camPos = controls.object.position
      const target = new THREE.Vector3(
        modelPosition[0] || 0,
        modelPosition[1] || 0,
        modelPosition[2] || 0
      )
      const distance = camPos.distanceTo(target)
      setCameraDistance(parseFloat(distance.toFixed(4)))
    }
    controls.addEventListener('change', onChange)
    return () => controls.removeEventListener('change', onChange)
  }, [modelPosition])

  // Initial camera fit: position camera target to body center, but keep initial cameraDistance
  // Do this once when body is loaded to avoid re-fitting when hairs are toggled.
  useEffect(() => {
    if (initialFitDone) return
    const controls = orbitControlsRef.current
    if (!body || !body.scene || !controls) return

    const box = new THREE.Box3().setFromObject(body.scene)
    const sphere = box.getBoundingSphere(new THREE.Sphere())
    const center = sphere.center

    // keep the configured cameraDistance (do not auto-change it when hairs are toggled)
    const cam = controls.object
    cam.position.set(center.x, center.y, center.z + cameraDistance)
    controls.target.copy(center)
    controls.update()

    setInitialFitDone(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body, orbitControlsRef.current])

  return (
    <div className="home-page">
      <div className="viewer-container">
        {/* overlays */}
        <div className="overlay-top">
          <button onClick={() => setSelectedHair((s) => Math.max(0, s - 1))}>&lt;</button>
          <button onClick={() => setSelectedHair((s) => Math.min(3, s + 1))}>&gt;</button>
        </div>

        <Canvas camera={{ position: [0, 0, cameraDistance], fov: 75 }}>
          <ambientLight intensity={1.2} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          {/* Group that holds body + optional hair; group transform drives both */}
          <animated.group
            ref={groupRef}
            position={springs.position}
            rotation={springs.rotation}
            scale={springs.scale}
          >
            {body && <primitive object={body.scene} />}
            {selectedHair === 1 && hair0 && <primitive object={hair0.scene} />}
            {selectedHair === 2 && hair1 && <primitive object={hair1.scene} />}
            {selectedHair === 3 && hair2 && <primitive object={hair2.scene} />}
          </animated.group>

          <OrbitControls
            ref={orbitControlsRef}
            enableZoom={true}
            minDistance={0.000001}
            maxDistance={1e12}
          />
        </Canvas>

        <div className="overlay-bottom">
          <div>Selection:</div>
          <div className="counter">{selectedHair}</div>
          <div className="nums">
            <button onClick={() => setSelectedHair(1)}>1</button>
            <button onClick={() => setSelectedHair(2)}>2</button>
            <button onClick={() => setSelectedHair(3)}>3</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home