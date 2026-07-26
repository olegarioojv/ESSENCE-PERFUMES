import { render, screen } from "@testing-library/react";
import HomePage from "@/app/(loja)/page";

describe("HomePage", () => {
  it("renders the storefront placeholder without crashing", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: /essence perfumes/i })
    ).toBeInTheDocument();
  });
});
