import { render, screen } from '@testing-library/react';
import App from './App';

// We don't wrap in BrowserRouter here because App already has a <Router> inside it.
// Wrapping it again causes a "You cannot render a <Router> inside another <Router>" error.

test('renders app and shows toggle button', () => {
    render(<App />);
    const toggleButton = screen.getByTitle(/Toggle sidebar/i);
    expect(toggleButton).toBeInTheDocument();
});
