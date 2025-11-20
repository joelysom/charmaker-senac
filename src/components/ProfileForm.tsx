import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

type ProfileFormProps = {
  userId: string;
  userEmail: string;
  onComplete: (userData: { name: string; age: number }) => void;
};

export function ProfileForm({ userId, userEmail, onComplete }: ProfileFormProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [errors, setErrors] = useState({ name: '', age: '', general: '' });
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = { name: '', age: '', general: '' };
    let isValid = true;

    if (name.trim().length < 2) {
      newErrors.name = 'Por favor, insira um nome válido';
      isValid = false;
    }

    const ageNum = parseInt(age);
    if (!age || ageNum < 5 || ageNum > 120) {
      newErrors.age = 'Por favor, insira uma idade válida (5-120)';
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
      // Salvar dados do perfil no Firestore
      await setDoc(doc(db, 'users', userId), {
        email: userEmail,
        name: name.trim(),
        age: parseInt(age),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      onComplete({ name: name.trim(), age: parseInt(age) });
    } catch (error: any) {
      setErrors({
        ...errors,
        general: 'Erro ao salvar perfil. Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full overflow-hidden mb-4 flex items-center justify-center">
            <img 
              src="/landpage/LOGO.jpeg" 
              alt="Logo Raízes" 
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-center text-gray-900 mb-2">
            Completing Your Profile
          </h1>
          <p className="text-center text-gray-600 mb-4">
            Passo 2: Informações Pessoais
          </p>
          <p className="text-center text-sm text-gray-500">
            Email: {userEmail}
          </p>
        </div>

        {errors.general && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertDescription className="text-red-700">{errors.general}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo ou nome social</Label>
            <Input
              id="name"
              type="text"
              placeholder="Digite seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Idade</Label>
            <Input
              id="age"
              type="number"
              placeholder="Digite sua idade"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className={errors.age ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.age && (
              <p className="text-red-500 text-sm">{errors.age}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gray-900 hover:bg-gray-800 text-amber-400"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Continuar'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
