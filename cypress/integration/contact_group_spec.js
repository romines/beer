/// <reference types="Cypress" />
const emergencyGroup = {
  list: [{
    name: 'Emergency Group',
    number: '+1-307-555-1212',
    tags: { summer: true, winter: true },
  }],
  section: 'Emergency'
}
const seedData = {
  emergencyGroup: { ...emergencyGroup },
  contactGroups: [
    { ...emergencyGroup }
  ]
}

describe('Contact Groups', () => {


  beforeEach(() => {
    cy.login()
    cy.visit('/')
  })


  it(`Has correct base data`, () => {
    cy.request('GET', 'https://us-central1-rta-testing.cloudfunctions.net/httpEndpoint?r=test_resort&strip=1')
      .then((response) => {
        const data = JSON.parse(response.body)
        expect(data).to.deep.equal(seedData)
    })
  })

  it(`Shows last published`, () => {
    cy.get('.last-published').should('be.visible')
  })

  it(`Requires group name`, () => {
    cy.get('.add-new-bar:not(.new-group)').click()
    cy.get('.add-new-bar button.save').should('be.disabled')
  })

  it(`Adds new group`, () => {
    cy.get('.add-new-bar:not(.new-group)').click()
    cy.get('.add-new-bar input')
      .type('Group One.wtf')
    cy.get('.add-new-bar button.save').click()
    cy.get('.draggable-group-container .contact-group.box').should('have.length', 1)
    cy.get('.save-publish-container.dirty').should('be.visible')
    cy.get('.last-published').should('not.exist')
    cy.get('.draggable-group-container .contact-group .name-and-edit').should('contain', 'Group One')
  })

  it(`Renames group one`, () => {
    cy.get('.edit-name').click()
    cy.get('.name-editor input')
      .type('enO puorG')
    cy.get('.name-editor button.save').click()
    cy.get('.draggable-group-container .contact-group .name-and-edit').should('contain', 'enO puorG')
  })

})