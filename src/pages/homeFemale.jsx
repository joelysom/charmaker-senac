import React, { useState, useRef, useEffect, useMemo } from 'react'
// firestore handled by SaveCharacter component
import SaveButton from '../components/SaveCharacter'
import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useSpring, animated } from '@react-spring/three'
import { GiHairStrands, GiLargeDress } from 'react-icons/gi'
import { IoMdClose } from 'react-icons/io'
import '../styles/home.css'
import { auth, db } from '../firebase/firebase'
import { doc, getDoc } from 'firebase/firestore'

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
        id: 'cultural',
        title: 'Cabelos Culturais',
        icon: GiLargeDress,
        options: [
          { id: 4, label: '1' },
          { id: 5, label: '2' },
          { id: 6, label: '3' },
          { id: 7, label: '4' },
          { id: 13, label: '5' }
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
        // merged with previous "Cabelos Lisos" options (1..3)
        options: [
          { id: 1, label: '1' },
          { id: 2, label: '2' },
          { id: 3, label: '3' },
          { id: 12, label: '4' }
        ]
      },
      {
        id: 'ondulado',
        title: 'Ondulado',
        icon: GiHairStrands,
        options: [
          { id: 14, label: '1' },
          { id: 15, label: '2' },
          { id: 16, label: '3' }
        ]
      }
    ]
  }
]

// We'll load models directly in the component so we can render body + hairs inside the same group

function Home({ onDone }) {
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
  
  // Face variants that correspond to body types
  const face0 = useGLTF('/models/female/GFace_0.glb')
  const face1 = useGLTF('/models/female/GFace_1.glb')
  const face2 = useGLTF('/models/female/GFace_2.glb')
  
  // Straight hairs (1-3)
  const hair0 = useGLTF('/models/female/GHair_0.glb')
  const hair1 = useGLTF('/models/female/GHair_1.glb')
  const hair2 = useGLTF('/models/female/GHair_2.glb')
  // Cultural hairs (Cultural_0 .. Cultural_3 + Cultural_4) -> ids 4..7 and 13
  const culturalHair0 = useGLTF('/models/female/Hair(FEMALE)/Cultural/Cultural_0.glb')
  const culturalHair1 = useGLTF('/models/female/Hair(FEMALE)/Cultural/Cultural_1.glb')
  const culturalHair2 = useGLTF('/models/female/Hair(FEMALE)/Cultural/Cultural_2.glb')
  const culturalHair3 = useGLTF('/models/female/Hair(FEMALE)/Cultural/Cultural_3.glb')
  const culturalHair4 = useGLTF('/models/female/Hair(FEMALE)/Cultural/Cultural_4.glb')
  // Cacheado (ids 8..9)
  const cacheado0 = useGLTF('/models/female/Hair(FEMALE)/Cacheado/Cacheado_0.glb')
  const cacheado1 = useGLTF('/models/female/Hair(FEMALE)/Cacheado/Cacheado_1.glb')
  // Crespo (ids 10..11)
  const crespo0 = useGLTF('/models/female/Hair(FEMALE)/Crespo/Crespo_0.glb')
  const crespo1 = useGLTF('/models/female/Hair(FEMALE)/Crespo/Crespo_1.glb')
  // Carregar textura do Crespo_1
  const crespo1Texture = useMemo(() => {
    const loader = new THREE.TextureLoader()
    const texture = loader.load('/models/female/Hair(FEMALE)/Crespo/Crespo_1.png')
    texture.flipY = false
    texture.encoding = THREE.sRGBEncoding
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])
  // Liso (ids 1..3 and 12)
  const liso0 = useGLTF('/models/female/Hair(FEMALE)/Liso/Liso_0.glb')
  // Ondulado (ids 14..16)
  const ondulado0 = useGLTF('/models/female/Hair(FEMALE)/Ondulado/Ondulado_0.glb')
  const ondulado1 = useGLTF('/models/female/Hair(FEMALE)/Ondulado/Ondulado_1.glb')
  const ondulado2 = useGLTF('/models/female/Hair(FEMALE)/Ondulado/Ondulado_2.glb')

  // Ensure all materials (body and hair) respect alpha/transparency. Run once when GLTFs load/change.
  // Effect para aplicar a textura ao modelo Crespo_1
  useEffect(() => {
    if (crespo1 && crespo1.scene && crespo1Texture) {
      crespo1.scene.traverse((child) => {
        if (child.isMesh) {
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach((mat) => {
            if (!mat) return
            mat.map = crespo1Texture
            mat.transparent = true
            mat.alphaTest = 0.7
            mat.depthWrite = true
            mat.side = THREE.DoubleSide
            mat.needsUpdate = true
          })
        }
      })
    }
  }, [crespo1, crespo1Texture])

  useEffect(() => {
    const gltfs = [
      // Include body models
      body0, body1, body2,
      // Include face models
      face0, face1, face2,
      // Hair models
      hair0, hair1, hair2,
      culturalHair0, culturalHair1, culturalHair2, culturalHair3, culturalHair4,
      cacheado0, cacheado1,
      crespo0, crespo1,
      liso0,
      ondulado0, ondulado1, ondulado2
    ]

    gltfs.forEach(gltf => {
      if (!gltf || !gltf.scene) return
      gltf.scene.traverse((child) => {
        if (!child.isMesh) return
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach((mat) => {
          if (!mat) return
          try {
            // Ativa transparência apenas para texturas com canal alpha
            mat.transparent = true

            // AlphaTest mais agressivo para eliminar "fantasmas" completamente
            // 0.7 é mais rigoroso que 0.5, descartando mais pixels semi-transparentes
            mat.alphaTest = 0.7

            // Mantém depthWrite = true para que geometrias continuem sólidas no depth buffer
            mat.depthWrite = true

            // Renderiza frente e verso para garantir que não haja artefatos em nenhum ângulo
            mat.side = THREE.DoubleSide

            // Se houver map, garanta espaço de cor correto e force atualização
            if (mat.map) {
              mat.map.encoding = THREE.sRGBEncoding
              mat.map.needsUpdate = true
            }

            // Força blending aditivo para melhor qualidade nas transparências
            mat.blending = THREE.NormalBlending
            mat.premultipliedAlpha = true

            mat.needsUpdate = true
          } catch (e) {
            // Logamos o erro para facilitar debug caso algum material seja imutável
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
  }, [hair0, hair1, hair2, culturalHair0, culturalHair1, culturalHair2, culturalHair3, 
      cacheado0, cacheado1, crespo0, crespo1, liso0, body0, body1, body2, face0, face1, face2])

  const [selectedHair, setSelectedHair] = useState(8) // Start with Cacheado_1 pre-selected (id 8)
  const [selectedSection, setSelectedSection] = useState(null) // null = show all sections, otherwise id of MAIN_SECTIONS
  const [selectedSubSection, setSelectedSubSection] = useState(null) // when a section has subSections, this selects the sub-card

  // lightweight selection state for body/face (placeholders for future behavior)
  // default to Tipo 1 which corresponds to GBody_0.glb
  const [selectedBodyType, setSelectedBodyType] = useState('body1')
  const [selectedSkinColor, setSelectedSkinColor] = useState('skin1') // Default to 'Preto'
  const [selectedFaceOption, setSelectedFaceOption] = useState('face1') // Default to A1 (Preto)

  // Load saved character for current user (if any) to initialize the editor
  useEffect(() => {
    let mounted = true
    const loadSavedCharacter = async () => {
      try {
        const user = auth.currentUser
        if (!user) return
        const snap = await getDoc(doc(db, 'characters', user.uid))
        if (!snap.exists()) return
        const data = snap.data()
        if (!mounted) return
        if (data.bodyType) setSelectedBodyType(data.bodyType)
        // `skinCode` stores the original skin id (e.g. 'skin1') in SaveCharacter
        if (data.skinCode) setSelectedSkinColor(data.skinCode)
        // if SaveCharacter saved faceOption
        if (data.faceOption) setSelectedFaceOption(data.faceOption)
        if (typeof data.hairId === 'number') setSelectedHair(data.hairId)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Não foi possível carregar personagem salvo:', e)
      }
    }
    loadSavedCharacter()
    return () => { mounted = false }
  }, [])
  
  // Função para gerar o caminho da textura do rosto baseado na seleção atual
  const getFaceTexturePath = (faceOption, skinColor) => {
    const basePath = '/models/female/TEXTURES'
    const selectedSkinFolder = skinIdToFolderName[skinColor] // Pasta da cor da pele atual (PRETO, PARDO, etc)
    const faceTextureName = faceTypeToTextureName[faceOption] // Tipo de rosto da opção selecionada (A1=PRETO, A2=PARDO, etc)
    
    // O nome do arquivo é baseado no tipo de rosto (A1-A5) que queremos mostrar
    // e o sufixo (_0 a _4) é baseado na cor da pele atual
    // Exemplo: se A1 (face1=PRETO) está selecionado e a pele é PARDO, carrega PRETO_3.png
    return `${basePath}/${selectedSkinFolder}/ROSTO/${faceTextureName}${skinTypeToTextureId[selectedSkinFolder]}.png`
  }

  // Mapa de texturas para cores de pele
  const skinTextureMap = {
    skin1: '/models/female/TEXTURES/PRETO/CORPO_PRETO/PRETO.png',
    skin2: '/models/female/TEXTURES/PARDO/CORPO_PARDO/PARDO.png',
    skin3: '/models/female/TEXTURES/INDIGENA/CORPO_INDIGENA/INDIGENA.png',
    skin4: '/models/female/TEXTURES/AMARELO/CORPO_AMARELO/AMARELO.png',
    skin5: '/models/female/TEXTURES/BRANCO/CORPO_BRANCO/BRANCO.png'
  }

  // Mapeamento entre opção de rosto (A1-A5) e tom de pele
  const faceTypeToTextureName = {
    face1: 'PRETO',    // A1 - Preto
    face2: 'PARDO',    // A2 - Pardo
    face3: 'INDIGENA', // A3 - Indígena
    face4: 'AMARELO',  // A4 - Amarelo
    face5: 'BRANCO'    // A5 - Branco
  }

  // Mapeamento do ID da textura baseado no tom de pele selecionado
  const skinTypeToTextureId = {
    'PRETO': '_0',     // ID 0 quando a pele é Preta
    'AMARELO': '_1',   // ID 1 quando a pele é Amarela
    'BRANCO': '_2',    // ID 2 quando a pele é Branca
    'PARDO': '_3',     // ID 3 quando a pele é Parda
    'INDIGENA': '_4'   // ID 4 quando a pele é Indígena
  }

  // Mapeamento reverso de skin1-skin5 para nomes de pasta
  const skinIdToFolderName = {
    skin1: 'PRETO',
    skin2: 'PARDO',
    skin3: 'INDIGENA',
    skin4: 'AMARELO',
    skin5: 'BRANCO'
  }

  // Pre-carrega todas as texturas (corpo e rosto)
  const { skinTextures, faceTexture } = useMemo(() => {
    const textures = {}
    const loader = new THREE.TextureLoader()
    
    // Função para configurar a textura
    const setupTexture = (texture) => {
      texture.flipY = false
      texture.encoding = THREE.sRGBEncoding
      texture.colorSpace = THREE.SRGBColorSpace
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.generateMipmaps = true
      return texture
    }

    // Carrega texturas do corpo
    Object.entries(skinTextureMap).forEach(([key, path]) => {
      textures[key] = setupTexture(loader.load(path))
    })

    // Carrega textura inicial do rosto
    const initialFaceTexture = setupTexture(
      loader.load(getFaceTexturePath(selectedFaceOption, selectedSkinColor))
    )

    return {
      skinTextures: textures,
      faceTexture: initialFaceTexture
    }
  }, []) // Carrega apenas uma vez

  // Referência à textura atual do corpo
  const currentBodyTexture = useMemo(() => 
    skinTextures[selectedSkinColor], 
    [selectedSkinColor, skinTextures]
  )

  // Atualiza a textura do rosto quando mudar a seleção do rosto ou cor da pele
  const currentFaceTexture = useMemo(() => {
    const loader = new THREE.TextureLoader()
    const setupTexture = (texture) => {
      texture.flipY = false
      texture.encoding = THREE.sRGBEncoding
      texture.colorSpace = THREE.SRGBColorSpace
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.generateMipmaps = true
      return texture
    }
    
    return setupTexture(loader.load(getFaceTexturePath(selectedFaceOption, selectedSkinColor)))
  }, [selectedFaceOption, selectedSkinColor])

  // Effect para atualizar as texturas quando mudar a seleção
  useEffect(() => {
    // Seleciona o corpo e rosto corretos baseado no tipo selecionado
    const currentBody = selectedBodyType === 'body2' ? body1 : (selectedBodyType === 'body3' ? body2 : body0)
    const currentFace = selectedBodyType === 'body2' ? face1 : (selectedBodyType === 'body3' ? face2 : face0)
    
    if (!currentBody?.scene || !currentBodyTexture || !currentFace?.scene || !currentFaceTexture) return

    // Guarda as referências originais dos materiais do corpo
    if (!currentBody.scene.userData.originalMaterials) {
      currentBody.scene.userData.originalMaterials = new Map()
    }

    // Guarda as referências originais dos materiais do rosto
    if (!currentFace.scene.userData.originalMaterials) {
      currentFace.scene.userData.originalMaterials = new Map()
    }

    // Atualiza materiais do corpo
    currentBody.scene.traverse((node) => {
      if (!node.isMesh) return
      const materials = Array.isArray(node.material) ? node.material : [node.material]
      
      materials.forEach(mat => {
        if (!mat || !mat.map) return
        
        // Guarda material original se ainda não guardamos
        const originalKey = node.uuid + '-' + mat.uuid
        if (!currentBody.scene.userData.originalMaterials.has(originalKey)) {
          currentBody.scene.userData.originalMaterials.set(originalKey, mat.clone())
        }
        
        // Pega referência do material original
        const originalMat = currentBody.scene.userData.originalMaterials.get(originalKey)
        
        // Configurações de material otimizadas
        mat.map = currentBodyTexture
        mat.transparent = false
        mat.opacity = 1.0
        mat.alphaTest = 0
        mat.depthWrite = true
        mat.depthTest = true
        mat.side = THREE.FrontSide
        
        // Mantém as propriedades originais do material
        mat.roughness = originalMat.roughness || 0.8
        mat.metalness = originalMat.metalness || 0.0
        mat.envMapIntensity = originalMat.envMapIntensity || 0.8
        mat.color.copy(originalMat.color)
        
        // Configurações de renderização
        mat.blending = THREE.NoBlending
        mat.premultipliedAlpha = false
        
        // Atualiza apenas a textura sem recriar o material
        mat.map.needsUpdate = true
        mat.needsUpdate = true
      })
    })

    // Atualiza materiais do rosto
    currentFace.scene.traverse((node) => {
      if (!node.isMesh) return

      // Converte para array mesmo se for material único
      const materials = Array.isArray(node.material) ? node.material : [node.material]
      
      materials.forEach(mat => {
        if (!mat) return
        
        // Cria um novo material se não existir
        if (!mat.map) {
          mat.map = currentFaceTexture
        }
        
        // Guarda material original se ainda não guardamos
        const originalKey = node.uuid + '-' + mat.uuid
        if (!currentFace.scene.userData.originalMaterials.has(originalKey)) {
          currentFace.scene.userData.originalMaterials.set(originalKey, mat.clone())
        }
        
        // Pega referência do material original
        const originalMat = currentFace.scene.userData.originalMaterials.get(originalKey)
        
        // Configurações específicas para texturas do rosto
        mat.map = currentFaceTexture
        mat.transparent = true // Rosto precisa de transparência
        mat.opacity = 1.0
        mat.alphaTest = 0.1 // Valor mais baixo para texturas do rosto
        mat.depthWrite = true
        mat.depthTest = true
        mat.side = THREE.DoubleSide // Importante para o rosto
        
        // Mantém as propriedades originais do material
        mat.roughness = originalMat.roughness || 0.5 // Menor roughness para o rosto
        mat.metalness = originalMat.metalness || 0.0
        mat.envMapIntensity = originalMat.envMapIntensity || 1.0 // Mais brilho para o rosto
        mat.color.copy(originalMat.color)
        
        // Configurações de renderização específicas para o rosto
        mat.blending = THREE.NormalBlending
        mat.premultipliedAlpha = true
        
        // Atualiza a textura e o material
        if (mat.map) {
          mat.map.needsUpdate = true
          mat.needsUpdate = true
        }
      })
    })
  }, [selectedSkinColor, selectedBodyType, selectedFaceOption, body0, body1, body2, face0, face1, face2, currentBodyTexture, currentFaceTexture])

  // Maximum hair id (update when adding new models)
  const MAX_HAIR_ID = 16

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
          <div style={{ marginLeft: 'auto' }}>
            <SaveButton
              gender="female"
              selectedBodyType={selectedBodyType}
              selectedSkinColor={selectedSkinColor}
              selectedFaceOption={selectedFaceOption}
              selectedHair={selectedHair}
              onDone={onDone}
            />
          </div>
        </div>
        {/* Preset position arrows */}
        <div className="preset-arrows">
          {/* Rotation / preset controls use image buttons as requested */}
          <button
            className="img-button"
            aria-label="Rotação anterior"
            onClick={() => setCurrentPreset((p) => (p - 1 + modelPresets.length) % modelPresets.length)}
            title="Rotação anterior"
          >
            <img src="/charmaker/left.png" alt="rot-left" />
          </button>
          <button
            className="img-button"
            aria-label="Próxima rotação"
            onClick={() => setCurrentPreset((p) => (p + 1) % modelPresets.length)}
            title="Próxima rotação"
          >
            <img src="/charmaker/right.png" alt="rot-right" />
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
            {/* render currently selected body and corresponding face */}
            {((() => {
              // Select the correct body and face pair based on body type
              const currentBody = selectedBodyType === 'body2' ? body1 : (selectedBodyType === 'body3' ? body2 : body0)
              const currentFace = selectedBodyType === 'body2' ? face1 : (selectedBodyType === 'body3' ? face2 : face0)
              
              return (
                <>
                  {currentBody && currentBody.scene && <primitive object={currentBody.scene} />}
                  {currentFace && currentFace.scene && <primitive object={currentFace.scene} />}
                </>
              )
            })())}
            {selectedHair === 1 && hair0 && <primitive object={hair0.scene} />}
            {selectedHair === 2 && hair1 && <primitive object={hair1.scene} />}
            {selectedHair === 3 && hair2 && <primitive object={hair2.scene} />}
            {selectedHair === 4 && culturalHair0 && <primitive object={culturalHair0.scene} />}
            {selectedHair === 5 && culturalHair1 && <primitive object={culturalHair1.scene} />}
            {selectedHair === 6 && culturalHair2 && <primitive object={culturalHair2.scene} />}
            {selectedHair === 7 && culturalHair3 && <primitive object={culturalHair3.scene} />}
            {selectedHair === 13 && culturalHair4 && <primitive object={culturalHair4.scene} />}
            {selectedHair === 8 && cacheado0 && <primitive object={cacheado0.scene} />}
            {selectedHair === 9 && cacheado1 && <primitive object={cacheado1.scene} />}
            {selectedHair === 10 && crespo0 && <primitive object={crespo0.scene} />}
            {selectedHair === 11 && crespo1 && <primitive object={crespo1.scene} />}
            {selectedHair === 12 && liso0 && <primitive object={liso0.scene} />}
            {selectedHair === 14 && ondulado0 && <primitive object={ondulado0.scene} />}
            {selectedHair === 15 && ondulado1 && <primitive object={ondulado1.scene} />}
            {selectedHair === 16 && ondulado2 && <primitive object={ondulado2.scene} /> }
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home