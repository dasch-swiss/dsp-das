declare namespace Cypress {

    // I can't import User from user-profiles without it breaking and idk why
    interface User {
        username: string;
        password: string;
    }

    interface Chainable<Subject> {
        /**
         * Logs-in user by using UI
         */
        login(user: User): void;
        logout(): void;
    }
}
