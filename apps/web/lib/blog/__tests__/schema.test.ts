import { describe, it, expect } from '@jest/globals'
import {
  AuthorSchema,
  SEOMetadataSchema,
  FeaturedImageSchema,
  PostFrontmatterSchema,
  validateFrontmatter,
} from '../schema'

describe('Blog Schema Validation', () => {
  describe('AuthorSchema', () => {
    it('should validate a complete author object', () => {
      const validAuthor = {
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        bio: 'Software developer',
        social: {
          twitter: 'johndoe',
          github: 'johndoe',
          linkedin: 'johndoe',
        },
      }

      expect(() => AuthorSchema.parse(validAuthor)).not.toThrow()
    })

    it('should validate author with only required fields', () => {
      const minimalAuthor = {
        name: 'Jane Doe',
      }

      expect(() => AuthorSchema.parse(minimalAuthor)).not.toThrow()
    })

    it('should reject author without name', () => {
      const invalidAuthor = {
        bio: 'Developer',
      }

      expect(() => AuthorSchema.parse(invalidAuthor)).toThrow()
    })

    it('should reject author with empty name', () => {
      const invalidAuthor = {
        name: '',
      }

      expect(() => AuthorSchema.parse(invalidAuthor)).toThrow('Author name is required')
    })

    it('should reject author with invalid avatar URL', () => {
      const invalidAuthor = {
        name: 'John Doe',
        avatar: 'not-a-url',
      }

      expect(() => AuthorSchema.parse(invalidAuthor)).toThrow()
    })
  })

  describe('SEOMetadataSchema', () => {
    it('should validate complete SEO metadata', () => {
      const validSEO = {
        title: 'Custom SEO Title',
        description: 'Custom SEO description',
        keywords: ['keyword1', 'keyword2'],
      }

      expect(() => SEOMetadataSchema.parse(validSEO)).not.toThrow()
    })

    it('should validate empty SEO metadata', () => {
      const emptySEO = {}

      expect(() => SEOMetadataSchema.parse(emptySEO)).not.toThrow()
    })
  })

  describe('FeaturedImageSchema', () => {
    it('should validate complete featured image', () => {
      const validImage = {
        src: '/images/hero.jpg',
        alt: 'Hero image',
        width: 1200,
        height: 630,
      }

      expect(() => FeaturedImageSchema.parse(validImage)).not.toThrow()
    })

    it('should validate featured image without dimensions', () => {
      const minimalImage = {
        src: '/images/hero.jpg',
        alt: 'Hero image',
      }

      expect(() => FeaturedImageSchema.parse(minimalImage)).not.toThrow()
    })

    it('should reject featured image without src', () => {
      const invalidImage = {
        alt: 'Hero image',
      }

      expect(() => FeaturedImageSchema.parse(invalidImage)).toThrow()
    })

    it('should reject featured image without alt text', () => {
      const invalidImage = {
        src: '/images/hero.jpg',
      }

      expect(() => FeaturedImageSchema.parse(invalidImage)).toThrow('Image alt text is required')
    })

    it('should reject featured image with empty alt text', () => {
      const invalidImage = {
        src: '/images/hero.jpg',
        alt: '',
      }

      expect(() => FeaturedImageSchema.parse(invalidImage)).toThrow()
    })

    it('should reject featured image with negative dimensions', () => {
      const invalidImage = {
        src: '/images/hero.jpg',
        alt: 'Hero image',
        width: -100,
      }

      expect(() => FeaturedImageSchema.parse(invalidImage)).toThrow()
    })
  })

  describe('PostFrontmatterSchema', () => {
    const validFrontmatter = {
      title: 'My Blog Post',
      date: '2024-01-15T10:00:00Z',
      author: {
        name: 'John Doe',
      },
      excerpt: 'This is a brief excerpt of the blog post.',
      tags: ['javascript', 'typescript'],
      categories: ['programming'],
      seo: {},
    }

    it('should validate complete frontmatter with all fields', () => {
      const completeFrontmatter = {
        ...validFrontmatter,
        featuredImage: {
          src: '/images/hero.jpg',
          alt: 'Hero image',
        },
        updatedAt: '2024-01-20T10:00:00Z',
        draft: false,
        customSlug: 'my-custom-slug',
        showTOC: true,
        relatedPosts: ['post-1', 'post-2'],
      }

      expect(() => PostFrontmatterSchema.parse(completeFrontmatter)).not.toThrow()
    })

    it('should validate frontmatter with only required fields', () => {
      expect(() => PostFrontmatterSchema.parse(validFrontmatter)).not.toThrow()
    })

    it('should apply default values for optional fields', () => {
      const result = PostFrontmatterSchema.parse(validFrontmatter)
      expect(result.draft).toBe(false)
      expect(result.showTOC).toBe(true)
    })

    it('should reject frontmatter without title', () => {
      const { title, ...invalidFrontmatter } = validFrontmatter

      expect(() => PostFrontmatterSchema.parse(invalidFrontmatter)).toThrow()
    })

    it('should reject frontmatter with empty title', () => {
      const invalidFrontmatter = {
        ...validFrontmatter,
        title: '',
      }

      expect(() => PostFrontmatterSchema.parse(invalidFrontmatter)).toThrow('Title is required')
    })

    it('should reject frontmatter with invalid date format', () => {
      const invalidFrontmatter = {
        ...validFrontmatter,
        date: '2024-01-15',
      }

      expect(() => PostFrontmatterSchema.parse(invalidFrontmatter)).toThrow('Date must be in ISO 8601 format')
    })

    it('should reject frontmatter without author', () => {
      const { author, ...invalidFrontmatter } = validFrontmatter

      expect(() => PostFrontmatterSchema.parse(invalidFrontmatter)).toThrow()
    })

    it('should reject frontmatter without excerpt', () => {
      const { excerpt, ...invalidFrontmatter } = validFrontmatter

      expect(() => PostFrontmatterSchema.parse(invalidFrontmatter)).toThrow()
    })

    it('should reject frontmatter with empty tags array', () => {
      const invalidFrontmatter = {
        ...validFrontmatter,
        tags: [],
      }

      expect(() => PostFrontmatterSchema.parse(invalidFrontmatter)).toThrow('At least one tag is required')
    })

    it('should reject frontmatter with empty string in tags', () => {
      const invalidFrontmatter = {
        ...validFrontmatter,
        tags: ['javascript', ''],
      }

      expect(() => PostFrontmatterSchema.parse(invalidFrontmatter)).toThrow('Tags cannot be empty strings')
    })

    it('should reject frontmatter with empty categories array', () => {
      const invalidFrontmatter = {
        ...validFrontmatter,
        categories: [],
      }

      expect(() => PostFrontmatterSchema.parse(invalidFrontmatter)).toThrow('At least one category is required')
    })

    it('should reject frontmatter with empty string in categories', () => {
      const invalidFrontmatter = {
        ...validFrontmatter,
        categories: ['programming', ''],
      }

      expect(() => PostFrontmatterSchema.parse(invalidFrontmatter)).toThrow('Categories cannot be empty strings')
    })

    it('should reject frontmatter with invalid updatedAt format', () => {
      const invalidFrontmatter = {
        ...validFrontmatter,
        updatedAt: 'invalid-date',
      }

      expect(() => PostFrontmatterSchema.parse(invalidFrontmatter)).toThrow()
    })
  })

  describe('validateFrontmatter', () => {
    const validFrontmatter = {
      title: 'My Blog Post',
      date: '2024-01-15T10:00:00Z',
      author: {
        name: 'John Doe',
      },
      excerpt: 'This is a brief excerpt.',
      tags: ['javascript'],
      categories: ['programming'],
      seo: {},
    }

    it('should return validated frontmatter for valid data', () => {
      const result = validateFrontmatter(validFrontmatter, 'content/blog/test.mdx')
      expect(result).toEqual(expect.objectContaining(validFrontmatter))
    })

    it('should throw descriptive error with filepath for invalid data', () => {
      const invalidFrontmatter = {
        ...validFrontmatter,
        title: '',
        date: 'invalid-date',
      }

      expect(() => validateFrontmatter(invalidFrontmatter, 'content/blog/test.mdx')).toThrow(
        'Invalid frontmatter in content/blog/test.mdx'
      )
    })

    it('should include field paths in error messages', () => {
      const invalidFrontmatter = {
        ...validFrontmatter,
        author: {
          name: '',
        },
      }

      try {
        validateFrontmatter(invalidFrontmatter, 'content/blog/test.mdx')
        fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('author.name')
      }
    })

    it('should include helpful message about checking frontmatter', () => {
      const invalidFrontmatter = {
        title: 'Test',
      }

      try {
        validateFrontmatter(invalidFrontmatter, 'content/blog/test.mdx')
        fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('Please check your frontmatter')
      }
    })

    it('should list multiple validation errors', () => {
      const invalidFrontmatter = {
        title: '',
        date: 'invalid',
        tags: [],
      }

      try {
        validateFrontmatter(invalidFrontmatter, 'content/blog/test.mdx')
        fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        const message = (error as Error).message
        expect(message).toContain('title')
        expect(message).toContain('date')
        expect(message).toContain('tags')
      }
    })
  })
})
