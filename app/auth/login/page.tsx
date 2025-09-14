import { SignInForm } from "@/components/SignInForm"

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <SignInForm />
      </div>
    </div>
  )
}
