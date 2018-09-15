/// <reference types="Cypress" />

describe('My First Test', () => {
  it(`Creates a user`, () => {
    const email = `testing_${Math.floor(Math.random()*90000) + 10000})@email.com`
    const password = (Math.floor(Math.random()*90000) + 10000) + ''
    // Arrange https://rta-staging.firebaseapp.com/#/
    cy.visit('/#/sign-up/dGVzdF9yZXNvcnQ=')
    // Act
    cy.get('input.email').type(email)
    cy.get('input.password').type(password)
    cy.get('input.confirm-password').type(password)
    // Assert

  })
})