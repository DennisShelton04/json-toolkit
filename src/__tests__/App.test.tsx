import { fireEvent, render, screen, within } from '@testing-library/react';
import App from '../App';

beforeEach(() => localStorage.clear());

describe('App (UI smoke)', () => {
  it('renders all tools and loads the sample by default', async () => {
    render(<App />);
    const tabs = screen.getAllByRole('tab').map((t) => t.textContent);
    expect(tabs).toEqual([
      'Beautify',
      'Minify',
      'Validate',
      'Repair',
      'Schema',
      'Diff',
      'Query',
      'Convert',
      'Types',
      'Escape',
    ]);
    expect(await screen.findByText(/Valid · .* keys/)).toBeInTheDocument();
  });

  it('shows a validation report', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: 'Validate' }));
    expect(await screen.findByText(/✓\s*Valid JSON/)).toBeInTheDocument();
  });

  it('keeps Diff and Schema inputs separate and asks for the comparison document', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: 'Schema' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Diff' }));
    // Diff must not reuse the schema editor's content
    expect(screen.getByRole('heading', { name: 'Compare with' })).toBeInTheDocument();
    const output = screen.getByRole('region', { name: 'Output' });
    expect(await within(output).findByText(/document to compare with/)).toBeInTheDocument();
  });

  it('validates the sample against the default schema', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: 'Schema' }));
    expect(await screen.findByText(/Document matches the schema/)).toBeInTheDocument();
  });

  it('switches to tree view and renders nodes', async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: 'Tree' }));
    expect(await screen.findByRole('tree')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'owner' })).toBeInTheDocument();
  });

  it('shows an empty state after Clear', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(await screen.findByText(/Paste JSON, drop a file/)).toBeInTheDocument();
  });
});
