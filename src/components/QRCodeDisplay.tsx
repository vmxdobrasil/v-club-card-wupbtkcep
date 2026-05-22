import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'

export function QRCodeDisplay() {
  const [timeLeft, setTimeLeft] = useState(60)
  const [qrKey, setQrKey] = useState(0)

  useEffect(() => {
    if (timeLeft <= 0) {
      setTimeLeft(60)
      setQrKey((prev) => prev + 1)
      return
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative p-4 bg-white rounded-xl shadow-lg border">
        <div className="w-[200px] h-[200px] flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
          <img
            key={qrKey}
            src={`https://img.usecurling.com/p/200/200?q=pattern&color=black&dpr=2`}
            alt="QR Code Dinâmico"
            className="w-full h-full mix-blend-multiply opacity-90 object-cover"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-4 py-2 rounded-full font-medium">
        <RefreshCw className={`h-4 w-4 ${timeLeft < 10 ? 'animate-spin text-destructive' : ''}`} />
        <span>
          Atualiza em{' '}
          <strong className={timeLeft < 10 ? 'text-destructive' : 'text-primary'}>
            {timeLeft}s
          </strong>
        </span>
      </div>
    </div>
  )
}
