import React, { useState, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useSpring, animated } from '@react-spring/three'
import { GiHairStrands, GiLargeDress } from 'react-icons/gi'
import { IoMdClose } from 'react-icons/io'
import '../styles/home.css'

// Main menu sections
const MAIN_SECTIONS = [
  {
    id: 'body',
    title: 'Corpo',
    icon: GiLargeDress,
    subSections: [
      {
        id: 'bodyTypes',
        title: 'Corpos',
        icon: GiLargeDress,
        options: [
          { id: 'body1', label: 'Tipo 1' },
          { id: 'body2', label: 'Tipo 2' },
          { id: 'body3', label: 'Tipo 3' }
        ]
      },
      {
        id: 'skinColor',
        title: 'Cor da Pele',
        icon: GiLargeDress,
        options: [
          { id: 'skin1', label: 'Preto' },
          { id: 'skin2', label: 'Pardo' },
          { id: 'skin3', label: 'Indigena' },
          { id: 'skin4', label: 'Amarelo' },
          { id: 'skin5', label: 'Branco' }
        ]
      }
    ]
  },
  {
    id: 'face',
    title: 'Rosto',
    icon: GiLargeDress,
    options: [
      { id: 'face1', label: 'A1' },
      { id: 'face2', label: 'A2' },
      { id: 'face3', label: 'A3' },
      { id: 'face4', label: 'A4' },
      { id: 'face5', label: 'A5' }
    ]
  },
  {
    id: 'hair',
    title: 'Cabelo',
    icon: GiHairStrands,
    subSections: [
      {
        id: 'straight',
        title: 'Cabelos Lisos',
        icon: GiHairStrands,
        options: [
          { id: 1, label: '1' },
          { id: 2, label: '2' },
          { id: 3, label: '3' }
        ]
      },
      {
        id: 'cultural',
        title: 'Cabelos Culturais',
        icon: GiLargeDress,
        options: [
          { id: 4, label: '1' },
          { id: 5, label: '2' },
          { id: 6, label: '3' },
          { id: 7, label: '4' }
        ]
      },
      {
        id: 'cacheado',
        title: 'Cacheado',
        icon: GiHairStrands,
        options: [
          { id: 8, label: '1' },
          { id: 9, label: '2' }
        ]
      },
      {
        id: 'crespo',
        title: 'Crespo',
        icon: GiHairStrands,
        options: [
          { id: 10, label: '1' },
          { id: 11, label: '2' }
        ]
      },
      {
        id: 'liso',
        title: 'Liso',
        icon: GiHairStrands,
        options: [
          { id: 12, label: '1' }
        ]
      }
    ]
  }
]

// We'll load models directly in the component so we can render body + hairs inside the same group

function Home() {
  // Model position presets
  const modelPresets = [
    {
      position: [0, -0.10, 0],
      rotation: [0.20, 5.70, 0],
      scale: [1, 1, 1],
      cameraDistance: 0.24
    },
    {
      position: [-0.02, -0.12, 0],
      rotation: [-0.1, 3.14, 0], // Side view
      scale: [1, 1, 1],
      cameraDistance: 0.12
    },
    {
      position: [0, -0.11, 0],
      rotation: [0.4, 4.5, 0], // Angled view
      scale: [1, 1, 1],
      cameraDistance: 0.18
    },
    {
      position: [-0.02, -0.12, 0],
      rotation: [0.3, 0, 0], // Front view
      scale: [1, 1, 1],
      cameraDistance: 0.16
    }
  ]

  const [currentPreset, setCurrentPreset] = useState(0)

  // Define default and hair-selected positions
  const defaultPosition = modelPresets[currentPreset].position
  const defaultRotation = modelPresets[currentPreset].rotation
  const defaultScale = modelPresets[currentPreset].scale
  const defaultCameraDistance = modelPresets[currentPreset].cameraDistance

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
  // Body variants: GBody_0.glb is Tipo 1 (default), GBody_1.glb = Tipo 2, GBody_2.glb = Tipo 3
  const body0 = useGLTF('/models/female/GBody_0.glb')
  const body1 = useGLTF('/models/female/GBody_1.glb')
  const body2 = useGLTF('/models/female/GBody_2.glb')
  // Straight hairs (1-3)
  const hair0 = useGLTF('/models/female/GHair_0.glb')
  const hair1 = useGLTF('/models/female/GHair_1.glb')
  const hair2 = useGLTF('/models/female/GHair_2.glb')
  // Cultural hairs (Cultural_0 .. Cultural_3) -> ids 4..7
  const culturalHair0 = useGLTF('/models/female/Hair(FEMALE)/Cultural/Cultural_0.glb')
  const culturalHair1 = useGLTF('/models/female/Hair(FEMALE)/Cultural/Cultural_1.glb')
  const culturalHair2 = useGLTF('/models/female/Hair(FEMALE)/Cultural/Cultural_2.glb')
  const culturalHair3 = useGLTF('/models/female/Hair(FEMALE)/Cultural/Cultural_3.glb')
  // Cacheado (ids 8..9)
  const cacheado0 = useGLTF('/models/female/Hair(FEMALE)/Cacheado/Cacheado_0.glb')
  const cacheado1 = useGLTF('/models/female/Hair(FEMALE)/Cacheado/Cacheado_1.glb')
  // Crespo (ids 10..11)
  const crespo0 = useGLTF('/models/female/Hair(FEMALE)/Crespo/Crespo_0.glb')
  const crespo1 = useGLTF('/models/female/Hair(FEMALE)/Crespo/Crespo_1.glb')
  // Liso (ids 12)
  const liso0 = useGLTF('/models/female/Hair(FEMALE)/Liso/Liso_0.glb')

  // Ensure hair materials respect alpha/transparency. Run once when GLTFs load/change.
  useEffect(() => {
    const gltfs = [
      hair0, hair1, hair2,
      culturalHair0, culturalHair1, culturalHair2, culturalHair3,
      cacheado0, cacheado1,
      crespo0, crespo1,
      liso0
    ]

    gltfs.forEach(gltf => {
      if (!gltf || !gltf.scene) return
      gltf.scene.traverse((child) => {
        if (!child.isMesh) return
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach((mat) => {
          if (!mat) return
          try {
            // ativa transparência apenas para texturas com canal alpha
            mat.transparent = true

            // alphaTest descarta pixels totalmente transparentes (evita "fantasmas")
            // ajuste entre ~0.3 e 0.7 conforme necessário; 0.5 é um bom ponto de partida
            mat.alphaTest = 0.5

            // mantém depthWrite = true para que geometrias continuem sólidas no depth buffer
            mat.depthWrite = true

            // renderiza frente apenas para evitar ver o 'verso' de shells finas
            mat.side = THREE.FrontSide

            // se houver map, garanta espaço de cor correto e force atualização
            if (mat.map) {
              mat.map.encoding = THREE.sRGBEncoding
              mat.map.needsUpdate = true
            }

            mat.needsUpdate = true
          } catch (e) {
            // logamos o erro para facilitar debug caso algum material seja imutável
            // (por exemplo materiais do tipo GLTF/THREE.RawShaderMaterial)
            // mas não interrompemos a execução
            // eslint-disable-next-line no-console
            console.warn('Material config error', e)
          }
        })
      })
    })
    // run when any of the referenced gltfs change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hair0, hair1, hair2, culturalHair0, culturalHair1, culturalHair2, culturalHair3, cacheado0, cacheado1, crespo0, crespo1, liso0])

  const [selectedHair, setSelectedHair] = useState(0) // 0 = none, 1-3 = straight, 4-7 = cultural, 8-9 cacheado, 10-11 crespo, 12 liso
  const [selectedSection, setSelectedSection] = useState(null) // null = show all sections, otherwise id of MAIN_SECTIONS
  const [selectedSubSection, setSelectedSubSection] = useState(null) // when a section has subSections, this selects the sub-card

  // lightweight selection state for body/face (placeholders for future behavior)
  // default to Tipo 1 which corresponds to GBody_0.glb
  const [selectedBodyType, setSelectedBodyType] = useState('body1')
  const [selectedSkinColor, setSelectedSkinColor] = useState(null)
  const [selectedFaceOption, setSelectedFaceOption] = useState(null)

  // Maximum hair id (update when adding new models)
  const MAX_HAIR_ID = 12

  // Create springs for smooth transitions
  const springs = useSpring({
    position: defaultPosition, // Always use preset position
    rotation: defaultRotation, // Always use preset rotation
    scale: defaultScale,      // Always use preset scale
    config: { mass: 1, tension: 170, friction: 26 },
    onChange: ({ value }) => {
      setModelPosition(value.position)
      setModelRotation(value.rotation)
      setModelScale(value.scale)
    },
  })

  // Spring for camera distance
  const cameraSpring = useSpring({
    distance: defaultCameraDistance,  // Always use preset camera distance
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
    // pick the current body gltf based on selectedBodyType
    const currentBody = selectedBodyType === 'body2' ? body1 : (selectedBodyType === 'body3' ? body2 : body0)
    if (!currentBody || !currentBody.scene || !controls) return

    const box = new THREE.Box3().setFromObject(currentBody.scene)
    const sphere = box.getBoundingSphere(new THREE.Sphere())
    const center = sphere.center

    // keep the configured cameraDistance (do not auto-change it when hairs are toggled)
    const cam = controls.object
    cam.position.set(center.x, center.y, center.z + cameraDistance)
    controls.target.copy(center)
    controls.update()

    setInitialFitDone(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body0, body1, body2, selectedBodyType, orbitControlsRef.current])

  return (
    <div className="home-page">
      <div className="viewer-container">
        {/* overlays */}
        <div className="overlay-top">
          <button onClick={() => setSelectedHair((s) => Math.max(0, s - 1))}>&lt;</button>
          <button onClick={() => setSelectedHair((s) => Math.min(MAX_HAIR_ID, s + 1))}>&gt;</button>
        </div>
        {/* Preset position arrows */}
        <div className="preset-arrows">
          <button 
            onClick={() => setCurrentPreset((p) => (p - 1 + modelPresets.length) % modelPresets.length)}
          >
            ⟲
          </button>
          <button 
            onClick={() => setCurrentPreset((p) => (p + 1) % modelPresets.length)}
          >
            ⟳
          </button>
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
            {/* render currently selected body variant */}
            {((() => {
              const current = selectedBodyType === 'body2' ? body1 : (selectedBodyType === 'body3' ? body2 : body0)
              return current && current.scene ? <primitive object={current.scene} /> : null
            })())}
            {selectedHair === 1 && hair0 && <primitive object={hair0.scene} />}
            {selectedHair === 2 && hair1 && <primitive object={hair1.scene} />}
            {selectedHair === 3 && hair2 && <primitive object={hair2.scene} />}
            {selectedHair === 4 && culturalHair0 && <primitive object={culturalHair0.scene} />}
            {selectedHair === 5 && culturalHair1 && <primitive object={culturalHair1.scene} />}
            {selectedHair === 6 && culturalHair2 && <primitive object={culturalHair2.scene} />}
            {selectedHair === 7 && culturalHair3 && <primitive object={culturalHair3.scene} />}
            {selectedHair === 8 && cacheado0 && <primitive object={cacheado0.scene} />}
            {selectedHair === 9 && cacheado1 && <primitive object={cacheado1.scene} />}
            {selectedHair === 10 && crespo0 && <primitive object={crespo0.scene} />}
            {selectedHair === 11 && crespo1 && <primitive object={crespo1.scene} />}
            {selectedHair === 12 && liso0 && <primitive object={liso0.scene} />}
          </animated.group>

          <OrbitControls
            ref={orbitControlsRef}
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
            minDistance={0.000001}
            maxDistance={1e12}
          />
        </Canvas>

        <div className="overlay-bottom">
          <div className="hair-sections">
            {!selectedSection ? (
              // Show main section cards
              <div className="main-sections-grid">
                {MAIN_SECTIONS.map(section => (
                  <button
                    key={section.id}
                    className="section-card"
                    onClick={() => { setSelectedSection(section.id); setSelectedSubSection(null) }}
                  >
                    <section.icon size={24} />
                    <span>{section.title}</span>
                  </button>
                ))}
              </div>
            ) : (
              // Show selected section card with nested navigation (sub-cards -> options)
              <div className="section-options">
                <div className="section-header">
                  <h3>
                    {MAIN_SECTIONS.find(s => s.id === selectedSection)?.icon({ size: 20 })}
                    <span>{MAIN_SECTIONS.find(s => s.id === selectedSection)?.title}</span>
                  </h3>
                  <div style={{display: 'flex', gap: 8}}>
                    {selectedSubSection && (
                      <button className="back-button" onClick={() => setSelectedSubSection(null)}>
                        ←
                      </button>
                    )}
                    <button className="close-button" onClick={() => { setSelectedSection(null); setSelectedSubSection(null) }}>
                      <IoMdClose size={20} />
                    </button>
                  </div>
                </div>

                {(() => {
                  const section = MAIN_SECTIONS.find(s => s.id === selectedSection)

                  // If the section has subSections, show the sub-cards (compact) or selected sub-section options
                  if (section?.subSections) {
                    // If no subSection selected, show the sub-cards
                    if (!selectedSubSection) {
                      return (
                        <div className="subsections-grid">
                          {section.subSections.map(sub => (
                            <button
                              key={sub.id}
                              className="subsection-card"
                              onClick={() => setSelectedSubSection(sub.id)}
                            >
                              <sub.icon size={18} />
                              <div className="subsection-info">
                                <div className="subsection-title">{sub.title}</div>
                                <div className="subsection-count">{sub.options.length} opções</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )
                    }

                    // show options for the selected sub-section
                    const sub = section.subSections.find(s => s.id === selectedSubSection)
                    if (!sub) return null
                    return (
                      <div className="options-card">
                        <div className="options-card-header">
                          <h4>{sub.title}</h4>
                        </div>
                        <div className="options-grid options-grid-wrap">
                          {sub.options.map(option => (
                            <button
                              key={option.id}
                              className={`option-button ${selectedHair === option.id ? 'active' : ''}`}
                              onClick={() => {
                                if (selectedSection === 'hair') {
                                  setSelectedHair(option.id)
                                } else if (selectedSection === 'body') {
                                  // body sub-sections: identify by sub.id
                                  if (sub.id === 'bodyTypes') setSelectedBodyType(option.id)
                                  if (sub.id === 'skinColor') setSelectedSkinColor(option.id)
                                }
                                // face handled elsewhere
                              }}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  }

                  // If section has direct options (like face), show them inside the card
                  if (section?.options) {
                    return (
                      <div className="options-card">
                        <div className="options-grid">
                          {section.options.map(option => (
                            <button
                              key={option.id}
                              className={`option-button ${selectedFaceOption === option.id ? 'active' : ''}`}
                              onClick={() => setSelectedFaceOption(option.id)}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  }
                })()}

                {/* reset button for hair stays */}
                {selectedSection === 'hair' && selectedHair !== 0 && (
                  <button className="reset-button" onClick={() => setSelectedHair(0)}>
                    Remover Cabelo
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home