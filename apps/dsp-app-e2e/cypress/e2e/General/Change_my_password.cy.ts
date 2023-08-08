cy.visit('https://admin.dev.dasch.swiss/');
cy.get('.login-button > .mdc-button__label').click();
cy.get('#mat-input-0').type('Rebecca');
cy.get('#mat-input-1').type('PleaseCh4ngeMe!');
cy.get('.progress-button-content > span').click();
cy.get('.login-form').submit();
cy.get('.mdc-snackbar__label').click(); //Check if snackbar text = Login successful
cy.get('.avatar').click();
cy.get('.active-link .label').click();
cy.get('#mat-input-3').type('PleaseCh4ngeMe!'); //Nothing to type here
cy.get('#mat-input-4').click();
cy.get('#mat-input-4').type('PleaseCh4ngeMe!');
cy.get('#mat-input-5').click();
cy.get('#mat-input-5').type('PleaseCh4ngeMe!');
cy.get('.mdc-button--raised > .mdc-button__label').click();
cy.get('.form-content').submit();
cy.get('.mdc-snackbar__label').click(); // Check if snackbar text = You have successfully updatewd your password
cy.visit('https://admin.dev.dasch.swiss/account');
cy.get('.avatar').click();
cy.get('.mat-mdc-list-item:nth-child(5) .label').click();
cy.url().should('contains', 'https://admin.dev.dasch.swiss/'); //Logout
cy.get('.login-button > .mdc-button__label').click(); // Login again with new password
cy.get('#mat-input-0').type('Rebecca');
cy.get('#mat-input-1').type('PleaseCh4ngeMe!');
cy.get('.full-width > .mat-mdc-button-touch-target').click();
cy.get('.login-form').submit();

