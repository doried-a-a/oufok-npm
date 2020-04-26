# @oufok/env-reader

## Use case
You might have an application that requires reading environment variables from different locations, depending on the run environment.

Let's think about an example:
- You want to share some env variables with other devs, and be able to add them to VCS (commit to git for example)
- You want to have the possibility to customise/define some variables per every environment, or machine.
 Example: local database username/password, settings whether to use a feature or not, etc
- You want to deploy your application in a container, so you can override those env variables through docker or kubernetes.

**As a solution for those requirements**, you can do the following:

- Define .env file and add it to git, where you add all env variables that can be shared across all environments
- Define .env.local file, and add it to `.gitignore`, so every user can use this to override generic variables, and add any env-specific variables.
- For containerized applications, you can still provide the variables you want to override via your orchestration system (like kubernetes) to override any values defined in .env or .env.local 

**If this solution works for you, then @oufok/env-reader is a perfect fit.**
 
It provides the following functionality:
 * Allows you to explicitly declare which env variables your application needs
 * Reads requested env variables from process.env (global env variables, like one defined system wide, or provided from orchestration (docker/kubernetes,..) )
 * For any missing variables, it falls back to the list of provided .env files and reads every variable from the first file that contains it.
 * This allows you to specify override order as desired.
 * Provides the possibility to explicitly fail if any requested env variables could not be found, so you can declare .env files as dependencies for your application.