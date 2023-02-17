import { signIn } from "next-auth/react"
import { useRouter } from "next/router";
import { useEffect } from "react";


export default function AccessDenied() {
  // useEffect(()=>{
  //   signIn()
  // },[])
  return (
    <>
      <h1>Access Denied</h1>
      <p>
        <a
          href="/api/auth/signin"
          onClick={(e) => {
            e.preventDefault()
            signIn()
          }}
        >
          You must be signed in to view this page
        </a>
      </p>
    </>
  )
}
