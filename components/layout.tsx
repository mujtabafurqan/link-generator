import Header from "./header"
import Footer from "./footer"
import type { ReactNode } from "react"

export default function Layout({ children, showHeader }: { children: ReactNode, showHeader: boolean }) {
  if( showHeader === false ) {
    return (
      <>
        <main>{children}</main>
        {/* <Footer /> */}
      </>
    )
  }
  return (
    <>
      <Header show='true'/>
      <main>{children}</main>
      {/* <Footer /> */}
    </>
  )
}
