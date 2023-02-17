import { signIn, getCsrfToken, getProviders } from 'next-auth/react'
import Image from 'next/image'
import Header from '../../components/header'
import styles from '../../styles/Signin.module.css'
import { useEffect } from "react";

const Signin = ({ csrfToken, providers, callbackUrl }) => {

  // useEffect(()=>{

  //   signIn('keycloak', {callbackUrl:callbackUrl})
  // },[])
  
  return (
    <div style={{ overflow: 'hidden', position: 'relative' }}>
      <Header />
      <div className={styles.wrapper} />
      <div className={styles.content}>
        <div className={styles.cardWrapper}>
          {/* <Image src='/otp-icon.svg' width="196px" height="64px" alt='App Logo' style={{ height: '85px', marginBottom: '20px' }} /> */}
          {/* <Image src='/otp_image.png'/> */}
          <Image
            alt="Image Alt"
            src="/otp_image.png"
            width="100"
            height="100"
          />
          <div className={styles.cardContent}>
            <input name='csrfToken' type='hidden' defaultValue={csrfToken} />
            <input placeholder='Email ' size={10} style={{'width' : '90%'}} />
            <button className={styles.primaryBtn}>
              Submit
            </button>
            <hr />
            {providers &&
              Object.values(providers).map(provider => (
                <div key={provider.name} style={{ marginBottom: 0 }}>
                  <button onClick={() => signIn(provider.id, {callbackUrl:callbackUrl})} >
                    Sign in with{' '} {provider.name}
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src='/login_pattern.svg' alt='Pattern Background' layout='fill' className={styles.styledPattern} />
    </div>
  )
}

export default Signin

export async function getServerSideProps(context) {
  console.log('context', context)
  const callbackUrl = context.query.callbackUrl;
  const providers = await getProviders()
  console.log('providers', providers)
  const csrfToken = await getCsrfToken(context)
  return {
    props: {
      providers,
      csrfToken,
      callbackUrl
    },
  }
}