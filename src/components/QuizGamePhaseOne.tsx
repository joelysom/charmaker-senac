import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Trophy } from 'lucide-react';
import { UserData } from '../App';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Avatar3D from './Avatar3D';

type QuizGamePhaseOneProps = {
  userId: string; 
  userData: UserData;
  onComplete: () => void;
};

type Question = {
  id: number;
  situation: string;
  question: string;
  perspective: 'aggressor' | 'witness' | 'victim';
  options: string[];
  correctAnswer: number;
  explanation: string;
};

const phaseOneQuestions: Question[] = [
  {
    id: 1,
    situation: 'Você escolhe não contratar uma pessoa negra porque acha que ela "não combina com o perfil da empresa".',
    question: 'Essa atitude pode ser considerada:',
    perspective: 'aggressor',
    options: [
      'Racismo estrutural.',
      'Uma escolha pessoal.',
      'Preconceito inconsciente.',
      'Nenhuma das anteriores.'
    ],
    correctAnswer: 0,
    explanation: 'Racismo estrutural se manifesta quando práticas discriminatórias estão enraizadas nas instituições e processos organizacionais. Não contratar alguém por sua cor de pele é uma forma clara de racismo estrutural e institucional.'
  },
  {
    id: 2,
    situation: 'Você entra em uma loja de grife no shopping e percebe que além de não ter ninguém querendo lhe atender passa a ser seguido apenas por causa do tom de sua pele.',
    question: 'O que você pode fazer?',
    perspective: 'victim',
    options: [
      'Denunciar o ocorrido.',
      'Ignorar e ir embora.',
      'Questionar o motivo.',
      'Ficar em silêncio para evitar problemas.'
    ],
    correctAnswer: 0,
    explanation: 'Denunciar é fundamental. Essa situação configura racismo e discriminação, crimes previstos em lei. Você pode denunciar ao gerente da loja, ao SAC do shopping, à polícia e ao Ministério Público. É importante não normalizar esse tipo de tratamento.'
  },
  {
    id: 3,
    situation: 'Você presencia um colega sendo discriminado ao realizar certo tipo de atividade em por sua cor de pele.',
    question: 'O que você faz?',
    perspective: 'witness',
    options: [
      'Apoia o colega e denuncia o agressor.',
      'Finge que não viu.',
      'Ri junto com os outros.',
      'Espera que alguém tome uma atitude.'
    ],
    correctAnswer: 0,
    explanation: 'Como testemunha, você tem o poder e a responsabilidade de intervir. Apoiar a vítima e denunciar o comportamento racista é fundamental para combater o racismo. O silêncio e a omissão são formas de cumplicidade.'
  }
];

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function processAndShuffleQuestions(questionsToShuffle: Question[]): Question[] {
  return questionsToShuffle.map(question => {
    const correctText = question.options[question.correctAnswer];
    const shuffledOptions = shuffleArray(question.options);
    const newCorrectIndex = shuffledOptions.findIndex(option => option === correctText);
    return {
      ...question,
      options: shuffledOptions,
      correctAnswer: newCorrectIndex,
    };
  });
}

export function QuizGamePhaseOne({ userId, userData, onComplete }: QuizGamePhaseOneProps) {
  const [shuffledQuestions] = useState(() => processAndShuffleQuestions(phaseOneQuestions));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [character, setCharacter] = useState<any>(null);
  const [loadingCharacter, setLoadingCharacter] = useState(true);
  const [answers, setAnswers] = useState<Array<{ questionId: number; selected: number; correct: number; isCorrect: boolean }>>([]);

  useEffect(() => {
    const loadCharacter = async () => {
      try {
        if (!userId) { 
          setLoadingCharacter(false);
          return;
        }
        const charDoc = await getDoc(doc(db, 'characters', userId)); 
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
  }, [userId]); 

  const savePhaseOneResult = async (finalScore: number, allAnswers: typeof answers) => {
    try {
      if (!userId) return; 

      const phaseOneResult = {
        phase: 1,
        totalQuestions: shuffledQuestions.length,
        totalAnswered: allAnswers.length, 
        correctAnswers: finalScore,
        wrongAnswers: allAnswers.length - finalScore, 
        percentage: Math.round((finalScore / allAnswers.length) * 100), 
        answers: allAnswers,
        completedAt: new Date().toISOString(),
        timestamp: Date.now()
      };

      const docId = `phase1_${Date.now()}`;
      console.log('💾 Salvando Phase 1 com ID:', docId);
      console.log('📋 Dados Phase 1:', {
        phase: phaseOneResult.phase,
        totalQuestions: phaseOneResult.totalQuestions,
        correctAnswers: phaseOneResult.correctAnswers,
        answersCount: phaseOneResult.answers.length,
        questionIds: phaseOneResult.answers.map(a => a.questionId)
      });

      const phaseOneResultsRef = doc(db, 'users', userId, 'quizResults', docId); 
      await setDoc(phaseOneResultsRef, phaseOneResult);
      console.log('✅ Phase 1 salvo com sucesso no documento:', docId);

      // RE-FETCH to ensure we have the latest data
      const userRef = doc(db, 'users', userId);
      const userDocRefresh = await getDoc(userRef);
      const currentStats = userDocRefresh.data()?.quizStats || { total: 0, correct: 0, wrong: 0 };

      console.log('🔍 Stats ATUAIS no Firebase (antes da Phase 1):', currentStats);
      console.log('➕ Phase 1 - Adicionando:', { 
        total: allAnswers.length, 
        correct: finalScore, 
        wrong: allAnswers.length - finalScore 
      });

      // CRITICAL: Only add if Phase 1 hasn't been completed before
      if (currentStats.phaseOneCompleted) {
        console.warn('⚠️ Phase 1 já foi completada anteriormente! Não somando novamente.');
        return;
      }

      const newStats = {
        total: currentStats.total + allAnswers.length,
        correct: currentStats.correct + finalScore,
        wrong: currentStats.wrong + (allAnswers.length - finalScore),
        lastQuizDate: new Date().toISOString(),
        phaseOneCompleted: true
      };

      console.log('✅ Stats NOVOS a serem salvos:', newStats);

      await setDoc(userRef, {
        quizStats: newStats
      }, { merge: true });

      // Verify the save
      const verifyDoc = await getDoc(userRef);
      console.log('✔️ Stats VERIFICADOS no Firebase após salvar:', verifyDoc.data()?.quizStats);

      console.log('Phase 1 quiz result saved successfully!');
    } catch (e) {
      console.error('Erro ao salvar resultado da fase 1 do quiz:', e);
    }
  };

  const progress = ((currentQuestion + 1) / shuffledQuestions.length) * 100;
  const question = shuffledQuestions[currentQuestion];

  const handleAnswer = () => {
    if (selectedAnswer === null) return;
    
    setAnswered(true);
    const isCorrect = selectedAnswer === question.correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
    }

    setAnswers([...answers, {
      questionId: question.id,
      selected: selectedAnswer,
      correct: question.correctAnswer,
      isCorrect: isCorrect
    }]);

    setShowResult(true);
  };

  const handleNext = async () => {
    setShowResult(false);
    setSelectedAnswer(null);
    setAnswered(false);

    if (currentQuestion < shuffledQuestions.length - 1) { 
      setCurrentQuestion(currentQuestion + 1); 
    } else {
      // Calculate final score from answers array to ensure accuracy
      const finalScore = answers.filter(a => a.isCorrect).length;
      await savePhaseOneResult(finalScore, answers);
      onComplete();
    }
  };

  return (
    <div className="py-8">
      <Card className="max-w-3xl mx-auto p-6 sm:p-8 shadow-xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {!loadingCharacter && character ? (
                <Avatar3D
                  gender={character.gender}
                  bodyType={character.bodyType}
                  skinColor={character.skinColor}
                  faceOption={character.faceOption}
                  hairId={character.hairId}
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">{userData.avatar}</span>
                </div>
              )}
              <div>
                <p className="text-gray-800 font-semibold">
                  {userData.name}
                </p>
                <p className="text-sm text-gray-600">
                  Fase 1 - Introdução
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full">
              <Trophy className="w-5 h-5 text-gray-900" />
              <span className="text-gray-900 font-semibold">{score} pontos</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Questão {currentQuestion + 1} de {shuffledQuestions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-xl mb-4 border-2 border-amber-200">
              <p className="text-sm text-gray-600 mb-2">
                {question.perspective === 'aggressor' ? '🤔 Você como agressor:' : 
                 question.perspective === 'victim' ? '😔 Você como vítima:' : 
                 '👥 Você como testemunha:'}
              </p>
              <p className="text-gray-800 mb-3">
                {question.situation}
              </p>
              <h3 className="text-gray-900 font-semibold">
                {question.question}
              </h3>
            </div>

            <div className="space-y-3 mb-6">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !answered && setSelectedAnswer(index)}
                  disabled={answered}
                  className={`
                    w-full p-4 rounded-xl text-left transition-all duration-300
                    ${!answered && selectedAnswer === index 
                      ? 'bg-amber-100 border-2 border-gray-900 shadow-md' 
                      : 'bg-white border-2 border-gray-200 hover:border-amber-300'
                    }
                    ${answered && index === question.correctAnswer 
                      ? 'bg-green-100 border-green-500' 
                      : ''
                    }
                    ${answered && selectedAnswer === index && index !== question.correctAnswer 
                      ? 'bg-red-100 border-red-500' 
                      : ''
                    }
                    ${answered ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1
                      ${!answered && selectedAnswer === index 
                        ? 'bg-gray-900 text-amber-400' 
                        : 'bg-gray-200 text-gray-600'
                      }
                      ${answered && index === question.correctAnswer 
                        ? 'bg-green-500 text-white' 
                        : ''
                      }
                      ${answered && selectedAnswer === index && index !== question.correctAnswer 
                        ? 'bg-red-500 text-white' 
                        : ''
                      }
                    `}>
                      {answered && index === question.correctAnswer && '✓'}
                      {answered && selectedAnswer === index && index !== question.correctAnswer && '✗'}
                      {!answered && (String.fromCharCode(65 + index))}
                    </div>
                    <span className="text-gray-700">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`
                  p-4 rounded-xl mb-6 border-2
                  ${selectedAnswer === question.correctAnswer 
                    ? 'bg-green-50 border-green-500' 
                    : 'bg-red-50 border-red-500'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  {selectedAnswer === question.correctAnswer ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  )}
                  <div>
                    <p className={`font-semibold ${selectedAnswer === question.correctAnswer ? 'text-green-800' : 'text-red-800'}`}>
                      {selectedAnswer === question.correctAnswer ? 'Muito bem! Resposta correta!' : 'Vamos refletir sobre isso.'}
                    </p>
                    <p className="text-gray-700 mt-2">
                      {question.explanation}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex justify-end gap-3">
              {!showResult ? (
                <Button 
                  onClick={handleAnswer}
                  disabled={selectedAnswer === null}
                  className="px-8 bg-gray-900 hover:bg-gray-800 text-amber-400"
                >
                  Responder
                </Button>
              ) : (
                <Button 
                  onClick={handleNext}
                  className="px-8 bg-gray-900 hover:bg-gray-800 text-amber-400"
                >
                  {currentQuestion < shuffledQuestions.length - 1 ? 'Próxima Pergunta' : 'Ir para o Menu'}
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </Card>
    </div>
  );
}
