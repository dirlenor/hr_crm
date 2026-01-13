import { redirect } from "next/navigation"

export default function Home() {
  // This will be handled by middleware, but as fallback redirect to sign-in
  redirect("/auth/sign-in")
}
