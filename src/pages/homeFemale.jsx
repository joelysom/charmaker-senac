import React, { useState, useRef, useEffect, useMemo, useCallback, Suspense } from 'react'
import SaveButton from '../components/SaveCharacter'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, useTexture, Preload } from '@react-three/drei'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { useSpring, animated } from '@react-spring/three'
import { GiHairStrands, GiLargeDress } from 'react-icons/gi'
import { IoMdClose } from 'react-icons/io'
import '../styles/home.css'
import { auth, db } from '../firebase/firebase'
import { doc, getDoc } from 'firebase/firestore'

// ==============================================================
// 🛡️ ERROR BOUNDARY
// ==============================================================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true }
  }
  componentDidCatch(error, errorInfo) {
    console.error("🚨 Erro capturado no 3D:", error)
    console.error("Detalhes do erro:", errorInfo)
  }
  componentDidUpdate(prevProps) {
    if (this.props.resetKey !== prevProps.resetKey) {
      this.setState({ hasError: false })
    }
  }
  render() {
    if (this.state.hasError) return null 
    return this.props.children
  }
}

// ==============================================================
// 📂 MAPEAMENTO DE ARQUIVOS
// ==============================================================

const BODY_MODELS = {
  body1: '/models/female/GBody_0.glb', 
  body2: '/models/female/GBody_1.glb', 
  body3: '/models/female/GBody_2.glb', 
}

const FACE_MODELS = {
  body1: '/models/female/GFace_0.glb',
  body2: '/models/female/GFace_1.glb',
  body3: '/models/female/GFace_2.glb',
}

const HAIR_MODELS = {
  // Básicos
  1: '/models/female/GHair_0.glb',
  2: '/models/female/GHair_1.glb',
  3: '/models/female/GHair_2.glb',
  
  // Culturais
  4: '/models/female/Hair(FEMALE)/Cultural/Cultural_0.glb', 
  5: '/models/female/Hair(FEMALE)/Cultural/Cultural_1.glb',
  6: '/models/female/Hair(FEMALE)/Cultural/Cultural_2.glb',
  7: '/models/female/Hair(FEMALE)/Cultural/Cultural_3.glb',
  13: '/models/female/Hair(FEMALE)/Cultural/Cultural_4.glb',

  // Cacheado
  8: '/models/female/Hair(FEMALE)/Cacheado/Cacheado_0.glb',
  9: '/models/female/Hair(FEMALE)/Cacheado/Cacheado_1.glb',

  // Crespo
  10: '/models/female/Hair(FEMALE)/Crespo/Crespo_0.glb',
  11: '/models/female/Hair(FEMALE)/Crespo/Crespo_1.glb',

  // Liso Extra
  12: '/models/female/Hair(FEMALE)/Liso/Liso_0.glb',

  // Ondulado
  14: '/models/female/Hair(FEMALE)/Ondulado/Ondulado_0.glb',
  15: '/models/female/Hair(FEMALE)/Ondulado/Ondulado_1.glb',
  16: '/models/female/Hair(FEMALE)/Ondulado/Ondulado_2.glb',
}

const SKIN_TEXTURE_MAP = {
  skin1: '/models/female/TEXTURES/PRETO/CORPO_PRETO/PRETO.png',
  skin2: '/models/female/TEXTURES/PARDO/CORPO_PARDO/PARDO.png',
  skin3: '/models/female/TEXTURES/INDIGENA/CORPO_INDIGENA/INDIGENA.png',
  skin4: '/models/female/TEXTURES/AMARELO/CORPO_AMARELO/AMARELO.png',
  skin5: '/models/female/TEXTURES/BRANCO/CORPO_BRANCO/BRANCO.png'
}

// ==============================================================
// 🚀 PRÉ-CARREGAMENTO DE MODELOS CRÍTICOS (PERFORMANCE MOBILE)
// ==============================================================
// Mobile: pré-carrega APENAS o essencial para evitar sobrecarga
const PRELOAD_MODELS = [
  '/models/female/GBody_0.glb',
  '/models/female/GFace_0.glb'
]
//Para evitar piscada na troca de pele.
Object.values(SKIN_TEXTURE_MAP).forEach(url => useTexture.preload(url))

// Força o cache apenas em desktop
if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
  PRELOAD_MODELS.forEach(url => useGLTF.preload(url))
}

// ==============================================================
// 🧹 UTILITÁRIOS DE LIMPEZA
// ==============================================================
function cleanMaterial(material) {
  material.dispose()
  for (const key of ['map','lightMap','bumpMap','normalMap','specularMap','envMap']) {
    if (material[key]) material[key].dispose()
  }
}

// ==============================================================
// 🔧 COMPONENTE ESPECIAL PARA CULTURAL_4 (PROBLEMA DE CRASH)
// ==============================================================
const Cultural4Hair = ({ onLoaded }) => {
  const [hairModel, setHairModel] = useState(null)
  const [loadError, setLoadError] = useState(false)
  const loadedRef = useRef(false)
  
  useEffect(() => {
    if (loadedRef.current) return // Evita recarregamento
    
    let mounted = true
    const loader = new GLTFLoader()
    
    loader.load(
      '/models/female/Hair(FEMALE)/Cultural/Cultural_4.glb',
      (gltf) => {
        if (!mounted) return
        try {
          const cloned = gltf.scene.clone()
          
          cloned.traverse((child) => {
            if (child.isMesh) {
              child.renderOrder = 2
              child.frustumCulled = true
              child.castShadow = false
              child.receiveShadow = false
              
              if (child.geometry && child.geometry.attributes.position) {
                const vertexCount = child.geometry.attributes.position.count
                if (vertexCount > 3000) {
                  child.geometry.computeVertexNormals()
                }
              }
              
              const materials = Array.isArray(child.material) ? child.material : [child.material]
              materials.forEach((mat) => {
                mat.transparent = true
                mat.alphaTest = 0.85
                mat.depthWrite = true
                mat.depthTest = true
                mat.side = THREE.FrontSide
                mat.needsUpdate = true
                mat.envMap = null
                mat.lightMap = null
              })
            }
          })
          
          setHairModel(cloned)
          loadedRef.current = true
          if (onLoaded) {
            setTimeout(() => onLoaded(), 100)
          }
        } catch (err) {
          console.error('❌ Erro ao processar Cultural_4:', err)
          setLoadError(true)
          loadedRef.current = true
        }
      },
      undefined,
      (error) => {
        console.error('❌ Erro ao carregar Cultural_4:', error)
        if (mounted) {
          setLoadError(true)
          loadedRef.current = true
        }
      }
    )
    
    return () => {
      mounted = false
    }
  }, []) // Sem dependências - carrega apenas uma vez

  useEffect(() => {
    return () => {
      if (hairModel) {
        hairModel.traverse((obj) => {
          if (obj.isMesh) {
            obj.geometry?.dispose()
            if (Array.isArray(obj.material)) obj.material.forEach(cleanMaterial)
            else if (obj.material) cleanMaterial(obj.material)
          }
        })
      }
    }
  }, [hairModel])
  
  if (loadError) {
    return <SmartHair hairId={7} onLoaded={onLoaded} />
  }
  
  if (!hairModel) return null
  
  return <primitive object={hairModel} dispose={null} />
}

// ==============================================================
// 💇‍♀️ COMPONENTE DE CABELO INTELIGENTE (OTIMIZADO PARA MOBILE)
// ==============================================================
const SmartHair = ({ hairId, onLoaded }) => {
  const url = HAIR_MODELS[hairId]
  if (!url) return null

  // Carrega o GLTF
  const { scene } = useGLTF(url, true)

  // 1. CLONAGEM INTELIGENTE
  const clone = useMemo(() => {
    const cloned = scene.clone()
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    cloned.traverse((child) => {
      if (child.isMesh) {
        // Otimizações Gerais
        child.renderOrder = 2
        child.frustumCulled = true
        
        // 🚨 LÓGICA ESPECÍFICA DO CULTURAL_4 (ID 13) INTEGRADA
        if (hairId === 13) {
           child.castShadow = false
           child.receiveShadow = false
           // Correção de normais para o Cultural 4 se necessário
           if (child.geometry && child.geometry.attributes.position.count > 3000) {
             child.geometry.computeVertexNormals()
           }
        }

        // Otimizações Mobile (Strip attributes)
        if (isMobile && child.geometry) {
           child.geometry.computeBoundsTree = null
           // Remove dados que pesam na GPU e não são usados em shaders simples
           if (child.geometry.attributes.uv2) child.geometry.deleteAttribute('uv2')
           if (child.geometry.attributes.tangent) child.geometry.deleteAttribute('tangent')
        }
      }
    })
    return cloned
  }, [scene, hairId])

  // 2. LIMPEZA SEGURA (CORREÇÃO DO BUG DE MEMÓRIA)
  useEffect(() => {
    return () => {
      clone.traverse((obj) => {
        if (obj.isMesh) {
          if (Array.isArray(obj.material)) obj.material.forEach(cleanMaterial)
          else cleanMaterial(obj.material)
        }
      })
    }
  }, [clone])

  // 3. APLICAÇÃO DE MATERIAIS
  useMemo(() => { 
    clone.traverse((child) => {
      if (child.isMesh) {
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        
        materials.forEach((mat) => {
          mat.transparent = true
          mat.depthWrite = true 
          mat.depthTest = true
          
          // Configurações específicas por ID
          if (hairId === 13) {
             mat.alphaTest = 0.85
             mat.side = THREE.FrontSide
             mat.envMap = null // Remove reflexos pesados no Cultural 4
          } else {
             mat.alphaTest = 0.9
             mat.side = THREE.DoubleSide
          }
          
          mat.needsUpdate = true
        })
      }
    })
  }, [clone, hairId])

  // Notifica carregamento concluído
  useEffect(() => {
    if (onLoaded) {
      // Pequeno delay para garantir que a GPU compilou o shader
      const timer = setTimeout(() => onLoaded(), 50)
      return () => clearTimeout(timer)
    }
  }, [onLoaded, hairId])

  return <primitive object={clone} dispose={null} />
}
// ==============================================================
// 🧍‍♀️ COMPONENTE DE CORPO INTELIGENTE (OTIMIZADO PARA MOBILE)
// ==============================================================
const SmartBody = ({ bodyType, skinColor, faceOption }) => {
  const bodyUrl = BODY_MODELS[bodyType]
  const faceUrl = FACE_MODELS[bodyType]

  const { scene: bodyScene } = useGLTF(bodyUrl, true, true)
  const { scene: faceScene } = useGLTF(faceUrl, true, true)

  const bodyClone = useMemo(() => bodyScene.clone(), [bodyScene])
  const faceClone = useMemo(() => faceScene.clone(), [faceScene])

  useEffect(() => {
    return () => {
        [bodyClone, faceClone].forEach(scene => {
            scene.traverse(o => {
                if(o.isMesh) {
                    
                    if (Array.isArray(o.material)) o.material.forEach(cleanMaterial)
                    else cleanMaterial(o.material)
                }
            })
        })
    }
  }, [bodyClone, faceClone])

  const skinTypeToTextureId = { 'PRETO': '_0', 'AMARELO': '_1', 'BRANCO': '_2', 'PARDO': '_3', 'INDIGENA': '_4' }
  const skinIdToFolderName = { skin1: 'PRETO', skin2: 'PARDO', skin3: 'INDIGENA', skin4: 'AMARELO', skin5: 'BRANCO' }
  const faceTypeToTextureName = { face1: 'PRETO', face2: 'PARDO', face3: 'INDIGENA', face4: 'AMARELO', face5: 'BRANCO' }

  const getFaceTexturePath = () => {
    const basePath = '/models/female/TEXTURES'
    const folder = skinIdToFolderName[skinColor] || 'PRETO'
    const faceName = faceTypeToTextureName[faceOption] || 'PRETO'
    const suffix = skinTypeToTextureId[folder] || '_0'
    return `${basePath}/${folder}/ROSTO/${faceName}${suffix}.png`
  }

  const bodyTexUrl = SKIN_TEXTURE_MAP[skinColor] || SKIN_TEXTURE_MAP.skin1
  const faceTexUrl = getFaceTexturePath()
  
  const bodyTexture = useTexture(bodyTexUrl)
  const faceTexture = useTexture(faceTexUrl)

  useEffect(() => {
    const configureTexture = (tex) => {
      try {
        if (tex) {
          tex.flipY = false 
          tex.colorSpace = THREE.SRGBColorSpace
          // Otimização AGRESSIVA mobile: qualidade mínima
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
          if (isMobile) {
            tex.anisotropy = 1 // Mínimo absoluto
            tex.generateMipmaps = false // Desabilita mipmaps
            tex.minFilter = THREE.LinearFilter // Filtro mais leve
            tex.magFilter = THREE.LinearFilter
          } else {
            tex.anisotropy = 4
            tex.generateMipmaps = true
            tex.minFilter = THREE.LinearMipmapLinearFilter
          }
          tex.needsUpdate = true
        }
      } catch (e) { console.warn("⚠️ Aviso textura:", e) }
    }

    configureTexture(bodyTexture)
    configureTexture(faceTexture)

    if (bodyTexture) {
      bodyClone.traverse((node) => {
        if (!node.isMesh) return
        
        node.renderOrder = 0 
        node.frustumCulled = true

        node.material.map = bodyTexture
        node.material.transparent = false
        node.material.depthWrite = true
        node.material.depthTest = true
        node.material.side = THREE.FrontSide
        node.material.needsUpdate = true
      })
    }

    if (faceTexture) {
      faceClone.traverse((node) => {
        if (!node.isMesh) return
        
        node.renderOrder = 1
        node.frustumCulled = true

        node.material.map = faceTexture
        node.material.transparent = true 
        node.material.alphaTest = 0.5 
        node.material.depthWrite = true 
        node.material.depthTest = true
        node.material.side = THREE.FrontSide 
        node.material.polygonOffset = true
        node.material.polygonOffsetFactor = -1
        node.material.polygonOffsetUnits = -4
        
        node.material.needsUpdate = true
      })
    }
  }, [bodyClone, faceClone, bodyTexture, faceTexture])

  return (
    <group>
      <primitive object={bodyClone} dispose={null} />
      <primitive object={faceClone} dispose={null} />
    </group>
  )
}

// ==============================================================
// 🎨 UI CONSTANTS (Mantido igual)
// ==============================================================
const MAIN_SECTIONS = [
  {
    id: 'body', title: 'Corpo', icon: GiLargeDress,
    subSections: [
      { id: 'bodyTypes', title: 'Corpos', icon: GiLargeDress, options: [{ id: 'body1', img:'/FEMALE_READY/FEMALE_BODY/BODY_0.png' }, { id: 'body2', img:'/FEMALE_READY/FEMALE_BODY/BODY_1.png' }, { id: 'body3', img:'/FEMALE_READY/FEMALE_BODY/BODY_2.png' }] },
      { id: 'skinColor', title: 'Cor da Pele', icon: GiLargeDress, options: [{ id: 'skin1', img:'/FEMALE_READY/COLOR/preta.png' }, { id: 'skin2', img:'/FEMALE_READY/COLOR/parda.png' }, { id: 'skin3', img:'/FEMALE_READY/COLOR/indigina.png' }, { id: 'skin4', img:'/FEMALE_READY/COLOR/amarela.png'}, { id: 'skin5' , img:'/FEMALE_READY/COLOR/branca.png'}] }
    ]
  },
  {
    id: 'face', title: 'Rosto', icon: GiLargeDress,
    options: [{ id: 'face1', img:'/FEMALE_READY/FEMALE_FACE/A1.png' }, { id: 'face2', img:'/FEMALE_READY/FEMALE_FACE/A2.png' }, { id: 'face3', img:'/FEMALE_READY/FEMALE_FACE/A3.png'}, { id: 'face4', img:'/FEMALE_READY/FEMALE_FACE/A4.png' }, { id: 'face5', img:'/FEMALE_READY/FEMALE_FACE/A5.png' }]
  },
  {
    id: 'hair', title: 'Cabelo', icon: GiHairStrands,
    subSections: [
      { id: 'cultural', title: 'Cabelos Culturais', icon: GiLargeDress, options: [{ id: 4,img:'/FEMALE_READY/FEMALE_HAIR/Culturais/C0.png' }, { id: 5,img:'/FEMALE_READY/FEMALE_HAIR/Culturais/C1.png'}, { id: 6,img:'/FEMALE_READY/FEMALE_HAIR/Culturais/C2.png'}, { id: 7, img:'/FEMALE_READY/FEMALE_HAIR/Culturais/C3.png' }, { id: 13, img:'/FEMALE_READY/FEMALE_HAIR/Culturais/C4.png' }] },
      { id: 'cacheado', title: 'Cacheado', icon: GiHairStrands, options: [{ id: 8, img:'/FEMALE_READY/FEMALE_HAIR/Cacheados/C0.png' }, { id: 9, img:'/FEMALE_READY/FEMALE_HAIR/Cacheados/C1.png' }] },
      { id: 'crespo', title: 'Crespo', icon: GiHairStrands, options: [{ id: 10, img:'/FEMALE_READY/FEMALE_HAIR/Crespos/C0.png' }, { id: 11, img:'/FEMALE_READY/FEMALE_HAIR/Crespos/C1.png' }] },
      { id: 'liso', title: 'Liso', icon: GiHairStrands, options: [{ id: 1, img:'/FEMALE_READY/FEMALE_HAIR/Lisos/C1.png'}, { id: 2, img:'/FEMALE_READY/FEMALE_HAIR/Lisos/C2.png'}, { id: 3, img:'/FEMALE_READY/FEMALE_HAIR/Lisos/C3.png'}, { id: 12, img:'/FEMALE_READY/FEMALE_HAIR/Lisos/C0.png' }] },
      { id: 'ondulado', title: 'Ondulado', icon: GiHairStrands, options: [{ id: 14, img:'/FEMALE_READY/FEMALE_HAIR/Ondulados/C0.png' }, { id: 15,img:'/FEMALE_READY/FEMALE_HAIR/Ondulados/C1.png'}, { id: 16, img:'/FEMALE_READY/FEMALE_HAIR/Ondulados/C2.png' }] }
    ]
  }
]

// ==============================================================
// 🏠 COMPONENTE PRINCIPAL
// ==============================================================

function Home({ onDone }) {
  const modelPresets = [
    { position: [0, -0.10, 0], rotation: [0.20, 5.70, 0], scale: [1, 1, 1], cameraDistance: 0.20 },
    { position: [-0.02, -0.12, 0], rotation: [-0.1, 3.14, 0], scale: [1, 1, 1], cameraDistance: 0.20 },
    { position: [0, -0.11, 0], rotation: [0.4, 4.5, 0], scale: [1, 1, 1], cameraDistance: 0.20 },
    { position: [-0.02, -0.12, 0], rotation: [0.3, 0, 0], scale: [1, 1, 1], cameraDistance: 0.20 }
  ]

  const [currentPreset, setCurrentPreset] = useState(0)
  
  const orbitControlsRef = useRef()
  const groupRef = useRef()
  const [initialFitDone, setInitialFitDone] = useState(false)

  const [selectedHair, setSelectedHair] = useState(8) 
  const [selectedSection, setSelectedSection] = useState(null)
  const [selectedSubSection, setSelectedSubSection] = useState(null)
  const [selectedBodyType, setSelectedBodyType] = useState('body1')
  const [selectedSkinColor, setSelectedSkinColor] = useState('skin1') 
  const [selectedFaceOption, setSelectedFaceOption] = useState('face1') 
  
  const [activeSkinModal, setActiveSkinModal] = useState(null)
  const [shownSkinModals, setShownSkinModals] = useState(new Set())
  const [isLoadingHair, setIsLoadingHair] = useState(false)
  const [isModalExpanded, setIsModalExpanded] = useState(false)
  const previousHairRef = useRef(selectedHair)
  const loadingTimerRef = useRef(null)
  const hairLoadedRef = useRef(false)

  // Callback memoizado para evitar loops
  const handleHairLoaded = useCallback(() => {
    hairLoadedRef.current = true
    // Se já passou o tempo mínimo, pode fechar
    if (!loadingTimerRef.current) {
      setIsLoadingHair(false)
    }
  }, [])

  const skinColorInfo = {
    skin1: { 
      title: '🧑🏿 Pele Preta', 
      shortDescription: 'Características comuns em pessoas pretas: Pele com tons mais escuros, protegida pela melanina.',
      fullDescription: `Características comuns em pessoas pretas: 

Pele: Varia em tons mais escuros, sendo protegida naturalmente pela melanina. 
Cabelo: Frequentemente crespo ou cacheado, com textura e curvatura marcantes. 
Nariz: Pode ter um formato largo e achatado, com narinas mais abertas. 
Lábios: Podem ser carnudos. 
Estrutura óssea: Algumas pessoas podem ter traços como prognatismo (avançamento da mandíbula) e arcadas zigomáticas proeminentes.`
    },
    skin2: { 
      title: '🧑🏽 Pele Parda', 
      shortDescription: 'Características comuns de pessoas pardas: Cor da pele variando do pardo claro ao escuro.',
      fullDescription: `Características comuns de pessoas pardas:

Cor da pele: Varia do pardo claro ao pardo escuro, com tons intermediários entre o branco e o preto.
Cabelos: Podem ser de textura grossa, densos, com curvatura ondulada, cacheada ou crespa.
Lábios: Geralmente são mais cheios ou volumosos, com coloração mais escura que o normal.
Nariz: Frequentemente mais largo, com base alargada e ponta arredondada.
Sobrancelhas: Podem ser grossas e com pelos densos.`
    },
    skin3: { 
      title: '🧑🏾 Pele Indígena', 
      shortDescription: 'Características comuns de pessoas indígenas: Pele com tonalidade variando, geralmente amarelada ou avermelhada.',
      fullDescription: `Características comuns de pessoas indígenas: 

Pele: A tonalidade da pele varia tons mais claros ou mais escuros, geralmente com um tom amarelado ou avermelhado, e é descrita como mais escura em comparação com a dos europeus, mas não negra. Uma característica notável é a tendência a ter poucos pelos corporais, uma adaptação biológica ao clima tropical.
Cabelos: Predominantemente lisos e escuros (pretos ou castanhos muito escuros).
Olhos: Geralmente de cor castanha escura ou preta, com a forma dos olhos frequentemente descrita como amendoada.
Estrutura Corporal: A altura e o tipo físico variam entre os grupos, com algumas etnias apresentando compleição física mais baixa e robusta, enquanto outras podem ser mais altas.`
    },
    skin4: { 
      title: '🧑🏻 Pele Amarela', 
      shortDescription: 'Características comuns de pessoas amarelas: Cabelo geralmente liso e de cor preta, olhos com formato inclinado.',
      fullDescription: `Características comuns de pessoas amarelas:

Cabelo: Geralmente liso e de cor preta.
Olhos: Formato inclinado, descrito como "oblíquos" ou "rasgados".`
    },
    skin5: { 
      title: '🧑🏼 Pele Branca', 
      shortDescription: 'Características comuns de pessoas brancas: Pele clara com baixa quantidade de melanina.',
      fullDescription: `Características comuns de pessoas brancas:

Pele clara: A principal característica física associada ao termo "branco" é a pele com baixa quantidade de melanina, o que a torna mais clara. 
Outros traços: A definição pode incluir outros traços físicos associados às populações europeias, mas a ênfase na cor da pele é a mais comum. 
Pele: De tonalidade clara, variando entre o branco e o amarelado.
Rosto: Pômulos frequentemente salientes e nariz reto.
Corpo: Tórax curto e largo e pouca presença de pelos corporais.`
    }
  }

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
        if (data.skinCode) setSelectedSkinColor(data.skinCode)
        if (data.faceOption) setSelectedFaceOption(data.faceOption)
        if (typeof data.hairId === 'number') setSelectedHair(data.hairId)
      } catch (e) { console.warn(e) }
    }
    loadSavedCharacter()
    return () => { mounted = false }
  }, [])

  const closeSkinModal = () => { setActiveSkinModal(null); setIsModalExpanded(false); }
  useEffect(() => {
    if (selectedSection === 'body' && selectedSubSection === 'skinColor' && selectedSkinColor) {
      if (!shownSkinModals.has(selectedSkinColor)) {
        setActiveSkinModal(selectedSkinColor)
        setShownSkinModals(prev => new Set([...prev, selectedSkinColor]))
      }
    }
  }, [selectedSection, selectedSubSection, selectedSkinColor, shownSkinModals])

  useEffect(() => {
    if (previousHairRef.current !== selectedHair) {
      setIsLoadingHair(true)
      previousHairRef.current = selectedHair
      hairLoadedRef.current = false
      loadingTimerRef.current = true
      
      // Tempo MÍNIMO de exibição do loading (1500ms)
      const timer = setTimeout(() => {
        loadingTimerRef.current = null
        // Só fecha se o modelo já carregou
        if (hairLoadedRef.current) {
          setIsLoadingHair(false)
        }
      }, 1500)
      
      return () => {
        clearTimeout(timer)
        loadingTimerRef.current = null
      }
    }
  }, [selectedHair])

  const springs = useSpring({
    position: modelPresets[currentPreset].position,
    rotation: modelPresets[currentPreset].rotation,
    scale: modelPresets[currentPreset].scale,
    config: { mass: 1, tension: 170, friction: 26 }
  })

  // Detecta mobile para ajustar qualidade do Canvas
  const isMobile = useMemo(() => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent), [])

  useEffect(() => {
    const controls = orbitControlsRef.current
    if (!controls) return

    const targetDist = modelPresets[currentPreset].cameraDistance
    const targetCenter = new THREE.Vector3(0, 0, 0)
    
    const cam = controls.object
    const dir = new THREE.Vector3().subVectors(cam.position, controls.target).normalize()
    if (dir.length() === 0) dir.set(0, 0, 1)
    
    cam.position.copy(targetCenter.clone().add(dir.multiplyScalar(targetDist)))
    controls.target.copy(targetCenter)
    controls.update()
    
  }, [currentPreset]) 

  useEffect(() => {
    if (initialFitDone) return
    const controls = orbitControlsRef.current
    if (!controls) return
    const center = new THREE.Vector3(0, 0, 0) 
    const dist = modelPresets[0].cameraDistance
    const cam = controls.object
    cam.position.set(center.x, center.y, center.z + dist)
    controls.target.copy(center)
    controls.update()
    setInitialFitDone(true)
  }, [initialFitDone])

  return ( 
    <div className="home-page">
      <div className="viewer-container">
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
        
        <div className="preset-arrows">
          <button className="img-button" onClick={() => setCurrentPreset((p) => (p - 1 + modelPresets.length) % modelPresets.length)}>
            <img src="/charmaker/left.png" alt="rot-left" />
          </button>
          <button className="img-button" onClick={() => setCurrentPreset((p) => (p + 1) % modelPresets.length)}>
            <img src="/charmaker/right.png" alt="rot-right" />
          </button>
        </div>

        <Canvas 
            camera={{ position: [0, 0, modelPresets[0].cameraDistance], fov: 75 }}
            gl={{ 
              preserveDrawingBuffer: true, 
              powerPreference: isMobile ? "low-power" : "high-performance",
              antialias: !isMobile,
              alpha: true,
              stencil: false,
              depth: true,
              logarithmicDepthBuffer: false,
              failIfMajorPerformanceCaveat: false
            }}
            dpr={isMobile ? 1 : [1, 2]} // Mobile: DPR fixo em 1
            performance={{ min: 0.5 }}
        >
          <ambientLight intensity={isMobile ? 1.5 : 1.2} />
          {!isMobile && <directionalLight position={[5, 5, 5]} intensity={1} />}
          {!isMobile && <pointLight position={[10, 10, 10]} intensity={0.8} />}
          {!isMobile && <pointLight position={[-10, -10, -10]} intensity={0.5} />}

          <animated.group
            ref={groupRef}
            position={springs.position}
            rotation={springs.rotation}
            scale={springs.scale}
          >
            <ErrorBoundary resetKey={selectedBodyType}>
                <Suspense fallback={null}>
                    <SmartBody 
                        bodyType={selectedBodyType}
                        skinColor={selectedSkinColor}
                        faceOption={selectedFaceOption}
                    />
                </Suspense>
            </ErrorBoundary>
            
            <ErrorBoundary resetKey={selectedHair}>
                <Suspense fallback={null}>
                    <SmartHair hairId={selectedHair} onLoaded={handleHairLoaded} />
                </Suspense>
            </ErrorBoundary>
            
          </animated.group>

          <OrbitControls
            ref={orbitControlsRef}
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
            minDistance={0.000001}
            maxDistance={1e12}
            enableDamping={false}
          />
          
          {!isMobile && <Preload all={false} />}
        </Canvas>

        <div className="overlay-bottom">
          <div className="hair-sections">
            {!selectedSection ? (
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
              <div className="section-options">
                <div className="section-header">
                  <h3>
                    {MAIN_SECTIONS.find(s => s.id === selectedSection)?.icon({ size: 20 })}
                    <span>{MAIN_SECTIONS.find(s => s.id === selectedSection)?.title}</span>
                  </h3>
                  <div style={{display: 'flex', gap: 8}}>
                    {selectedSubSection && (
                      <button className="back-button" onClick={() => setSelectedSubSection(null)}>←</button>
                    )}
                    <button className="close-button" onClick={() => { setSelectedSection(null); setSelectedSubSection(null) }}>
                      <IoMdClose size={20} />
                    </button>
                  </div>
                </div>

                {(() => {
                  const section = MAIN_SECTIONS.find(s => s.id === selectedSection)
                  if (section?.subSections) {
                    if (!selectedSubSection) {
                      return (
                        <div className="subsections-grid">
                          {section.subSections.map(sub => (
                            <button key={sub.id} className="subsection-card" onClick={() => setSelectedSubSection(sub.id)}>
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
                    const sub = section.subSections.find(s => s.id === selectedSubSection)
                    if (!sub) return null
                    return (
                      <div className="options-card">
                        <div className="options-card-header"><h4>{sub.title}</h4></div>
                        <div className="options-grid options-grid-wrap">
                          {sub.options.map(option => (
                            <button
                              key={option.id}
                              className={`option-button ${
                                (selectedSection === 'hair' && selectedHair === option.id) ||
                                (selectedSection === 'body' && sub.id === 'bodyTypes' && selectedBodyType === option.id) ||
                                (selectedSection === 'body' && sub.id === 'skinColor' && selectedSkinColor === option.id)
                                ? 'active' : ''
                              }`}
                              style={{ backgroundImage: option.img ? `url(${option.img})` : 'none', backgroundSize: 'cover' }}
                              onClick={() => {
                                if (selectedSection === 'hair') setSelectedHair(option.id)
                                else if (selectedSection === 'body') {
                                  if (sub.id === 'bodyTypes') setSelectedBodyType(option.id)
                                  if (sub.id === 'skinColor') setSelectedSkinColor(option.id)
                                }
                              }}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  if (section?.options) {
                    return (
                      <div className="options-card">
                        <div className="options-grid">
                          {section.options.map(option => (
                            <button
                              key={option.id}
                              className={`option-button ${selectedFaceOption === option.id ? 'active' : ''}`}
                              onClick={() => setSelectedFaceOption(option.id)}
                              style={{ backgroundImage: option.img ? `url(${option.img})` : 'none', backgroundSize: 'cover' }}
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

      {activeSkinModal && skinColorInfo[activeSkinModal] && (
        <div className="skin-modal-overlay">
          <div className="skin-modal-bubble">
            <button className="skin-modal-close" onClick={closeSkinModal}><IoMdClose size={20} /></button>
            <h3>{skinColorInfo[activeSkinModal].title}</h3>
            <p style={{ whiteSpace: 'pre-line' }}>{isModalExpanded ? skinColorInfo[activeSkinModal].fullDescription : skinColorInfo[activeSkinModal].shortDescription}</p>
            <button onClick={() => setIsModalExpanded(!isModalExpanded)} style={{ marginTop: '10px', background: 'none', border: '1px solid #ccc', padding: '5px 10px', cursor: 'pointer' }}>
              {isModalExpanded ? 'Mostrar menos' : 'Ler mais..'}
            </button>
          </div>
        </div>
      )}

      {isLoadingHair && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          gap: '20px'
        }}>
          <img 
            src="/charmaker/amandarunning.gif" 
            alt="Carregando..." 
            style={{ 
              width: '200px', 
              height: '200px',
              objectFit: 'contain'
            }}
          />
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#fff',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}>
            Carregando...
          </div>
        </div>
      )}
    </div>
  )
}

export default Home