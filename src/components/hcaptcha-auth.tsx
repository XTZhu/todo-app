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
    <div className="mb-6 flex justify-center">
      <div className="rounded-xl bg-card p-6 text-center shadow-[var(--shadow-card)]">
        <p className="mb-4 text-sm text-muted-foreground">
          请完成验证以启用云同步
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
