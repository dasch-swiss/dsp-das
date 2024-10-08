declare namespace Cypress {
  // I can't import User from user-profiles without the linter breaking and idk why
  interface User {
    username: string;
    password: string;
  }

  interface Chainable<Subject> {
    // logs user in via the API
    login(user: User): Chainable<Subject>;
    login2(user: User): Chainable<Subject>;
    // logs user out
    logout(): void;
    // logs system admin in
    loginAdmin(): Chainable<Subject>;
    //creates resource request
    createResource(payload: any): Chainable<Subject>;
    //uploads file request
    uploadFile(filePath: string, projectShortCode: string): Chainable<Subject>;
  }
}
