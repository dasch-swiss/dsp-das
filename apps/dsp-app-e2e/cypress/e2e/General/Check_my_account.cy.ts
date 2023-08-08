cy.visit('https://admin.dev.dasch.swiss/account');
cy.get('.login-button > .mdc-button__label').click();
cy.get('#mat-input-0').type('Rebecca');
cy.get('#mat-input-1').type('PleaseCh4ngeMe!');
cy.get('.progress-button-content > span').click();
cy.get('.login-form').submit();
cy.get('.mdc-snackbar__label').click(); // Change to check snackbar Text = Login successful
cy.get('.avatar').click();
cy.get('.active-link .label').click();
cy.get('#mat-input-3').type('PleaseCh4ngeMe!');// I don't know why it recorded this line because i was already logged in
// Add a check my account -> Missing: Check if the logged in user is correct (First and Last name)