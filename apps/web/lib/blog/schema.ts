import { z } from 'zod'

/**
 * Author information schema
 * Validates author metadata including name, avatar, bio, and social links
 */
export const AuthorSchema = z.object({
  name: z.string().min(1, 'Author name is required'),
  avatar: z.string().url('Avatar must be a valid URL').optional(),
  bio: z.string().optional(),
  social: z.object({
    twitter: z.string().optional(),
    github: z.string().optional(),
    linkedin: z.string().optional(),
  }).optional(),
})

/**
 * SEO metadata schema
 * Validates SEO-specific fields for search engine optimization
 */
export const SEOMetadataSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
})

/**
 * Featured image schema
 * Validates featured image metadata with required alt text for accessibility
 */
export const FeaturedImageSchema = z.object({
  src: z.string().min(1, 'Image source is required'),
  alt: z.string().min(1, 'Image alt text is required for accessibility'),
  width: z.number().positive('Width must be a positive number').optional(),
  height: z.number().positive('Height must be a positive number').optional(),
})

/**
 * Post frontmatter schema
 * Validates all required and optional frontmatter fields for blog posts
 */
export const PostFrontmatterSchema = z.object({
  // Required fields
  title: z.string().min(1, 'Title is required'),
  date: z.string().datetime('Date must be in ISO 8601 format (e.g., 2024-01-15T10:00:00Z)'),
  author: AuthorSchema,
  excerpt: z.string().min(1, 'Excerpt is required'),
  tags: z.array(z.string().min(1, 'Tags cannot be empty strings')).min(1, 'At least one tag is required'),
  categories: z.array(z.string().min(1, 'Categories cannot be empty strings')).min(1, 'At least one category is required'),
  seo: SEOMetadataSchema,
  
  // Optional fields
  featuredImage: FeaturedImageSchema.optional(),
  updatedAt: z.string().datetime('Updated date must be in ISO 8601 format').optional(),
  draft: z.boolean().optional().default(false),
  featured: z.boolean().optional().default(false),
  customSlug: z.string().optional(),
  showTOC: z.boolean().optional().default(true),
  relatedPosts: z.array(z.string()).optional(),
})

/**
 * TypeScript types inferred from Zod schemas
 */
export type Author = z.infer<typeof AuthorSchema>
export type SEOMetadata = z.infer<typeof SEOMetadataSchema>
export type FeaturedImage = z.infer<typeof FeaturedImageSchema>
export type PostFrontmatter = z.infer<typeof PostFrontmatterSchema>

/**
 * Validates frontmatter data against the schema
 * 
 * @param data - The frontmatter data to validate
 * @param filepath - The file path for error reporting
 * @returns Validated and typed frontmatter data
 * @throws Error with descriptive message if validation fails
 * 
 * @example
 * ```typescript
 * try {
 *   const frontmatter = validateFrontmatter(data, 'content/blog/my-post.mdx')
 *   // frontmatter is now typed and validated
 * } catch (error) {
 *   console.error(error.message)
 *   // Error: Invalid frontmatter in content/blog/my-post.mdx:
 *   //   - title: Title is required
 *   //   - date: Date must be in ISO 8601 format
 * }
 * ```
 */
export function validateFrontmatter(data: unknown, filepath: string): PostFrontmatter {
  try {
    return PostFrontmatterSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format validation errors with clear, actionable messages
      const messages = error.issues.map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join('.') : 'root'
        return `  - ${path}: ${issue.message}`
      })
      
      throw new Error(
        `Invalid frontmatter in ${filepath}:\n${messages.join('\n')}\n\n` +
        `Please check your frontmatter and ensure all required fields are present and correctly formatted.`
      )
    }
    throw error
  }
}
