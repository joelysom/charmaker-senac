import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase/firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

type SaveButtonProps = {
  gender: 'female' | 'male'
  selectedBodyType: string
  selectedSkinColor: string
  selectedFaceOption: string
  selectedHair: number
  onDone?: (data: { avatar?: string }) => void
}

export default function SaveButton({ gender, selectedBodyType, selectedSkinColor, selectedFaceOption, selectedHair, onDone }: SaveButtonProps) {
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
      const charRef = doc(db, 'characters', user.uid)
        // normalize skin code (e.g. 'skin1') to a readable racial tone string
        const skinMap: Record<string, string> = {
          skin1: 'preto',
          skin2: 'pardo',
          skin3: 'indigena',
          skin4: 'amarelo',
          skin5: 'branco'
        }

        const normalizedSkin = skinMap[selectedSkinColor] ?? String(selectedSkinColor)

        const payload = {
          uid: user.uid,
          gender,
          bodyType: selectedBodyType,
          // Save normalized skin tone so admin statistics can read it reliably
          skinColor: normalizedSkin,
          // keep the original selection code for debugging if needed
          skinCode: selectedSkinColor,
          faceOption: selectedFaceOption,
          hairId: selectedHair,
          updatedAt: serverTimestamp()
        }

      // Overwrite or create the character document for this user (ensures single character per user)
      await setDoc(charRef, payload, { merge: true })

      // Optionally also keep a reference inside user's doc (users/{uid}.characterId)
      // Skipping for now to keep simple; characters doc ID == uid

      // Call onDone so App can continue the flow
      if (onDone) onDone({ avatar: `${gender}-${selectedHair}` })

      // Navigate back to root so App's main UI is visible and it can render the quiz step
      try {
        navigate('/', { replace: true })
      } catch (e) {
        // fallback: change location
        window.history.replaceState({}, '', '/')
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Erro ao salvar personagem:', e)
      window.alert('Erro ao salvar o personagem. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <button
      onClick={saveCharacter}
      disabled={saving}
      className="btn-save"
    >
      {saving ? 'Salvando...' : 'Salvar e continuar'}
    </button>
  )
}
