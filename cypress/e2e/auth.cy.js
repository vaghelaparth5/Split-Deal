describe('Auth Page E2E Testing ', () => {
  
  // Generate a random email for each test run to avoid conflicts
  const randomId = Math.floor(Math.random() * 1000000);
  const email = `testuser${randomId}@example.com`;
  const password = 'TestPass123';

  beforeEach(() => {
    cy.visit('/views/login.html');
  });

  it('should toggle between Sign In and Sign Up views', () => {
    cy.get('#formTitle').should('have.text', 'Sign In');
    cy.get('#toggleLink').click();
    cy.get('#formTitle').should('have.text', 'Sign Up');
    cy.get('#toggleLink').click();
    cy.get('#formTitle').should('have.text', 'Sign In');
  });

  it('should show error if login fields are empty', () => {
    cy.get('#submitBtn').click();
    cy.get('#errorMessage').should('be.visible').and('contain.text', 'Please enter all required fields.');
  });

  it('should show error if signup passwords do not match', () => {
    cy.get('#toggleLink').click(); // switch to Sign Up
    cy.get('#name').type('Test User');
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('#confirmPassword').type('DifferentPass');
    cy.get('#submitBtn').click();
    cy.get('#errorMessage').should('be.visible').and('contain.text', 'Passwords do not match.');
  });


  it('should clear error message when user starts typing', () => {
    cy.get('#submitBtn').click(); // trigger error
    cy.get('#errorMessage').should('be.visible');
    cy.get('#email').type('a');
    cy.get('#errorMessage').should('not.be.visible');
  });

  it('should keep Sign In view active on page load', () => {
    cy.get('#formTitle').should('have.text', 'Sign In');
  });

  it('should not allow submit if Sign Up confirm password is empty', () => {
    cy.get('#toggleLink').click(); // switch to Sign Up
    cy.get('#name').type('Test User');
    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('#submitBtn').click(); // confirmPassword empty
    cy.get('#errorMessage').should('be.visible').and('contain.text', 'Please enter all required fields.');
  });

  it('should reset form fields when toggling views', () => {
    cy.get('#email').type(email);
    cy.get('#toggleLink').click(); // switch to Sign Up
    cy.get('#email').should('have.value', '');
    cy.get('#toggleLink').click(); // back to Sign In
    cy.get('#email').should('have.value', '');
  });

  it('should show error if login password is empty', () => {
    cy.get('#email').type(email);
    cy.get('#submitBtn').click(); // password empty
    cy.get('#errorMessage').should('be.visible').and('contain.text', 'Please enter all required fields.');
  });

  it('should allow valid Sign Up', () => {
    const uniqueEmail = `testuser_${Date.now()}@example.com`;

    cy.window().then((win) => {
      cy.stub(win.console, 'log').as('consoleLog');
    });

    cy.get('#toggleLink').click(); // switch to Sign Up
    cy.get('#name').type('Test User');
    cy.get('#email').type(uniqueEmail);
    cy.get('#password').type(password);
    cy.get('#confirmPassword').type(password);
    cy.get('#submitBtn').click();

    cy.get('@consoleLog').should('be.calledWith', 'Form submitted');
  });

  it('should allow valid Sign In', () => {
    const email = 'testuser@example.com'; // existing user
    cy.window().then((win) => {
      cy.stub(win.console, 'log').as('consoleLog');
    });

    cy.get('#email').type(email);
    cy.get('#password').type(password);
    cy.get('#submitBtn').click();

    cy.get('@consoleLog').should('be.calledWith', 'Form submitted');
  });

});