import { signIn } from "next-auth/react"
import { useRouter } from "next/router";
import { useEffect } from "react";


export default function AccessDenied({mobile}) {
  const router = useRouter();
  console.log("router18817", router.asPath)
  return (
    <>
      <h1>Access Denied</h1>
      <p>
        <a
          href="/api/auth/signin"
          onClick={(e) => {
            e.preventDefault()
            router.push('/api/auth/signin?callbackUrl='+router.asPath+'&mobile='+mobile)
          }}
        >
          You must be signed in to view this page
        </a>
      </p>
    </>
  )
}
