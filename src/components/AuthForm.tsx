import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

type AuthFormProps = {
  onAuthComplete: (userId: string) => void;
};

export function AuthForm({ onAuthComplete }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [errors, setErrors] = useState({ email: '', password: '', general: '' });
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = { email: '', password: '', general: '' };
    let isValid = true;

    if (!email.includes('@')) {
      newErrors.email = 'Por favor, insira um email válido';
      isValid = false;
    }

    if (password.length < 6) {
      newErrors.password = 'A senha deve ter no mínimo 6 caracteres';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Create user document in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        onAuthComplete(userCredential.user.uid);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onAuthComplete(userCredential.user.uid);
      }
    } catch (error: any) {
      const errorCode = error.code;
      let errorMessage = 'Erro ao processar sua solicitação';

      if (errorCode === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está cadastrado';
      } else if (errorCode === 'auth/user-not-found') {
        errorMessage = 'Email não encontrado';
      } else if (errorCode === 'auth/wrong-password') {
        errorMessage = 'Senha incorreta';
      } else if (errorCode === 'auth/weak-password') {
        errorMessage = 'A senha é muito fraca';
      }

      setErrors({ email: '', password: '', general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full overflow-hidden mb-4 flex items-center justify-center">
            <img src="/landpage/LOGO.jpeg" alt="Logo Raízes" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-center text-gray-900 mb-2">
            Raízes
          </h1>
          <p className="text-center text-gray-600 mb-4">
            Plataforma de Consciência Negra
          </p>
          <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-xl">
            <p className="text-gray-700 text-sm text-center">
              <strong>Bem-vindo(a)!</strong> Esta é uma plataforma dedicada à <strong>identificação racial</strong>, 
              <strong> conscientização sobre preconceito</strong> e <strong>educação sobre consciência negra</strong>. 
              Aqui você aprenderá sobre respeito, igualdade e a importância de valorizar todas as raízes que formam nossa sociedade.
            </p>
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          <Button
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`flex-1 ${isSignUp ? 'bg-gray-900 text-amber-400' : 'bg-gray-200 text-gray-900'}`}
            disabled={loading}
          >
            Cadastro
          </Button>
          <Button
            type="button"
            onClick={() => setIsSignUp(false)}
            className={`flex-1 ${!isSignUp ? 'bg-gray-900 text-amber-400' : 'bg-gray-200 text-gray-900'}`}
            disabled={loading}
          >
            Login
          </Button>
        </div>

        {errors.general && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertDescription className="text-red-700">{errors.general}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gray-900 hover:bg-gray-800 text-amber-400"
            disabled={loading}
          >
            {loading ? 'Processando...' : isSignUp ? 'Cadastrar' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button 
            onClick={() => window.location.href = '/'} 
            variant="outline" 
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Voltar à Home
          </Button>
        </div>
      </Card>
    </div>
  );
}
