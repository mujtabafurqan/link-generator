import { signIn, useSession } from 'next-auth/react';
import { ChangeEvent, KeyboardEventHandler, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/typescript-types';
import { startAuthentication } from '@simplewebauthn/browser';
import { startRegistration } from '@simplewebauthn/browser';


import styles from '../../styles/Home.module.css'

export default function SignInComponent() {
    const [email, setEmail] = useState('mujtaba@gmail.com');
    const [isValid, setIsValid] = useState(false);

    const router = useRouter();
    const session = useSession();

    useEffect(() => {
      console.log(session)
        if (session.status === 'authenticated') {
            router.push('/');
        }
    },[session.status])

    // async function signInWithEmail() {
    //     return signIn('email', { email })
    // }

    async function signInWithWebauthn() {
      console.log('signing in with webauthn');
      const url = new URL(
          '/api/auth/webauthn/authenticate',
          window.location.origin,
      );
      url.search = new URLSearchParams({ email }).toString();
      const optionsResponse = await fetch(url.toString());
      console.log(optionsResponse);
    
      if (optionsResponse.status !== 200) {
          throw new Error('Could not get authentication options from server');
      }
      const opt: PublicKeyCredentialRequestOptionsJSON = await optionsResponse.json();
    
      if (!opt.allowCredentials || opt.allowCredentials.length === 0) {
          throw new Error('There is no registered credential.')
      }
    
      const credential = await startAuthentication(opt);
      
      await signIn('credentials', {
          id: credential.id,
          rawId: credential.rawId,
          type: credential.type,
          clientDataJSON: credential.response.clientDataJSON,
          authenticatorData: credential.response.authenticatorData,
          signature: credential.response.signature,
          userHandle: credential.response.userHandle,
      })
      // router.push('/getotp/asgfgkaj');
    }


    async function registerWebauthn() {
      console.log('registering webauthn');
      const optionsResponse = await fetch('/api/auth/webauthn/register');
      if (optionsResponse.status !== 200) {
          alert('Could not get registration options from server');
          return;
      }
      const opt = await optionsResponse.json();

      try {
          const credential = await startRegistration(opt)

          const response = await fetch('/api/auth/webauthn/register', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(credential),
              credentials: 'include'
          });
          if (response.status != 201) {
              alert('Could not register webauthn credentials.');
          } else {
              alert('Your webauthn credentials have been registered.')
          }
      } catch (err) {
          alert(`Registration failed. ${(err as Error).message}`);
      }

  }
    async function handleSignIn() {
      console.log('handle sign in');
      try {
          await signInWithWebauthn();

      } catch (error) {
          console.log(error);
          await registerWebauthn();
      }
  }

    // const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    //     if (e.key === 'Enter') {
    //         return handleSignIn();
    //     }
    // }

    // function updateEmail(e: ChangeEvent<HTMLInputElement>) {
    //     setIsValid(e.target.validity.valid)
    //     setEmail(e.target.value);
    // }

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <form onSubmit={e => e.preventDefault()}>
                    <input
                        name="email"
                        type="email"
                        id="email"
                        autoComplete="home email"
                        placeholder="Enter your email"
                        // value={email}
                        // onChange={updateEmail}
                        // onKeyDown={handleKeyDown}
                    />
                    <button type="button" onClick={handleSignIn}>
                        Sign in
                    </button>
                </form>
            </main>
        </div>
    )
}