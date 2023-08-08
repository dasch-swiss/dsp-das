declare namespace Cypress {

    interface Chainable<Subject> {
        /**
         * Logs-in user by using UI
         */
        login(username: string, password: string): void;
    }
}
