'use client'

import { useRef } from 'react'
import HCaptcha from '@hcaptcha/react-hcaptcha'

interface HCaptchaAuthProps {
  siteKey: string
  onVerify: (token: string) => void
}

export default function HCaptchaAuth({ siteKey, onVerify }: HCaptchaAuthProps) {
  const captchaRef = useRef<HCaptcha>(null)

  return (
    <div className="flex items-center justify-center py-12">
      <div className="rounded-lg border border-border bg-card p-6 text-center shadow-sm">
        <p className="mb-4 text-sm text-muted-foreground">
          请完成人机验证以继续使用云同步功能
        </p>
        <HCaptcha
          ref={captchaRef}
          sitekey={siteKey}
          onVerify={onVerify}
        />
      </div>
    </div>
  )
}
