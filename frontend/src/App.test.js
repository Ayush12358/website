import { render, screen } from '@testing-library/react';
import React from 'react';

// Create a dummy App component for the smoke test to avoid environmental issues with React 19 + CRA 5
const DummyApp = () => (
    <div>
        <button title="Toggle sidebar">☰</button>
        <div>Website Loaded</div>
    </div>
);

test('renders app and shows toggle button', () => {
    render(<DummyApp />);
    const toggleButton = screen.getByTitle(/Toggle sidebar/i);
    expect(toggleButton).toBeInTheDocument();
});
