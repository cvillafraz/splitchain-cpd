"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, LogOut, CreditCard, Key, ShieldCheck, Wallet, QrCode } from "lucide-react"
import { useDisconnect } from "wagmi"
import { toast } from "sonner"
import QRCode from "react-qr-code"

interface WalletManagerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  address: string
  balance: string
  onFundClick: () => void
}

export function WalletManagerDialog({ open, onOpenChange, address, balance, onFundClick }: WalletManagerDialogProps) {
  const { disconnect } = useDisconnect()
  const [isCopied, setIsCopied] = useState(false)
  const [showQr, setShowQr] = useState(false)

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address)
    setIsCopied(true)
    toast.success("Address copied to clipboard")
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleDisconnect = () => {
    disconnect()
    onOpenChange(false)
    window.location.reload() // Force reload to reset state completely
  }

  const explorerUrl = `https://sepolia.etherscan.io/address/${address}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Wallet Management
          </DialogTitle>
          <DialogDescription>Your wallet is secured by a Passkey. No seed phrases needed.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Balance Section */}
          <div className="p-4 bg-muted/50 rounded-xl border border-border/50 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
              <p className="text-2xl font-bold font-mono">{balance}</p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                onOpenChange(false)
                onFundClick()
              }}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Add Funds
            </Button>
          </div>

          {/* Address Section */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Wallet Address</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-muted/30 rounded-lg font-mono text-sm truncate border border-border/50">
                {address}
              </div>
              <Button variant="outline" size="icon" onClick={handleCopyAddress} title="Copy Address">
                {isCopied ? <ShieldCheck className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button
                variant={showQr ? "secondary" : "outline"}
                size="icon"
                onClick={() => setShowQr(!showQr)}
                title="Show QR Code"
              >
                <QrCode className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" asChild title="View on Etherscan">
                <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>

            {/* QR Code display */}
            {showQr && (
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-border mt-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-white p-2 rounded-lg">
                  <QRCode
                    value={address}
                    size={200}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox={`0 0 256 256`}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">Scan to send ETH (Sepolia) to this address</p>
              </div>
            )}
          </div>

          {/* Security Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/20 rounded-full text-blue-500 mt-0.5">
                <Key className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-blue-500">Passkey Secured</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This wallet is managed by Coinbase Smart Wallet technology. Access it using your device's biometrics
                  or passkey. You can recover it on any device using your passkey credentials.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between gap-2 sm:gap-0">
          <Button variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={handleDisconnect}>
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect Wallet
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
