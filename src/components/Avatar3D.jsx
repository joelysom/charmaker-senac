import React, { Suspense, useMemo, useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import ErrorBoundary from './ErrorBoundary'

// ============================================
// 🎨 MAPEAMENTO DE TEXTURAS CORRETO
// ============================================

// Mapeamento de skinColor (skin1-5) para nome da pasta de textura
const SKIN_FOLDER_MAP = {
  skin1: 'PRETO',
  skin2: 'PARDO',
  skin3: 'INDIGENA',
  skin4: 'AMARELO',
  skin5: 'BRANCO',
  // Fallback para nomes diretos (caso venha normalizado do Firestore)
  preto: 'PRETO',
  pardo: 'PARDO',
  indigena: 'INDIGENA',
  amarelo: 'AMARELO',
  branco: 'BRANCO'
}

// Mapeamento de skinColor para sufixo da textura do rosto
const SKIN_SUFFIX_MAP = {
  'PRETO': '_0',
  'AMARELO': '_1',
  'BRANCO': '_2',
  'PARDO': '_3',
  'INDIGENA': '_4'
}

// Mapeamento de faceOption para nome base do arquivo da textura
const FACE_NAME_MAP = {
  face1: 'PRETO',
  face2: 'PARDO',
  face3: 'INDIGENA',
  face4: 'AMARELO',
  face5: 'BRANCO'
}

// Mapeamento de hairId para caminho do modelo GLB
const HAIR_MODELS = {
  // Básicos
  1: { female: 'GHair_0.glb', male: 'MHair_0.glb' },
  2: { female: 'GHair_1.glb', male: 'MHair_1.glb' },
  3: { female: 'GHair_2.glb', male: 'MHair_2.glb' },
  
  // Culturais
  4: { female: 'Hair(FEMALE)/Cultural/Cultural_0.glb', male: 'hair(MALE)/Cultural/Cultural_0.glb' },
  5: { female: 'Hair(FEMALE)/Cultural/Cultural_1.glb', male: 'hair(MALE)/Cultural/Cultural_1.glb' },
  6: { female: 'Hair(FEMALE)/Cultural/Cultural_2.glb', male: 'hair(MALE)/Cultural/Cultural_2.glb' },
  7: { female: 'Hair(FEMALE)/Cultural/Cultural_3.glb', male: 'hair(MALE)/Cultural/Cultural_3.glb' },
  13: { female: 'Hair(FEMALE)/Cultural/Cultural_4.glb', male: 'hair(MALE)/Cultural/Cultural_4.glb' },

  // Cacheado
  8: { female: 'Hair(FEMALE)/Cacheado/Cacheado_0.glb', male: 'hair(MALE)/Cacheado/Cacheado_0.glb' },
  9: { female: 'Hair(FEMALE)/Cacheado/Cacheado_1.glb', male: 'hair(MALE)/Cacheado/Cacheado_1.glb' },

  // Crespo
  10: { female: 'Hair(FEMALE)/Crespo/Crespo_0.glb', male: 'hair(MALE)/Crespo/Crespo_0.glb' },
  11: { female: 'Hair(FEMALE)/Crespo/Crespo_1.glb', male: 'hair(MALE)/Crespo/Crespo_1.glb' },

  // Liso Extra
  12: { female: 'Hair(FEMALE)/Liso/Liso_0.glb', male: 'hair(MALE)/Liso/Liso_0.glb' },

  // Ondulado
  14: { female: 'Hair(FEMALE)/Ondulado/Ondulado_0.glb', male: 'hair(MALE)/Ondulado/Ondulado_0.glb' },
  15: { female: 'Hair(FEMALE)/Ondulado/Ondulado_1.glb', male: 'hair(MALE)/Ondulado/Ondulado_1.glb' },
  16: { female: 'Hair(FEMALE)/Ondulado/Ondulado_2.glb', male: 'hair(MALE)/Ondulado/Ondulado_2.glb' }
}

// ============================================
// 🧹 UTILITÁRIOS E OTIMIZAÇÕES MOBILE
// ============================================

// Detecção de dispositivo mobile
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

function cleanMaterial(material) {
  if (!material) return
  material.dispose()
  const textures = ['map', 'lightMap', 'bumpMap', 'normalMap', 'specularMap', 'envMap']
  textures.forEach(key => {
    if (material[key]) {
      material[key].dispose()
    }
  })
}

// Preload de recursos comuns APENAS em desktop
const preloadCommonResources = () => {
  if (isMobileDevice()) return // Não pré-carrega em mobile
  
  const commonPaths = [
    '/models/female/GBody_0.glb',
    '/models/male/MBody_0.glb',
  ]
  commonPaths.forEach(path => useGLTF.preload(path))
}
if (typeof window !== 'undefined') {
  setTimeout(preloadCommonResources, 100)
}

// ============================================
// 🧍 COMPONENTE DE AVATAR
// ============================================

function AvatarPreview({ gender, bodyType, skinColor, faceOption, hairId, instanceId }) {
  const basePath = gender === 'female' ? '/models/female' : '/models/male'
  const bodyPrefix = gender === 'female' ? 'GBody' : 'MBody'
  const facePrefix = gender === 'female' ? 'GFace' : 'MFace'

  // Índices dos modelos
  const bodyIndex = bodyType === 'body2' ? 1 : (bodyType === 'body3' ? 2 : 0)
  const faceIndex = bodyIndex // Face segue o body

  // Caminhos dos modelos GLB
  const bodyPath = `${basePath}/${bodyPrefix}_${bodyIndex}.glb?inst=${instanceId}`
  const facePath = `${basePath}/${facePrefix}_${faceIndex}.glb?inst=${instanceId}`
  
  // Caminho do cabelo
  const hairConfig = HAIR_MODELS[hairId]
  const hairPath = hairConfig 
    ? `${basePath}/${hairConfig[gender]}?inst=${instanceId}`
    : `${basePath}/${gender === 'female' ? 'GHair_0.glb' : 'MHair_0.glb'}?inst=${instanceId}`

  // Carregamento dos modelos
  const body = useGLTF(bodyPath)
  const face = useGLTF(facePath)
  const hair = useGLTF(hairPath)

  // Clonagem dos modelos com otimizações mobile
  const bodyClone = useMemo(() => {
    if (!body?.scene) return null
    const cloned = clone(body.scene)
    cloned.userData._instanceId = instanceId
    
    // Otimização mobile: simplifica geometria
    if (isMobileDevice()) {
      cloned.traverse((child) => {
        if (child.isMesh && child.geometry) {
          child.geometry.computeBoundsTree = null
          child.frustumCulled = true
          // Remove atributos desnecessários
          if (child.geometry.attributes.uv2) {
            child.geometry.deleteAttribute('uv2')
          }
          if (child.geometry.attributes.tangent) {
            child.geometry.deleteAttribute('tangent')
          }
        }
      })
    }
    return cloned
  }, [body, instanceId])

  const faceClone = useMemo(() => {
    if (!face?.scene) return null
    const cloned = clone(face.scene)
    cloned.userData._instanceId = instanceId
    
    if (isMobileDevice()) {
      cloned.traverse((child) => {
        if (child.isMesh && child.geometry) {
          child.geometry.computeBoundsTree = null
          child.frustumCulled = true
          if (child.geometry.attributes.uv2) {
            child.geometry.deleteAttribute('uv2')
          }
          if (child.geometry.attributes.tangent) {
            child.geometry.deleteAttribute('tangent')
          }
        }
      })
    }
    return cloned
  }, [face, instanceId])

  const hairClone = useMemo(() => {
    if (!hair?.scene) return null
    const cloned = clone(hair.scene)
    cloned.userData._instanceId = instanceId
    
    if (isMobileDevice()) {
      cloned.traverse((child) => {
        if (child.isMesh && child.geometry) {
          child.geometry.computeBoundsTree = null
          child.geometry.computeVertexNormals()
          child.frustumCulled = true
          if (child.geometry.attributes.uv2) {
            child.geometry.deleteAttribute('uv2')
          }
          if (child.geometry.attributes.tangent) {
            child.geometry.deleteAttribute('tangent')
          }
        }
      })
    }
    return cloned
  }, [hair, instanceId])

  // ============================================
  // 🎨 APLICAÇÃO DE TEXTURAS
  // ============================================

  useEffect(() => {
    if (!bodyClone || !faceClone) return

    // Normalização da cor da pele
    const skinFolder = SKIN_FOLDER_MAP[skinColor] || SKIN_FOLDER_MAP[skinColor?.toLowerCase()] || 'PARDO'
    
    // Textura do corpo: /models/{gender}/TEXTURES/{skinFolder}/CORPO_{skinFolder}/{skinFolder}.png
    const bodyTexturePath = `${basePath}/TEXTURES/${skinFolder}/CORPO_${skinFolder}/${skinFolder}.png`
    
    // Textura do rosto: LÓGICA CORRETA
    // Pasta = Cor da Pele (skinFolder)
    // Nome do arquivo = Face escolhida (faceOption)
    // Sufixo = Cor da Pele (skinFolder)
    // Exemplo: skin2(PARDO) + face2(PARDO) = /TEXTURES/PARDO/ROSTO/PARDO_3.png
    const faceName = FACE_NAME_MAP[faceOption] || 'PRETO'
    const suffix = SKIN_SUFFIX_MAP[skinFolder] || '_0'
    const faceTexturePath = `${basePath}/TEXTURES/${skinFolder}/ROSTO/${faceName}${suffix}.png`

    const textureLoader = new THREE.TextureLoader()
    const loadedTextures = []
    const isMobile = isMobileDevice()

    // Configuração de textura otimizada para mobile
    const configureTexture = (texture) => {
      texture.flipY = false
      texture.colorSpace = THREE.SRGBColorSpace
      
      if (isMobile) {
        // Mobile: qualidade mínima para performance
        texture.anisotropy = 1
        texture.generateMipmaps = false
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
      } else {
        // Desktop: qualidade normal
        texture.anisotropy = 4
        texture.generateMipmaps = true
        texture.minFilter = THREE.LinearMipmapLinearFilter
      }
      texture.needsUpdate = true
    }

    // Aplicar textura no corpo
    bodyClone.traverse((child) => {
      if (child.isMesh && child.material) {
        textureLoader.load(
          bodyTexturePath,
          (texture) => {
            configureTexture(texture)
            
            const newMaterial = child.material.clone()
            newMaterial.map = texture
            newMaterial.needsUpdate = true
            
            cleanMaterial(child.material)
            child.material = newMaterial
            loadedTextures.push(texture)
          },
          undefined,
          (error) => console.warn(`Erro ao carregar textura do corpo (${bodyTexturePath}):`, error)
        )
      }
    })

    // Aplicar textura no rosto
    faceClone.traverse((child) => {
      if (child.isMesh && child.material) {
        textureLoader.load(
          faceTexturePath,
          (texture) => {
            configureTexture(texture)
            
            const newMaterial = child.material.clone()
            newMaterial.map = texture
            newMaterial.needsUpdate = true
            
            cleanMaterial(child.material)
            child.material = newMaterial
            loadedTextures.push(texture)
          },
          undefined,
          (error) => console.warn(`Erro ao carregar textura do rosto (${faceTexturePath}):`, error)
        )
      }
    })

    // Cleanup
    return () => {
      loadedTextures.forEach(tex => tex.dispose())
    }
  }, [bodyClone, faceClone, skinColor, faceOption, basePath])

  return (
    <>
      {bodyClone && <primitive object={bodyClone} />}
      {faceClone && <primitive object={faceClone} />}
      {hairClone && <primitive object={hairClone} />}
    </>
  )
}

// ============================================
// 📷 CONTROLE DE CÂMERA
// ============================================

function CameraController({ cameraDistance }) {
  const { camera } = useThree()
  
  useEffect(() => {
    camera.near = 0.001
    camera.far = 1000
    camera.position.z = cameraDistance
    camera.updateProjectionMatrix()
  }, [camera, cameraDistance])
  
  return null
}

// ============================================
// 🎭 COMPONENTE PRINCIPAL
// ============================================

export default function Avatar3D({ 
  gender, 
  bodyType, 
  skinColor, 
  faceOption, 
  hairId, 
  size = 48, 
  bgGradient = 'linear-gradient(135deg, #FFD700 0%, #FF9800 50%, #FF8C00 100%)' 
}) {
  const instanceId = useRef(Math.random()).current
  const avatarKey = `${gender}-${bodyType}-${skinColor}-${faceOption}-${hairId}-${instanceId}`
  const isMobile = useMemo(() => isMobileDevice(), [])

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
        <Suspense fallback={
          <div style={{
            width: '100%', 
            height: '100%', 
            background: '#1f2937', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center'
          }}>
            <span style={{ color: '#6b7280', fontSize: '10px' }}>Carregando...</span>
          </div>
        }>
          <Canvas
            key={avatarKey}
            style={{ width: '100%', height: '100%' }}
            gl={{ 
              antialias: !isMobile, 
              alpha: true, 
              powerPreference: isMobile ? 'low-power' : 'high-performance',
              stencil: false,
              depth: true
            }}
            dpr={isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5)}
            performance={{ min: 0.5 }}
          >
            <CameraController cameraDistance={modelPresets.cameraDistance} />
            <ambientLight intensity={isMobile ? 1.5 : 1.2} />
            {!isMobile && <directionalLight position={[5, 5, 5]} intensity={1} />}
            <group 
              position={modelPresets.position} 
              rotation={modelPresets.rotation} 
              scale={modelPresets.scale}
            >
              <AvatarPreview
                gender={gender}
                bodyType={bodyType}
                skinColor={skinColor}
                faceOption={faceOption}
                hairId={hairId}
                instanceId={instanceId}
              />
            </group>
            <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
          </Canvas>
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
