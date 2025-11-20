import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase/firebase'
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'

type SaveButtonProps = {
  gender: 'female' | 'male'
  selectedBodyType: string
  selectedSkinColor: string
  selectedFaceOption: string
  selectedHair: number
  onDone?: (data: { avatar?: string }) => void
}

// Função auxiliar para pegar o caminho da imagem baseado no ID
// Isso replica a lógica que existe na Home para garantir que o Perfil tenha a foto certa
const getAvatarPreviewPath = (gender: string, hairId: number) => {
  if (gender === 'female') {
    const hairMap: Record<number, string> = {
      1: '/FEMALE_READY/FEMALE_HAIR/Lisos/C1.png',
      2: '/FEMALE_READY/FEMALE_HAIR/Lisos/C2.png',
      3: '/FEMALE_READY/FEMALE_HAIR/Lisos/C3.png',
      4: '/FEMALE_READY/FEMALE_HAIR/Culturais/C0.png',
      5: '/FEMALE_READY/FEMALE_HAIR/Culturais/C1.png',
      6: '/FEMALE_READY/FEMALE_HAIR/Culturais/C2.png',
      7: '/FEMALE_READY/FEMALE_HAIR/Culturais/C3.png',
      8: '/FEMALE_READY/FEMALE_HAIR/Cacheados/C0.png',
      9: '/FEMALE_READY/FEMALE_HAIR/Cacheados/C1.png',
      10: '/FEMALE_READY/FEMALE_HAIR/Crespos/C0.png',
      11: '/FEMALE_READY/FEMALE_HAIR/Crespos/C1.png',
      12: '/FEMALE_READY/FEMALE_HAIR/Lisos/C0.png',
      13: '/FEMALE_READY/FEMALE_HAIR/Culturais/C4.png',
      14: '/FEMALE_READY/FEMALE_HAIR/Ondulados/C0.png',
      15: '/FEMALE_READY/FEMALE_HAIR/Ondulados/C1.png',
      16: '/FEMALE_READY/FEMALE_HAIR/Ondulados/C2.png'
    }
    return hairMap[hairId] || '/FEMALE_READY/FEMALE_HAIR/Cacheados/C0.png'
  } else {
    // Male Map
    const hairMap: Record<number, string> = {
      1: '/MALE_READY/MALE_HAIR/Lisos/c0.png',
      2: '/MALE_READY/MALE_HAIR/Lisos/c1.png',
      3: '/MALE_READY/MALE_HAIR/Lisos/c2.png',
      4: '/MALE_READY/MALE_HAIR/Culturais/c0.png',
      5: '/MALE_READY/MALE_HAIR/Culturais/c1.png',
      6: '/MALE_READY/MALE_HAIR/Culturais/c2.png',
      7: '/MALE_READY/MALE_HAIR/Culturais/c3.png',
      8: '/MALE_READY/MALE_HAIR/Cacheados/c0.png',
      9: '/MALE_READY/MALE_HAIR/Cacheados/c1.png',
      10: '/MALE_READY/MALE_HAIR/Crespos/c0.png',
      11: '/MALE_READY/MALE_HAIR/Crespos/c1.png',
      12: '/MALE_READY/MALE_HAIR/Lisos/c3.png',
      13: '/MALE_READY/MALE_HAIR/Culturais/c4.png',
      14: '/MALE_READY/MALE_HAIR/Ondulados/c0.png',
      15: '/MALE_READY/MALE_HAIR/Ondulados/c1.png',
      16: '/MALE_READY/MALE_HAIR/Ondulados/c2.png'
    }
    return hairMap[hairId] || '/MALE_READY/MALE_HAIR/Cacheados/c0.png'
  }
}

export default function SaveButton({ 
  gender, 
  selectedBodyType, 
  selectedSkinColor, 
  selectedFaceOption, 
  selectedHair, 
  onDone 
}: SaveButtonProps) {
  
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  const saveCharacter = async () => {
    if (saving) return
    
    const user = auth.currentUser
    if (!user) {
      window.alert('Você precisa estar logado para salvar o personagem.')
      return
    }

    setSaving(true)
    
    try {
      // 1. Normalização dos dados
      const skinMap: Record<string, string> = {
        skin1: 'preto', skin2: 'pardo', skin3: 'indigena', skin4: 'amarelo', skin5: 'branco'
      }
      const normalizedSkin = skinMap[selectedSkinColor] ?? String(selectedSkinColor)

      // 2. Gera a URL da imagem (Foto do Avatar)
      const avatarPhotoUrl = getAvatarPreviewPath(gender, selectedHair)

      // 3. Montagem do Payload
      const payload = {
        uid: user.uid,
        gender,
        bodyType: selectedBodyType,
        skinColor: normalizedSkin,
        skinCode: selectedSkinColor,
        faceOption: selectedFaceOption,
        hairId: selectedHair,
        // Salva o link da imagem diretamente no documento do personagem
        photoUrl: avatarPhotoUrl, 
        updatedAt: serverTimestamp()
      }

      console.log('💾 Salvando Personagem...', payload)

      // 4. Salvar no Firestore (Coleção characters)
      const charRef = doc(db, 'characters', user.uid)
      await setDoc(charRef, payload, { merge: true })

      // 5. ATUALIZAÇÃO CRÍTICA: Salvar também no documento do USUÁRIO e no AUTH
      // Isso garante que o header/perfil mostre a foto imediatamente
      const userRef = doc(db, 'users', user.uid)
      
      // Tenta atualizar o documento de usuário se ele existir
      try {
        await setDoc(userRef, { 
          photoURL: avatarPhotoUrl,
          characterCreated: true,
          updatedAt: serverTimestamp()
        }, { merge: true })
      } catch (err) {
        console.warn('Não foi possível atualizar doc do usuário (pode ser permissão), mas character foi salvo.')
      }

      // Atualiza o perfil de autenticação do Firebase (Cache local do navegador)
      await updateProfile(user, {
        photoURL: avatarPhotoUrl
      })
      
      console.log('✅ Foto do perfil atualizada com:', avatarPhotoUrl)

      // 6. Callback e Navegação
      if (onDone) {
        onDone({ avatar: `${gender}-${selectedHair}` })
      }

      // Não navega mais para landpage - deixa o App.tsx controlar o fluxo
      // O onDone já vai redirecionar para quizPhaseOne via App.tsx

    } catch (e) {
      console.error('🚨 Erro ao salvar personagem:', e)
      window.alert('Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <button
      onClick={saveCharacter}
      disabled={saving}
      className={`btn-save ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{ 
        padding: '10px 20px', 
        fontSize: '16px', 
        fontWeight: 'bold',
        cursor: saving ? 'wait' : 'pointer'
      }}
    >
      {saving ? 'Salvando...' : 'Salvar e continuar'}
    </button>
  )
}