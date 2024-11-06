declare namespace Cypress {
  // I can't import User from user-profiles without the linter breaking and idk why
  interface User {
    username: string;
    password: string;
  }

  interface Chainable<Subject> {
    resetDatabase(): void;
    // logs user in via the API
    login(user: User): Chainable<Subject>;
    // logs user out
    logout(): void;
    // logs system admin in
    loginAdmin(): Chainable<Subject>;
    //creates resource request
    createResource(payload: any): Chainable<Subject>;
    //uploads file request
    uploadFile(filePath: string, projectShortCode: string): Chainable<Subject>;
    //gets resource canvas element
    getCanvas(selector: string): Chainable<Subject>;
  }
}
