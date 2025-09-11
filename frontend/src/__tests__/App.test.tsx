import { test, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";
import App from "@/app/App";

test("renders header and shows API status from mocked endpoints", async () => {
  renderWithProviders(<App />);
  expect(await screen.findByText(/Arcanalyse — MVP/)).toBeInTheDocument();
  expect(await screen.findByText(/API:\s*ok/i)).toBeInTheDocument();
  expect(await screen.findByText(/Arcanalyse API 0\.1\.0 \(dev\)/i)).toBeInTheDocument();
});
