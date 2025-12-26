import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

// Simple integrated smoke test to verify dependencies are correctly resolved
test('renders with react-router-dom correctly', () => {
    render(
        <BrowserRouter>
            <div>
                <button title="Toggle sidebar">☰</button>
                <div>Website Loaded</div>
            </div>
        </BrowserRouter>
    );
    const toggleButton = screen.getByTitle(/Toggle sidebar/i);
    expect(toggleButton).toBeInTheDocument();
});
