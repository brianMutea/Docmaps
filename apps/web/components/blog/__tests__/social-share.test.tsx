import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SocialShare } from '../social-share';

// Mock window.open
const mockWindowOpen = jest.fn();
global.window.open = mockWindowOpen;

// Mock navigator.clipboard
const mockClipboard = {
  writeText: jest.fn(),
};
Object.assign(navigator, {
  clipboard: mockClipboard,
});

describe('SocialShare', () => {
  const mockTitle = 'Test Blog Post Title';
  const mockUrl = 'https://example.com/blog/test-post';

  beforeEach(() => {
    jest.clearAllMocks();
    mockClipboard.writeText.mockResolvedValue(undefined);
  });

  it('renders all share buttons', () => {
    render(<SocialShare title={mockTitle} url={mockUrl} />);

    expect(screen.getByText('Share this post')).toBeInTheDocument();
    expect(screen.getByLabelText('Share on X')).toBeInTheDocument();
    expect(screen.getByLabelText('Share on LinkedIn')).toBeInTheDocument();
    expect(screen.getByLabelText('Copy link to clipboard')).toBeInTheDocument();
  });

  it('opens X share dialog with correct URL', () => {
    render(<SocialShare title={mockTitle} url={mockUrl} />);

    const xButton = screen.getByLabelText('Share on X');
    fireEvent.click(xButton);

    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining('x.com/intent/tweet'),
      '_blank',
      'noopener,noreferrer,width=600,height=400'
    );
    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent(mockTitle)),
      '_blank',
      'noopener,noreferrer,width=600,height=400'
    );
    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent(mockUrl)),
      '_blank',
      'noopener,noreferrer,width=600,height=400'
    );
  });

  it('opens LinkedIn share dialog with correct URL', () => {
    render(<SocialShare title={mockTitle} url={mockUrl} />);

    const linkedinButton = screen.getByLabelText('Share on LinkedIn');
    fireEvent.click(linkedinButton);

    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining('linkedin.com/sharing/share-offsite'),
      '_blank',
      'noopener,noreferrer,width=600,height=400'
    );
    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent(mockUrl)),
      '_blank',
      'noopener,noreferrer,width=600,height=400'
    );
  });

  it('copies link to clipboard when copy button is clicked', async () => {
    render(<SocialShare title={mockTitle} url={mockUrl} />);

    const copyButton = screen.getByLabelText('Copy link to clipboard');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith(mockUrl);
    });
  });

  it('shows "Copied!" feedback after copying link', async () => {
    render(<SocialShare title={mockTitle} url={mockUrl} />);

    const copyButton = screen.getByLabelText('Copy link to clipboard');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('resets "Copied!" feedback after 2 seconds', async () => {
    jest.useFakeTimers();
    render(<SocialShare title={mockTitle} url={mockUrl} />);

    const copyButton = screen.getByLabelText('Copy link to clipboard');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });

    // Fast-forward time by 2 seconds
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
      expect(screen.getByText('Copy Link')).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('handles clipboard write failure gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockClipboard.writeText.mockRejectedValue(new Error('Clipboard error'));

    render(<SocialShare title={mockTitle} url={mockUrl} />);

    const copyButton = screen.getByLabelText('Copy link to clipboard');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to copy link:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('encodes special characters in title and URL', () => {
    const specialTitle = 'Test & Special <Characters>';
    const specialUrl = 'https://example.com/blog/test?param=value&other=123';

    render(<SocialShare title={specialTitle} url={specialUrl} />);

    const xButton = screen.getByLabelText('Share on X');
    fireEvent.click(xButton);

    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent(specialTitle)),
      '_blank',
      'noopener,noreferrer,width=600,height=400'
    );
    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent(specialUrl)),
      '_blank',
      'noopener,noreferrer,width=600,height=400'
    );
  });

  it('applies correct styling classes', () => {
    render(<SocialShare title={mockTitle} url={mockUrl} />);

    const xButton = screen.getByLabelText('Share on X');
    expect(xButton).toHaveClass('hover:bg-blue-50');
    expect(xButton).toHaveClass('rounded-lg');
  });
});
