import Cookies from 'js-cookie'
import React from 'react'
import {
  ApolloClient,
  from,
  createHttpLink,
  ApolloLink,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  Observable,
  gql
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
// import ApolloClient from "react"

import { TOKEN_REFRESH } from "./queries/system/auth"
// Import moment locale
// import moment from 'moment'
// import 'moment/locale/nl'

import CSLS from "./tools/cs_local_storage"
import CSEC from "./tools/cs_error_codes"
import { CSAuth } from './tools/authentication'

// Main app
import AppRoot from "./AppRoot"

// Tabler css 
import "tabler-react/dist/Tabler.css"
// React-datepicker css
import "react-datepicker/dist/react-datepicker.css"
// App css
import './App.css'
// import { concat } from 'apollo-boost';

// Register "nl" locale for react-datepicker
// https://reactdatepicker.com/#example-17
// import { registerLocale } from "react-datepicker"
// import nl from 'date-fns/locale/nl';
// registerLocale('nl', nl);

// This allows <string>.trunc(x)
String.prototype.trunc = 
  function(n){
      return this.substr(0, n-1) + (this.length > n ? '...' : '')
  }

function SetCurrentUrlAsNext() {
  console.log("Storing current location as next in local storage")
  const currentUrl = window.location.href
  const next = currentUrl.split("#")[1]
  console.log(next)
  localStorage.setItem(CSLS.AUTH_LOGIN_NEXT, next)
}
  

const errorLink = onError(({ graphQLErrors, networkError, operation, forward, response }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    );

  if (networkError) console.log(`[Network error]: ${networkError}`);

  // request size check
  if (graphQLErrors[0].message == "Request body exceeded settings.DATA_UPLOAD_MAX_MEMORY_SIZE.") {
    console.error('CHOSEN FILE EXCEEDS SIZE LIMIT')
  }

  // Token refresh / re-auth check
  if (response) {
    let i
    for (i = 0; i < response.errors.length; i++) {
      if (response.errors[i].extensions && response.errors[i].extensions.code === CSEC.USER_NOT_LOGGED_IN) {

        let authTokenExpired = false
        const tokenExp = localStorage.getItem(CSLS.AUTH_TOKEN_EXP)
        if ((new Date() / 1000) >= tokenExp) {
          authTokenExpired = true
        }

        console.log('token expired')
        console.log(authTokenExpired)

        if (authTokenExpired) {
          const refreshTokenExp = localStorage.getItem(CSLS.AUTH_TOKEN_REFRESH_EXP)
          if (refreshTokenExp == null) {
            // User hasn't logged in before
            SetCurrentUrlAsNext()
            window.location.href = "#/user/login/required"
            window.location.reload()
          } else if ((new Date() / 1000) >= refreshTokenExp) {
            // Session expired
            SetCurrentUrlAsNext()
            console.log("refresh token expired or not found")
            console.log(new Date() / 1000)
            console.log(refreshTokenExp)
      
            window.location.href = "#/user/session/expired"
            window.location.reload()
          } else {
            // Refresh token... no idea how this observable & subscriber stuff works... but it does :).
            // https://stackoverflow.com/questions/50965347/how-to-execute-an-async-fetch-request-and-then-retry-last-failed-request/51321068#51321068
            console.log("auth token expired")
            console.log(new Date() / 1000)
            console.log(refreshTokenExp)

            console.log("refresh token... somehow...")

            return new Observable(observer => {
              client.mutate({
                mutation: TOKEN_REFRESH
              })
                .then(({ data }) => { 
                  console.log(data)
                  CSAuth.updateTokenInfo(data.refreshToken)
                })
                .then(() => {
                  const subscriber = {
                    next: observer.next.bind(observer),
                    error: observer.error.bind(observer),
                    complete: observer.complete.bind(observer)
                  };

                  // Retry last failed request
                  forward(operation).subscribe(subscriber);
                })
                .catch(error => {
                  // No refresh or client token available, we force user to login
                  observer.error(error);
                  SetCurrentUrlAsNext()
                  window.location.href = "/#/user/login"
                  window.location.reload()
                });
            })
          }
        } else {
          SetCurrentUrlAsNext()
          window.location.href = "/#/user/login"
          window.location.reload()
        }

        // window.location.href = "/#/user/login"
        // window.location.reload()
      }
    }
  }
});


// Fetch CSRF Token 
let csrftoken;
async function getCsrfToken() {
    if (csrftoken) return csrftoken;
    csrftoken = await fetch('/d/csrf/')
        .then(response => response.json())
        .then(data => data.csrfToken)
    return await csrftoken
}

const httpLink = createHttpLink({
  uri: '/d/graphql/',
  credentials: 'same-origin',
  request: async (operation) => {
    const csrftoken = await getCsrfToken();
    Cookies.set('csrftoken', csrftoken);
    // set the cookie 'csrftoken'
    operation.setContext({
        // set the 'X-CSRFToken' header to the csrftoken
        headers: {
            'X-CSRFToken': csrftoken,
        },
    })}
});

const csrfMiddleWare = new ApolloLink(async (operation, forward) => {
  // const csrftoken = await getCsrfToken();
  const csrftoken = await getCsrfToken();
  Cookies.set('csrftoken', csrftoken);

  operation.setContext({
    // set the 'X-CSRFToken' header to the csrftoken
    headers: {
        'X-CSRFToken': csrftoken,
    },
  })

  return forward(operation)
})

// set up ApolloClient
const client = new ApolloClient({
  link: from([csrfMiddleWare, errorLink, httpLink]),
  cache: new InMemoryCache(),
// },
  // request: async operation => {
  //   var csrftoken = Cookies.get('csrftoken');
  //   operation.setContext({
  //     headers: {
  //       "X-CSRFToken": csrftoken ? csrftoken : ''
  //     }
  //   })
  // }
  // request: async operation => {
  //   const token = localStorage.getItem(CSLS.AUTH_TOKEN)
  //   operation.setContext({
  //     headers: {
  //       Authorization: token ? `JWT ${token}`: ''
  //     }
  //   })
  // }
})


function App() {
  // Register "NL" locale for moment
  // moment.locale('en-US')

  return (
    <ApolloProvider client={client}>
      <AppRoot />
    </ApolloProvider>
  )
}

export default App

