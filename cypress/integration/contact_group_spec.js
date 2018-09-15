/// <reference types="Cypress" />

describe('Contact Groups', () => {

  beforeEach(() => {
    cy.login()
  })

  it(`Shows last published`, () => {
    cy.visit('/')
    cy.get('.last-published').should('be.visible')
  })

})