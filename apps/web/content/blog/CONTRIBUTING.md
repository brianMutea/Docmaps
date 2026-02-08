# Contributing to DocMaps Blog

Thank you for your interest in contributing to the DocMaps blog! This guide will help you submit high-quality blog posts that align with our standards and workflow.

## Table of Contents

- [Getting Started](#getting-started)
- [Contribution Guidelines](#contribution-guidelines)
- [Pull Request Workflow](#pull-request-workflow)
- [Validation Checks](#validation-checks)
- [Style Guide](#style-guide)
- [Review Process](#review-process)
- [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

- Git installed on your machine
- Node.js 18+ installed
- Familiarity with Markdown and basic Git workflows
- A GitHub account

### Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/docs-maps.git
   cd docs-maps
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a branch**
   ```bash
   git checkout -b blog/your-post-title
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## Contribution Guidelines

### Content Standards

#### Topics We're Looking For

- Visual documentation techniques and best practices
- Developer tools and workflows
- Software architecture and design patterns
- Technical tutorials and how-to guides
- Case studies and real-world examples
- DocMaps features and use cases

#### Topics to Avoid

- Promotional content or advertisements
- Off-topic content unrelated to documentation or development
- Plagiarized or duplicate content
- Controversial political or religious topics
- Content that violates our code of conduct

### Writing Guidelines

1. **Be Clear and Concise**
   - Use simple language
   - Avoid jargon unless necessary
   - Explain technical terms
   - Keep paragraphs short (3-5 sentences)

2. **Be Accurate**
   - Fact-check your content
   - Test all code examples
   - Cite sources when appropriate
   - Update outdated information

3. **Be Original**
   - Write original content
   - Don't copy from other sources
   - Provide unique insights
   - Add your own perspective

4. **Be Inclusive**
   - Use inclusive language
   - Avoid assumptions about reader knowledge
   - Provide context for beginners
   - Consider accessibility

### Technical Requirements

#### Frontmatter

All posts must include valid frontmatter with:
- ✅ Title (clear and descriptive)
- ✅ Date (ISO 8601 format)
- ✅ Author information
- ✅ Excerpt (1-2 sentences)
- ✅ At least one tag
- ✅ At least one category
- ✅ SEO metadata

See [README.md](./README.md) for detailed frontmatter documentation.

#### Content

- Use proper Markdown syntax
- Include code examples where relevant
- Add alt text to all images
- Use custom MDX components appropriately
- Follow the heading hierarchy (h1 → h2 → h3)

#### Images

- Optimize images before uploading (< 500KB)
- Use descriptive filenames
- Include alt text for accessibility
- Store images near your post or in `/public/images/blog/`
- Recommended featured image size: 1200x630px

## Pull Request Workflow

### 1. Create Your Post

```bash
# Copy the template
cp templates/blog-post-template.mdx content/blog/2026/your-post-title.mdx

# Edit the file
# Add your content
```

### 2. Test Locally

```bash
# Start dev server
npm run dev

# Visit your post
# http://localhost:3001/blog/your-post-slug

# Check for errors in the terminal
```

### 3. Validate Your Post

```bash
# Run linting
npm run lint

# Run type checking
npm run typecheck

# Try building
npm run build
```

### 4. Commit Your Changes

```bash
# Stage your changes
git add content/blog/2026/your-post-title.mdx

# Commit with a descriptive message
git commit -m "blog: add post about [topic]"

# Push to your fork
git push origin blog/your-post-title
```

### 5. Create Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Fill out the PR template:
   - **Title**: `blog: [Post Title]`
   - **Description**: Brief summary of the post
   - **Checklist**: Complete all items

### 6. Address Review Feedback

- Respond to reviewer comments
- Make requested changes
- Push updates to your branch
- Request re-review when ready

## Validation Checks

Our CI/CD pipeline runs several automated checks on your pull request:

### Automated Checks

1. **Frontmatter Validation**
   - Checks all required fields are present
   - Validates date format
   - Ensures tags and categories are non-empty
   - Verifies featured image has alt text

2. **TypeScript Compilation**
   - Ensures no type errors
   - Validates MDX syntax
   - Checks component usage

3. **ESLint**
   - Enforces code style
   - Checks for common errors
   - Validates JSX syntax

4. **Build Test**
   - Attempts to build the site
   - Ensures no runtime errors
   - Validates all routes

### Common Validation Errors

#### Missing Required Fields

```
Error: Invalid frontmatter in 2026/my-post.mdx:
  - title: Title is required
```

**Fix**: Add the missing field to your frontmatter.

#### Invalid Date Format

```
Error: Date must be in ISO 8601 format
```

**Fix**: Use format `2026-01-15T10:00:00Z`

#### Empty Tags/Categories

```
Error: At least one tag is required
```

**Fix**: Add at least one tag and one category.

#### MDX Syntax Error

```
Error: Unexpected token '<'
```

**Fix**: Check for unclosed JSX tags or invalid syntax.

### Manual Checks

Reviewers will also check for:
- Content quality and accuracy
- Writing style and clarity
- Proper use of images and code examples
- SEO optimization
- Accessibility compliance

## Style Guide

### Formatting

- **Headings**: Use sentence case (capitalize first word only)
- **Lists**: Use parallel structure
- **Code**: Use backticks for inline code, fenced blocks for multi-line
- **Links**: Use descriptive link text (not "click here")
- **Emphasis**: Use **bold** for strong emphasis, *italic* for mild emphasis

### Voice and Tone

- **Active voice**: "We built this feature" not "This feature was built"
- **Second person**: "You can use this" not "One can use this"
- **Conversational**: Write like you're explaining to a colleague
- **Professional**: Maintain a professional tone

### Code Examples

```typescript
// ✅ Good: Clear, commented, complete
interface User {
  id: string;
  name: string;
}

// Fetch user data
async function getUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}
```

```typescript
// ❌ Bad: Unclear, no context
const u = await f(id);
```

### Accessibility

- Add alt text to all images
- Use descriptive link text
- Maintain proper heading hierarchy
- Ensure sufficient color contrast
- Test with screen readers when possible

## Review Process

### Timeline

- **Initial Review**: Within 24 hrs
- **Follow-up Reviews**: Within 2 business days
- **Merge**: After approval and passing all checks

### What Reviewers Look For

1. **Content Quality**
   - Accuracy and correctness
   - Clarity and readability
   - Relevance to audience
   - Original insights

2. **Technical Correctness**
   - Valid frontmatter
   - Working code examples
   - Proper MDX syntax
   - No broken links

3. **Style Compliance**
   - Follows style guide
   - Consistent formatting
   - Proper grammar and spelling
   - Appropriate tone

4. **SEO and Accessibility**
   - Optimized meta tags
   - Alt text on images
   - Proper heading structure
   - Descriptive URLs

### Approval Process

1. **Reviewer Approval**: At least one maintainer must approve
2. **CI Checks**: All automated checks must pass
3. **Final Review**: Quick check before merge
4. **Merge**: Post is published to production

## Troubleshooting

### Build Failures

**Problem**: Build fails with validation errors

**Solution**:
1. Read the error message carefully
2. Check the file and line number mentioned
3. Fix the issue in your frontmatter or content
4. Test locally with `npm run build`
5. Push the fix

### Images Not Displaying

**Problem**: Images show broken in preview

**Solution**:
1. Check the image path is correct
2. Ensure the image file exists
3. Verify the image is in `public/` or co-located
4. Check for typos in the filename
5. Clear browser cache

### MDX Components Not Working

**Problem**: Custom components don't render

**Solution**:
1. Check component name spelling (case-sensitive)
2. Verify you're using JSX syntax: `<Component />`
3. Ensure props are correctly formatted
4. Check for unclosed tags
5. Review the template for examples

### Merge Conflicts

**Problem**: Your branch has conflicts with main

**Solution**:
```bash
# Update your local main branch
git checkout main
git pull upstream main

# Rebase your branch
git checkout blog/your-post-title
git rebase main

# Resolve conflicts
# Edit conflicting files
git add .
git rebase --continue

# Force push (your branch only!)
git push --force origin blog/your-post-title
```

### Getting Help

If you're stuck:

1. **Check Documentation**
   - Read [README.md](./README.md)
   - Review the [template](../../templates/blog-post-template.mdx)
   - Look at existing posts

2. **Search Issues**
   - Check if someone else had the same problem
   - Look for similar error messages

3. **Ask for Help**
   - Comment on your pull request
   - Tag a maintainer
   - Be specific about the problem

## Code of Conduct

All contributors must follow our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

Violations may result in:
- Warning
- Temporary ban
- Permanent ban

## Recognition

Contributors will be:
- Listed as the post author
- Credited in the commit history
- Mentioned in release notes (for significant contributions)
- Added to our contributors list

## Questions?

- **General Questions**: Open a GitHub Discussion
- **Bug Reports**: Open a GitHub Issue
- **Security Issues**: Email brianmuteak@gmail.com
- **Other**: Contact us at brianmuteak@gmail.com

---

Thank you for contributing to DocMaps! Your insights help the entire developer community. 🙏
