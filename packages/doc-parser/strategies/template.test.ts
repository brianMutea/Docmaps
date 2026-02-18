// Unit tests for template strategy

import { describe, it, expect } from 'vitest';
import { TemplateStrategy } from './template';

describe('TemplateStrategy', () => {
  const strategy = new TemplateStrategy();

  describe('canHandle', () => {
    it('should detect AWS documentation URLs', () => {
      expect(strategy.canHandle('', 'https://docs.aws.amazon.com/ec2/')).toBe(true);
      expect(strategy.canHandle('', 'https://aws.amazon.com/documentation/')).toBe(true);
    });

    it('should detect Stripe documentation URLs', () => {
      expect(strategy.canHandle('', 'https://docs.stripe.com/api')).toBe(true);
      expect(strategy.canHandle('', 'https://stripe.com/docs/payments')).toBe(true);
    });

    it('should detect GitHub documentation URLs', () => {
      expect(strategy.canHandle('', 'https://docs.github.com/en')).toBe(true);
      expect(strategy.canHandle('', 'https://github.com/docs')).toBe(true);
    });

    it('should reject non-matching URLs', () => {
      expect(strategy.canHandle('', 'https://example.com')).toBe(false);
      expect(strategy.canHandle('', 'https://docs.example.com')).toBe(false);
    });
  });

  describe('confidence', () => {
    it('should return high confidence score', () => {
      expect(strategy.confidence()).toBe(0.9);
    });
  });

  describe('parse - AWS', () => {
    it('should extract products from AWS navigation', async () => {
      const html = `
        <nav role="navigation">
          <ul>
            <li><a href="/ec2">EC2</a></li>
            <li><a href="/s3">S3 Storage</a></li>
            <li><a href="/lambda">Lambda</a></li>
          </ul>
        </nav>
      `;

      const result = await strategy.parse(html, 'https://docs.aws.amazon.com');
      
      expect(result.nodes.length).toBeGreaterThan(0);
      expect(result.nodes.some(n => n.data.label === 'EC2')).toBe(true);
      expect(result.nodes.some(n => n.data.label === 'S3 Storage')).toBe(true);
      expect(result.nodes.some(n => n.data.label === 'Lambda')).toBe(true);
    });

    it('should extract features from nested AWS navigation', async () => {
      const html = `
        <nav role="navigation">
          <ul>
            <li>
              <a href="/ec2">EC2</a>
              <ul>
                <li><a href="/ec2/instances">Instances</a></li>
                <li><a href="/ec2/volumes">Volumes</a></li>
              </ul>
            </li>
          </ul>
        </nav>
      `;

      const result = await strategy.parse(html, 'https://docs.aws.amazon.com');
      
      const features = result.nodes.filter(n => n.type === 'feature');
      expect(features.length).toBeGreaterThan(0);
      expect(features.some(n => n.data.label === 'Instances')).toBe(true);
      expect(features.some(n => n.data.label === 'Volumes')).toBe(true);
    });
  });

  describe('parse - Stripe', () => {
    it('should extract products from Stripe sidebar', async () => {
      const html = `
        <nav class="sidebar">
          <ul>
            <li><a href="/payments">Payments</a></li>
            <li><a href="/billing">Billing</a></li>
            <li><a href="/connect">Connect</a></li>
          </ul>
        </nav>
      `;

      const result = await strategy.parse(html, 'https://docs.stripe.com');
      
      expect(result.nodes.length).toBeGreaterThan(0);
      expect(result.nodes.some(n => n.data.label === 'Payments')).toBe(true);
      expect(result.nodes.some(n => n.data.label === 'Billing')).toBe(true);
    });

    it('should extract features from nested Stripe sidebar', async () => {
      const html = `
        <nav class="sidebar">
          <ul>
            <li>
              <a href="/payments">Payments</a>
              <ul>
                <li><a href="/payments/cards">Cards</a></li>
                <li><a href="/payments/wallets">Wallets</a></li>
              </ul>
            </li>
          </ul>
        </nav>
      `;

      const result = await strategy.parse(html, 'https://docs.stripe.com');
      
      const features = result.nodes.filter(n => n.type === 'feature');
      expect(features.length).toBeGreaterThan(0);
      expect(features.some(n => n.data.label === 'Cards')).toBe(true);
    });
  });

  describe('parse - GitHub', () => {
    it('should extract products from GitHub navigation', async () => {
      const html = `
        <nav role="navigation">
          <ul>
            <li><a href="/actions">Actions</a></li>
            <li><a href="/packages">Packages</a></li>
            <li><a href="/security">Security</a></li>
          </ul>
        </nav>
      `;

      const result = await strategy.parse(html, 'https://docs.github.com');
      
      expect(result.nodes.length).toBeGreaterThan(0);
      expect(result.nodes.some(n => n.data.label === 'Actions')).toBe(true);
      expect(result.nodes.some(n => n.data.label === 'Packages')).toBe(true);
    });
  });

  describe('parse - edges', () => {
    it('should create hierarchy edges between products and features', async () => {
      const html = `
        <nav role="navigation">
          <ul>
            <li>
              <a href="/ec2">EC2</a>
              <ul>
                <li><a href="/ec2/instances">Instances</a></li>
              </ul>
            </li>
          </ul>
        </nav>
      `;

      const result = await strategy.parse(html, 'https://docs.aws.amazon.com');
      
      expect(result.edges.length).toBeGreaterThan(0);
      expect(result.edges[0].type).toBe('hierarchy');
      expect(result.edges[0].inferenceMethod).toBe('hierarchy');
    });
  });

  describe('parse - metadata', () => {
    it('should include generation metadata', async () => {
      const html = '<nav role="navigation"><ul><li><a>Test</a></li></ul></nav>';
      const url = 'https://docs.aws.amazon.com';

      const result = await strategy.parse(html, url);
      
      expect(result.metadata.source_url).toBe(url);
      expect(result.metadata.strategy).toBe('template');
      expect(result.metadata.confidence).toBe(0.9);
      expect(result.metadata.generated_at).toBeDefined();
    });

    it('should include warnings when no nodes found', async () => {
      const html = '<div>No navigation</div>';
      const url = 'https://docs.aws.amazon.com';

      const result = await strategy.parse(html, url);
      
      expect(result.metadata.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('parse - edge cases', () => {
    it('should handle empty HTML', async () => {
      const result = await strategy.parse('', 'https://docs.aws.amazon.com');
      
      expect(result.nodes).toEqual([]);
      expect(result.edges).toEqual([]);
    });

    it('should filter out short labels', async () => {
      const html = `
        <nav role="navigation">
          <ul>
            <li><a href="/a">A</a></li>
            <li><a href="/ab">AB</a></li>
            <li><a href="/abc">ABC</a></li>
          </ul>
        </nav>
      `;

      const result = await strategy.parse(html, 'https://docs.aws.amazon.com');
      
      // Only "ABC" should be included (length >= 3)
      expect(result.nodes.length).toBe(1);
      expect(result.nodes[0].data.label).toBe('ABC');
    });

    it('should sanitize text content', async () => {
      const html = `
        <nav role="navigation">
          <ul>
            <li><a href="/test">  Test&nbsp;Product  </a></li>
          </ul>
        </nav>
      `;

      const result = await strategy.parse(html, 'https://docs.aws.amazon.com');
      
      expect(result.nodes[0].data.label).toBe('Test Product');
    });
  });
});
