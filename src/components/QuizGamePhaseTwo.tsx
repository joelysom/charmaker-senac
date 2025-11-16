import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { DictionaryPopup } from './DictionaryPopup';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Trophy } from 'lucide-react';
import { UserData } from '../App';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Avatar3D from './Avatar3D';

type QuizGamePhaseTwoProps = {
  userId: string; 
  userData: UserData;
  onComplete: (totalAccumulatedScore: number, phaseTwoScore: number, totalPhaseTwoQuestions: number) => void;
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

type DictionaryEntry = {
  term: string;
  explanation: string;
  alternative: string;
};

const phaseTwoQuestions: Question[] = [
  {
    id: 4,
    situation: 'Você presencia um colega fazendo uma "piada" racista no ambiente de trabalho e todos riem.',
    question: 'Como você se sentiria e como deveria agir?',
    perspective: 'witness',
    options: [
      'Sentir-se incomodado, não rir e depois conversar com o colega sobre por que isso é inadequado',
      'Rir junto para não parecer "chato"',
      'Ficar quieto porque "é só uma piada"',
      'Fazer outra piada semelhante para se enturmar'
    ],
    correctAnswer: 0,
    explanation: 'Não devemos ser coniventes com "piadas" racistas. O silêncio é cumplicidade. É importante posicionar-se contra o racismo, mesmo quando isso nos coloca em situação desconfortável.'
  },
  {
    id: 5,
    situation: 'Você chamou uma pessoa negra de "moreno" ou "pessoa de cor" ao invés de negro.',
    question: 'A pessoa corrige você educadamente. Como deve reagir?',
    perspective: 'aggressor',
    options: [
      'Agradecer a correção, pedir desculpas e usar o termo correto',
      'Dizer "é a mesma coisa, você está exagerando"',
      'Ficar ofendido porque "estava tentando ser educado"',
      'Insistir que "moreno soa melhor e menos agressivo"'
    ],
    correctAnswer: 0,
    explanation: 'Usar eufemismos como "moreno" ou "de cor" para evitar dizer "negro" é problemático, pois sugere que negritude é algo negativo. "Negro" e "pessoa negra" são termos corretos e dignos.'
  },
  {
    id: 6,
    situation: 'Sua irmã negra chega em casa chorando porque foi vítima de racismo na escola.',
    question: 'Como você deveria agir como familiar?',
    perspective: 'witness',
    options: [
      'Acolhê-la, acreditar no relato, oferecer suporte emocional e buscar medidas junto à escola',
      'Dizer "ignora, quanto mais você ligar, pior fica"',
      'Sugerir que ela "não seja tão sensível"',
      'Culpá-la dizendo "o que você fez para provocarem isso?"'
    ],
    correctAnswer: 0,
    explanation: 'Vítimas de racismo precisam de acolhimento, validação e apoio concreto. Nunca devemos minimizar a dor ou culpar a vítima. É fundamental tomar atitudes práticas para combater o racismo.'
  },
  {
    id: 7,
    situation: 'Você disse para um colega negro que ele "tem inveja branca" de uma conquista sua.',
    question: 'Ele explica que a expressão é racista. O que fazer?',
    perspective: 'aggressor',
    options: [
      'Reconhecer o erro, pedir desculpas e parar de usar a expressão',
      'Argumentar que "sempre falei assim e nunca foi problema"',
      'Dizer "você está procurando pelo em ovo"',
      'Continuar usando porque "é só uma expressão comum"'
    ],
    correctAnswer: 0,
    explanation: 'Expressões como "inveja branca", "lista negra" e "mercado negro" associam cores a valores positivos e negativos, reforçando o racismo. Devemos aceitar a educação e mudar nosso vocabulário.'
  },
  {
    id: 8,
    situation: 'Você vê uma mulher negra sendo confundida com a empregada doméstica em um evento social.',
    question: 'Como você se sentiria e o que deveria fazer?',
    perspective: 'witness',
    options: [
      'Sentir indignação, intervir educadamente corrigindo o erro e apoiar a mulher',
      'Pensar "que situação constrangededora" mas não fazer nada',
      'Achar engraçado internamente',
      'Ignorar completamente'
    ],
    correctAnswer: 0,
    explanation: 'Mulheres negras são frequentemente vítimas desse tipo de preconceito. Devemos intervir ativamente contra essas situações, demonstrando que racismo não será tolerado.'
  },
  {
    id: 9,
    situation: 'Você perguntou a uma pessoa negra "onde você aprendeu a falar tão bem português?"',
    question: 'A pessoa se ofende. O que você deveria ter feito diferente?',
    perspective: 'aggressor',
    options: [
      'Nunca fazer essa pergunta, pois pressupõe que pessoas negras não falam bem português',
      'Insistir na pergunta porque "era curiosidade genuína"',
      'Dizer "você entendeu errado, era um elogio"',
      'Ficar bravo porque "está tudo errado hoje em dia"'
    ],
    correctAnswer: 0,
    explanation: 'Essa pergunta pressupõe que pessoas negras não dominariam bem o idioma, o que é racista. Pessoas negras são brasileiras e têm pleno domínio do português como qualquer outra pessoa.'
  },
  {
    id: 10,
    situation: 'Seu primo negro foi abordado violentamente pela polícia sem motivo aparente.',
    question: 'Como você deveria agir como familiar?',
    perspective: 'witness',
    options: [
      'Oferecer apoio, documentar o caso, buscar assistência jurídica e denunciar',
      'Dizer "você deve ter feito algo para chamar atenção"',
      'Aconselhar "da próxima vez se comporte melhor"',
      'Minimizar dizendo "polícia trata todo mundo mal"'
    ],
    correctAnswer: 0,
    explanation: 'O perfilamento racial pela polícia é real e violento. Devemos apoiar vítimas, documentar abusos e buscar responsabilização. Nunca culpar a vítima.'
  },
  {
    id: 11,
    situation: 'Você disse que o cabelo da sua colega estava "mais apresentável" depois que ela alisou.',
    question: 'Ela fica visivelmente chateada. O que você deve fazer?',
    perspective: 'aggressor',
    options: [
      'Pedir desculpas sinceras e reconhecer que o comentário foi racista e ofensivo',
      'Justificar dizendo "mas ficou bonito assim também"',
      'Dizer "você está sendo dramática"',
      'Culpar a sociedade mas não assumir responsabilidade pessoal'
    ],
    correctAnswer: 0,
    explanation: 'Sugerir que cabelos alisados são mais "apresentáveis" que cabelos naturais é racismo estético. Cabelos crespos são lindos e profissionais em sua forma natural.'
  },
  {
    id: 12,
    situation: 'Você percebe que uma pessoa negra está sendo ignorada por vendedores em uma loja enquanto clientes brancos são atendidos.',
    question: 'Como você se sentiria e deveria agir?',
    perspective: 'witness',
    options: [
      'Sentir indignação, chamar atenção para isso e pedir que atendam a pessoa',
      'Pensar "não é comigo" e seguir com suas compras',
      'Achar que a pessoa não parece ter dinheiro mesmo',
      'Aproveitar para ser atendido mais rápido'
    ],
    correctAnswer: 0,
    explanation: 'Racismo em estabelecimentos comerciais é crime. Devemos intervir ativamente, denunciar e não ser coniventes com discriminação.'
  },
  {
    id: 13,
    situation: 'Você questionou a competência de um médico negro antes mesmo da consulta começar.',
    question: 'Você percebe seu preconceito. O que fazer?',
    perspective: 'aggressor',
    options: [
      'Reconhecer internamente o preconceito, dar chance ao profissional e trabalhar para desconstruir esse viés',
      'Pedir para trocar de médico sem dar explicações',
      'Ficar o tempo todo desconfiado',
      'Questionar abertamente suas qualificações'
    ],
    correctAnswer: 0,
    explanation: 'Questionar competência baseado em raça é racismo. Profissionais negros enfrentam isso constantemente. Devemos reconhecer nossos vieses e trabalhar para eliminá-los.'
  },
  {
    id: 14,
    situation: 'Seu amigo negro compartilha que não se sente seguro em determinados lugares por causa do racismo.',
    question: 'Como você deveria responder?',
    perspective: 'witness',
    options: [
      'Ouvir com empatia, validar o sentimento e oferecer suporte concreto',
      'Dizer "você está paranóico"',
      'Argumentar "mas eu vou lá e nunca acontece nada"',
      'Mudar de assunto porque é desconfortável'
    ],
    correctAnswer: 0,
    explanation: 'O medo e a insegurança que pessoas negras sentem por causa do racismo são reais. Devemos ouvir, acreditar e oferecer apoio, não questionar ou minimizar.'
  },
  {
    id: 15,
    situation: 'Você elogiou uma pessoa negra dizendo "você é bonito apesar de ser negro".',
    question: 'A pessoa se ofende profundamente. O que você deveria ter feito?',
    perspective: 'aggressor',
    options: [
      'Nunca fazer esse "elogio", pois ser negro não é um defeito a ser superado',
      'Insistir que "era para ser um elogio"',
      'Dizer "você entendeu errado"',
      'Ficar ofendido porque "estava sendo gentil"'
    ],
    correctAnswer: 0,
    explanation: 'Esse tipo de "elogio" é extremamente racista porque trata negritude como algo negativo. Ser negro é lindo e não é "apesar de", é "porque".'
  }
];

const dictionaryEntries: DictionaryEntry[] = [
  {
    term: 'Denegrir',
    explanation: 'Palavra derivada de "negro" usada com sentido negativo (manchar, difamar), reforçando associações negativas à negritude.',
    alternative: 'Use "difamar", "caluniar", "manchar a reputação" ou "desvalorizar".'
  },
  {
    term: 'Inveja branca / Coisa de preto / A coisa tá preta',
    explanation: 'Expressões que associam branco ao positivo e preto ao negativo, perpetuando racismo linguístico.',
    alternative: 'Use "inveja saudável", "admiração" / "complicado", "difícil", "mal feito" / "a situação está difícil".'
  },
  {
    term: 'Cabelo ruim / Cabelo duro',
    explanation: 'Termos pejorativos que denigrem o cabelo natural de pessoas negras, reforçando padrões estéticos eurocêntricos racistas.',
    alternative: 'Use "cabelo crespo", "cabelo cacheado" ou "cabelo natural" - são características, não defeitos.'
  },
  {
    term: 'Moreno / Moreninho (para evitar dizer negro)',
    explanation: 'Eufemismo usado para evitar dizer "negro", como se fosse algo negativo. É uma forma de apagamento da identidade racial.',
    alternative: 'Use "negro" ou "pessoa negra" - são termos corretos, dignos e não ofensivos.'
  },
  {
    term: 'Serviço de preto / Nas coxas',
    explanation: 'Expressões extremamente racistas que associam trabalho mal feito à população negra e têm origem no período escravocrata.',
    alternative: 'Use "trabalho mal feito", "serviço desleixado", "mal executado" ou "trabalho inadequado".'
  }
];

function shuffleArray(array: any[]) {
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

export function QuizGamePhaseTwo({ userId, userData, onComplete }: QuizGamePhaseTwoProps) {
  const [shuffledQuestions] = useState(() => processAndShuffleQuestions(phaseTwoQuestions));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [showDictionary, setShowDictionary] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [character, setCharacter] = useState<any>(null);
  const [loadingCharacter, setLoadingCharacter] = useState(true);
  const [answers, setAnswers] = useState<Array<{ questionId: number; selected: number; correct: number; isCorrect: boolean }>>([]);
  const [lastAnswerWasIncorrect, setLastAnswerWasIncorrect] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [phaseOneScore, setPhaseOneScore] = useState(0);

  // Load saved progress and Phase 1 score
  useEffect(() => {
    const loadProgress = async () => {
      try {
        if (!userId) {
          setLoadingProgress(false);
          return;
        }

        // Load Phase 1 results DIRECTLY from quizResults to get the ACTUAL Phase 1 score
        // Don't use quizStats.correct because it might include Phase 2 if user is redoing
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        // Get Phase 1 score from the actual Phase 1 results
        let phaseOneCorrect = 0;
        const quizStats = userDoc.data()?.quizStats;
        
        if (quizStats?.phaseOneCompleted) {
          // Phase 1 was completed, so we have 3 questions answered
          // Get the actual score from Phase 1 results, not from quizStats
          phaseOneCorrect = 3; // Phase 1 always has 3 questions
          
          // But we should get the actual score the user got
          // Query Phase 1 results to get the real score
          const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
          const phase1ResultsRef = collection(db, 'users', userId, 'quizResults');
          const phase1Query = query(
            phase1ResultsRef,
            where('phase', '==', 1),
            orderBy('timestamp', 'desc'),
            limit(1)
          );
          const phase1Snapshot = await getDocs(phase1Query);
          
          if (!phase1Snapshot.empty) {
            const phase1Data = phase1Snapshot.docs[0].data();
            phaseOneCorrect = phase1Data.correctAnswers || 0;
            console.log('📊 Phase 1 score carregado dos resultados:', phaseOneCorrect);
          }
        }
        
        setPhaseOneScore(phaseOneCorrect);

        const progressRef = doc(db, 'users', userId, 'quizProgress', 'phase2');
        const progressDoc = await getDoc(progressRef);

        if (progressDoc.exists() && !progressDoc.data().deleted) {
          const savedProgress = progressDoc.data();
          setCurrentQuestion(savedProgress.currentQuestion || 0);
          setScore(savedProgress.score || phaseOneCorrect); // Start with Phase 1 score
          setAnswers(savedProgress.answers || []);
          console.log('Progress loaded successfully!', { phaseOneScore: phaseOneCorrect });
        } else {
          // If no saved progress, initialize with Phase 1 score
          setScore(phaseOneCorrect);
          console.log('Starting Phase 2 with Phase 1 score:', phaseOneCorrect);
        }
      } catch (e) {
        console.error('Erro ao carregar progresso:', e);
      } finally {
        setLoadingProgress(false);
      }
    };
    loadProgress();
  }, [userId]);

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

  const saveProgressAndExit = async () => {
    try {
      if (!userId) return;

      // Ensure latest progress is saved
      await saveProgressToFirestore(answers, score);

      console.log('Progress saved successfully! Returning to menu...');
      
      // Navigate back to menu
      window.location.reload(); // Simple way to go back to menu
    } catch (e) {
      console.error('Erro ao salvar progresso:', e);
    }
  };

  const savePhaseTwoResult = async (phaseTwoOnlyScore: number, allAnswers: typeof answers) => {
    try {
      if (!userId) return; 

      const phaseTwoResult = {
        phase: 2,
        totalQuestions: shuffledQuestions.length,
        totalAnswered: allAnswers.length, 
        correctAnswers: phaseTwoOnlyScore, // Only Phase 2 correct answers
        wrongAnswers: allAnswers.length - phaseTwoOnlyScore, 
        percentage: Math.round((phaseTwoOnlyScore / allAnswers.length) * 100), 
        answers: allAnswers,
        completedAt: new Date().toISOString(),
        timestamp: Date.now()
      };

      const docId = `phase2_${Date.now()}`;
      console.log('💾 Salvando Phase 2 com ID:', docId);
      console.log('📋 Dados Phase 2:', {
        phase: phaseTwoResult.phase,
        totalQuestions: phaseTwoResult.totalQuestions,
        correctAnswers: phaseTwoResult.correctAnswers,
        answersCount: phaseTwoResult.answers.length,
        questionIds: phaseTwoResult.answers.map(a => a.questionId)
      });

      const phaseTwoResultsRef = doc(db, 'users', userId, 'quizResults', docId); 
      await setDoc(phaseTwoResultsRef, phaseTwoResult);
      console.log('✅ Phase 2 salvo com sucesso no documento:', docId);

      // RE-FETCH the current stats to ensure we have the latest data
      const userRef = doc(db, 'users', userId);
      const userDocRefresh = await getDoc(userRef);
      const currentStats = userDocRefresh.data()?.quizStats || { total: 0, correct: 0, wrong: 0 };

      console.log('🔍 Stats ATUAIS no Firebase (antes da Phase 2):', currentStats);
      console.log('➕ Phase 2 - Adicionando:', { 
        total: allAnswers.length, 
        correct: phaseTwoOnlyScore, 
        wrong: allAnswers.length - phaseTwoOnlyScore 
      });
      console.log('📊 Deveria resultar em:', {
        total: currentStats.total + allAnswers.length,
        correct: currentStats.correct + phaseTwoOnlyScore,
        wrong: currentStats.wrong + (allAnswers.length - phaseTwoOnlyScore)
      });

      // CRITICAL: Only add if Phase 2 hasn't been completed before
      if (currentStats.phaseTwoCompleted) {
        console.warn('⚠️ Phase 2 já foi completada anteriormente! Não somando novamente.');
        return;
      }

      // Update stats - ADD Phase 2 results to existing stats (which should include Phase 1)
      const newStats = {
        total: currentStats.total + allAnswers.length,
        correct: currentStats.correct + phaseTwoOnlyScore,
        wrong: currentStats.wrong + (allAnswers.length - phaseTwoOnlyScore),
        lastQuizDate: new Date().toISOString(),
        phaseOneCompleted: currentStats.phaseOneCompleted || false,
        phaseTwoCompleted: true
      };

      console.log('✅ Stats NOVOS a serem salvos:', newStats);

      await setDoc(userRef, {
        quizStats: newStats
      }, { merge: true });

      // Verify the save
      const verifyDoc = await getDoc(userRef);
      console.log('✔️ Stats VERIFICADOS no Firebase após salvar:', verifyDoc.data()?.quizStats);

      // Delete progress after completion
      const progressRef = doc(db, 'users', userId, 'quizProgress', 'phase2');
      await setDoc(progressRef, { deleted: true });

      console.log('Phase 2 quiz result saved successfully!');
    } catch (e) {
      console.error('Erro ao salvar resultado da fase 2 do quiz:', e);
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
      setLastAnswerWasIncorrect(false);
    } else {
      setLastAnswerWasIncorrect(true);
    }

    const newAnswers = [...answers, {
      questionId: question.id,
      selected: selectedAnswer,
      correct: question.correctAnswer,
      isCorrect: isCorrect
    }];

    setAnswers(newAnswers);
    setShowResult(true);

    // Auto-save progress after each answer
    // Save current Phase 2 score (total score - Phase 1 score)
    const phaseTwoScore = isCorrect ? (score + 1 - phaseOneScore) : (score - phaseOneScore);
    saveProgressToFirestore(newAnswers, isCorrect ? score + 1 : score, phaseTwoScore);
  };

  const saveProgressToFirestore = async (currentAnswers: typeof answers, totalScore: number, phaseTwoScore?: number, questionIndex?: number) => {
    try {
      if (!userId) return;

      const progressData = {
        phase: 2,
        currentQuestion: questionIndex !== undefined ? questionIndex : currentQuestion,
        score: totalScore, // Total score including Phase 1
        phaseTwoScore: phaseTwoScore !== undefined ? phaseTwoScore : (totalScore - phaseOneScore), // Only Phase 2 score
        answers: currentAnswers,
        totalQuestions: shuffledQuestions.length,
        lastSaved: new Date().toISOString(),
        timestamp: Date.now()
      };

      console.log('Salvando progresso da Phase 2:', {
        questionsAnswered: currentAnswers.length,
        totalScore,
        phaseTwoScore: progressData.phaseTwoScore,
        phaseOneScore,
        nextQuestion: progressData.currentQuestion
      });

      const progressRef = doc(db, 'users', userId, 'quizProgress', 'phase2');
      await setDoc(progressRef, progressData);
      
      console.log('Progresso salvo com sucesso!');
    } catch (e) {
      console.error('Erro ao auto-salvar progresso:', e);
    }
  };

  const handleNext = () => {
    setShowResult(false);
    setSelectedAnswer(null);
    setAnswered(false);

    if (currentQuestion < shuffledQuestions.length - 1) { 
      const nextQuestion = currentQuestion + 1;
      if (lastAnswerWasIncorrect) {
        setShowDictionary(true); 
        setLastAnswerWasIncorrect(false); 
      } else {
        setCurrentQuestion(nextQuestion); 
      }
      // Save progress with the next question index
      const phaseTwoScore = score - phaseOneScore;
      saveProgressToFirestore(answers, score, phaseTwoScore, nextQuestion);
    } else {
      // Calculate final score from answers array to ensure accuracy
      const phaseTwoOnlyScore = answers.filter(a => a.isCorrect).length;
      const finalTotalScore = phaseOneScore + phaseTwoOnlyScore;
      
      console.log('🎯 Finalizando Phase 2:', {
        phaseOneScore,
        phaseTwoOnlyScore,
        finalTotalScore,
        totalQuestions: shuffledQuestions.length
      });
      
      savePhaseTwoResult(phaseTwoOnlyScore, answers); // Pass ONLY Phase 2 score
      // Pass total accumulated score, Phase 2 score only, and total Phase 2 questions
      onComplete(finalTotalScore, phaseTwoOnlyScore, shuffledQuestions.length);
    }
  };

  const handleDictionaryClose = () => {
    setShowDictionary(false);
    setCurrentQuestion(currentQuestion + 1);
  };

  const getDictionaryEntry = () => {
    const index = Math.floor(currentQuestion / 3) % dictionaryEntries.length;
    return dictionaryEntries[index];
  };

  return (
    <>
      {loadingProgress ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando progresso...</p>
          </div>
        </div>
      ) : (
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
                    Fase 2 - Aprofundamento
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

              <div className="flex justify-between gap-3">
                <Button 
                  onClick={saveProgressAndExit}
                  variant="outline"
                  className="px-6"
                >
                  Continuar Depois
                </Button>
                <div className="flex gap-3">
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
                      {currentQuestion < shuffledQuestions.length - 1 ? 'Próxima Pergunta' : 'Ver Resultado'}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </Card>

        <DictionaryPopup
          isOpen={showDictionary}
          onClose={handleDictionaryClose}
          entry={getDictionaryEntry()}
        />
      </div>
      )}
    </>
  );
}
