// See https://on.cypress.io/custom-commands for more comprehensive examples of custom commands
//
// ***********************************************
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
//
//
// -- Authenticate with firebase --

import { auth } from '../../src/firebaseInit.js'

Cypress.Commands.add("login", () => {

  auth.signInWithEmailAndPassword('cypress-test-reg-user@email.com', 'Str4ightHamma')
    .then((authCredential) => {
      authCredential.uid && console.log('cypress authenticated successfully')
    })
    .catch(error => {
      var errorMessage = error.message
      console.log(errorMessage)
  })
})
