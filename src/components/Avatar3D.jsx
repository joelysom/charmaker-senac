import React, { Suspense, useMemo, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import * as SkeletonUtilsModule from 'three/examples/jsm/utils/SkeletonUtils'
// compatibility: some bundlers export SkeletonUtils as named, default, or on the namespace
const SkeletonUtils = SkeletonUtilsModule?.SkeletonUtils || SkeletonUtilsModule?.default || SkeletonUtilsModule
import ErrorBoundary from './ErrorBoundary'

// Small Avatar Preview Component
function AvatarPreview({ gender, bodyType, skinColor, faceOption, hairId, instanceId }) {
  const basePath = gender === 'female' ? '/models/female' : '/models/male'
  const bodyPrefix = gender === 'female' ? 'GBody' : 'MBody'
  const facePrefix = gender === 'female' ? 'GFace' : 'MFace'
  const hairPrefix = gender === 'female' ? 'GHair' : 'MHair'

  const bodyIndex = bodyType === 'body2' ? 1 : (bodyType === 'body3' ? 2 : 0)
  const faceIndex = bodyIndex

  // Caminhos dos modelos - CADA INSTÂNCIA TEM SUA PRÓPRIA CÓPIA CARREGADA
  // O instanceId garante que useGLTF carregue instâncias completamente separadas
  const bodyPath = `${basePath}/${bodyPrefix}_${bodyIndex}.glb?inst=${instanceId}`
  const facePath = `${basePath}/${facePrefix}_${faceIndex}.glb?inst=${instanceId}`

  // Load all models - COM ISOLAMENTO DE INSTÂNCIA VIA QUERY PARAM
  const body = useGLTF(bodyPath)
  const face = useGLTF(facePath)

  const getHairPath = (id) => {
    const hairFolder = gender === 'female' ? 'Hair(FEMALE)' : 'hair(MALE)'
    let hairBasePath = ''
    if (id >= 1 && id <= 3) hairBasePath = `${basePath}/${hairPrefix}_${id - 1}.glb`
    else if (id === 4) hairBasePath = `${basePath}/${hairFolder}/Cultural/Cultural_0.glb`
    else if (id === 5) hairBasePath = `${basePath}/${hairFolder}/Cultural/Cultural_1.glb`
    else if (id === 6) hairBasePath = `${basePath}/${hairFolder}/Cultural/Cultural_2.glb`
    else if (id === 7) hairBasePath = `${basePath}/${hairFolder}/Cultural/Cultural_3.glb`
    else if (id === 8) hairBasePath = `${basePath}/${hairFolder}/Cacheado/Cacheado_0.glb`
    else if (id === 9) hairBasePath = `${basePath}/${hairFolder}/Cacheado/Cacheado_1.glb`
    else if (id === 10) hairBasePath = `${basePath}/${hairFolder}/Crespo/Crespo_0.glb`
    else if (id === 11) hairBasePath = `${basePath}/${hairFolder}/Crespo/Crespo_1.glb`
    else if (id === 12) hairBasePath = `${basePath}/${hairFolder}/Liso/Liso_0.glb`
    else if (id === 13) hairBasePath = `${basePath}/${hairFolder}/Cultural/Cultural_4.glb`
    else if (id === 14) hairBasePath = `${basePath}/${hairFolder}/Ondulado/Ondulado_0.glb`
    else if (id === 15) hairBasePath = `${basePath}/${hairFolder}/Ondulado/Ondulado_1.glb`
    else if (id === 16) hairBasePath = `${basePath}/${hairFolder}/Ondulado/Ondulado_2.glb`
    else hairBasePath = `${basePath}/${hairPrefix}_0.glb`
    
    // Adiciona instanceId para isolar cada cópia carregada
    return `${hairBasePath}?inst=${instanceId}`
  }

  const hairPath = getHairPath(hairId)
  const hair = useGLTF(hairPath)

  // Create per-instance clones of the loaded scenes so each Avatar can render independently
  // CADA CLONE TEM SEU PRÓPRIO CACHE DE TEXTURAS ISOLADO
  const bodyClone = useMemo(() => {
    if (!body?.scene) return null
    try {
      const cloned = SkeletonUtils.clone(body.scene)
      // Marca este clone com um ID único para isolar suas texturas
      cloned.userData._instanceId = instanceId
      cloned.userData.textureCache = new Map()
      return cloned
    } catch (e) {
      const cloned = body.scene.clone(true)
      cloned.userData._instanceId = instanceId
      cloned.userData.textureCache = new Map()
      return cloned
    }
  }, [body, instanceId])

  const faceClone = useMemo(() => {
    if (!face?.scene) return null
    try {
      const cloned = SkeletonUtils.clone(face.scene)
      cloned.userData._instanceId = instanceId
      cloned.userData.textureCache = new Map()
      return cloned
    } catch (e) {
      const cloned = face.scene.clone(true)
      cloned.userData._instanceId = instanceId
      cloned.userData.textureCache = new Map()
      return cloned
    }
  }, [face, instanceId])

  const hairClone = useMemo(() => {
    if (!hair?.scene) return null
    try {
      const cloned = SkeletonUtils.clone(hair.scene)
      cloned.userData._instanceId = instanceId
      cloned.userData.textureCache = new Map()
      return cloned
    } catch (e) {
      const cloned = hair.scene.clone(true)
      cloned.userData._instanceId = instanceId
      cloned.userData.textureCache = new Map()
      return cloned
    }
  }, [hair, instanceId])

  // Accept either 'skin1'..'skin5' or normalized strings saved in Firestore ('preto','pardo','indigena','amarelo','branco')
  const normalizedToSkinCode = {
    preto: 'skin1',
    pardo: 'skin2',
    indigena: 'skin3',
    amarelo: 'skin4',
    branco: 'skin5'
  }

  const resolveSkinCode = (input) => {
    if (!input) return 'skin1'
    if (typeof input === 'string' && input.toLowerCase().startsWith('skin')) return input
    const key = String(input).toLowerCase()
    return normalizedToSkinCode[key] || 'skin1'
  }

  const skinCode = resolveSkinCode(skinColor)

  // Mapa de texturas para cores de pele
  const skinTextureMap = {
    skin1: `${basePath}/TEXTURES/PRETO/CORPO_PRETO/PRETO.png`,
    skin2: `${basePath}/TEXTURES/PARDO/CORPO_PARDO/PARDO.png`,
    skin3: `${basePath}/TEXTURES/INDIGENA/CORPO_INDIGENA/INDIGENA.png`,
    skin4: `${basePath}/TEXTURES/AMARELO/CORPO_AMARELO/AMARELO.png`,
    skin5: `${basePath}/TEXTURES/BRANCO/CORPO_BRANCO/BRANCO.png`
  }

  // Map face option to face texture name
  const faceTypeToTextureName = {
    face1: 'PRETO',
    face2: 'PARDO',
    face3: 'INDIGENA',
    face4: 'AMARELO',
    face5: 'BRANCO'
  }

  // Map skin color to suffix ID
  const skinTypeToTextureId = {
    'PRETO': '_0',
    'AMARELO': '_1',
    'BRANCO': '_2',
    'PARDO': '_3',
    'INDIGENA': '_4'
  }

  // Map skin ID to folder name
  const skinIdToFolderName = {
    skin1: 'PRETO',
    skin2: 'PARDO',
    skin3: 'INDIGENA',
    skin4: 'AMARELO',
    skin5: 'BRANCO'
  }

  // Pre-carrega todas as texturas (corpo e rosto) - setup igual a homeMale/homeFemale
  // CADA INSTÂNCIA TEM SEU PRÓPRIO CACHE DE TEXTURAS
  const { skinTextures, faceTexture } = useMemo(() => {
    const textures = {}
    const loader = new THREE.TextureLoader()
    
    // Função para configurar a textura - EXATAMENTE IGUAL A homeMale/homeFemale
    const setupTexture = (texture) => {
      texture.flipY = false
      texture.encoding = THREE.sRGBEncoding
      texture.colorSpace = THREE.SRGBColorSpace
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.generateMipmaps = true
      return texture
    }

    // Carrega texturas do corpo - COM CACHE ISOLADO POR INSTÂNCIA
    Object.entries(skinTextureMap).forEach(([key, path]) => {
      // Adiciona instanceId à URL para forçar carregamento separado
      const uniquePath = `${path}?instance=${instanceId}`
      textures[key] = setupTexture(loader.load(path))
    })

    // Carrega textura inicial do rosto - COM CACHE ISOLADO
    const faceTexturePath = (() => {
      const selectedSkinFolder = skinIdToFolderName[skinCode]
      const faceTextureName = faceTypeToTextureName[faceOption]
      const textureSuffix = skinTypeToTextureId[selectedSkinFolder]
      return `${basePath}/TEXTURES/${selectedSkinFolder}/ROSTO/${faceTextureName}${textureSuffix}.png`
    })()

    const initialFaceTexture = setupTexture(
      loader.load(faceTexturePath)
    )

    return {
      skinTextures: textures,
      faceTexture: initialFaceTexture
    }
  }, [instanceId, faceOption, skinCode]) // Depende de instanceId para isolar

  // Referência à textura atual do corpo
  const currentBodyTexture = useMemo(() => 
    skinTextures[skinCode], 
    [skinCode, skinTextures]
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
    
    const selectedSkinFolder = skinIdToFolderName[skinCode]
    const faceTextureName = faceTypeToTextureName[faceOption]
    const textureSuffix = skinTypeToTextureId[selectedSkinFolder]
    const faceTexturePath = `${basePath}/TEXTURES/${selectedSkinFolder}/ROSTO/${faceTextureName}${textureSuffix}.png`
    
    return setupTexture(loader.load(faceTexturePath))
  }, [faceOption, skinCode, basePath])

  // Effect para atualizar as texturas quando mudar a seleção - MESMO SISTEMA DE homeMale/homeFemale
  // MAS COM ISOLAMENTO COMPLETO POR INSTÂNCIA
  useEffect(() => {
    // Seleciona o corpo e rosto corretos baseado no tipo selecionado
    const currentBody = bodyClone
    const currentFace = faceClone
    const currentHair = hairClone
    
    if (!currentBody || !currentBodyTexture || !currentFace || !currentFaceTexture) return

    // Guarda as referências originais dos materiais do corpo - ISOLADO POR INSTÂNCIA
    if (!currentBody.userData.originalMaterials) {
      currentBody.userData.originalMaterials = new Map()
    }

    // Guarda as referências originais dos materiais do rosto - ISOLADO POR INSTÂNCIA
    if (!currentFace.userData.originalMaterials) {
      currentFace.userData.originalMaterials = new Map()
    }

    // Guarda as referências originais dos materiais do cabelo - ISOLADO POR INSTÂNCIA
    if (currentHair && !currentHair.userData.originalMaterials) {
      currentHair.userData.originalMaterials = new Map()
    }

    // Atualiza materiais do corpo
    currentBody.traverse((node) => {
      if (!node.isMesh) return
      const materials = Array.isArray(node.material) ? node.material : [node.material]
      
      materials.forEach(mat => {
        if (!mat || !mat.map) return
        
        // Guarda material original se ainda não guardamos
        const originalKey = node.uuid + '-' + mat.uuid
        if (!currentBody.userData.originalMaterials.has(originalKey)) {
          currentBody.userData.originalMaterials.set(originalKey, mat.clone())
        }
        
        // Pega referência do material original
        const originalMat = currentBody.userData.originalMaterials.get(originalKey)
        
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
        
        mat.map.needsUpdate = true
        mat.needsUpdate = true
      })
    })

    // Atualiza materiais do rosto
    currentFace.traverse((node) => {
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
        if (!currentFace.userData.originalMaterials.has(originalKey)) {
          currentFace.userData.originalMaterials.set(originalKey, mat.clone())
        }
        
        // Pega referência do material original
        const originalMat = currentFace.userData.originalMaterials.get(originalKey)
        
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
        
        if (mat.map) {
          mat.map.needsUpdate = true
          mat.needsUpdate = true
        }
      })
    })

    // Atualiza materiais do cabelo - CABELO DEVE SER SÓLIDO!
    if (currentHair) {
      currentHair.traverse((node) => {
        if (!node.isMesh) return

        // Converte para array mesmo se for material único
        const materials = Array.isArray(node.material) ? node.material : [node.material]
        
        materials.forEach(mat => {
          if (!mat) return
          
          // Guarda material original se ainda não guardamos
          const originalKey = node.uuid + '-' + mat.uuid
          if (!currentHair.userData.originalMaterials.has(originalKey)) {
            currentHair.userData.originalMaterials.set(originalKey, mat.clone())
          }
          
          // Pega referência do material original
          const originalMat = currentHair.userData.originalMaterials.get(originalKey)
          
          // Configurações específicas para o cabelo - DEVE SER SÓLIDO
          mat.transparent = false // Cabelo não precisa de transparência
          mat.opacity = 1.0 // Totalmente opaco
          mat.alphaTest = 0 // Sem teste de alpha
          mat.depthWrite = true
          mat.depthTest = true
          mat.side = THREE.FrontSide // Renderizar apenas a frente
          
          // Mantém as propriedades originais do material
          mat.roughness = originalMat.roughness || 0.6 // Roughness do cabelo
          mat.metalness = originalMat.metalness || 0.0
          mat.envMapIntensity = originalMat.envMapIntensity || 0.8
          mat.color.copy(originalMat.color)
          
          // Configurações de renderização para cabelo sólido
          mat.blending = THREE.NoBlending // Sem blending para ser sólido
          mat.premultipliedAlpha = false
          
          mat.needsUpdate = true
        })
      })
    }
  }, [skinCode, bodyType, faceOption, bodyClone, faceClone, hairClone, currentBodyTexture, currentFaceTexture, instanceId])

  return (
    <>
  {bodyClone && <primitive object={bodyClone} />}
  {faceClone && <primitive object={faceClone} />}
  {hairClone && <primitive object={hairClone} />}
    </>
  )
}

// Componente para controlar a câmera com zoom
function CameraController({ cameraDistance }) {
  const { camera } = useThree()

  useEffect(() => {
    // Ajustar os clipping planes para permitir zoom bem próximo
    camera.near = 0.001  // Permite ver objetos muito perto
    camera.far = 1000    // Mantém objetos distantes visíveis
    
    camera.position.z = cameraDistance
    camera.updateProjectionMatrix()
  }, [camera, cameraDistance])

  return null
}

// Avatar3D component: renders a small 3D avatar in a Canvas
export default function Avatar3D({ gender, bodyType, skinColor, faceOption, hairId, size = 48, bgGradient = 'linear-gradient(135deg, #FFD700 0%, #FF9800 50%, #FF8C00 100%)' }) {
  // Gerar chave ÚNICA para cada instância - usa Math.random() para garantir que cada instância seja completamente isolada
  // Isso é crucial quando há múltiplos avatares com os mesmos parâmetros (ex: 2 homens iguais)
  const instanceId = React.useRef(Math.random()).current
  const avatarKey = `${gender}-${bodyType}-${skinColor}-${faceOption}-${hairId}-${instanceId}`
  
  // Different presets for male and female models - EXATAMENTE COMO EM homeMale/homeFemale
  const modelPresets = gender === 'female' ? {
    position: [0, -0.169, 0],
    rotation: [-0.23, 5.59, 0],
    scale: [1, 1, 1],
    cameraDistance: 0.0030
  } : {
    position: [0, -0.169, 0],
    rotation: [-0.23, 5.85, 0],
    scale: [1, 1, 1],
    cameraDistance: 0.0008
  }

  return (
    <div style={{ 
      width: `${size}px`, 
      height: `${size}px`, 
      borderRadius: '50%', 
      overflow: 'hidden', 
      flexShrink: 0,
      background: bgGradient
    }}>
      <ErrorBoundary>
        <Suspense fallback={<div style={{ width: '100%', height: '100%', background: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#6b7280', fontSize: '10px' }}>⏳</span></div>}>
          <Canvas
            key={avatarKey}
            style={{ width: '100%', height: '100%' }}
            gl={{ 
              antialias: true, 
              preserveDrawingBuffer: false,
              alpha: true,
              powerPreference: 'high-performance'
            }}
            onCreated={(state) => {
              try {
                state.gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.25))
                state.gl.clearColor(0, 0, 0, 0)
              } catch (e) {
                console.warn('Erro ao criar Canvas:', e)
              }
            }}
          >
            <CameraController cameraDistance={modelPresets.cameraDistance} />
            <ambientLight intensity={1.2} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <group position={modelPresets.position} rotation={modelPresets.rotation} scale={modelPresets.scale}>
              <AvatarPreview
                gender={gender}
                bodyType={bodyType}
                skinColor={skinColor}
                faceOption={faceOption}
                hairId={hairId}
                instanceId={instanceId}
              />
            </group>
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              enableRotate={false}
            />
          </Canvas>
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
