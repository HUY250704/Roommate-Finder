# Conventional Commit & GitHub PR Guidelines

## Commit Structure
```text
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes only
- `style`: Changes that do not affect the meaning of the code
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Performance improvements
- `test`: Adding or correcting tests
- `build`: Changes affecting build systems or external dependencies
- `ci`: CI configuration files and scripts
- `chore`: Other changes that do not modify src or test files

## gh CLI References
- Check auth: `gh auth status`
- Create PR: `gh pr create --title "..." --body "..."`
- Check existing PRs: `gh pr list --head <branch>`
