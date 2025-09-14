import { SignUpForm } from "@/components/SignUpForm"

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <SignUpForm />
      </div>
    </div>
  )
}
