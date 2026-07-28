import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { theme } from "@/lib/theme";
import HomePage from "@/app/(loja)/page";

describe("HomePage", () => {
  it("renders the hero heading", () => {
    render(
      <ThemeProvider theme={theme}>
        <HomePage />
      </ThemeProvider>
    );

    expect(
      screen.getByRole("heading", { name: /the art of scent/i })
    ).toBeInTheDocument();
  });
});
