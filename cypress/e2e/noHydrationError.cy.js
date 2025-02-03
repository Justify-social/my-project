describe("Dashboard Hydration", () => {
  it("should load the dashboard without hydration errors", () => {
    let hydrationErrorFound = false;
    // Override console.error before the window loads.
    cy.on("window:before:load", (win) => {
      const originalConsoleError = win.console.error;
      win.console.error = (...args) => {
        if (
          args[0] &&
          typeof args[0] === "string" &&
          args[0].includes("Hydration failed")
        ) {
          hydrationErrorFound = true;
        }
        originalConsoleError.apply(win.console, args);
      };
    });

    // Visit the dashboard page.
    cy.visit("/dashboard").then(() => {
      // After the page loads, assert that no hydration errors were found.
      expect(hydrationErrorFound, "No hydration errors should be logged").to.be.false;
    });
  });
});
