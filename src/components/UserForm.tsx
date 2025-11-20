import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

type UserFormProps = {
  onComplete: (name: string, age: number) => void;
};

export function UserForm({ onComplete }: UserFormProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [errors, setErrors] = useState({ name: '', age: '' });

  const validateForm = () => {
    const newErrors = { name: '', age: '' };
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onComplete(name, parseInt(age));
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
            />
            {errors.age && (
              <p className="text-red-500 text-sm">{errors.age}</p>
            )}
          </div>

          <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-amber-400">
            Continuar
          </Button>
        </form>
      </Card>
    </div>
  );
}
