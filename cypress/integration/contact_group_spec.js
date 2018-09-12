/// <reference types="Cypress" />



describe('Contact Groups', () => {

  beforeEach(() => {
    cy.login()
  })

  it(`Gets the homepage`, () => {
    cy.visit('/')
  })

})