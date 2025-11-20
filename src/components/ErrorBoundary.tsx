import React from 'react'

type Props = {
  children: React.ReactNode
  fallback?: React.ReactNode
}

type State = {
  hasError: boolean
  error?: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: any) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught', error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 rounded bg-red-50 border border-red-200">
          <h3 className="text-red-800 font-semibold mb-2">Erro ao carregar cena 3D</h3>
          <p className="text-sm text-red-700 mb-4">Parece que os arquivos de modelo não estão disponíveis no servidor. Verifique se a pasta <code>/models</code> existe e contém os arquivos .glb.</p>
          <p className="text-sm text-red-700">Você pode voltar para a tela anterior ou usar o avatar simplificado.</p>
        </div>
      )
    }

    return this.props.children as any
  }
}

export default ErrorBoundary
