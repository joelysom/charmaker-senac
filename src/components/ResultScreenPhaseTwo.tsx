import { Card } from './ui/card';
import { Button } from './ui/button';
import { Trophy, Star, Award, Heart, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { UserData } from '../App';
import Avatar3D from './Avatar3D';
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

type ResultScreenPhaseTwoProps = {
  userData: UserData;
  phaseTwoScore: number;
  totalPhaseTwoQuestions: number;
  totalAccumulatedScore: number;
  onContinue: () => void;
};

export function ResultScreenPhaseTwo({ 
  userData, 
  phaseTwoScore, 
  totalPhaseTwoQuestions,
  totalAccumulatedScore,
  onContinue 
}: ResultScreenPhaseTwoProps) {
  const [character, setCharacter] = useState<any>(null);
  const [loadingCharacter, setLoadingCharacter] = useState(true);
  const percentage = (phaseTwoScore / totalPhaseTwoQuestions) * 100;

  // Load character data from Firestore
  useEffect(() => {
    const loadCharacter = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoadingCharacter(false);
          return;
        }
        const charDoc = await getDoc(doc(db, 'characters', user.uid));
        if (charDoc.exists()) {
          setCharacter(charDoc.data());
        }
      } catch (e) {
        console.error('Erro ao carregar personagem:', e);
      } finally {
        setLoadingCharacter(false);
      }
    }
    loadCharacter();
  }, []);
  
  const getMessage = () => {
    if (percentage >= 90) {
      return {
        title: 'Excelente! 🎉',
        message: 'Você demonstrou grande consciência e respeito! Continue sendo um agente de mudança positiva.',
        icon: Trophy,
        color: 'from-yellow-400 to-amber-500'
      };
    } else if (percentage >= 70) {
      return {
        title: 'Muito Bem! 🌟',
        message: 'Você está no caminho certo! Continue aprendendo e refletindo sobre igualdade racial.',
        icon: Star,
        color: 'from-amber-400 to-yellow-500'
      };
    } else if (percentage >= 50) {
      return {
        title: 'Bom Começo! 💪',
        message: 'Você já deu passos importantes! Continue estudando e praticando o respeito e a empatia.',
        icon: Award,
        color: 'from-yellow-300 to-amber-400'
      };
    } else {
      return {
        title: 'Continue Aprendendo! 📚',
        message: 'Toda jornada começa com o primeiro passo. Revise o conteúdo e tente novamente!',
        icon: Heart,
        color: 'from-amber-300 to-orange-400'
      };
    }
  };

  const result = getMessage();
  const Icon = result.icon;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-2xl p-8 shadow-xl">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="flex flex-col items-center"
        >
          {/* Icon */}
          <div className={`w-32 h-32 bg-gradient-to-br ${result.color} rounded-full flex items-center justify-center mb-6 shadow-lg`}>
            <Icon className="w-16 h-16 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            {result.title}
          </h2>

          {/* Phase 2 Score */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-2">Fase 2 - Aprofundamento</p>
            <div className="inline-flex items-center gap-2 bg-amber-100 px-6 py-3 rounded-full mb-2">
              <span className="text-gray-900 text-3xl font-bold">
                {phaseTwoScore}/{totalPhaseTwoQuestions}
              </span>
            </div>
            <p className="text-gray-600 text-lg">
              {percentage.toFixed(0)}% de acertos
            </p>
          </div>

          {/* Total Accumulated Score */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl mb-6 border-2 border-green-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600 font-semibold">Pontuação Total Acumulada</p>
            </div>
            <p className="text-center text-gray-900 text-2xl font-bold">
              {totalAccumulatedScore} pontos
            </p>
            <p className="text-center text-xs text-gray-600 mt-1">
              (Fase 1: {totalAccumulatedScore - phaseTwoScore} + Fase 2: {phaseTwoScore})
            </p>
          </div>

          {/* Message */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-xl mb-8 text-center border-2 border-amber-200">
            <p className="text-gray-700">
              {result.message}
            </p>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 mb-8 bg-white p-4 rounded-xl border-2 border-amber-200">
            {!loadingCharacter && character ? (
              <Avatar3D
                gender={character.gender}
                bodyType={character.bodyType}
                skinColor={character.skinColor}
                faceOption={character.faceOption}
                hairId={character.hairId}
                size={64}
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                <span className="text-3xl">{userData.avatar}</span>
              </div>
            )}
            <div className="text-left">
              <p className="text-lg font-semibold text-gray-800">
                {userData.name}
              </p>
              <p className="text-gray-600 text-sm">
                Completou a jornada completa!
              </p>
            </div>
          </div>

          {/* Educational Message */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5 mb-6 w-full">
            <p className="text-gray-700 text-sm text-center">
              <strong className="text-gray-900">Parabéns!</strong> Você completou todas as fases 
              do quiz de consciência racial. Lembre-se: a luta antirracista é uma jornada contínua 
              de aprendizado, reflexão e ação. Continue praticando o respeito e a empatia no seu dia a dia.
            </p>
          </div>

          {/* Action Button */}
          <Button onClick={onContinue} className="w-full bg-gray-900 hover:bg-gray-800 text-amber-400" size="lg">
            Voltar ao Menu
          </Button>
        </motion.div>
      </Card>
    </div>
  );
}
