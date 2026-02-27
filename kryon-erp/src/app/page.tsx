import { redirect } from 'next/navigation'

export default function RootPage() {
  // Since middleware handles protection, if we are here we are authenticated
  // or heading to login.
  redirect('/dashboard')
}
